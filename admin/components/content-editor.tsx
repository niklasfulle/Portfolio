"use client";

import { useEffect, useMemo, useState } from "react";

type ContentRecord = Record<string, unknown>;
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

const sections: Array<{ key: ContentKey; label: string }> = [
  { key: "aboutMe", label: "Über mich" },
  { key: "projects", label: "Projekte" },
  { key: "skills", label: "Fähigkeiten" },
  { key: "experience", label: "Erfahrung & Ausbildung" },
  { key: "contactEmail", label: "Kontakt" },
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

  function updateField(recordId: string, field: string, value: unknown) {
    setHasUnsavedChanges(true);
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
    setState((current) => {
      if (!current) return current;
      const entries = current.content[activeSection];
      const next = createRecord(activeSection, entries.length ? Math.max(...entries.map((entry) => Number(entry.series) || 0)) + 10 : 10);
      return { ...current, content: { ...current.content, [activeSection]: [...entries, next] } };
    });
  }

  function hideItem(recordId: string) {
    setHasUnsavedChanges(true);
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
      if (!response.ok) throw new Error(result.message ?? "Entwurf konnte nicht gespeichert werden.");
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
    <section className="content-manager" aria-label="Portfolio-Inhalte verwalten">
      <div className="editor-heading">
        <div>
          <p className="eyebrow">INHALTE</p>
          <h2>Portfolio verwalten</h2>
          <p className="auth-description">Entwürfe bleiben privat, bis du sie veröffentlichst.</p>
        </div>
        <div className="editor-actions">
          <a className="secondary-button" href="/preview" target="_blank" rel="noopener noreferrer">Vorschau öffnen</a>
          <button className="secondary-button danger-button" type="button" disabled={busy || !hasUnpublishedDraft} onClick={discardDraft}>Entwurf verwerfen</button>
          <button className="secondary-button" type="button" disabled={busy} onClick={saveDraft}>{busy ? "Bitte warten …" : "Entwurf speichern"}</button>
          <button className="primary-button" type="button" disabled={busy || !hasUnpublishedDraft || hasUnsavedChanges} onClick={publish}>Veröffentlichen</button>
        </div>
      </div>

      <div className="version-line">
        <span>Veröffentlichte Version: {state.currentPublishedVersion}</span>
        <span>{!state.hasDraft ? "Noch kein Entwurf gespeichert" : hasUnpublishedDraft ? `Unveröffentlichter Entwurf v${state.draftVersion}` : `Entwurf v${state.draftVersion} veröffentlicht`}</span>
        <span>{state.publishedAt ? `Zuletzt veröffentlicht: ${new Date(state.publishedAt).toLocaleString("de-DE")}` : "Noch nicht veröffentlicht"}</span>
        <span role="status">{hasUnsavedChanges ? "Ungespeicherte Änderungen" : "Alle Änderungen gespeichert"}</span>
      </div>

      <nav className="editor-tabs" aria-label="Inhaltsbereiche">
        {sections.map((section) => (
          <button key={section.key} type="button" disabled={busy} aria-pressed={activeSection === section.key} onClick={() => setActiveSection(section.key)}>
            {section.label}
          </button>
        ))}
      </nav>

      <div className="editor-list">
        {selectedItems.length === 0 && <p className="editor-status">In diesem Bereich sind noch keine Einträge vorhanden.</p>}
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
                      <textarea rows={4} disabled={busy} value={String(value ?? "")} onChange={(event) => updateField(String(entry.id), field, event.target.value)} />
                    ) : (
                      <input
                        type={field === "series" ? "number" : "text"}
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

      <button className="secondary-button add-item-button" type="button" disabled={busy} onClick={addItem}>Eintrag hinzufügen</button>
      {message && <p className="editor-status" role="status">{message}</p>}
    </section>
  );
}
