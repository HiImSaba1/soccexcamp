import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type ContentRecord = {
  wordpressId: number;
  postType: string;
  status: string;
  title: string;
  slug: string;
  link: string;
  parentId: number | null;
  mimeType: string;
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

type LinkRecord = {
  sourceId: number;
  sourceType: string;
  sourceSlug: string;
  attribute: string;
  url: string;
  kind: "internal" | "external" | "relative" | "special";
};

type MenuRecord = {
  wordpressId: number;
  title: string;
  status: string;
  parentMenuItemId: number;
  objectId: number;
  objectType: string;
  targetUrl: string;
  terms: Array<{ domain: string; nicename: string; label: string }>;
};

type MediaRecord = {
  wordpressId: number;
  filename: string;
  originalUrl: string;
  mimeType: string;
  parentContentId: number | null;
  featuredImageForContentIds: number[];
};

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const migrationRoot = path.join(repositoryRoot, "migration");
const reportRoot = path.join(migrationRoot, "reports");

async function writeUtf8(filePath: string, content: string): Promise<void> {
  await writeFile(filePath, content, { encoding: "utf8" });
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

function getMeta(record: ContentRecord, key: string): string {
  const value = record.metadata.find((entry) => entry.key === key)?.value;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function decodeSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function displayTitle(record: Pick<ContentRecord, "title" | "slug">): string {
  return record.title;
}

function displaySlug(value: string): string {
  return decodeSlug(value);
}

function markdownTable(
  headers: string[],
  rows: Array<Array<string | number | null>>,
): string {
  const escape = (value: string | number | null) =>
    String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`),
  ].join("\n");
}

async function main(): Promise<void> {
  const content = await readJson<ContentRecord[]>(
    path.join(reportRoot, "content-inventory.json"),
  );
  const links = await readJson<LinkRecord[]>(
    path.join(reportRoot, "link-inventory.json"),
  );
  const menus = await readJson<MenuRecord[]>(
    path.join(migrationRoot, "generated", "menu-inventory.json"),
  );
  const media = await readJson<MediaRecord[]>(
    path.join(migrationRoot, "media-manifest.json"),
  );

  const pages = content
    .filter((record) => record.postType === "page")
    .map((record) => ({
      id: record.wordpressId,
      title: displayTitle(record),
      originalTitle: record.title,
      slug: displaySlug(record.slug),
      originalSlug: record.slug,
      status: record.status,
      parentId: record.parentId,
      template: getMeta(record, "_wp_page_template") || "default",
      builder: getMeta(record, "_elementor_edit_mode") || "WordPress editor",
    }));
  const posts = content
    .filter((record) => record.postType === "post")
    .map((record) => ({
      id: record.wordpressId,
      title: displayTitle(record),
      originalTitle: record.title,
      slug: displaySlug(record.slug),
      originalSlug: record.slug,
      status: record.status,
      categories: record.terms
        .filter((term) => term.domain === "category")
        .map((term) => term.label),
      tags: record.terms
        .filter((term) => term.domain === "post_tag")
        .map((term) => term.label),
    }));

  const externalDomains = new Map<string, number>();
  for (const link of links.filter((entry) => entry.kind === "external")) {
    try {
      const hostname = new URL(link.url).hostname.toLowerCase();
      externalDomains.set(hostname, (externalDomains.get(hostname) ?? 0) + 1);
    } catch {
      // Malformed URLs are reported separately below.
    }
  }

  const duplicateSlugs = Object.entries(
    content.reduce<Record<string, number[]>>((index, record) => {
      if (record.slug) index[record.slug] = [...(index[record.slug] ?? []), record.wordpressId];
      return index;
    }, {}),
  )
    .filter(([, ids]) => ids.length > 1)
    .map(([slug, ids]) => ({ slug, wordpressIds: ids }));
  const ids = new Set(content.map((record) => record.wordpressId));
  const attachmentIds = new Set(
    content
      .filter((record) => record.postType === "attachment")
      .map((record) => record.wordpressId),
  );
  const thumbnailReferences = content.flatMap((record) => {
    const thumbnailId = Number.parseInt(getMeta(record, "_thumbnail_id"), 10);
    return Number.isFinite(thumbnailId)
      ? [{ ownerId: record.wordpressId, attachmentId: thumbnailId }]
      : [];
  });
  const invalidUrls = links
    .filter((link) => {
      if (link.url.startsWith("/") || link.url.startsWith("#") || link.url.startsWith("?")) {
        return false;
      }
      try {
        new URL(link.url);
        return false;
      } catch {
        return true;
      }
    })
    .map((link) => ({ sourceId: link.sourceId, url: link.url }));

  const review = {
    pages,
    posts,
    customPostTypes: unique(
      content
        .map((record) => record.postType)
        .filter(
          (type) =>
            !["attachment", "nav_menu_item", "page", "post"].includes(type),
        ),
    ),
    menus: menus.map((menu) => ({
      id: menu.wordpressId,
      title: menu.title,
      parentMenuItemId: menu.parentMenuItemId || null,
      objectId: menu.objectId || null,
      objectType: menu.objectType,
      targetUrl: menu.targetUrl,
      menuTerms: menu.terms.map((term) => term.label),
    })),
    externalDomains: [...externalDomains.entries()]
      .map(([domain, references]) => ({ domain, references }))
      .sort((left, right) => right.references - left.references),
    specialLinkSchemes: Object.fromEntries(
      [...links.filter((entry) => entry.kind === "special").reduce((counts, entry) => {
        let scheme = "unknown";
        try {
          scheme = new URL(entry.url).protocol.replace(":", "");
        } catch {
          // Kept as unknown for review.
        }
        counts.set(scheme, (counts.get(scheme) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())].sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
    contentSignals: content
      .filter(
        (record) =>
          record.flags.hasShortcodes ||
          record.flags.hasGutenbergBlocks ||
          record.flags.hasEmbeddedMedia,
      )
      .map((record) => ({
        id: record.wordpressId,
        postType: record.postType,
        title: displayTitle(record),
        slug: displaySlug(record.slug),
        shortcodes: record.flags.shortcodeNames,
        gutenbergBlocks: record.flags.gutenbergBlockNames,
        hasEmbeddedMedia: record.flags.hasEmbeddedMedia,
      })),
    mediaTypes: Object.fromEntries(
      [...media.reduce((counts, item) => {
        const type = item.mimeType || "(missing)";
        counts.set(type, (counts.get(type) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())].sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
    mediaExtensions: Object.fromEntries(
      [...media.reduce((counts, item) => {
        let extension = path.extname(item.filename).toLowerCase();
        if (!extension) {
          try {
            extension = path.extname(new URL(item.originalUrl).pathname).toLowerCase();
          } catch {
            // Reported as missing below.
          }
        }
        const label = extension || "(missing)";
        counts.set(label, (counts.get(label) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())].sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
    dataQuality: {
      emptyTitles: content
        .filter(
          (record) =>
            !record.title &&
            !["attachment", "nav_menu_item"].includes(record.postType),
        )
        .map((record) => ({ id: record.wordpressId, type: record.postType })),
      emptySlugs: content
        .filter(
          (record) =>
            !record.slug && !["attachment", "nav_menu_item"].includes(record.postType),
        )
        .map((record) => ({ id: record.wordpressId, type: record.postType })),
      duplicateSlugs,
      orphanParentReferences: content
        .filter((record) => record.parentId && !ids.has(record.parentId))
        .map((record) => ({ id: record.wordpressId, parentId: record.parentId })),
      missingFeaturedAttachments: thumbnailReferences.filter(
        (reference) => !attachmentIds.has(reference.attachmentId),
      ),
      attachmentsWithoutUrl: media
        .filter((item) => !item.originalUrl)
        .map((item) => item.wordpressId),
      attachmentsWithoutMimeType: media
        .filter((item) => !item.mimeType)
        .map((item) => item.wordpressId),
      malformedLinks: invalidUrls,
      privateRecords: content
        .filter((record) => record.status === "private")
        .map((record) => ({ id: record.wordpressId, type: record.postType })),
    },
  };

  const report = [
    "# Soccerxcamp migration review",
    "",
    "## Pages",
    "",
    markdownTable(
      ["ID", "Title", "Slug", "Status", "Parent", "Builder"],
      pages.map((page) => [
        page.id,
        page.title,
        page.slug,
        page.status,
        page.parentId,
        page.builder,
      ]),
    ),
    "",
    "## Posts",
    "",
    markdownTable(
      ["ID", "Title", "Slug", "Status", "Categories", "Tags"],
      posts.map((post) => [
        post.id,
        post.title,
        post.slug,
        post.status,
        post.categories.join(", "),
        post.tags.join(", "),
      ]),
    ),
    "",
    "## External domains",
    "",
    markdownTable(
      ["Domain", "References"],
      review.externalDomains.map((entry) => [entry.domain, entry.references]),
    ),
    "",
    "## Navigation items",
    "",
    markdownTable(
      ["ID", "Title", "Parent", "Object type", "Object ID", "Custom URL"],
      review.menus.map((menu) => [
        menu.id,
        menu.title ||
          displayTitle(
            content.find((record) => record.wordpressId === menu.objectId) ?? {
              title: "",
              slug: "",
            },
          ),
        menu.parentMenuItemId,
        menu.objectType,
        menu.objectId,
        menu.targetUrl,
      ]),
    ),
    "",
    "## Content requiring migration handling",
    "",
    markdownTable(
      ["ID", "Type", "Title", "Shortcodes", "Blocks", "Embedded media"],
      review.contentSignals.map((signal) => [
        signal.id,
        signal.postType,
        signal.title,
        signal.shortcodes.join(", "),
        signal.gutenbergBlocks.join(", "),
        signal.hasEmbeddedMedia ? "yes" : "no",
      ]),
    ),
    "",
    "## Media types",
    "",
    markdownTable(["MIME type", "Count"], Object.entries(review.mediaTypes)),
    "",
    "## Special link schemes",
    "",
    markdownTable(
      ["Scheme", "References"],
      Object.entries(review.specialLinkSchemes),
    ),
    "",
    "## Media filename extensions",
    "",
    markdownTable(
      ["Extension", "Count"],
      Object.entries(review.mediaExtensions),
    ),
    "",
    "## Data-quality counts",
    "",
    markdownTable(
      ["Check", "Count"],
      Object.entries(review.dataQuality).map(([name, entries]) => [
        name,
        entries.length,
      ]),
    ),
    "",
    "This report contains discovery results only. No legacy HTML is approved for rendering and no media is approved for download.",
    "",
  ].join("\n");

  await Promise.all([
    writeUtf8(
      path.join(reportRoot, "wxr-review.json"),
      `${JSON.stringify(review, null, 2)}\n`,
    ),
    writeUtf8(path.join(reportRoot, "wxr-review.md"), report),
  ]);

  console.log(JSON.stringify(review, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
