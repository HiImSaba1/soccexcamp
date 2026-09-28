# Sprint 2 — proposed Soccerxcamp architecture

## Decision status

Proposed for owner approval. No routes, database schema, redirects, forms, or frontend components are implemented by this document.

## Evidence boundary

The proposal is based on:

- the immutable 2026-09-28 WXR export;
- Sprint 1 generated inventories and data-quality review;
- the current public site and indexed bilingual routes;
- the source-level design and animation audit;
- the stated Plesk/Passenger and CloudLinux constraints.

The export contains 19 pages, 2 posts, 159 attachments, 40 navigation items, 35 Elementor library records, and no structured tournament/team/fixture/result/standing custom post types. The application must not invent a tournament database merely because Drizzle and PostgreSQL are installed.

## Product model

Soccerxcamp is presently an event/campaign and talent-promotion website, not a tournament-management application.

Initial public concepts:

- organization profile;
- current event campaign;
- participation/application flow;
- success stories;
- testimonials/scouters;
- specialists/team;
- talent books and historical downloads;
- gallery/media;
- contact and legal content.

Teams, age groups, fixtures, results, standings, and venues remain future concepts until the owner supplies authoritative requirements/data.

## Proposed sitemap

English and Greek share the same clean canonical paths. The language switcher changes a server-readable locale preference and refreshes the same path; it does not add `/el` or translated slugs.

| Purpose | Canonical path |
| --- | --- |
| Home | `/` |
| About | `/about` |
| Current event | `/events/germany-2026` |
| Success stories | `/success-stories` |
| Talent books | `/talentbook` |
| Apply | `/apply` |
| Contact | `/contact` |
| Privacy | `/privacy` |

Historical posts may become `/stories/[slug]` only if their content remains useful after editorial review. Private Thessaloniki records stay unpublished.

## Navigation proposal

Primary:

1. Current event
2. About
3. Success stories
4. Talentbook
5. Contact

Persistent primary CTA: Apply.

Utility: EN/EL locale switcher, privacy, social links, phone/email.

## Legacy URL policy

Generate redirects only after canonical routes are approved. Candidate mappings include:

- `/homepage/` → `/`
- `/about-us/` → `/about`
- `/participation-form/` → `/apply`
- `/germany-26/` → `/events/germany-2026`
- `/talentbook-gr/` → `/talentbook` while setting the Greek locale preference
- `/former-2023-book/` and Greek equivalent → a reviewed talentbook archive target
- `/el/αρχική/` → `/` while setting the Greek locale preference
- Greek About, Contact, Participation, Success, Germany, and Book routes → the matching clean canonical route while setting the Greek locale preference

Redirect generation must use the route inventory and retain query strings. No redirect should publish either private Thessaloniki page.

## Locale architecture

- English is the default for a first visit; English and Greek use the same route.
- A language switch calls a same-origin locale endpoint that sets a purpose-specific HttpOnly, `SameSite=Lax`, secure-in-production cookie and redirects back to the validated current path.
- The server reads the locale preference and renders the chosen dictionary before HTML reaches the browser. Do not swap the full page from local storage after hydration.
- Content is stored as explicit `{ en, el }` fields or paired locale records, not runtime machine translation.
- Missing translations fail visibly during verification rather than silently falling back in public content.
- Legacy `/el/...` routes redirect to their clean equivalent and set Greek preference so old links retain language intent.
- Original WXR strings remain UTF-8 and unchanged; no mojibake repair or transliteration layer exists.

### SEO and caching consequence

One URL cannot expose two independently indexable language variants or meaningful `hreflang` alternates. The canonical metadata language will be English, while Greek is a user-selected representation of the same canonical resource. Reading the locale cookie at the public layout/page boundary also makes those responses request-dependent rather than fully static. This is the accepted tradeoff for route-neutral URLs unless the owner later restores locale-prefixed routes.

## Content storage decision

### Static typed content initially

- global navigation/contact details;
- evergreen About content;
- approved specialist profiles;
- approved testimonials;
- privacy copy;
- current campaign editorial content while there is one active event;
- approved success-story records;
- talentbook/download metadata;
- legacy URL mapping.

Use TypeScript content modules or validated generated JSON. Do not parse WXR during requests.

### Media manifest

Keep attachment provenance, WordPress ID, original URL, inferred extension, relationships, intended destination, approval state, checksum after acquisition, and final attribution/alt text. Downloads remain approval-gated.

### Database only for operational submissions

PostgreSQL/Drizzle becomes justified when the application form or contact workflow is approved. Do not create editorial CMS tables in the foundation sprint.

## Proposed operational schema boundary

The following is a privacy review proposal, not an implemented schema:

- `application_submission`: id, event reference, locale, athlete identity fields, birth date, club/position/city, physical measurements only if confirmed necessary, contact channels, status, timestamps;
- `guardian_consent`: submission id, guardian identity, consent text version, accepted timestamp, request evidence appropriate to the approved policy;
- `submission_note`: restricted internal note/audit trail, if an administrative workflow is approved;
- `contact_submission`: minimized contact details, message, locale, status, timestamps;
- `privacy_event`: access/export/deletion lifecycle where legally required.

Never store an uploaded signature image, medical diagnosis, or broad free-form sensitive data without an explicit requirement, legal basis, retention policy, and access model.

## Form/privacy decisions required before implementation

- Is the athlete always a minor, sometimes a minor, or age-variable?
- Which fields are operationally necessary?
- Who receives and accesses submissions?
- Is email delivery sufficient, or is an authenticated portal required?
- What is the retention period?
- What withdrawal/deletion process applies?
- What exact consent/release text is owner/legal approved?
- Is electronic signature actually required, and what evidence must be retained?
- Are medical details prohibited from free-form notes?

Until answered, Sprint 3 may build only a non-submitting presentation shell for the Apply route.

## Component architecture

Server Components own pages, content composition, metadata, and static records. Client Components are limited to:

- header/menu interaction;
- locale preference control if needed;
- explicit animation primitives;
- carousel/gallery interaction;
- forms and client-side validation;
- future interactive event data.

Proposed domains:

```text
src/
  app/
    (site)/
  components/
    layout/
    motion/
    home/
    events/
    stories/
    forms/
    media/
  content/
    site.ts
    events.ts
    stories.ts
    people.ts
  lib/
    i18n/
    motion/
    seo/
    validation/
  features/
    applications/   # only after privacy approval
    contact/        # only after delivery approval
```

## Animation architecture

- one `MotionProvider` at the public site layout boundary;
- one GSAP registration module;
- optional single Lenis root, never nested;
- route curtain bypassed for Apply, Contact, reduced motion, downloads, external URLs, hash navigation, and future admin routes;
- explicit `SplitReveal` and `ImageReveal` primitives;
- `gsap.matchMedia()` for major responsive variants;
- `useGSAP` scope plus timeline/trigger cleanup;
- SplitText waits for fonts, uses `autoSplit` for lines, and always reverts;
- no broad global selector that competes with section-owned motion;
- content is visible without JavaScript and in reduced-motion mode.

## SEO architecture

- locale-specific metadata and alternates;
- canonical URLs based on approved routes;
- sitemap includes only published canonical pages;
- private/operational routes excluded or `noindex` as appropriate;
- `Organization`/`SportsOrganization` structured data only with verified facts;
- `Event` structured data for Germany 2026 only after dates, location, offer/payment terms, organizer, and status are confirmed;
- success claims and club affiliations require owner approval before structured data;
- redirects generated from evidence, never guessed.

## Media strategy

1. Review the 159-item manifest without downloading.
2. Mark assets approved/rejected/replaced.
3. Confirm ownership and usage rights.
4. Download approved files into a quarantined migration area.
5. Record checksum, dimensions, actual MIME type, and source URL.
6. Normalize filenames and create optimized derivatives locally.
7. Commit only approved web-ready assets; never commit the original WXR or an uncontrolled bulk archive.

The extension inventory is 127 JPG, 22 PNG, 6 JPEG, 3 WebP, and 1 PDF. MIME type must be detected from acquired bytes, not trusted or fabricated from the missing WXR field.

## Current content conflicts requiring approval

- Germany 2026 says both seven and ten days.
- represented-player counts vary between 150+ and 200+;
- Dimitris Petkakis appearance counts vary between 300+ and 350+;
- specialist naming/capitalization varies;
- animated homepage counters are indexed as zero;
- time-sensitive rankings, club affiliations, success outcomes, event dates, and cancellation/payment terms need confirmation.

## Sprint 3 acceptance proposal

After approval, Sprint 3 should implement only:

- local-font and token foundation;
- locale routing/content contract;
- route-neutral cookie locale endpoint, provider, dictionary contract, and switcher;
- application shell;
- accessible header and mobile menu;
- footer curtain and footer content;
- reduced-motion and motion-provider foundation;
- metadata/canonical/alternate foundation;
- empty approved route shells where useful.

It should not yet implement the full homepage, operational form submission, database schema, media download, or admin system.

## Approved owner direction

- Use clean route-neutral URLs with a same-path EN/GR switcher.
- Structurally port Sabaweb's `HomeAboutSection` directly below the Soccerxcamp home hero, replacing all agency content and media.

## Remaining owner decisions requested

1. Approve or revise the proposed canonical sitemap.
2. Decide whether Germany 2026 is the only current event at launch.
3. Confirm whether Success Stories and Talentbook remain primary navigation items.
4. Confirm the application/privacy workflow questions before any persistence work.
5. Choose whether `TournamentExperience` should use Kimono's inline image-mask rows only, or add Sabaweb's desktop floating preview.
6. Approve the single animation architecture and Sprint 3 boundary.
