# Soccerxcamp design and animation reference audit

## Scope

This audit is based on the actual source in the three owner-provided repositories. It is an implementation reference, not permission to merge their identities. No component has been copied into Soccerxcamp during this sprint.

## Executive recommendation

Use one animation architecture:

- GSAP owns route choreography, split-text reveals, clip-path reveals, footer reveal, and any future pinned editorial sequence.
- Motion owns small component-local interactions such as list-item entrance, carousel state, and layout transitions.
- CSS owns hover, focus, menu-icon, color, and simple state transitions.
- Lenis, if approved after mobile testing, has exactly one root provider and is disabled for reduced motion and operational/form routes.
- A component has one motion owner. GSAP and Motion must not animate the same property on the same element.

## Important source discrepancy

No component named `HomeServices` exists in the current Santra Kimono repository. The closest Kimono implementation is:

- SOURCE: `C:\Users\sab_j\Desktop\Projects\Santra_Kimono\kimono-shop\src\components\about\AboutServicesSection.tsx`
- BEHAVIOR: numbered editorial rows, copy/capability tags, in-view stagger, vertically revealed imagery, and scroll-linked image drift.

The source that actually contains `HomeServicesSection` and `HomeServicesList` is Sabaweb:

- SOURCE: `C:\Users\sab_j\Desktop\Projects\Sabaweb\saba-web-solutions\src\components\home\HomeServicesSection.tsx`
- SOURCE: `C:\Users\sab_j\Desktop\Projects\Sabaweb\saba-web-solutions\src\components\home\HomeServicesList.tsx`
- BEHAVIOR: numbered service rows with inline mobile imagery and a fine-pointer floating image preview driven by `gsap.quickTo`.

Therefore there is no honest “direct port of Kimono HomeServices” available from the current checkout. The proposed Soccerxcamp `TournamentExperience` should adapt the verified Kimono `AboutServicesSection` structure and selectively borrow the Sabaweb pointer-preview concept only if it improves the approved content model.

## Santra Kimono audit

### Files inspected

- `src/app/page.tsx`
- `src/components/about/AboutServicesSection.tsx`
- `src/components/home/HomeHero.tsx`
- `src/components/home/DesignCarousel.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/animations/SplitText.tsx`
- `src/components/animations/TextImageReveal.tsx`
- `src/components/animations/EditorialSectionChoreography.tsx`
- `src/providers/StorefrontProviders.tsx`
- `src/providers/PageTransitionProvider.tsx`
- `src/lib/animation/gsap.ts`
- `src/lib/animations/gsap.ts`

### Header

SOURCE: `src/components/layout/Header.tsx`

ACTION: Adapt.

Useful mechanics:

- fixed three-column shell;
- full-screen menu revealed with an inset clip-path;
- masked staggered navigation links;
- separate visual reveal and image scale settle;
- reduced-motion path that immediately exposes content;
- `useGSAP` scoped to the header and timeline cleanup;
- document overflow restored on unmount;
- language control and semantic `aria-expanded`/`aria-controls`.

Do not copy the commerce/cart controls, paper palette, centered fashion composition, or Kimono imagery.

### Footer

SOURCE: `src/components/layout/Footer.tsx`

ACTION: Adapt.

Useful mechanics:

- sticky curtain-like final section;
- footer clip-path opening;
- scoped item entrance;
- large SplitText brand line;
- explicit timeline kill and `split.revert()`;
- reduced-motion state that leaves all content visible.

The newsletter, commerce/legal link set, and fashion copy are not reusable.

### Editorial row implementation

SOURCE: `src/components/about/AboutServicesSection.tsx`

TARGET: proposed `src/components/home/TournamentExperience.tsx`

ACTION: Adapt, closest match to the requested Kimono HomeServices behavior.

Dependencies and behavior:

- `next/image`;
- `motion/react` (`motion`, `useInView`, `useScroll`, `useTransform`);
- locale-aware data;
- numbered grid rows;
- capability tags;
- mobile-first stacked layout and four-column large-screen layout;
- image mask from a collapsed top edge to full height;
- subtle scroll-linked vertical media travel.

Keep the layout and interaction concept. Replace all fashion data, naming, assets, palette, type, and spacing with tournament content.

### Split text

SOURCE: `src/components/animations/SplitText.tsx`

TARGET: proposed `src/components/motion/SplitReveal.tsx`

ACTION: Adapt.

Strengths:

- words, lines, and characters supported through one primitive;
- waits for fonts before line measurement;
- `autoSplit` for responsive lines;
- scroll-triggered or route-entry modes;
- reduced-motion fallback;
- kills the tween and reverts SplitText;
- route-ready dependency and `revertOnUpdate`.

Changes required:

- default Soccerxcamp to words/lines; characters are exceptional;
- use `aria: "auto"` for accessible reconstructed text;
- centralize durations/eases;
- avoid wrapping headings in a way that invalidates semantics;
- test Greek line breaking after local fonts load.

### Image and section reveals

SOURCE: `src/components/home/HomeHero.tsx`

ACTION: Adapt for the Soccerxcamp hero choreography.

The timeline establishes a sound sequence: background horizontal mask, primary media vertical mask, then restrained copy stagger. It scopes and kills its timeline, respects route readiness and reduced motion, and clears transient properties.

SOURCE: `src/components/animations/EditorialSectionChoreography.tsx`

ACTION: Reference only.

Its broad selector-based animation can quickly create consistency, but applying it to every section/media/copy item is too implicit for Soccerxcamp. Prefer opt-in primitives so each major section has an explicit motion owner.

SOURCE: `src/components/animations/TextImageReveal.tsx`

ACTION: Inspiration only.

The scrubbed inline image-width reveal is editorially strong but should be reserved for one campaign statement, not become a global motif.

### Page transitions and Lenis

SOURCE: `src/providers/PageTransitionProvider.tsx`

ACTION: Adapt after form-route exclusions are expanded.

Strengths:

- explicit `idle → covering → covered → revealing` state machine;
- ignores external, hash-only, modified-click, download, and new-tab navigation;
- uses route readiness to coordinate page entrances;
- stops/restarts and resizes Lenis;
- bypasses operational routes and reduced motion;
- cleans its document listener.

SOURCE: `src/providers/StorefrontProviders.tsx`

ACTION: Reference only.

One root `ReactLenis` instance is correct. Soccerxcamp should not copy the commerce provider stack. Lenis must be omitted from application/contact workflows if it harms form behavior.

### Architecture conflict to avoid

Kimono imports GSAP from both:

- `src/lib/animation/gsap.ts`
- `src/lib/animations/gsap.ts`

Soccerxcamp will have exactly one module: `src/lib/motion/gsap.ts`.

## Sabaweb audit

### Files inspected

- `src/components/home/HomeServicesSection.tsx`
- `src/components/home/HomeServicesList.tsx`
- `src/components/home/HomeAboutSection.tsx`
- `src/app/(site)/page.tsx`
- `src/i18n/LocaleProvider.tsx`
- `src/i18n/dictionaries.ts`
- `src/app/api/locale/route.ts`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/providers/SmoothScrollProvider.tsx`
- `src/providers/PageTransitionProvider.tsx`
- `src/components/animations/SplitText.tsx`
- `src/lib/animations/gsap.ts`
- `src/app/globals.css`

### Home services

SOURCE: `src/components/home/HomeServicesList.tsx`

ACTION: Adapt selectively.

The strongest reusable idea is the fine-pointer floating image preview:

- gated by `(hover: hover) and (pointer: fine)`;
- `gsap.quickTo` for pointer following;
- viewport clamping;
- keyboard focus fallback centered in the viewport;
- inline media remains available for touch/mobile;
- all row, mouse, and focus listeners are removed;
- tweens are killed during cleanup.

For Soccerxcamp, this could enhance a short list of tournament differentiators or success stories. It should not be combined with the Kimono row image on the same breakpoint.

### Post-hero About section

SOURCE: `src/components/home/HomeAboutSection.tsx`

TARGET: proposed `src/components/home/HomeAboutIntro.tsx`

ACTION: Direct structural port, with Soccerxcamp content and media.

The Sabaweb homepage renders this immediately after `HomeHero` in `src/app/(site)/page.tsx`. Its structure is suitable for Soccerxcamp:

- compact indexed eyebrow;
- large line-split editorial statement;
- offset portrait media with parallax;
- narrow supporting copy and one About CTA;
- 12-column desktop composition and straightforward mobile stacking;
- copy sourced from the active locale dictionary.

Port `SplitText`, `ParallaxImage`, `Reveal`, and the button contract through the consolidated Soccerxcamp primitives rather than copying duplicate animation utilities. Replace agency copy, `/images/webp/36.webp`, and `/about` assumptions with approved Soccerxcamp content and media.

### Locale implementation finding

Sabaweb's current `LocaleProvider.tsx` is not route-neutral: `setLocale` adds or removes `/el` and navigates with `location.assign`. Its `/api/locale` route separately demonstrates a safe HttpOnly locale-cookie pattern. Soccerxcamp can reuse the dictionary/provider and switcher interaction concept, but a clean same-path URL requires a deliberate cookie-rendered variant rather than copying Sabaweb verbatim.

### Visual direction

ACTION: Inspiration only.

Reuse the confidence of high-contrast dark fields, oversized uppercase display type, sparse red accents, strict grids, restrained borders, and asymmetrical image composition. Do not reuse agency service language, tech motifs, portfolio metaphors, or general-purpose creative-agency page structures.

### Header, footer, transitions

ACTION: Reference only.

Sabaweb confirms the same useful conventions: scoped GSAP registration, one smooth-scroll provider, curtain route transitions, letter-hover links, and a visually substantial footer. Kimono is the primary source for motion mechanics; do not merge both provider implementations.

## Argiropoulos Law audit

### Files inspected

- `src/components/layout/site-header.tsx`
- `src/components/layout/site-footer.tsx`
- `src/components/layout/footer-curtain.tsx`
- `src/components/home/home-services-section.tsx`
- `src/components/motion/global-reveal-choreography.tsx`
- `src/providers/page-transition-provider.tsx`
- `src/lib/animations/gsap.ts`
- `src/app/globals.css`

### Clean structural patterns

ACTION: Adapt.

- straightforward navigation hierarchy and current-page state;
- Escape-to-close and focus movement in the mobile menu;
- restrained content widths and consistent section anatomy;
- address/contact semantics;
- clear separation between global layout and page sections;
- readable mobile fallbacks that do not depend on hover;
- server-rendered footer content with small interaction boundaries.

### Footer curtain

SOURCE: `src/components/layout/footer-curtain.tsx`

TARGET: proposed `src/components/layout/FooterCurtain.tsx`

ACTION: Direct structural port, restyled.

The ResizeObserver-driven CSS variable accurately tracks dynamic footer height and cleans up both observer and load listener. This is simpler and more resilient than making GSAP own footer layout. GSAP may animate inner footer content while the curtain component owns geometry.

### Global reveal choreography

SOURCE: `src/components/motion/global-reveal-choreography.tsx`

ACTION: Adapt as an explicit primitive, not a document-wide scanner.

Its font-ready setup, word/line SplitText masks, route dependency, timeline cleanup, and split reversion are strong. Its global `main section` querying is too broad for Soccerxcamp and risks duplicate ownership with bespoke sections.

### Services section

SOURCE: `src/components/home/home-services-section.tsx`

ACTION: Inspiration only.

Its editorial hierarchy and mobile readability are strong, but Kimono's requested image-mask behavior is the preferred basis for `TournamentExperience`.

## Component reuse map

| Source | Soccerxcamp target | Decision |
| --- | --- | --- |
| Kimono `AboutServicesSection` | `TournamentExperience` | Adapt; closest available requested implementation |
| Sabaweb `HomeServicesList` pointer preview | Optional desktop mode inside `TournamentExperience` | Adapt selectively after content approval |
| Sabaweb `HomeAboutSection` | `HomeAboutIntro` directly below hero | Direct structural port, replace content/media |
| Sabaweb dictionary/provider and locale API | Same-path locale preference | Adapt; do not copy `/el` rewriting |
| Kimono `Header` menu choreography | `SiteHeader` | Adapt |
| Kimono `Footer` inner reveal | `SiteFooter` inner motion | Adapt |
| Argiropoulos `FooterCurtain` | `FooterCurtain` | Direct structural port, restyled |
| Kimono `SplitText` | `SplitReveal` | Adapt and consolidate |
| Kimono `HomeHero` reveal timeline | `CampaignHero` | Adapt |
| Kimono `TextImageReveal` | Optional campaign statement | Inspiration only |
| Sabaweb dark editorial composition | Design tokens/layout direction | Inspiration only |
| Argiropoulos navigation/readability | Layout and accessibility contracts | Adapt |
| Kimono/Sabaweb commerce/admin code | None | Do not reuse |
| Broad global section scanners | None | Do not reuse as-is |

## Proposed Soccerxcamp visual language

### Palette

- `pitch-black`: near-black base, not pure black;
- `floodlight`: warm off-white foreground;
- `signal-red`: controlled competitive accent for active state and primary CTA;
- `turf`: muted deep green used sparingly for contextual surfaces;
- `steel`: cool gray for metadata, rules, and secondary copy.

No decorative gradients in the core system. Photography may use controlled overlays for text contrast.

### Typography

- condensed or tightly tracked display face for campaign headlines and scores;
- highly readable grotesk sans for body/UI;
- tabular mono/numeric treatment for dates, indices, ages, and future match data;
- local font files only after licensing is confirmed;
- Greek and Latin glyph coverage must be verified before selection.

### Layout

- 12-column desktop grid;
- responsive page gutter token;
- large editorial type balanced by narrow readable copy columns;
- square or lightly rounded media; avoid card-heavy composition;
- thin high-contrast rules as the primary grouping device;
- section rhythm based on large breathing space, not stacked generic cards.

## Proposed motion language

- **Kickoff:** one decisive horizontal or vertical mask for route/hero entry.
- **Acceleration:** 700–1100 ms editorial reveals with fast initial movement and soft settling.
- **Formation:** short 35–80 ms row/word staggers that communicate coordinated movement.
- **Tracking:** subtle media drift or pointer-follow only on capable devices.
- **Score:** compact 250–450 ms state transitions for counters or future results.
- **Final whistle:** footer curtain geometry plus one large typographic reveal.

Reduced motion removes masks, parallax, scrub, and route curtains while leaving all content visible in its final state.

## Proposed implementation structure

```text
src/
  components/
    layout/
      SiteHeader.tsx
      SiteFooter.tsx
      FooterCurtain.tsx
    motion/
      MotionProvider.tsx
      PageTransitionProvider.tsx
      SplitReveal.tsx
      ImageReveal.tsx
      ParallaxMedia.tsx
    home/
      CampaignHero.tsx
      TournamentExperience.tsx
  lib/
    motion/
      gsap.ts
      timing.ts
      preferences.ts
```

This is a proposal only. No frontend implementation begins until the Sprint 2 architecture is approved.
