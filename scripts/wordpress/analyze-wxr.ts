import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

type UnknownRecord = Record<string, unknown>;

type LinkRecord = {
  sourceId: number;
  sourceType: string;
  sourceSlug: string;
  attribute: "href" | "src" | "url";
  url: string;
  kind: "internal" | "external" | "relative" | "special";
};

type ContentRecord = {
  wordpressId: number;
  postType: string;
  status: string;
  title: string;
  slug: string;
  link: string;
  guid: string;
  publishedAt: string;
  modifiedAt: string;
  parentId: number | null;
  authorLogin: string;
  mimeType: string;
  excerpt: string;
  content: string;
  terms: Array<{ domain: string; nicename: string; label: string }>;
  metadata: Array<{ key: string; value: unknown }>;
  flags: {
    hasShortcodes: boolean;
    shortcodeNames: string[];
    hasGutenbergBlocks: boolean;
    gutenbergBlockNames: string[];
    hasRawHtml: boolean;
    hasEmbeddedMedia: boolean;
  };
};

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const defaultInput = path.join(
  repositoryRoot,
  "soccerxcamp.WordPress.2026-09-28.xml",
);
const inputPath = path.resolve(process.argv[2] ?? defaultInput);
const migrationRoot = path.join(repositoryRoot, "migration");
const reportRoot = path.join(migrationRoot, "reports");
const generatedRoot = path.join(migrationRoot, "generated");

async function writeUtf8(filePath: string, content: string): Promise<void> {
  await writeFile(filePath, content, { encoding: "utf8" });
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asString(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  const record = asRecord(value);
  if ("#text" in record) return asString(record["#text"]);
  return "";
}

function asNumber(value: unknown): number {
  const parsed = Number.parseInt(asString(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function countBy(values: string[]): Record<string, number> {
  return Object.fromEntries(
    [...values.reduce((counts, value) => {
      counts.set(value || "(empty)", (counts.get(value || "(empty)") ?? 0) + 1);
      return counts;
    }, new Map<string, number>())].sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
}

function extractShortcodes(content: string): string[] {
  const names: string[] = [];
  const pattern = /\[(?!\/)([a-zA-Z][\w-]*)(?:\s|\]|\/)/g;
  for (const match of content.matchAll(pattern)) names.push(match[1]);
  return unique(names);
}

function extractGutenbergBlocks(content: string): string[] {
  const names: string[] = [];
  const pattern = /<!--\s+\/?wp:([\w/-]+)/g;
  for (const match of content.matchAll(pattern)) names.push(match[1]);
  return unique(names);
}

function hasRawHtml(content: string): boolean {
  return /<(?:a|article|aside|audio|blockquote|br|div|figure|figcaption|h[1-6]|hr|iframe|img|li|ol|p|pre|section|source|span|strong|table|tbody|td|th|thead|tr|ul|video)\b/i.test(
    content,
  );
}

function hasEmbeddedMedia(content: string): boolean {
  return /<(?:audio|embed|iframe|source|video)\b|https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com|soundcloud\.com)\//i.test(
    content,
  );
}

function classifyUrl(url: string, siteUrl: string): LinkRecord["kind"] {
  if (url.startsWith("/") || url.startsWith("#") || url.startsWith("?")) {
    return "relative";
  }
  try {
    const candidate = new URL(url);
    const site = new URL(siteUrl);
    if (!['http:', 'https:'].includes(candidate.protocol)) return "special";
    return candidate.hostname === site.hostname || candidate.hostname.endsWith('.localhost')
      ? "internal"
      : "external";
  } catch {
    return "relative";
  }
}

function extractLinks(record: ContentRecord, siteUrl: string): LinkRecord[] {
  const links: LinkRecord[] = [];
  const seen = new Set<string>();
  const attributePattern = /\b(href|src)\s*=\s*["']([^"']+)["']/gi;

  for (const match of record.content.matchAll(attributePattern)) {
    const attribute = match[1].toLowerCase() as "href" | "src";
    const url = match[2].trim();
    const key = `${attribute}:${url}`;
    if (!url || seen.has(key)) continue;
    seen.add(key);
    links.push({
      sourceId: record.wordpressId,
      sourceType: record.postType,
      sourceSlug: record.slug,
      attribute,
      url,
      kind: classifyUrl(url, siteUrl),
    });
  }

  const plainUrlPattern = /https?:\/\/[^\s<>'"\])}]+/gi;
  for (const match of record.content.matchAll(plainUrlPattern)) {
    const url = match[0].replace(/[.,;:!?]+$/, "");
    const key = `url:${url}`;
    if (seen.has(`href:${url}`) || seen.has(`src:${url}`) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    links.push({
      sourceId: record.wordpressId,
      sourceType: record.postType,
      sourceSlug: record.slug,
      attribute: "url",
      url,
      kind: classifyUrl(url, siteUrl),
    });
  }

  return links;
}

function proposedMediaDestination(id: number, sourceUrl: string): string {
  let filename = `wordpress-${id}`;
  try {
    filename = decodeURIComponent(new URL(sourceUrl).pathname.split("/").pop() || filename);
  } catch {
    // The original value remains preserved in the manifest even when malformed.
  }
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]+/g, "-");
  return `public/media/wordpress/${id}-${safeFilename}`;
}

function markdownTable(rows: Array<[string, string | number]>): string {
  return [
    "| Metric | Value |",
    "| --- | ---: |",
    ...rows.map(([label, value]) => `| ${label} | ${value} |`),
  ].join("\n");
}

async function main(): Promise<void> {
  if (!inputPath.startsWith(repositoryRoot + path.sep)) {
    throw new Error("The WXR input must be inside the Soccerxcamp repository.");
  }

  const xml = await readFile(inputPath, "utf8");
  const sourceSha256 = createHash("sha256").update(xml).digest("hex");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    processEntities: false,
    trimValues: false,
    parseTagValue: false,
    isArray: (name) =>
      [
        "item",
        "wp:author",
        "wp:category",
        "wp:tag",
        "wp:term",
        "category",
        "wp:postmeta",
        "wp:comment",
      ].includes(name),
  });
  const document = asRecord(parser.parse(xml));
  const rss = asRecord(document.rss);
  const channel = asRecord(rss.channel);
  const siteUrl = asString(channel["wp:base_site_url"]) || asString(channel.link);

  const authors = asArray(channel["wp:author"]).map((entry) => {
    const author = asRecord(entry);
    return {
      id: asNumber(author["wp:author_id"]),
      login: asString(author["wp:author_login"]),
      hasEmail: Boolean(asString(author["wp:author_email"])),
      displayName: asString(author["wp:author_display_name"]),
      firstName: asString(author["wp:author_first_name"]),
      lastName: asString(author["wp:author_last_name"]),
    };
  });

  const records: ContentRecord[] = asArray(channel.item).map((entry) => {
    const item = asRecord(entry);
    const metadata = asArray(item["wp:postmeta"]).map((metaEntry) => {
      const meta = asRecord(metaEntry);
      return {
        key: asString(meta["wp:meta_key"]),
        value: meta["wp:meta_value"] ?? "",
      };
    });
    const terms = asArray(item.category).map((termEntry) => {
      const term = asRecord(termEntry);
      return {
        domain: asString(term["@_domain"]),
        nicename: asString(term["@_nicename"]),
        label: asString(term["#text"] ?? termEntry),
      };
    });
    const content = asString(item["content:encoded"]);
    const shortcodeNames = extractShortcodes(content);
    const gutenbergBlockNames = extractGutenbergBlocks(content);

    return {
      wordpressId: asNumber(item["wp:post_id"]),
      postType: asString(item["wp:post_type"]),
      status: asString(item["wp:status"]),
      title: asString(item.title),
      slug: asString(item["wp:post_name"]),
      link: asString(item.link),
      guid: asString(item.guid),
      publishedAt: asString(item["wp:post_date_gmt"] || item.pubDate),
      modifiedAt: asString(item["wp:post_modified_gmt"]),
      parentId: asNumber(item["wp:post_parent"]) || null,
      authorLogin: asString(item["dc:creator"]),
      mimeType: asString(item["wp:post_mime_type"]),
      excerpt: asString(item["excerpt:encoded"]),
      content,
      terms,
      metadata,
      flags: {
        hasShortcodes: shortcodeNames.length > 0,
        shortcodeNames,
        hasGutenbergBlocks: gutenbergBlockNames.length > 0,
        gutenbergBlockNames,
        hasRawHtml: hasRawHtml(content),
        hasEmbeddedMedia: hasEmbeddedMedia(content),
      },
    };
  });

  const links = records.flatMap((record) => extractLinks(record, siteUrl));
  const attachments = records.filter((record) => record.postType === "attachment");
  const thumbnailOwners = new Map<number, number[]>();
  for (const record of records) {
    for (const meta of record.metadata) {
      if (meta.key !== "_thumbnail_id") continue;
      const attachmentId = asNumber(meta.value);
      if (!attachmentId) continue;
      thumbnailOwners.set(attachmentId, [
        ...(thumbnailOwners.get(attachmentId) ?? []),
        record.wordpressId,
      ]);
    }
  }

  const mediaManifest = attachments.map((record) => {
    const attachedFile = record.metadata.find(
      (entry) => entry.key === "_wp_attached_file",
    );
    const attachmentUrl = record.guid || record.link;
    return {
      wordpressId: record.wordpressId,
      filename: asString(attachedFile?.value) || path.basename(attachmentUrl),
      originalUrl: attachmentUrl,
      mimeType: record.mimeType,
      parentContentId: record.parentId,
      featuredImageForContentIds: thumbnailOwners.get(record.wordpressId) ?? [],
      proposedLocalDestination: proposedMediaDestination(
        record.wordpressId,
        attachmentUrl,
      ),
      migrationStatus: "pending-approval",
    };
  });

  const categoryDefinitions = asArray(channel["wp:category"]).map((entry) => {
    const category = asRecord(entry);
    return {
      id: asNumber(category["wp:term_id"]),
      nicename: asString(category["wp:category_nicename"]),
      parent: asString(category["wp:category_parent"]),
      name: asString(category["wp:cat_name"]),
      description: asString(category["wp:category_description"]),
    };
  });
  const tagDefinitions = asArray(channel["wp:tag"]).map((entry) => {
    const tag = asRecord(entry);
    return {
      id: asNumber(tag["wp:term_id"]),
      slug: asString(tag["wp:tag_slug"]),
      name: asString(tag["wp:tag_name"]),
      description: asString(tag["wp:tag_description"]),
    };
  });
  const customTerms = asArray(channel["wp:term"]).map((entry) => {
    const term = asRecord(entry);
    return {
      id: asNumber(term["wp:term_id"]),
      taxonomy: asString(term["wp:term_taxonomy"]),
      slug: asString(term["wp:term_slug"]),
      parent: asString(term["wp:term_parent"]),
      name: asString(term["wp:term_name"]),
      description: asString(term["wp:term_description"]),
    };
  });

  const menus = records
    .filter((record) => record.postType === "nav_menu_item")
    .map((record) => ({
      wordpressId: record.wordpressId,
      title: record.title,
      status: record.status,
      parentMenuItemId: asNumber(
        record.metadata.find((entry) => entry.key === "_menu_item_menu_item_parent")
          ?.value,
      ),
      objectId: asNumber(
        record.metadata.find((entry) => entry.key === "_menu_item_object_id")?.value,
      ),
      objectType: asString(
        record.metadata.find((entry) => entry.key === "_menu_item_object")?.value,
      ),
      targetUrl: asString(
        record.metadata.find((entry) => entry.key === "_menu_item_url")?.value,
      ),
      terms: record.terms,
      metadata: record.metadata,
    }));

  const routes = records
    .filter((record) => record.link || record.slug)
    .map((record) => {
      let pathname = "";
      try {
        pathname = new URL(record.link).pathname;
      } catch {
        pathname = record.slug ? `/${record.slug}/` : "";
      }
      return {
        wordpressId: record.wordpressId,
        postType: record.postType,
        status: record.status,
        slug: record.slug,
        legacyUrl: record.link,
        legacyPath: pathname,
        parentId: record.parentId,
      };
    });

  const summary = {
    generatedAt: new Date().toISOString(),
    source: {
      filename: path.basename(inputPath),
      bytes: Buffer.byteLength(xml),
      sha256: sourceSha256,
      wasModified: false,
    },
    site: {
      title: asString(channel.title),
      description: asString(channel.description),
      siteUrl,
      homeUrl: asString(channel["wp:base_blog_url"]),
      language: asString(channel.language),
      wxrVersion: asString(channel["wp:wxr_version"]),
      exportDate: asString(channel.pubDate),
      generator: asString(channel.generator),
    },
    totals: {
      authors: authors.length,
      records: records.length,
      attachments: attachments.length,
      menus: menus.length,
      categories: categoryDefinitions.length,
      tags: tagDefinitions.length,
      customTerms: customTerms.length,
      links: links.length,
      internalLinks: links.filter((link) => link.kind === "internal").length,
      externalLinks: links.filter((link) => link.kind === "external").length,
      relativeLinks: links.filter((link) => link.kind === "relative").length,
      specialLinks: links.filter((link) => link.kind === "special").length,
      withShortcodes: records.filter((record) => record.flags.hasShortcodes).length,
      withGutenbergBlocks: records.filter(
        (record) => record.flags.hasGutenbergBlocks,
      ).length,
      withRawHtml: records.filter((record) => record.flags.hasRawHtml).length,
      withEmbeddedMedia: records.filter(
        (record) => record.flags.hasEmbeddedMedia,
      ).length,
      featuredImageRelationships: [...thumbnailOwners.values()].reduce(
        (total, owners) => total + owners.length,
        0,
      ),
    },
    byPostType: countBy(records.map((record) => record.postType)),
    byStatus: countBy(records.map((record) => record.status)),
    shortcodeNames: unique(
      records.flatMap((record) => record.flags.shortcodeNames),
    ),
    gutenbergBlockNames: unique(
      records.flatMap((record) => record.flags.gutenbergBlockNames),
    ),
    metadataKeys: countBy(
      records.flatMap((record) => record.metadata.map((entry) => entry.key)),
    ),
  };

  await mkdir(reportRoot, { recursive: true });
  await mkdir(generatedRoot, { recursive: true });

  await Promise.all([
    writeUtf8(
      path.join(reportRoot, "wxr-summary.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
    ),
    writeUtf8(
      path.join(reportRoot, "author-inventory.json"),
      `${JSON.stringify(authors, null, 2)}\n`,
    ),
    writeUtf8(
      path.join(reportRoot, "content-inventory.json"),
      `${JSON.stringify(records, null, 2)}\n`,
    ),
    writeUtf8(
      path.join(reportRoot, "taxonomy-inventory.json"),
      `${JSON.stringify(
        { categories: categoryDefinitions, tags: tagDefinitions, customTerms },
        null,
        2,
      )}\n`,
    ),
    writeUtf8(
      path.join(reportRoot, "link-inventory.json"),
      `${JSON.stringify(links, null, 2)}\n`,
    ),
    writeUtf8(
      path.join(generatedRoot, "route-inventory.json"),
      `${JSON.stringify(routes, null, 2)}\n`,
    ),
    writeUtf8(
      path.join(generatedRoot, "menu-inventory.json"),
      `${JSON.stringify(menus, null, 2)}\n`,
    ),
    writeUtf8(
      path.join(migrationRoot, "media-manifest.json"),
      `${JSON.stringify(mediaManifest, null, 2)}\n`,
    ),
  ]);

  const report = [
    "# Soccerxcamp WordPress WXR discovery report",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    "## Source integrity",
    "",
    `- File: \`${summary.source.filename}\``,
    `- Size: ${summary.source.bytes} bytes`,
    `- SHA-256: \`${summary.source.sha256}\``,
    "- Source modified by analyzer: no",
    "",
    "## Site",
    "",
    `- Title: ${summary.site.title || "(empty)"}`,
    `- Site URL: ${summary.site.siteUrl || "(empty)"}`,
    `- Home URL: ${summary.site.homeUrl || "(empty)"}`,
    `- Language: ${summary.site.language || "(empty)"}`,
    `- WXR version: ${summary.site.wxrVersion || "(empty)"}`,
    `- Export date: ${summary.site.exportDate || "(empty)"}`,
    "",
    "## Inventory totals",
    "",
    markdownTable(Object.entries(summary.totals)),
    "",
    "## Records by post type",
    "",
    markdownTable(Object.entries(summary.byPostType)),
    "",
    "## Records by status",
    "",
    markdownTable(Object.entries(summary.byStatus)),
    "",
    "## Content signals",
    "",
    `- Shortcodes: ${summary.shortcodeNames.join(", ") || "none detected"}`,
    `- Gutenberg blocks: ${summary.gutenbergBlockNames.join(", ") || "none detected"}`,
    "",
    "## Safety boundary",
    "",
    "The analyzer performs read-only discovery. It does not sanitize for publication, import records, download media, create redirects, write to a database, or modify the WXR source.",
    "",
  ].join("\n");
  await writeUtf8(path.join(reportRoot, "wxr-report.md"), report);

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
