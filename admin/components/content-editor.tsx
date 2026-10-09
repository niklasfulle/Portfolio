"use client";

import { useEffect, useMemo, useState } from "react";

type ContentRecord = Record<string, unknown>;
type ValidationIssue = { field: string; message: string };
type Content = {
  aboutMe: ContentRecord[];
  projects: ContentRecord[];
  skills: ContentRecord[];
  experience: ContentRecord[];
  contactEmail: ContentRecord[];
};
type ContentKey = keyof Content;
type EditorState = {
  content: Content;
  draftVersion: number;
  sourceVersion: number;
  currentPublishedVersion: number;
  publishedVersion: number;
  publishedDraftVersion: number;
  publishedAt: string | null;
  hasDraft: boolean;
};

const sections: Array<{ key: ContentKey; label: string; hint: string }> = [
  { key: "aboutMe", label: "Über mich", hint: "Profil & Kurztext" },
  { key: "projects", label: "Projekte", hint: "Arbeiten & Repositories" },
  { key: "skills", label: "Fähigkeiten", hint: "Stack & Tools" },
  { key: "experience", label: "Erfahrung & Ausbildung", hint: "Werdegang" },
  { key: "contactEmail", label: "Kontakt", hint: "Kontaktadresse" },
];

const fieldLabels: Record<string, string> = {
  textDe: "Text (Deutsch)", textEn: "Text (Englisch)",
  title: "Titel", descriptionDe: "Beschreibung (Deutsch)", descriptionEn: "Beschreibung (Englisch)",
  image: "Bildpfad oder Bild-URL", url: "Projekt-URL", tags: "Stichpunkte (kommagetrennt)",
  name: "Name", type: "Typ", category: "Kategorie", titleDe: "Titel (Deutsch)", titleEn: "Titel (Englisch)",
  location: "Ort oder Link", icon: "Icon", date: "Zeitraum", email: "E-Mail", series: "Sortierung", visible: "Auf der Website anzeigen",
};

const fieldsBySection: Record<ContentKey, string[]> = {
  aboutMe: ["textDe", "textEn", "visible", "series"],
  projects: ["title", "descriptionDe", "descriptionEn", "image", "url", "tags", "visible", "series"],
  skills: ["name", "image", "type", "visible", "series"],
  experience: ["category", "titleDe", "titleEn", "location", "descriptionDe", "descriptionEn", "icon", "date", "visible", "series"],
  contactEmail: ["email"],
};

function createRecord(section: ContentKey, series: number): ContentRecord {
  const id = crypto.randomUUID();
  const defaults: Record<ContentKey, ContentRecord> = {
    aboutMe: { id, textDe: "", textEn: "", visible: true, series },
    projects: { id, title: "", descriptionDe: "", descriptionEn: "", image: null, url: null, tags: "", visible: true, series },
    skills: { id, name: "", image: null, type: "skill", visible: true, series },
    experience: { id, category: "experience", titleDe: "", titleEn: "", location: "", descriptionDe: "", descriptionEn: "", icon: "", date: "", visible: true, series },
    contactEmail: { id, email: "" },
  };
  return defaults[section];
}

export function ContentEditor() {
  const [state, setState] = useState<EditorState | null>(null);
  const [activeSection, setActiveSection] = useState<ContentKey>("projects");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/content", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Inhalte konnten nicht geladen werden.");
        return response.json() as Promise<EditorState>;
      })
      .then((data) => { if (active) setState(data); })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "Laden fehlgeschlagen.");
      });
    return () => { active = false; };
  }, []);

  const selectedItems = useMemo(
    () => state?.content[activeSection] ?? [],
    [activeSection, state],
  );
  const hasUnpublishedDraft = Boolean(
    state?.hasDraft && state.draftVersion > state.publishedDraftVersion,
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasUnsavedChanges]);

  function updateField(recordId: string, field: string, value: unknown) {
    setHasUnsavedChanges(true);
    setValidationIssues([]);
    setState((current) => {
      if (!current) return current;
      const entries = current.content[activeSection].map((entry) => {
        if (entry.id !== recordId) return entry;
        const nextValue = (field === "image" || field === "url") && value === "" ? null : value;
        return { ...entry, [field]: nextValue };
      });
      return { ...current, content: { ...current.content, [activeSection]: entries } };
    });
  }

  function addItem() {
    setHasUnsavedChanges(true);
    setValidationIssues([]);
    setState((current) => {
      if (!current) return current;
      const entries = current.content[activeSection];
      const next = createRecord(activeSection, entries.length ? Math.max(...entries.map((entry) => Number(entry.series) || 0)) + 10 : 10);
      return { ...current, content: { ...current.content, [activeSection]: [...entries, next] } };
    });
  }

  function hideItem(recordId: string) {
    setHasUnsavedChanges(true);
    setValidationIssues([]);
    setState((current) => {
      if (!current) return current;
      const entries = current.content[activeSection].map((entry) =>
        entry.id === recordId ? { ...entry, visible: false } : entry,
      );
      return { ...current, content: { ...current.content, [activeSection]: entries } };
    });
  }

  function removeItem(recordId: string) {
    if (!window.confirm("Diesen Eintrag aus dem Entwurf entfernen?")) return;
    setHasUnsavedChanges(true);
    setValidationIssues([]);
    setState((current) => {
      if (!current) return current;
      const entries = current.content[activeSection].filter((entry) => entry.id !== recordId);
      return { ...current, content: { ...current.content, [activeSection]: entries } };
    });
  }

  async function saveDraft() {
    if (!state) return;
    setBusy(true);
    setMessage("");
    setValidationIssues([]);
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedVersion: state.draftVersion,
          sourceVersion: state.sourceVersion,
          content: state.content,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (Array.isArray(result.issues)) {
          setValidationIssues(result.issues.filter((issue: unknown): issue is ValidationIssue =>
            Boolean(issue && typeof issue === "object" &&
              "field" in issue && typeof issue.field === "string" &&
              "message" in issue && typeof issue.message === "string"),
          ));
        }
        throw new Error(result.message ?? "Entwurf konnte nicht gespeichert werden.");
      }
      setState({ ...state, draftVersion: result.version, hasDraft: true });
      setHasUnsavedChanges(false);
      setMessage("Entwurf gespeichert.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!state || !window.confirm("Diesen gespeicherten Entwurf jetzt öffentlich veröffentlichen?")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/content/publish", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Veröffentlichung fehlgeschlagen.");
      setState({ ...state, sourceVersion: result.publishedVersion, publishedVersion: result.publishedVersion, publishedDraftVersion: state.draftVersion, currentPublishedVersion: result.publishedVersion, publishedAt: result.publishedAt });
      setMessage("Inhalte veröffentlicht.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Veröffentlichung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function discardDraft() {
    if (!hasUnpublishedDraft || !window.confirm("Den gespeicherten Entwurf verwerfen und den veröffentlichten Stand laden?")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/content/discard", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Entwurf konnte nicht verworfen werden.");

      const latest = await fetch("/api/content", { cache: "no-store" });
      if (!latest.ok) throw new Error("Der veröffentlichte Stand konnte nicht geladen werden.");
      setState(await latest.json() as EditorState);
      setHasUnsavedChanges(false);
      setMessage("Entwurf verworfen; der veröffentlichte Stand ist wieder geladen.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Entwurf konnte nicht verworfen werden.");
    } finally {
      setBusy(false);
    }
  }

  if (!state) return <p className="editor-status" role="status">{message || "Inhalte werden geladen …"}</p>;

  return (
    <section id="editor" className="content-manager" aria-label="Portfolio-Inhalte verwalten">
      <div className="editor-heading">
        <div>
          <p className="eyebrow">DEIN INHALT</p>
          <h2>Alles an einem Ort.</h2>
          <p className="auth-description">Änderungen bleiben privat, bis du sie veröffentlichst.</p>
        </div>
        <div className="editor-actions">
          <a className="secondary-button" href="/preview" target="_blank" rel="noopener noreferrer">Vorschau öffnen <span aria-hidden="true">↗</span></a>
          <button className="secondary-button danger-button" type="button" disabled={busy || !hasUnpublishedDraft} onClick={discardDraft}>Entwurf verwerfen</button>
          <button className="secondary-button" type="button" disabled={busy || !hasUnsavedChanges} onClick={saveDraft}>{busy ? "Bitte warten …" : "Entwurf speichern"}</button>
          <button className="primary-button" type="button" disabled={busy || !hasUnpublishedDraft || hasUnsavedChanges} onClick={publish}>{busy ? "Bitte warten …" : "Veröffentlichen"}</button>
        </div>
      </div>

      <div className="version-line">
        <div className="version-card"><span className="version-card-mark" aria-hidden="true">●</span><span><small>LIVE-VERSION</small><strong>v{state.currentPublishedVersion}</strong></span></div>
        <div className={`version-card ${hasUnpublishedDraft ? "is-draft" : ""}`}><span className="version-card-mark" aria-hidden="true">●</span><span><small>ENTWURF</small><strong>{!state.hasDraft ? "Noch nicht gespeichert" : hasUnpublishedDraft ? `v${state.draftVersion} · unveröffentlicht` : `v${state.draftVersion} · live`}</strong></span></div>
        <div className="version-card"><span className="version-card-mark" aria-hidden="true">◷</span><span><small>ZULETZT VERÖFFENTLICHT</small><strong>{state.publishedAt ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(state.publishedAt)) : "Noch keine Veröffentlichung"}</strong></span></div>
        <div className={`version-card save-state ${hasUnsavedChanges ? "is-unsaved" : ""}`} role="status" aria-live="polite"><span className="version-card-mark" aria-hidden="true">●</span><span><small>BEARBEITUNGSSTATUS</small><strong>{hasUnsavedChanges ? "Ungespeicherte Änderungen" : "Alles gespeichert"}</strong></span></div>
      </div>

      <nav className="editor-tabs" aria-label="Inhaltsbereiche">
        {sections.map((section, index) => (
          <button key={section.key} type="button" disabled={busy} aria-pressed={activeSection === section.key} onClick={() => setActiveSection(section.key)}>
            <span className="section-tab-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="section-tab-copy"><strong>{section.label}</strong><small>{section.hint}</small></span>
            <span className="section-tab-count">{state.content[section.key].length}</span>
          </button>
        ))}
      </nav>

      <div className="section-list-heading">
        <div>
          <h3>{sections.find((section) => section.key === activeSection)?.label}</h3>
          <p>{selectedItems.length} {selectedItems.length === 1 ? "Eintrag" : "Einträge"} · Änderungen werden erst nach dem Veröffentlichen öffentlich.</p>
        </div>
        <button className="add-item-button" type="button" disabled={busy} onClick={addItem}>+ Eintrag hinzufügen</button>
      </div>

      <div className="editor-list">
        {selectedItems.length === 0 && <p className="editor-empty">Hier ist noch nichts drin. Über „Eintrag hinzufügen“ kannst du den ersten Inhalt anlegen.</p>}
        {selectedItems.map((entry) => (
          <fieldset className="editor-item" key={String(entry.id)}>
            <legend>{String(entry.title ?? entry.name ?? entry.titleDe ?? entry.email ?? "Eintrag")}</legend>
            <div className="editor-fields">
              {fieldsBySection[activeSection].map((field) => {
                const value = entry[field];
                if (field === "visible") {
                  return <label className="visibility-field" key={field}><input type="checkbox" disabled={busy} checked={Boolean(value)} onChange={(event) => updateField(String(entry.id), field, event.target.checked)} />{fieldLabels[field]}</label>;
                }
                const multiline = field.startsWith("description") || field === "textDe" || field === "textEn";
                return (
                  <label className={multiline ? "editor-field editor-field-wide" : "editor-field"} key={field}>
                    <span>{fieldLabels[field] ?? field}</span>
                    {field === "tags" && <small>Mindestens sechs Stichpunkte, kommagetrennt (z. B. TypeScript, Next.js, Webentwicklung, …).</small>}
                    {multiline ? (
                      <textarea name={`${activeSection}.${String(entry.id)}.${field}`} rows={4} disabled={busy} value={String(value ?? "")} onChange={(event) => updateField(String(entry.id), field, event.target.value)} />
                    ) : (
                      <input
                        name={`${activeSection}.${String(entry.id)}.${field}`}
                        type={field === "series" ? "number" : field === "email" ? "email" : field === "url" || field === "image" ? "url" : "text"}
                        autoComplete="off"
                        spellCheck={field === "email" || field === "url" || field === "image" ? false : undefined}
                        disabled={busy}
                        min={field === "series" ? 0 : undefined}
                        value={String(value ?? "")}
                        onChange={(event) => updateField(String(entry.id), field, field === "series" ? Number(event.target.value) : event.target.value)}
                      />
                    )}
                  </label>
                );
              })}
            </div>
            {activeSection !== "contactEmail" && entry.visible !== false && (
              <button className="text-button danger-button" type="button" disabled={busy} onClick={() => hideItem(String(entry.id))}>Ausblenden</button>
            )}
            <button className="text-button danger-button" type="button" disabled={busy} onClick={() => removeItem(String(entry.id))}>Eintrag entfernen</button>
          </fieldset>
        ))}
      </div>

      {message && (
        <div className={`editor-status ${validationIssues.length ? "has-error" : ""}`} role={validationIssues.length ? "alert" : "status"} aria-live={validationIssues.length ? "assertive" : "polite"}>
          <p>{message}</p>
          {validationIssues.length > 0 && (
            <ul>
              {validationIssues.map((issue, index) => (
                <li key={`${issue.field}-${index}`}><strong>{fieldLabels[issue.field] ?? issue.field}:</strong> {issue.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
