"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { authClient } from "@admin/lib/auth-client";

function TotpEnrollmentCode({ uri }: { uri: string }) {
  return (
    <div
      className="totp-enrollment-code"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        marginBlock: 24,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#fff",
        }}
      >
        <QRCodeSVG
          value={uri}
          size={224}
          level="M"
          marginSize={4}
          title="QR-Code für die Authenticator-App"
        />
      </div>
      <details style={{ width: "100%" }}>
        <summary style={{ cursor: "pointer", textAlign: "center" }}>Manuelle Einrichtung anzeigen</summary>
        <code className="secret-value">{uri}</code>
      </details>
    </div>
  );
}

export function SetupTwoFactor() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function beginEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await authClient.twoFactor.enable({ password, method: "totp" });
    setPending(false);
    if (result.error || result.data?.method !== "totp") {
      setError("MFA konnte nicht eingerichtet werden. Bitte prüfe dein Passwort.");
      return;
    }
    setTotpUri(result.data.totpURI);
    setBackupCodes(result.data.backupCodes);
  }

  async function verifyEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") });
    setPending(false);
    if (result.error) {
      setError("Der Code stimmt nicht. Prüfe deine Authenticator-App und versuche es erneut.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="setup-title">
        <p className="eyebrow">KONTO ABSICHERN</p>
        <h1 id="setup-title">MFA einrichten</h1>
        {!totpUri ? (
          <form className="auth-form" onSubmit={beginEnrollment}>
            <p className="auth-description">MFA ist für den Admin-Zugriff erforderlich. Bestätige dein Passwort, um einen TOTP-Schlüssel für deine Authenticator-App zu erzeugen.</p>
            <label htmlFor="enrollment-password">Passwort</label>
            <input id="enrollment-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={pending}>{pending ? "Erzeuge Schlüssel …" : "MFA-Schlüssel erstellen"}</button>
          </form>
        ) : backupCodes.length ? (
          <>
            <p className="auth-description">Scanne den QR-Code mit Google Authenticator, Microsoft Authenticator oder einer anderen TOTP-App. Bewahre die Recovery-Codes sicher auf; jeder ist nur einmal nutzbar.</p>
            <TotpEnrollmentCode uri={totpUri} />
            <ul className="recovery-list">{backupCodes.map((backupCode) => <li key={backupCode}><code>{backupCode}</code></li>)}</ul>
            <form className="auth-form" onSubmit={verifyEnrollment}>
              <label htmlFor="enrollment-code">Code aus der App</label>
              <input id="enrollment-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button" type="submit" disabled={pending}>{pending ? "Prüfe Code …" : "MFA bestätigen"}</button>
            </form>
          </>
        ) : (
          <form className="auth-form" onSubmit={verifyEnrollment}>
            <p className="auth-description">Scanne diesen QR-Code mit deiner Authenticator-App und bestätige anschließend einen Code.</p>
            <TotpEnrollmentCode uri={totpUri} />
            <label htmlFor="enrollment-code">Code aus der App</label>
            <input id="enrollment-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={pending}>{pending ? "Prüfe Code …" : "MFA bestätigen"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
