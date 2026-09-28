"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

const copy = {
  en: { eyebrow: "Direct enquiry", title: "Send us a message.", intro: "Complete the form and the SoccerX Camp team will reply by email or phone.", name: "Full name", email: "Email", phone: "Phone (optional)", subject: "Subject", message: "Message", consent: "I have read the Privacy information and agree to the use of my details to answer this enquiry.", privacy: "Privacy information", submit: "Send message", sending: "Sending…", success: "Thanks for contacting us. Your message has been sent and we will be in touch shortly.", error: "We could not send your message. Please try again or use one of the email addresses shown on this page." },
  el: { eyebrow: "Άμεση επικοινωνία", title: "Στείλε μας μήνυμα.", intro: "Συμπλήρωσε τη φόρμα και η ομάδα του SoccerX Camp θα απαντήσει μέσω email ή τηλεφώνου.", name: "Ονοματεπώνυμο", email: "Email", phone: "Τηλέφωνο (προαιρετικό)", subject: "Θέμα", message: "Μήνυμα", consent: "Έχω διαβάσει την Πολιτική απορρήτου και συμφωνώ με τη χρήση των στοιχείων μου για την απάντηση στο αίτημά μου.", privacy: "Πολιτική απορρήτου", submit: "Αποστολή μηνύματος", sending: "Αποστολή…", success: "Ευχαριστούμε για την επικοινωνία. Το μήνυμά σου στάλθηκε και θα επικοινωνήσουμε μαζί σου σύντομα.", error: "Δεν ήταν δυνατή η αποστολή. Δοκίμασε ξανά ή χρησιμοποίησε ένα από τα email της σελίδας." },
} as const;

export function ContactForm() {
  const { locale } = useLocale();
  const text = copy[locale];
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.get("name"), email: data.get("email"), phone: data.get("phone"), subject: data.get("subject"), message: data.get("message"), consent: data.get("consent") === "on", website: data.get("website") }) });
      if (!response.ok) throw new Error("Contact delivery failed");
      form.reset();
      setStatus("success");
    } catch { setStatus("error"); }
  }

  return <section className="contact-form-section" aria-labelledby="contact-form-title">
    <header><p>{text.eyebrow}</p><div><h2 id="contact-form-title">{text.title}</h2><p>{text.intro}</p></div></header>
    {status === "success" ? <div className="contact-form__success" role="status"><CheckCircle2 aria-hidden="true" /><p>{text.success}</p></div> : <form className="contact-form" onSubmit={submit}>
      <div className="contact-form__field"><label htmlFor="contact-name">{text.name} *</label><input id="contact-name" name="name" autoComplete="name" minLength={2} maxLength={100} required /></div>
      <div className="contact-form__field"><label htmlFor="contact-email">{text.email} *</label><input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
      <div className="contact-form__field"><label htmlFor="contact-phone">{text.phone}</label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></div>
      <div className="contact-form__field"><label htmlFor="contact-subject">{text.subject} *</label><input id="contact-subject" name="subject" minLength={2} maxLength={140} required /></div>
      <div className="contact-form__field contact-form__field--message"><label htmlFor="contact-message">{text.message} *</label><textarea id="contact-message" name="message" rows={7} minLength={10} maxLength={4000} required /></div>
      <div className="contact-form__honeypot" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <label className="contact-form__consent"><input name="consent" type="checkbox" required /><span>{text.consent} <Link href="/privacy">{text.privacy}</Link>.</span></label>
      <div className="contact-form__actions"><button type="submit" disabled={status === "sending"}><span>{status === "sending" ? text.sending : text.submit}</span><ArrowUpRight aria-hidden="true" /></button>{status === "error" && <p role="alert">{text.error}</p>}</div>
    </form>}
  </section>;
}
