"use client";

import Link from "next/link";
import { useLanguage } from "@/context/language-context";

export type LegalPageKind = "privacy" | "terms" | "cookies" | "imprint";

type LegalPageProps = {
  readonly kind: LegalPageKind;
};

const pageCopy = {
  de: {
    privacy: {
      title: "Datenschutzerklärung",
      intro:
        "Diese Seite ist ein technischer Entwurf auf Basis der aktuell im Projekt erkennbaren Datenverarbeitungen. Vor der Veröffentlichung müssen die markierten Betreiber-, Hosting- und Aufbewahrungsangaben ergänzt und rechtlich geprüft werden.",
      sections: [
        ["Verantwortliche Stelle", "[ANGABEN ERFORDERLICH: vollständiger Name bzw. Unternehmen, ladungsfähige Anschrift und Kontaktadresse des Verantwortlichen.]"],
        ["Kontaktformular", "Über das Formular werden E-Mail-Adresse, Betreff und Nachricht verarbeitet, damit eine Kontaktanfrage beantwortet werden kann. Eine Versand- und Zustellungsprotokollierung durch die eingesetzten Server- und E-Mail-Dienstleister kann zusätzlich stattfinden; Umfang und Speicherdauer müssen noch bestätigt werden."],
        ["E-Mail-Versand", "Die Anwendung versendet Kontaktanfragen über einen SMTP-Dienst bei Google/Gmail. Dabei werden die Formulardaten an den konfigurierten E-Mail-Versanddienst übermittelt. [ANGABEN ERFORDERLICH: konkreter Anbieter/Account, Auftragsverarbeitungsvertrag, Datenstandort und Löschfristen.]"],
        ["GitHub-Statistiken", "Die Anwendung ruft GitHub-Statistiken für den konfigurierten Account ab und speichert einen aggregierten Snapshot in PostgreSQL. Der GitHub-Zugriffsschlüssel bleibt serverseitig und wird nicht an den Browser übertragen. [ANGABEN ERFORDERLICH: Hosting-/Datenbankanbieter, Standort und konkrete Aufbewahrungsdauer.]"],
        ["Profilbild und externe Dienste", "Das Profilbild wird von avatars.githubusercontent.com geladen. Dadurch wird beim Abruf mindestens die technische Anfrage an GitHub übermittelt. Weitere externe Analyse-, Werbe- oder Tracking-Dienste wurden im Code nicht gefunden."],
        ["Browser-Speicher und Cookies", "Für die Theme- und Animationsauswahl verwendet die Seite nach deiner ausdrücklichen Zustimmung lokalen Browser-Speicher. Die Einwilligungsentscheidung selbst wird für 180 Tage gespeichert. Analyse- und Marketingdienste werden im geprüften Code nicht eingesetzt."],
        ["Betroffenenrechte", "Betroffene können – soweit die gesetzlichen Voraussetzungen erfüllt sind – insbesondere Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch verlangen. [ANGABEN ERFORDERLICH: Kontaktweg und zuständige Datenschutzaufsicht.]"],
      ],
    },
    terms: {
      title: "Nutzungsbedingungen",
      intro:
        "Diese Nutzungsbedingungen sind ein Entwurf für das persönliche Portfolio. Es wurde im Code kein kostenpflichtiges Angebot, kein Checkout und kein sonstiger Kaufprozess gefunden.",
      sections: [
        ["Geltungsbereich", "Die Website stellt Informationen zu Person, Fähigkeiten, Projekten und beruflichem Hintergrund bereit. Verbindliche Leistungs-, Preis- oder Lieferzusagen werden auf der Website derzeit nicht angeboten."],
        ["Externe Links", "Links zu GitHub, LinkedIn und Projekt-Repositories führen zu Angeboten Dritter. Für deren Inhalte, Datenschutz und Nutzungsbedingungen gelten die jeweiligen Regelungen der Drittanbieter."],
        ["Geistiges Eigentum", "Texte, Gestaltung, eigene Bilder und eigener Quellcode dürfen nicht ohne entsprechende Erlaubnis übernommen oder kommerziell verwendet werden. Für Drittinhalte gelten die jeweiligen Lizenzen. Eine vollständige Rechte- und Lizenzprüfung steht noch aus."],
        ["Kontaktanfragen", "Kontaktanfragen werden über das Formular an die konfigurierte Kontaktadresse versendet. Eine Annahme, Bearbeitung oder Begründung eines Vertragsverhältnisses wird dadurch nicht zugesichert."],
        ["Änderungen", "Inhalte und Funktionen können weiterentwickelt werden. [ANGABEN ERFORDERLICH: Betreiberangaben und finale rechtliche Regelungen vor Veröffentlichung.]"],
      ],
    },
    cookies: {
      title: "Cookie-Richtlinie",
      intro:
        "Der aktuelle Code enthält keine eingebundenen Analyse-, Werbe- oder Tracking-Pixel. Eine individuelle Prüfung der produktiven Hosting-Konfiguration und möglicher Drittanbieter bleibt erforderlich.",
      sections: [
        ["Technisch notwendige Funktionen", "Next.js und der Webserver können technisch notwendige Requests und Standard-Header verarbeiten. Konkrete Server-Logs, deren Speicherdauer und die Konfiguration des Hosters sind im Repository nicht ersichtlich."],
        ["Theme-Präferenz", "Die ausgewählte Darstellung wird erst nach ausdrücklicher Zustimmung im Browser gespeichert. Bei Ablehnung bleibt die Seite im hellen Design und es werden keine Präferenzen abgelegt."],
        ["Einwilligungsentscheidung", "Die Entscheidung für oder gegen die Speicherung der Theme-Präferenz wird für 180 Tage in einem Cookie mit dem Namen portfolio-cookie-consent gespeichert. Es dient ausschließlich dazu, die Entscheidung zu berücksichtigen."],
        ["Keine Marketing-Cookies gefunden", "Im geprüften Quellcode wurden keine Analytics-, Advertising-, Retargeting- oder Social-Tracking-Skripte gefunden. Werden solche Dienste später ergänzt, darf deren Speicherung bzw. Zugriff erst nach einer passenden Einwilligung starten."],
        ["Einstellungen ändern", "Die Cookie-Einstellungen können jederzeit über den Link im Footer erneut geöffnet und geändert werden."],
      ],
    },
    imprint: {
      title: "Impressum",
      intro:
        "Die folgenden Pflichtangaben sind aus dem Code nicht vollständig ableitbar. Diese Seite darf erst nach Ergänzung und Prüfung der fehlenden Angaben veröffentlicht werden.",
      sections: [
        ["Diensteanbieter", "[ANGABEN ERFORDERLICH: vollständiger Vor- und Nachname oder Unternehmensname.]\n[ANGABEN ERFORDERLICH: ladungsfähige Anschrift.]"],
        ["Kontakt", "E-Mail: [ANGABEN ERFORDERLICH: öffentlich vorgesehene Kontaktadresse]\nTelefon: [ANGABEN ERFORDERLICH oder entfernen, falls nicht angeboten]"],
        ["Weitere Pflichtangaben", "[ANGABEN ERFORDERLICH, soweit zutreffend: Register und Registernummer, Umsatzsteuer-ID/Wirtschafts-ID, Aufsichtsbehörde, berufsrechtliche Angaben.]"],
        ["Verantwortlich für Inhalte", "[ANGABEN ERFORDERLICH: Name und Anschrift der inhaltlich verantwortlichen Person, sofern erforderlich.]"],
        ["Hinweis", "Die im Portfolio sichtbare E-Mail-Adresse wird aus der Datenbank geladen und ist nicht automatisch ein vollständiger Ersatz für ein Impressum."],
      ],
    },
  },
  en: {
    privacy: {
      title: "Privacy Policy",
      intro:
        "This page is a technical draft based on the processing visible in the current project. Before publication, the marked operator, hosting and retention details must be completed and reviewed by a qualified professional.",
      sections: [
        ["Controller", "[INPUT REQUIRED: full name or company, physical address and contact address of the controller.]"],
        ["Contact form", "The form processes an email address, subject and message so that a contact request can be answered. Server and email providers may create additional delivery or access logs; their scope and retention period still need confirmation."],
        ["Email delivery", "The application sends contact requests through an SMTP service at Google/Gmail. Form data is transmitted to the configured email delivery service. [INPUT REQUIRED: exact provider/account, data-processing agreement, data location and deletion periods.]"],
        ["GitHub statistics", "The application requests GitHub statistics for the configured account and stores an aggregated snapshot in PostgreSQL. The GitHub access token remains server-side and is not sent to the browser. [INPUT REQUIRED: hosting/database provider, location and retention period.]"],
        ["Profile image and external services", "The profile image is loaded from avatars.githubusercontent.com, which sends a technical request to GitHub. No additional analytics, advertising or tracking services were found in the code."],
        ["Browser storage and cookies", "The site uses browser storage for theme and animation choices only after your explicit consent. The consent decision itself is stored for 180 days. No analytics or marketing services are used in the reviewed code."],
        ["Data subject rights", "Where the legal requirements apply, individuals may have rights to access, rectification, erasure, restriction, portability and objection. [INPUT REQUIRED: contact route and competent supervisory authority.]"],
      ],
    },
    terms: {
      title: "Terms of Service",
      intro:
        "These terms are a draft for a personal portfolio. The code contains no paid offer, checkout or other purchase flow.",
      sections: [
        ["Scope", "The website provides information about the person, skills, projects and professional background. No binding service, price or delivery promises are currently offered."],
        ["External links", "Links to GitHub, LinkedIn and project repositories lead to third-party services. Their own terms and privacy policies apply there."],
        ["Intellectual property", "Texts, design, owned images and owned source code must not be copied or used commercially without the relevant permission. Third-party content is subject to its own licence. A complete rights and licence review is still required."],
        ["Contact requests", "Contact requests are sent to the configured contact address. Sending a request does not guarantee acceptance, a response or the creation of a contract."],
        ["Changes", "Content and features may change as the portfolio develops. [INPUT REQUIRED: operator details and final legal provisions before publication.]"],
      ],
    },
    cookies: {
      title: "Cookie Policy",
      intro:
        "The current code contains no analytics, advertising or tracking pixels. The production hosting configuration and any later third-party integrations still require a separate check.",
      sections: [
        ["Necessary functions", "Next.js and the web server may process necessary requests and standard headers. Specific server logs, retention and hosting configuration are not visible in this repository."],
        ["Theme preference", "The selected theme is stored in the browser only after explicit consent. If rejected, the site stays in the light theme and no preferences are stored."],
        ["Consent decision", "The choice to allow or reject theme-preference storage is stored for 180 days in a cookie named portfolio-cookie-consent. It is used solely to respect that choice."],
        ["No marketing cookies found", "No analytics, advertising, retargeting or social-tracking scripts were found in the reviewed source. If such services are added later, they must not start before a suitable consent is obtained."],
        ["Changing settings", "Cookie preferences can be reopened and changed at any time through the link in the footer."],
      ],
    },
    imprint: {
      title: "Legal Notice",
      intro:
        "The required operator information cannot be fully derived from the code. This page must be completed and reviewed before publication.",
      sections: [
        ["Service provider", "[INPUT REQUIRED: full name or company.]\n[INPUT REQUIRED: physical address.]"],
        ["Contact", "Email: [INPUT REQUIRED: public contact address]\nPhone: [INPUT REQUIRED or remove if not offered]"],
        ["Additional information", "[INPUT REQUIRED where applicable: register and registration number, VAT/business ID, supervisory authority and professional-law details.]"],
        ["Content responsibility", "[INPUT REQUIRED: name and address of the person responsible for content, where applicable.]"],
        ["Note", "The email address displayed in the portfolio is loaded from the database and is not automatically a complete legal notice."],
      ],
    },
  },
} as const;

const footerLinks = [
  ["/imprint", "Impressum", "Legal notice"],
  ["/privacy", "Datenschutz", "Privacy"],
  ["/cookies", "Cookies", "Cookies"],
  ["/terms", "Nutzungsbedingungen", "Terms"],
] as const;

export default function LegalPage({ kind }: LegalPageProps) {
  const { language } = useLanguage();
  const copy = pageCopy[language][kind];

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <article className="rounded-[2rem] border border-slate-200/80 bg-white/65 p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/25 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
          {language === "de" ? "Rechtliche Informationen" : "Legal information"}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-5 rounded-2xl border border-amber-400/35 bg-amber-300/10 p-4 text-sm leading-6 text-slate-700 dark:text-slate-200">
          {copy.intro}
        </p>

        <div className="mt-10 space-y-8">
          {copy.sections.map(([heading, content]) => (
            <section key={heading}>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{heading}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">{content}</p>
            </section>
          ))}
        </div>

        <nav aria-label={language === "de" ? "Rechtliche Seiten" : "Legal pages"} className="mt-12 flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-200/80 pt-6 text-sm dark:border-white/10">
          {footerLinks.map(([href, de, en]) => (
            <Link className="text-cyan-700 underline decoration-cyan-500/30 underline-offset-4 hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200" href={href} key={href}>
              {language === "de" ? de : en}
            </Link>
          ))}
        </nav>
      </article>
    </main>
  );
}
