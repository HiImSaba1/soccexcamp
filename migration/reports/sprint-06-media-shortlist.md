# Sprint 6 media approval shortlist

## Current boundary

No media has been downloaded. Every listed manifest record remains `pending-approval`. Approval should cover ownership/usage rights, intended placement, and permission to download the original URL. Acquired files must then be verified by checksum, actual MIME type and dimensions before entering `public/`.

## Recommended first acquisition batch

### Current campaign / homepage

| WordPress ID | File | Proposed use | Source condition |
| --- | --- | --- | --- |
| 2589 | `soccerx_trials_26.png` | Germany ’26 campaign artwork or supporting visual | Public HTTPS URL; also identified as a featured image |
| 2317 | `soccerxcamp_trainers_scouters_3.jpg` | Germany/event or June 2024 story lead candidate | Public URL; featured by both June posts and Germany pages |

ID 2589 is time-sensitive campaign artwork for dates that have already passed as of 28 September 2026. It should not become the primary homepage hero without confirming whether Germany ’26 remains an active campaign.

### June 2024 bilingual story

| WordPress IDs | Files | Proposed use |
| --- | --- | --- |
| 2297, 2298, 2299, 2307, 2308, 2310, 2315, 2316, 2318, 2320 | `soccerxcamp_players_*.jpg` | Match/action gallery |
| 2300, 2302, 2303, 2305, 2313, 2319 | `soccerxcamp_players_scouters_*.jpg` | Players/scouters gallery |
| 2301, 2304, 2312, 2317 | `soccerxcamp_trainers_scouters_*.jpg` | Trainers/scouters gallery |

These records use public WordPress upload URLs and are referenced by the paired published posts 2321/2337. Player and minor-image consent must be confirmed before publication.

### Talentbook

| WordPress ID | File | Proposed use | Source condition |
| --- | --- | --- | --- |
| 1257 | `Talentebuch-final.pdf` | Historical 2023 downloadable talent book | Public HTTP URL; review personal data before publication |
| 1513 | `soccerxcamp_talentbook.png` | Talentbook cover/preview | Public HTTP URL; featured-image relationship exists |

## Deferred records

Homepage candidates 70, 71, 72 and 78 and legacy logos 115/161 point to `soccerxcamp.localhost`; they cannot be acquired from those manifest URLs. They require an owner-supplied archive or a separately verified live equivalent. No URL substitution should be guessed.

## Approval response requested

Approve one or more explicit groups:

1. `campaign`: IDs 2589 and 2317;
2. `june-story`: IDs 2297–2320 listed above;
3. `talentbook`: IDs 1257 and 1513;
4. provide replacements/archive files for localhost-only IDs 70, 71, 72, 78, 115 and 161.

Approval to download does not itself approve public publication. The verified local assets and proposed alt text will be reviewed once more before they are wired into the site.
