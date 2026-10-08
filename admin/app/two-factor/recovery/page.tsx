"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@admin/lib/auth-client";

export default function RecoveryPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const result = await authClient.twoFactor.verifyBackupCode({ code: code.trim() });
    setPending(false);
    if (result.error) {
      setError("Der Recovery-Code ist ungültig oder wurde bereits verwendet.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="recovery-title">
        <p className="eyebrow">KONTO-WIEDERHERSTELLUNG</p>
        <h1 id="recovery-title">Recovery-Code</h1>
        <p className="auth-description">Jeder Recovery-Code kann nur einmal verwendet werden.</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="recovery-code">Code</label>
          <input id="recovery-code" name="recovery-code" autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={pending}>{pending ? "Prüfe Code …" : "Code verwenden"}</button>
        </form>
        <button className="text-button" type="button" onClick={() => router.push("/two-factor")}>Zurück zum Authenticator-Code</button>
      </section>
    </main>
  );
}
