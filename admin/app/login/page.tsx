"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@admin/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const result = await authClient.signIn.email({ email, password });
    setPending(false);

    if (result.error) {
      setError("Anmeldung nicht möglich. Bitte Zugangsdaten prüfen oder später erneut versuchen.");
      return;
    }

    router.replace(
      "twoFactorRedirect" in result.data && result.data.twoFactorRedirect
        ? "/two-factor"
        : "/admin",
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">PORTFOLIO ADMIN</p>
        <h1 id="login-title">Anmelden</h1>
        <p className="auth-description">Melde dich mit deinem Admin-Konto an. Für den Zugriff ist MFA erforderlich.</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="email">E-Mail-Adresse</label>
          <input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="password">Passwort</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={pending}>{pending ? "Anmeldung läuft …" : "Weiter"}</button>
        </form>
      </section>
    </main>
  );
}
