"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@admin/lib/auth-client";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const result = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") });
    setPending(false);
    if (result.error) {
      setError("Der Code ist ungültig oder abgelaufen. Bitte versuche es erneut.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="mfa-title">
        <p className="eyebrow">ZWEITER FAKTOR</p>
        <h1 id="mfa-title">Code bestätigen</h1>
        <p className="auth-description">Gib den aktuellen Code aus deiner Authenticator-App ein.</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="totp-code">Einmalcode</label>
          <input id="totp-code" name="totp-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={pending}>{pending ? "Prüfe Code …" : "Bestätigen"}</button>
        </form>
        <button className="text-button" type="button" onClick={() => router.push("/two-factor/recovery")}>Recovery-Code verwenden</button>
      </section>
    </main>
  );
}
