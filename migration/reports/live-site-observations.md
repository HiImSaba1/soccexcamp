# Soccerxcamp live-site observations

Observed on 2026-09-28 from publicly indexed pages at `https://www.soccerxcamp.com/`. Direct automated retrieval was challenged by the site's verification layer, so these observations supplement rather than replace the WXR export.

## Confirmed public surfaces

- English home: `/`
- Greek home: `/el/αρχική/`
- English about: `/about-us/`
- Greek about: `/el/ποιοι-είμαστε/`
- English participation form: `/participation-form/`
- English contact: `/contact/`
- English success stories: `/success-stories/`
- Current English event campaign: `/germany-26/`

The bilingual route model and active Germany 2026 campaign agree with the WXR page and menu inventory. Greek titles render correctly on the live site, so mojibake in WXR title fields must be treated as an export/data-normalization issue; original values must remain retained alongside repaired display values.

## Current content model implied by the live site

- Homepage: campaign hero, participation CTA, positioning, animated statistics, testimonials, specialist profiles, gallery, and contact CTA.
- About: organization story, representatives, experience/scouting/work/success sections, former-camp media, specialists, and contact CTA.
- Germany 2026: dated event landing page, eligibility years, travel/accommodation, competitive program, purpose, health-card guidance, cancellation policy, registration details, and organizer/auspice statements.
- Success stories: named player outcomes with images and club claims.
- Participation: athlete and parent information, birth date, club, playing position, city, height, weight, email, phone, notes, parental acknowledgement, liability/medical release language, and electronic-signature acknowledgement.
- Contact: two phone numbers, two email addresses, location, and contact copy.

## Privacy and legal boundary

The participation flow handles data about potentially minor athletes, including identity, date of birth, contact details, physical measurements, free-form notes, parental acknowledgement, and medical/liability language. Sprint 2 must define data minimization, retention, access, consent evidence, delivery, deletion, and privacy-notice requirements before any database schema or form implementation is approved.

No existing WordPress form submission data was discovered in this WXR export, and none should be inferred from form markup.

## Copy and factual conflicts requiring owner confirmation

- Germany 2026 is described as a seven-day event from 6–12 April 2026, while another section says participants travel for ten action-packed days.
- The about content references both more than 150 and more than 200 represented professional players.
- Dimitris Petkakis is described with both more than 300 and more than 350 professional appearances across language/page variants.
- The site uses variants of the name `Nickolay Guido`, including inconsistent capitalization/spelling.
- The homepage's indexed animated counters appear as `0+` or `0%`; these values must not be migrated as factual totals without their configured targets.
- Time-sensitive rankings, represented-player counts, club affiliations, transfer outcomes, event dates, pricing/payment terms, and cancellation policy require explicit owner validation before publication in the new application.

## Migration implications

- Preserve bilingual content relationships, but replace WordPress/Polylang mechanics with an explicit locale-aware route/content model.
- Treat Elementor structures as extraction evidence, not reusable frontend architecture.
- Rebuild forms as typed application flows; do not render WordPress form shortcodes.
- Model the current event separately from evergreen organization content.
- Represent success stories as structured, owner-approved records only after names, clubs, outcomes, images, and permissions are verified.
- Preserve legacy URLs for redirect planning, including percent-encoded Greek routes, but do not finalize redirects before Sprint 2 approves the route model.
- Do not download or publish referenced media until ownership, relevance, and migration scope are reviewed.
