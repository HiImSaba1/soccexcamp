import type { Locale } from "@/i18n/config";

export type Story = {
  slug: string;
  publishedAt: string;
  source: { enWordPressId: number; elWordPressId: number; featuredAttachmentId: number; mediaStatus: "awaiting-approval" };
  content: Record<Locale, { eyebrow: string; title: string; intro: string; sections: { title: string; body: string }[]; closing: string }>;
};

export const stories: Story[] = [{
  slug: "june-2024",
  publishedAt: "2024-07-04",
  source: { enWordPressId: 2337, elWordPressId: 2321, featuredAttachmentId: 2317, mediaStatus: "awaiting-approval" },
  content: {
    en: {
      eyebrow: "Camp recap / June 2024",
      title: "Three days of football, effort and international scouting.",
      intro: "SoccerX Camp brought young footballers, coaches and guests together in Raidestos, Thessaloniki, from 22–24 June 2024.",
      sections: [
        { title: "On the pitch", body: "Players in the 2007–2008 and 2009–2010 age groups took part in competitive matches across the three-day camp. The original report congratulates every participant for their effort, talent and football." },
        { title: "A professional perspective", body: "Marco Thiede, a Soccer and More player then competing with Karlsruher SC in Germany, attended the event and followed the young players’ work. The original recap records his positive response to the quality of the emerging Greek talent." },
        { title: "Guidance", body: "The recap also thanks associate coach Efstratios Pagotis for guiding and supporting the participating footballers throughout the international scouting event." },
      ],
      closing: "Thank you to everyone who joined us. See you on the field!",
    },
    el: {
      eyebrow: "Ανασκόπηση camp / Ιούνιος 2024",
      title: "Τρεις ημέρες ποδοσφαίρου, προσπάθειας και διεθνούς scouting.",
      intro: "Το SoccerX Camp έφερε κοντά νεαρούς ποδοσφαιριστές, προπονητές και προσκεκλημένους στη Ραιδεστό Θεσσαλονίκης, από τις 22 έως τις 24 Ιουνίου 2024.",
      sections: [
        { title: "Στο γήπεδο", body: "Ποδοσφαιριστές των ηλικιακών κατηγοριών 2007–2008 και 2009–2010 συμμετείχαν σε αγώνες κατά τη διάρκεια του τριήμερου camp. Η αρχική δημοσίευση συγχαίρει όλα τα παιδιά για την προσπάθεια, το ταλέντο και το ποδόσφαιρο που παρουσίασαν." },
        { title: "Επαγγελματική ματιά", body: "Ο Marco Thiede, ποδοσφαιριστής της Soccer and More που τότε αγωνιζόταν στην Karlsruher SC στη Γερμανία, παρακολούθησε τη διοργάνωση και την προσπάθεια των νεαρών παικτών. Η αρχική ανασκόπηση καταγράφει τη θετική του εντύπωση για την ποιότητα των ανερχόμενων ελληνικών ταλέντων." },
        { title: "Καθοδήγηση", body: "Η δημοσίευση ευχαριστεί επίσης τον συνεργάτη προπονητή Ευστράτιο Παγώτη για την καθοδήγηση και την υποστήριξη των ποδοσφαιριστών στη διάρκεια της διοργάνωσης." },
      ],
      closing: "Σας ευχαριστούμε όλους για την παρουσία σας. Τα λέμε στα γήπεδα!",
    },
  },
}];

export function getStory(slug: string) { return stories.find(story => story.slug === slug); }
