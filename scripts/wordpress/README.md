# WordPress migration discovery

This tooling treats `soccerxcamp.WordPress.2026-09-28.xml` as immutable migration input.

`npm run migration:analyze` parses the WXR export and creates deterministic inventories under `migration/`. It does not import content, sanitize content for publication, download media, access a database, or modify the source XML.

`npm run migration:validate` checks the generated files against the summary counts and source-integrity record.

`npm run migration:review` produces a compact editorial and data-quality review from the local detailed inventories. It includes no post bodies or author email addresses.

Generated local inventories retain all WordPress post metadata so unknown keys remain available for later architecture decisions. Detailed author, content, and link inventories are Git-ignored because they can contain personal or private legacy data. HTML and shortcode detection are discovery signals only; neither is considered safe for rendering.

All source reads and generated text writes use UTF-8 explicitly. Greek content and Unicode punctuation are preserved exactly; the tooling does not attempt mojibake repair or transliteration.
