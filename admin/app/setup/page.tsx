"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@admin/lib/auth-client";

export default function InitialAdminSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapToken, setBootstrapToken] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const result = await authClient.signUp.email(
      {
        name,
        email,
        password,
        fetchOptions: { headers: { "x-admin-bootstrap-token": bootstrapToken } },
      },
    );
    setPending(false);
    if (result.error) {
      setError("Ersteinrichtung nicht möglich. Prüfe die Admin-E-Mail und den Bootstrap-Token oder ob bereits ein Konto besteht.");
      return;
    }
    router.replace("/two-factor/setup");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="setup-admin-title">
        <p className="eyebrow">EINMALIGE ERSTEINRICHTUNG</p>
        <h1 id="setup-admin-title">Admin-Konto erstellen</h1>
        <p className="auth-description">Nur die serverseitig konfigurierte Admin-E-Mail und der einmalige Bootstrap-Token werden akzeptiert. Danach wird die Registrierung automatisch gesperrt.</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="admin-name">Name</label>
          <input id="admin-name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
          <label htmlFor="admin-email">Admin-E-Mail</label>
          <input id="admin-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="admin-password">Passwort (mindestens 14 Zeichen)</label>
          <input id="admin-password" type="password" autoComplete="new-password" minLength={14} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
          <label htmlFor="bootstrap-token">Bootstrap-Token</label>
          <input id="bootstrap-token" type="password" autoComplete="off" minLength={32} required value={bootstrapToken} onChange={(event) => setBootstrapToken(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={pending}>{pending ? "Erstelle Konto …" : "Konto erstellen und MFA einrichten"}</button>
        </form>
      </section>
    </main>
  );
}
