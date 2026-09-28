import type { Locale } from "@/i18n/config";
import { siteContact } from "@/content/site-contact";

export type CorePageKey =
  | "about"
  | "event"
  | "success"
  | "talentbook"
  | "contact"
  | "apply"
  | "privacy";
type PageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string; items?: string[] }>;
  cta?: { label: string; href: string };
};

const en: Record<CorePageKey, PageContent> = {
  about: {
    eyebrow: "About SoccerX Camp",
    title: "A serious stage for ambitious footballers.",
    intro:
      "SoccerX Camp connects young players with international coaching, competitive football and professional scouting perspectives.",
    sections: [
      {
        title: "The purpose",
        body: "Create a focused environment where players can train, compete and be evaluated with clarity.",
      },
      {
        title: "The network",
        body: "SoccerX Camp is organized with Soccer and More, bringing international football management, coaching and scouting perspectives into one focused environment.",
      },
      {
        title: "Our standard",
        body: "Clear organization, demanding football and respectful communication with players and families.",
      },
    ],
    cta: { label: "Contact the team", href: "/contact" },
  },
  event: {
    eyebrow: "Event archive · Germany",
    title: "SoccerX Trials Germany ’26",
    intro:
      "Archive of the international football trials held in Germany from 6–12 April 2026 for players born from 2008 through 2011.",
    sections: [
      {
        title: "On the pitch",
        body: "Structured training and competitive matches were designed to show how players responded technically, tactically and mentally.",
      },
      {
        title: "The setting",
        body: "The campaign included accommodation at Fun4You in Wiesloch, near Heidelberg, alongside the event's football programme.",
      },
      {
        title: "Event record",
        body: "This page is retained as a historical record. Applications for the April 2026 event are closed.",
        items: [
          "Dates: 6–12 April 2026",
          "Eligible birth years: 2008–2011",
          "Location: Germany",
          "Status: completed",
        ],
      },
    ],
  },
  success: {
    eyebrow: "Success archive",
    title: "Progress earned on and beyond the pitch.",
    intro:
      "A selection of documented trials, signings and professional opportunities connected with the SoccerX Camp network.",
    sections: [
      {
        title: "Opportunity in motion",
        body: "Each story represents a different step: being observed, earning a trial, joining a club or continuing development in a professional environment.",
      },
      {
        title: "Built on the pitch",
        body: "The archive connects the camp experience with real football pathways while preserving the original WordPress media and published context.",
      },
    ],
    cta: { label: "Learn about the camp", href: "/about" },
  },
  talentbook: {
    eyebrow: "Player archive",
    title: "Talentbook",
    intro:
      "A focused archive for approved player material and historical SoccerX Camp publications.",
    sections: [
      {
        title: "2023 archive",
        body: "The WXR references English and Greek 2023 publications and one PDF attachment. The file remains unavailable until the media manifest is reviewed and approved.",
      },
      {
        title: "Next edition",
        body: "Future editions should use accessible web profiles and an optional verified PDF download rather than an image-only publication.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Start the conversation.",
    intro:
      "Questions about the Germany trials, participation or SoccerX Camp can be directed to the existing public contacts below.",
    sections: [
      { title: "Greece", body: siteContact.phones[0].label },
      { title: "Germany", body: siteContact.phones[1].label },
      {
        title: "Email",
        body: siteContact.emails.map((item) => item.label).join("\n"),
      },
    ],
  },
  apply: {
    eyebrow: "Participation",
    title: "Take your next step.",
    intro:
      "Submit your details to the SoccerX Camp team and express your interest in future football opportunities, trials and camp activities.",
    sections: [
      {
        title: "Your application",
        body: "Complete the athlete and parent or guardian information below, including birth date, current club, playing position, city and contact details.",
      },
      {
        title: "Player profile",
        body: "Height, weight and participation notes help the SoccerX Camp team understand the player profile and the reason for applying.",
      },
      {
        title: "What happens next",
        body: "After the application is submitted, the information is delivered directly to the SoccerX Camp team for review. Submission does not guarantee selection or participation in a future event.",
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy information",
    intro:
      "SoccerX Camp uses the information you submit through its website only for the purpose connected with the form you choose to complete.",
    sections: [
      {
        title: "Contact enquiries",
        body: "Your name, email address, optional phone number, subject and message are sent by email to the published SoccerX Camp contacts so the team can receive and answer your enquiry. The website does not store these submissions in an application database.",
      },
      {
        title: "Participation applications",
        body: "Participation applications include athlete and parent or guardian details, birth date, current club, playing position, city, height, weight, contact information and participation notes. These details are sent by email to the designated SoccerX Camp recipients so the application can be reviewed. The website does not store the submitted application in an application database.",
      },
      {
        title: "Your request",
        body: "You may use the published SoccerX Camp contact details to request access to, correction of or deletion of information you have submitted.",
      },
    ],
  },
};
const el: Record<CorePageKey, PageContent> = {
  about: {
    eyebrow: "Σχετικά με το SoccerX Camp",
    title: "Μια σοβαρή σκηνή για φιλόδοξους ποδοσφαιριστές.",
    intro:
      "Το SoccerX Camp συνδέει νέους αθλητές με διεθνή προπόνηση, ανταγωνιστικό ποδόσφαιρο και επαγγελματική οπτική scouting.",
    sections: [
      {
        title: "Ο σκοπός",
        body: "Ένα συγκεντρωμένο περιβάλλον όπου οι παίκτες προπονούνται, αγωνίζονται και αξιολογούνται με σαφήνεια.",
      },
      {
        title: "Το δίκτυο",
        body: "Το SoccerX Camp διοργανώνεται με τη Soccer and More, συνδυάζοντας διεθνή εμπειρία management, προπονητική και scouting σε ένα απαιτητικό περιβάλλον.",
      },
      {
        title: "Το πρότυπό μας",
        body: "Σαφής οργάνωση, απαιτητικό ποδόσφαιρο και υπεύθυνη επικοινωνία με παίκτες και οικογένειες.",
      },
    ],
    cta: { label: "Επικοινωνία με την ομάδα", href: "/contact" },
  },
  event: {
    eyebrow: "Αρχείο διοργάνωσης · Γερμανία",
    title: "SoccerX Trials Γερμανία ’26",
    intro:
      "Αρχείο των διεθνών ποδοσφαιρικών trials που πραγματοποιήθηκαν στη Γερμανία από 6–12 Απριλίου 2026 για παίκτες γεννημένους από το 2008 έως το 2011.",
    sections: [
      {
        title: "Στο γήπεδο",
        body: "Οι οργανωμένες προπονήσεις και οι ανταγωνιστικοί αγώνες σχεδιάστηκαν ώστε να αναδείξουν τεχνική, τακτική και νοοτροπία.",
      },
      {
        title: "Η τοποθεσία",
        body: "Η διοργάνωση περιλάμβανε διαμονή στο Fun4You στο Wiesloch, κοντά στη Χαϊδελβέργη, παράλληλα με το αγωνιστικό πρόγραμμα.",
      },
      {
        title: "Αρχείο διοργάνωσης",
        body: "Η σελίδα διατηρείται ως ιστορικό αρχείο. Οι αιτήσεις για τη διοργάνωση του Απριλίου 2026 έχουν κλείσει.",
        items: [
          "Ημερομηνίες: 6–12 Απριλίου 2026",
          "Έτη γέννησης: 2008–2011",
          "Τοποθεσία: Γερμανία",
          "Κατάσταση: ολοκληρώθηκε",
        ],
      },
    ],
  },
  success: {
    eyebrow: "Αρχείο επιτυχιών",
    title: "Πρόοδος μέσα και έξω από το γήπεδο.",
    intro:
      "Μια επιλογή από καταγεγραμμένα trials, υπογραφές και επαγγελματικές ευκαιρίες που συνδέονται με το δίκτυο του SoccerX Camp.",
    sections: [
      {
        title: "Η ευκαιρία σε κίνηση",
        body: "Κάθε ιστορία αποτυπώνει ένα διαφορετικό βήμα: αξιολόγηση, trial, ένταξη σε ομάδα ή συνέχιση της εξέλιξης σε επαγγελματικό περιβάλλον.",
      },
      {
        title: "Χτισμένο στο γήπεδο",
        body: "Το αρχείο συνδέει την εμπειρία του camp με πραγματικές ποδοσφαιρικές διαδρομές, διατηρώντας το αρχικό υλικό και το δημοσιευμένο πλαίσιο.",
      },
    ],
    cta: { label: "Σχετικά με το camp", href: "/about" },
  },
  talentbook: {
    eyebrow: "Αρχείο παικτών",
    title: "Talentbook",
    intro:
      "Ένα οργανωμένο αρχείο για εγκεκριμένο υλικό παικτών και παλαιότερες εκδόσεις του SoccerX Camp.",
    sections: [
      {
        title: "Αρχείο 2023",
        body: "Το WXR αναφέρει αγγλικές και ελληνικές εκδόσεις του 2023 και ένα PDF. Το αρχείο παραμένει κλειστό μέχρι την έγκριση του media manifest.",
      },
      {
        title: "Επόμενη έκδοση",
        body: "Οι επόμενες εκδόσεις πρέπει να χρησιμοποιούν προσβάσιμα web profiles και προαιρετικό επαληθευμένο PDF.",
      },
    ],
  },
  contact: {
    eyebrow: "Επικοινωνία",
    title: "Ας ξεκινήσουμε τη συζήτηση.",
    intro:
      "Για ερωτήσεις σχετικά με τη Γερμανία, τη συμμετοχή ή το SoccerX Camp χρησιμοποιήστε τα υπάρχοντα δημόσια στοιχεία.",
    sections: [
      { title: "Ελλάδα", body: siteContact.phones[0].label },
      { title: "Γερμανία", body: siteContact.phones[1].label },
      {
        title: "Email",
        body: siteContact.emails.map((item) => item.label).join("\n"),
      },
    ],
  },
  apply: {
    eyebrow: "Συμμετοχή",
    title: "Κάνε το επόμενο βήμα.",
    intro:
      "Στείλε τα στοιχεία σου στην ομάδα του SoccerX Camp και εκδήλωσε το ενδιαφέρον σου για μελλοντικές ποδοσφαιρικές ευκαιρίες, trials και δραστηριότητες του camp.",
    sections: [
      {
        title: "Η αίτησή σου",
        body: "Συμπλήρωσε τα στοιχεία του αθλητή και του γονέα ή κηδεμόνα, καθώς και την ημερομηνία γέννησης, την ομάδα, τη θέση, την πόλη και τα στοιχεία επικοινωνίας.",
      },
      {
        title: "Προφίλ αθλητή",
        body: "Το ύψος, το βάρος και οι σημειώσεις συμμετοχής βοηθούν την ομάδα του SoccerX Camp να κατανοήσει καλύτερα το προφίλ του αθλητή και τον λόγο της αίτησης.",
      },
      {
        title: "Τι ακολουθεί",
        body: "Μετά την υποβολή, τα στοιχεία αποστέλλονται απευθείας στην ομάδα του SoccerX Camp για αξιολόγηση. Η υποβολή αίτησης δεν εγγυάται επιλογή ή συμμετοχή σε μελλοντική διοργάνωση.",
      },
    ],
  },
  privacy: {
    eyebrow: "Απόρρητο",
    title: "Πληροφορίες απορρήτου",
    intro:
      "Το SoccerX Camp χρησιμοποιεί τις πληροφορίες που υποβάλλετε μέσω της ιστοσελίδας μόνο για τον σκοπό που σχετίζεται με τη φόρμα που επιλέγετε να συμπληρώσετε.",
    sections: [
      {
        title: "Μηνύματα επικοινωνίας",
        body: "Το ονοματεπώνυμο, το email, το προαιρετικό τηλέφωνο, το θέμα και το μήνυμά σας αποστέλλονται μέσω email στις δημοσιευμένες επαφές του SoccerX Camp, ώστε η ομάδα να λάβει και να απαντήσει στο αίτημά σας. Η ιστοσελίδα δεν αποθηκεύει αυτές τις υποβολές σε βάση δεδομένων εφαρμογής.",
      },
      {
        title: "Αιτήσεις συμμετοχής",
        body: "Οι αιτήσεις συμμετοχής περιλαμβάνουν στοιχεία αθλητή και γονέα ή κηδεμόνα, ημερομηνία γέννησης, ομάδα, θέση, πόλη, ύψος, βάρος, στοιχεία επικοινωνίας και σημειώσεις συμμετοχής. Τα στοιχεία αποστέλλονται μέσω email στους καθορισμένους αποδέκτες του SoccerX Camp για την αξιολόγηση της αίτησης. Η ιστοσελίδα δεν αποθηκεύει την υποβληθείσα αίτηση σε βάση δεδομένων εφαρμογής.",
      },
      {
        title: "Το αίτημά σας",
        body: "Μπορείτε να χρησιμοποιήσετε τα δημοσιευμένα στοιχεία επικοινωνίας του SoccerX Camp για να ζητήσετε πρόσβαση, διόρθωση ή διαγραφή πληροφοριών που έχετε υποβάλει.",
      },
    ],
  },
};
export function getCorePage(locale: Locale, key: CorePageKey) {
  return (locale === "el" ? el : en)[key];
}
