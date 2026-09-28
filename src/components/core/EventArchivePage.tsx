"use client";

import { CorePage } from "@/components/core/CorePage";
import { EventMedia } from "@/components/core/EventMedia";
import { useLocale } from "@/providers/LocaleProvider";

export function EventArchivePage() {
  const { locale } = useLocale();
  return <><aside className="date-notice">{locale === "el" ? "Σημείωση αρχείου: η διοργάνωση 6–12 Απριλίου 2026 έχει ολοκληρωθεί και οι αιτήσεις έχουν κλείσει." : "Archive notice: the 6–12 April 2026 event has passed and applications are closed."}</aside><CorePage page="event" /><EventMedia /></>;
}
