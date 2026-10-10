"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

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
  location: "Ort oder Link", icon: "Icon", date: "Zeitraum", email: "E-Mail", visible: "Auf der Website anzeigen",
};

const fieldsBySection: Record<ContentKey, string[]> = {
  aboutMe: ["textDe", "textEn", "visible"],
  projects: ["title", "descriptionDe", "descriptionEn", "image", "url", "tags", "visible"],
  skills: ["name", "image", "type", "visible"],
  experience: ["category", "titleDe", "titleEn", "location", "descriptionDe", "descriptionEn", "icon", "date", "visible"],
  contactEmail: ["email"],
};

function createRecord(section: ContentKey, series: number, id: string): ContentRecord {
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
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
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
    const id = crypto.randomUUID();
    setExpandedRecordId(id);
    setHasUnsavedChanges(true);
    setValidationIssues([]);
    setState((current) => {
      if (!current) return current;
      const entries = current.content[activeSection];
      const next = createRecord(activeSection, entries.length ? Math.max(...entries.map((entry) => Number(entry.series) || 0)) + 10 : 10, id);
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

  function moveItem(recordId: string, offset: -1 | 1) {
    if (activeSection === "contactEmail") return;
    setHasUnsavedChanges(true);
    setValidationIssues([]);
    setState((current) => {
      if (!current) return current;
      const entries = [...current.content[activeSection]];
      const index = entries.findIndex((entry) => entry.id === recordId);
      const destination = index + offset;
      if (index < 0 || destination < 0 || destination >= entries.length) return current;

      [entries[index], entries[destination]] = [entries[destination], entries[index]];
      const orderedEntries = entries.map((entry, position) => ({
        ...entry,
        series: (position + 1) * 10,
      }));
      return { ...current, content: { ...current.content, [activeSection]: orderedEntries } };
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
          <p className="eyebrow">PORTFOLIO-INHALTE</p>
          <h2>Inhalte bearbeiten</h2>
          <p className="auth-description">Änderungen bleiben privat, bis du sie veröffentlichst.</p>
        </div>
        <div className="editor-actions">
          {hasUnsavedChanges ? (
            <button className="primary-button" type="button" disabled={busy} onClick={saveDraft}>
              {busy ? "Bitte warten …" : "Entwurf speichern"}
            </button>
          ) : hasUnpublishedDraft ? (
            <button className="primary-button" type="button" disabled={busy} onClick={publish}>
              {busy ? "Bitte warten …" : "Veröffentlichen"}
            </button>
          ) : null}
          {hasUnpublishedDraft && (
            <details className="editor-secondary-actions">
              <summary>Weitere Aktionen</summary>
              <div className="editor-secondary-actions-popover">
                <button className="secondary-button danger-button" type="button" disabled={busy} onClick={discardDraft}>
                  Entwurf verwerfen
                </button>
              </div>
            </details>
          )}
        </div>
      </div>

      <div className="publish-overview" aria-label="Veröffentlichungsstatus">
        <div className={`publish-state ${hasUnsavedChanges ? "is-unsaved" : hasUnpublishedDraft ? "is-draft" : "is-live"}`} role="status" aria-live="polite">
          <span className="publish-state-dot" aria-hidden="true" />
          <span>{hasUnsavedChanges ? "Änderungen noch nicht gespeichert" : hasUnpublishedDraft ? "Entwurf bereit zur Veröffentlichung" : "Website ist auf dem aktuellen Stand"}</span>
        </div>
        <div className="publish-meta">
          <span>Live <strong>v{state.currentPublishedVersion}</strong></span>
          <span>Entwurf <strong>{state.hasDraft ? `v${state.draftVersion}` : "—"}</strong></span>
          <span>Zuletzt veröffentlicht <strong>{state.publishedAt ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(state.publishedAt)) : "Noch nie"}</strong></span>
        </div>
      </div>

      <div className="editor-workspace">
        <nav className="editor-section-nav" aria-label="Inhaltsbereiche">
          <p className="editor-section-nav-heading">BEREICHE</p>
          {sections.map((section) => (
            <button
              key={section.key}
              className="editor-section-link"
              type="button"
              disabled={busy}
              aria-pressed={activeSection === section.key}
              onClick={() => {
                setActiveSection(section.key);
                setExpandedRecordId(null);
                setValidationIssues([]);
              }}
            >
              <span className="editor-section-copy"><strong>{section.label}</strong><small>{section.hint}</small></span>
              <span className="editor-section-count">{state.content[section.key].length}</span>
            </button>
          ))}
        </nav>

        <div className="editor-main-panel">
          <div className="section-list-heading">
            <div>
              <p className="eyebrow">{selectedItems.length} {selectedItems.length === 1 ? "EINTRAG" : "EINTRÄGE"}</p>
              <h3>{sections.find((section) => section.key === activeSection)?.label}</h3>
              <p>Wähle einen Eintrag zum Bearbeiten. Änderungen werden erst nach dem Veröffentlichen öffentlich.</p>
            </div>
            <button className="add-item-button" type="button" disabled={busy} onClick={addItem}>+ Eintrag hinzufügen</button>
          </div>

          <div className="editor-list">
        {selectedItems.length === 0 && <p className="editor-empty">Hier ist noch nichts drin. Über „Eintrag hinzufügen“ kannst du den ersten Inhalt anlegen.</p>}
        {selectedItems.map((entry, index) => {
          const itemLabel = String(entry.title ?? entry.name ?? entry.titleDe ?? entry.email ?? "").trim() || "Eintrag";
          return (
          <details
            className="editor-item"
            key={String(entry.id)}
            open={expandedRecordId === String(entry.id)}
            onToggle={(event) => {
              if (event.currentTarget.open) setExpandedRecordId(String(entry.id));
              else if (expandedRecordId === String(entry.id)) setExpandedRecordId(null);
            }}
          >
            <summary className="editor-item-summary">
              <span className="editor-item-summary-copy">
                <strong>{itemLabel}</strong>
                <small>{activeSection === "contactEmail" ? "Kontaktadresse" : `Position ${index + 1}`}</small>
              </span>
              {activeSection !== "contactEmail" && (
                <span className={`editor-item-visibility ${entry.visible === false ? "is-hidden" : "is-visible"}`}>
                  {entry.visible === false ? "Ausgeblendet" : "Sichtbar"}
                </span>
              )}
              <span className="editor-item-chevron" aria-hidden="true">⌄</span>
            </summary>
            <div className="editor-item-content">
            {activeSection !== "contactEmail" && (
              <div className="editor-item-order">
                <span>Position {index + 1} von {selectedItems.length}</span>
                <div>
                  <button
                    className="editor-order-button"
                    type="button"
                    aria-label={`${itemLabel} nach oben verschieben`}
                    title="Nach oben verschieben"
                    disabled={busy || index === 0}
                    onClick={() => moveItem(String(entry.id), -1)}
                  >
                    <ArrowUp aria-hidden="true" size={15} />
                  </button>
                  <button
                    className="editor-order-button"
                    type="button"
                    aria-label={`${itemLabel} nach unten verschieben`}
                    title="Nach unten verschieben"
                    disabled={busy || index === selectedItems.length - 1}
                    onClick={() => moveItem(String(entry.id), 1)}
                  >
                    <ArrowDown aria-hidden="true" size={15} />
                  </button>
                </div>
              </div>
            )}
            <div className="editor-fields">
              {fieldsBySection[activeSection].map((field) => {
                const value = entry[field];
                if (field === "visible") {
                  return <label className="visibility-field" key={field}><input type="checkbox" disabled={busy} checked={Boolean(value)} onChange={(event) => updateField(String(entry.id), field, event.target.checked)} />{fieldLabels[field]}</label>;
                }
                const multiline = field.startsWith("description") || field === "textDe" || field === "textEn";
                const inputId = `field-${activeSection}-${encodeURIComponent(String(entry.id))}-${field}`;
                const hintId = field === "tags" ? `${inputId}-hint` : undefined;
                const fieldMessages = [...new Set(validationIssues
                  .filter((issue) => issue.field === field)
                  .map((issue) => issue.message))];
                const errorId = fieldMessages.length ? `${inputId}-error` : undefined;
                const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
                return (
                  <div className={multiline ? "editor-field editor-field-wide" : "editor-field"} key={field}>
                    <label htmlFor={inputId}>{fieldLabels[field] ?? field}</label>
                    {field === "tags" && <small id={hintId}>Mindestens sechs Stichpunkte, kommagetrennt (z. B. TypeScript, Next.js, Webentwicklung, …).</small>}
                    {multiline ? (
                      <textarea id={inputId} name={`${activeSection}.${String(entry.id)}.${field}`} rows={4} disabled={busy} value={String(value ?? "")} aria-invalid={fieldMessages.length > 0 || undefined} aria-describedby={describedBy} onChange={(event) => updateField(String(entry.id), field, event.target.value)} />
                    ) : (
                      <input
                        id={inputId}
                        name={`${activeSection}.${String(entry.id)}.${field}`}
                        type={field === "email" ? "email" : field === "url" || field === "image" ? "url" : "text"}
                        autoComplete="off"
                        spellCheck={field === "email" || field === "url" || field === "image" ? false : undefined}
                        disabled={busy}
                        value={String(value ?? "")}
                        aria-invalid={fieldMessages.length > 0 || undefined}
                        aria-describedby={describedBy}
                        onChange={(event) => updateField(String(entry.id), field, event.target.value)}
                      />
                    )}
                    {errorId && <small className="editor-field-error" id={errorId}>{fieldMessages.join(" ")}</small>}
                  </div>
                );
              })}
            </div>
            {activeSection !== "contactEmail" && entry.visible !== false && (
              <button className="text-button danger-button" type="button" disabled={busy} onClick={() => hideItem(String(entry.id))}>Ausblenden</button>
            )}
            <button className="text-button danger-button" type="button" disabled={busy} onClick={() => removeItem(String(entry.id))}>Eintrag entfernen</button>
            </div>
          </details>
          );
        })}
          </div>
        </div>
      </div>

      {message && (
        <div className={`editor-status ${validationIssues.length ? "has-error" : ""}`} role={validationIssues.length ? "alert" : "status"} aria-live={validationIssues.length ? "assertive" : "polite"}>
          <p>{message}</p>
        </div>
      )}
    </section>
  );
}
