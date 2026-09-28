import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const referencedMedia = [
  "public/media/wordpress/161-soccer_x_camp_logo_ok.png",
  "public/media/wordpress/195-maragozidis_tasos.jpg",
  "public/media/wordpress/197-dimitris_petkakis.jpg",
  "public/media/wordpress/198-dora_ioakeimidou.jpg",
  "public/media/wordpress/1653-guido_nikolay.jpg",
  "public/media/wordpress/123-paok_deliopoulos_petkakis.jpg",
  "public/media/wordpress/1540-zannakis_hoffenheim_maragozidis.jpg",
  "public/media/wordpress/1544-aristadis_soccerx_camp_petkakis_maragozidis.jpg",
  "public/media/wordpress/1546-stefan_shwab_paok_maragozidis_soccerxcamp.png",
  "public/media/wordpress/1547-giannouis_maragozidis.png",
  "public/media/wordpress/2416-fun4you.jpg",
  "public/media/wordpress/2678-soccerxcamp_april_trails_germany_main.jpg",
  "public/media/wordpress/499-soccerxcamp.jpg",
  "public/media/wordpress/1257-Talentebuch-final.pdf",
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
