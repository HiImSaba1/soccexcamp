import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const referencedMedia = [
  "public/media/wordpress/161-soccer_x_camp_logo_ok.png",
  "public/media/wordpress/629-soccerxcamp-logo.png",
  "public/media/wordpress/70-soccer_camp_section_2-scaled.jpg",
  "public/media/wordpress/71-kids_playing_2-scaled.jpg",
  "public/media/wordpress/195-maragozidis_tasos.jpg",
  "public/media/wordpress/197-dimitris_petkakis.jpg",
  "public/media/wordpress/198-dora_ioakeimidou.jpg",
  "public/media/wordpress/1653-guido_nikolay.jpg",
  "public/media/wordpress/123-paok_deliopoulos_petkakis.jpg",
  "public/media/wordpress/1540-zannakis_hoffenheim_maragozidis.jpg",
  "public/media/wordpress/1544-aristadis_soccerx_camp_petkakis_maragozidis.jpg",
  "public/media/wordpress/1546-stefan_shwab_paok_maragozidis_soccerxcamp.png",
  "public/media/wordpress/1547-giannouis_maragozidis.png",
  "public/media/wordpress/239-soccer_x_camp_signing_6.jpg",
  "public/media/wordpress/241-soccer_x_camp_signing_8.jpg",
  "public/media/wordpress/242-soccer_x_camp_signing.jpg",
  "public/media/wordpress/244-soccer_x_camp_signing_2.jpg",
  "public/media/wordpress/245-soccer_x_camp_signing_3.jpg",
  "public/media/wordpress/246-soccer_x_camp_signing_4.jpg",
  "public/media/wordpress/248-soccer_x_camp_signing_5.jpg",
  "public/media/wordpress/2416-fun4you.jpg",
  "public/media/wordpress/2678-soccerxcamp_april_trails_germany_main.jpg",
  "public/media/wordpress/499-soccerxcamp.jpg",
  "public/media/wordpress/2005-tasos_petkakis_scouters_soccerxcamp_fifa.jpg",
  "public/media/wordpress/326-dora_soccerxcamp.jpg",
  "public/media/wordpress/1257-Talentebuch-final.pdf",
  "public/media/wordpress/1513-soccerxcamp_talentbook.png",
  "public/media/wordpress/611-flanagan-profile.jpg",
  "public/media/wordpress/1041-joel_damahou_soccerxcamp_profile.jpg",
  "public/media/wordpress/1973-gregory_knoff.jpg",
  "public/media/wordpress/1962-ivo_rogalo.jpg",
] as const;

describe("public WXR media references", () => {
  it.each(referencedMedia)("keeps %s available", relativePath => {
    expect(existsSync(join(process.cwd(), relativePath))).toBe(true);
  });
});
