import sanitizeHtml from "sanitize-html";

const allowedTags = ["p", "br", "strong", "em", "ul", "ol", "li", "blockquote", "h2", "h3", "h4", "a"];

export function sanitizeWordPressHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags,
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => {
        const external = attributes.target === "_blank";
        return { tagName: "a", attribs: { ...attributes, ...(external ? { rel: "noopener noreferrer" } : {}) } };
      },
    },
    disallowedTagsMode: "discard",
  });
}

export const wordpressHtmlAllowlist = { tags: allowedTags, attributes: { a: ["href", "title", "target", "rel"] }, schemes: ["http", "https", "mailto", "tel"] } as const;
