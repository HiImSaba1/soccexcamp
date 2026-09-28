"use client";

import {
  type FormEvent,
  useState,
} from "react";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import { useLocale } from "@/providers/LocaleProvider";

const copy = {
  en: {
    eyebrow: "Participation form",
    title: "Apply for SoccerX Camp.",
    intro:
      "Complete the athlete and guardian details below. Required fields are marked with an asterisk.",

    athlete: "Athlete’s full name",
    guardian: "Parent or guardian’s full name",
    birthDate: "Birth date",
    club: "Current club",
    position: "Main position",
    city: "City",
    height: "Height (cm)",
    weight: "Weight (kg)",
    email: "Email",
    phone: "Phone number",

    notes: "Participation notes",
    notesPlaceholder:
      "I want to be part of SoccerX Camp because…",

    consentTitle:
      "Informed consent and acknowledgement",

    consent:
      "I approve the child’s participation in SoccerX Camp activities and acknowledge the risks connected with travel and sporting activity. I authorize appropriate medical assistance in case of injury, release the organizers, coaches, partners, sponsors and venue operators from claims arising from participation where permitted by law, and confirm that this electronic acknowledgement has the same effect as my handwritten signature.",

    privacy:
      "I have also read the Privacy information.",

    submit: "Submit application",
    sending: "Submitting…",

    success:
      "Thank you. The participation application has been sent successfully and the SoccerX Camp team will contact you shortly.",

    error:
      "The application could not be sent. Please try again or contact the team by email or phone.",

    rateLimited:
      "Too many applications have been submitted from this connection. Please wait before trying again.",
  },

  el: {
    eyebrow: "Αίτηση συμμετοχής",
    title: "Κάνε αίτηση στο SoccerX Camp.",

    intro:
      "Συμπλήρωσε τα στοιχεία αθλητή και κηδεμόνα. Τα υποχρεωτικά πεδία σημειώνονται με αστερίσκο.",

    athlete: "Ονοματεπώνυμο αθλητή",
    guardian:
      "Ονοματεπώνυμο γονέα ή κηδεμόνα",
    birthDate: "Ημερομηνία γέννησης",
    club: "Σύλλογος που ανήκει",
    position: "Θέση που αγωνίζεται",
    city: "Πόλη",
    height: "Ύψος (cm)",
    weight: "Βάρος (kg)",
    email: "Email",
    phone: "Τηλέφωνο επικοινωνίας",

    notes: "Σημειώσεις συμμετοχής",
    notesPlaceholder:
      "Θα ήθελα να συμμετάσχω στο SoccerX Camp γιατί…",

    consentTitle:
      "Ενημερωμένη συγκατάθεση και αναγνώριση",

    consent:
      "Εγκρίνω τη συμμετοχή του παιδιού στις δραστηριότητες του SoccerX Camp και αναγνωρίζω τους κινδύνους που συνδέονται με τη μετακίνηση και την αθλητική δραστηριότητα. Εξουσιοδοτώ την κατάλληλη ιατρική βοήθεια σε περίπτωση τραυματισμού, απαλλάσσω τους διοργανωτές, προπονητές, συνεργάτες, χορηγούς και υπεύθυνους εγκαταστάσεων από αξιώσεις που προκύπτουν από τη συμμετοχή όπου το επιτρέπει ο νόμος και επιβεβαιώνω ότι η ηλεκτρονική αναγνώριση έχει την ίδια ισχύ με τη χειρόγραφη υπογραφή μου.",

    privacy:
      "Έχω επίσης διαβάσει την Πολιτική απορρήτου.",

    submit: "Υποβολή αίτησης",
    sending: "Υποβολή…",

    success:
      "Ευχαριστούμε. Η αίτηση συμμετοχής στάλθηκε επιτυχώς και η ομάδα του SoccerX Camp θα επικοινωνήσει μαζί σας σύντομα.",

    error:
      "Δεν ήταν δυνατή η αποστολή της αίτησης. Δοκιμάστε ξανά ή επικοινωνήστε με την ομάδα μέσω email ή τηλεφώνου.",

    rateLimited:
      "Έχουν πραγματοποιηθεί πολλές προσπάθειες υποβολής. Παρακαλούμε περιμένετε λίγο πριν δοκιμάσετε ξανά.",
  },
} as const;

type Status =
  | "idle"
  | "sending"
  | "success"
  | "error"
  | "rate-limited";

type FieldOptions = {
  type?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
  step?: string;
};

export function ParticipationForm() {
  const { locale } = useLocale();

  const text = copy[locale];

  const [status, setStatus] =
    useState<Status>("idle");

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (status === "sending") {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("sending");

    try {
      const response = await fetch(
        "/api/participation",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            athleteName:
              data.get("athleteName"),

            guardianName:
              data.get("guardianName"),

            birthDate:
              data.get("birthDate"),

            currentClub:
              data.get("currentClub"),

            position:
              data.get("position"),

            city:
              data.get("city"),

            height:
              data.get("height"),

            weight:
              data.get("weight"),

            email:
              data.get("email"),

            phone:
              data.get("phone"),

            notes:
              data.get("notes"),

            consent:
              data.get("consent") === "on",

            website:
              data.get("website"),
          }),
        }
      );

      if (response.status === 429) {
        setStatus("rate-limited");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Participation delivery failed"
        );
      }

      form.reset();

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function field(
    name: string,
    label: string,
    options: FieldOptions = {}
  ) {
    return (
      <div className="contact-form__field">
        <label
          htmlFor={`participation-${name}`}
        >
          {label} *
        </label>

        <input
          id={`participation-${name}`}
          name={name}
          type={options.type ?? "text"}
          autoComplete={options.autoComplete}
          min={options.min}
          max={options.max}
          step={options.step}
          required
        />
      </div>
    );
  }

  return (
    <section
      className="contact-form-section participation-form-section"
      aria-labelledby="participation-form-title"
    >
      <header>
        <p>{text.eyebrow}</p>

        <div>
          <h2 id="participation-form-title">
            {text.title}
          </h2>

          <p>{text.intro}</p>
        </div>
      </header>

      {status === "success" ? (
        <div
          className="contact-form__success"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" />

          <p>{text.success}</p>
        </div>
      ) : (
        <form
          className="contact-form participation-form"
          onSubmit={submit}
        >
          {field(
            "athleteName",
            text.athlete,
            {
              autoComplete: "name",
            }
          )}

          {field(
            "guardianName",
            text.guardian,
            {
              autoComplete: "name",
            }
          )}

          {field(
            "birthDate",
            text.birthDate,
            {
              type: "date",
            }
          )}

          {field(
            "currentClub",
            text.club
          )}

          {field(
            "position",
            text.position
          )}

          {field(
            "city",
            text.city,
            {
              autoComplete:
                "address-level2",
            }
          )}

          {field(
            "height",
            text.height,
            {
              type: "number",
              min: 100,
              max: 230,
            }
          )}

          {field(
            "weight",
            text.weight,
            {
              type: "number",
              min: 30,
              max: 180,
              step: "0.1",
            }
          )}

          {field(
            "email",
            text.email,
            {
              type: "email",
              autoComplete: "email",
            }
          )}

          {field(
            "phone",
            text.phone,
            {
              type: "tel",
              autoComplete: "tel",
            }
          )}

          <div className="contact-form__field contact-form__field--message">
            <label htmlFor="participation-notes">
              {text.notes} *
            </label>

            <textarea
              id="participation-notes"
              name="notes"
              rows={7}
              minLength={10}
              maxLength={4000}
              placeholder={
                text.notesPlaceholder
              }
              required
            />
          </div>

          <div
            className="contact-form__honeypot"
            aria-hidden="true"
          >
            <label htmlFor="participation-website">
              Website
            </label>

            <input
              id="participation-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <fieldset className="participation-form__consent">
            <legend>
              {text.consentTitle} *
            </legend>

            <label className="contact-form__consent">
              <input
                name="consent"
                type="checkbox"
                required
              />

              <span>
                {text.consent}{" "}

                <Link href="/privacy">
                  {text.privacy}
                </Link>
              </span>
            </label>
          </fieldset>

          <div className="contact-form__actions">
            <button
              type="submit"
              disabled={status === "sending"}
            >
              <span className="action-button__fill" aria-hidden="true" />
              <span className="action-button__label"><span>{status === "sending" ? text.sending : text.submit}</span><span aria-hidden="true">{status === "sending" ? text.sending : text.submit}</span></span>
              <span className="action-button__arrow" aria-hidden="true"><ArrowUpRight /></span>
            </button>

            {status === "error" && (
              <p role="alert">
                {text.error}
              </p>
            )}

            {status ===
              "rate-limited" && (
              <p role="alert">
                {text.rateLimited}
              </p>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
