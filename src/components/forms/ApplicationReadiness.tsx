"use client";

import { Check, LockKeyhole } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { useLocale } from "@/providers/LocaleProvider";

const copy = {
  en: {
    eyebrow: "Application preview",
    title: "Know what to prepare.",
    intro: "This checklist describes the expected application journey without collecting or transmitting personal information.",
    steps: [
      ["Athlete profile", "Name, birth date, city, current club and playing position."],
      ["Guardian details", "Required whenever the participating athlete is a minor."],
      ["Event terms", "Confirmed schedule, travel, payment and cancellation information."],
      ["Consent and privacy", "An approved notice, consent version, retention period and deletion route."],
    ],
    lock: "Online submissions remain locked until the privacy and event terms are approved.",
    button: "Contact us meanwhile",
  },
  el: {
    eyebrow: "Προεπισκόπηση αίτησης",
    title: "Τι θα χρειαστεί να προετοιμάσεις.",
    intro: "Η λίστα παρουσιάζει την αναμενόμενη διαδικασία χωρίς να συλλέγει ή να αποστέλλει προσωπικά δεδομένα.",
    steps: [
      ["Προφίλ αθλητή", "Ονοματεπώνυμο, ημερομηνία γέννησης, πόλη, τωρινή ομάδα και αγωνιστική θέση."],
      ["Στοιχεία κηδεμόνα", "Απαραίτητα όταν ο αθλητής που συμμετέχει είναι ανήλικος."],
      ["Όροι διοργάνωσης", "Επιβεβαιωμένο πρόγραμμα και πληροφορίες ταξιδιού, πληρωμής και ακύρωσης."],
      ["Συγκατάθεση και απόρρητο", "Εγκεκριμένη ενημέρωση, έκδοση συγκατάθεσης, χρόνος διατήρησης και διαδικασία διαγραφής."],
    ],
    lock: "Οι online αιτήσεις παραμένουν κλειστές μέχρι να εγκριθούν οι όροι απορρήτου και διοργάνωσης.",
    button: "Επικοινώνησε μαζί μας",
  },
} as const;

export function ApplicationReadiness() {
  const { locale } = useLocale(); const text = copy[locale];
  return <section className="application-readiness" aria-labelledby="application-readiness-title"><header><p>{text.eyebrow}</p><h2 id="application-readiness-title">{text.title}</h2><p>{text.intro}</p></header><ol>{text.steps.map(([title, body], index) => <li key={title}><span>0{index + 1}</span><Check aria-hidden="true"/><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol><div className="application-readiness__lock"><LockKeyhole aria-hidden="true"/><p>{text.lock}</p><EditorialButton href="/contact" label={text.button} tone="dark"/></div></section>;
}
