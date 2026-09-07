# Sicherheitsprüfung Portfolio

Stand: 07.09.2026. Geprüft wurde der aktuelle, uncommittete Arbeitsstand und der lokale Docker-Dev-Stack.

## Ergebnis und Umfang

Die nachfolgend dokumentierten Anwendungsbefunde wurden im selben Arbeitsstand behoben und erneut geprüft. Der Bericht bewahrt die ursprünglichen Nachweise, damit Ursache und Korrektur nachvollziehbar bleiben.

## Behebungsstatus

- F1, F3 und F4: behoben durch serverseitig festgelegten Empfänger, strikte Zod-Validierung, Größenlimit, Rate-Limit, HTML-Escaping und korrekt abgewarteten SMTP-Versand.
- F2: behoben durch validierte NextAuth-JWT-Prüfung mit expliziter Admin-Rolle und Matcher für `/admin/:path*`. Ein erfundener Session-Cookie wird nun abgewiesen.
- F5: behoben für den Dev-Stack. Die App bindet ausschließlich an `127.0.0.1`; PostgreSQL besitzt keine Host-Portfreigabe mehr. Ein fehlendes lokales Auth-Secret wird beim Containerstart zufällig erzeugt.
- F6: behoben. Nach Bereinigung der Laufzeit-/Entwicklungsabhängigkeiten und gezielten sicheren Auflösungen meldet `yarn audit` 0 bekannte Schwachstellen in allen Schweregraden.
- F7: behoben. Datenbanktexte werden als React-Text und nicht mehr über `dangerouslySetInnerHTML` ausgegeben.
- F8/F9: behoben durch CSP und ergänzende Browser-Sicherheitsheader sowie erweiterte Git-/Docker-Ignorierregeln.

Verifikation: 56 Tests in 11 Suites bestanden; Branch-Coverage 84,16 %, Statements 97,20 %. Prisma Client wurde erfolgreich generiert. Der laufende Stack liefert die Header aus, blockiert einen gefälschten Admin-Cookie mit HTTP 307 und lehnt einen vom Client eingeschleusten Mail-Empfänger mit HTTP 400 ab. Der Produktionsbuild kompiliert die Anwendung, scheitert derzeit jedoch noch an bereits vorhandenen TypeScript-Fehlern in älteren Testdateien und `src/lib/github-stats.ts`.

Geprüft: erreichbare App-Router-Endpunkte, Proxy, Mail-Transport, Datenbank-Helfer, HTML-Ausgabe, Upload-Komponente, GitHub-Abfragen und Cache/Worker, Docker-/Next-Konfiguration, ausgewählte Tests sowie deklarierte Laufzeit-Abhängigkeiten. Keine Anwendungsdateien oder Datenbankinhalte verändert. Keine echten E-Mails verschickt. HTTP-Prüfungen waren lesend; Mail-Prüfungen liefen mit vollständig simuliertem SMTP und Testumgebung.

Grenzen: kein vollständiger Penetrationstest, kein Produktionssystem/TLS-Terminator geprüft, kein Container-OS-CVE-Scan. Inhalte von .env-Dateien und backup.sql sowie die Git-Historie wurden nicht gelesen. Vor dem Lesen der geprüften Workspace-Dateien meldete der vorgeschriebene Sonar-Secrets-Scanner jeweils „No issues found“, allerdings mit Authentifizierungs-/HTTP-Warnungen. Das ist kein Nachweis, dass sämtliche Projektdateien frei von Geheimnissen sind. Die zusätzlichen Playbook-/Template-Dateien des OWASP-Skills fehlen in der lokalen Installation.

## Befunde

### F1 – Hoch: Unbeschränkter Mail-Versand an frei wählbare Empfänger

Quelle: src/app/api/email/send/route.ts:8–10 und src/lib/helpers/send-mail.ts:25–38.
OWASP: A04, A01.

Der öffentliche POST-Endpunkt übernimmt contactEmail direkt aus dem Request und setzt ihn als SMTP-Empfänger. Es gibt keine serverseitige Schema-/Längenprüfung und keinen anwendungsseitigen Rate-Limiter. Die Formularlimits im Browser schützen direkte API-Aufrufe nicht.

Bei eingerichtetem SMTP-Konto können Außenstehende das Portfolio als Versanddienst für Spam/Phishing missbrauchen oder das Versandkontingent ausschöpfen. Eine erfolgreiche reale SMTP-Zustellung wurde bewusst nicht getestet.

Nachweis: Original-Route und Original-Mail-Helfer isoliert ausgeführt, Nodemailer durch einen Mock ersetzt. Ein frei gewählter externer Testempfänger und 6.000 Zeichen Nachricht wurden übernommen; Antwortstatus 200. Kein echter Versand.

Empfehlung: Empfänger ausschließlich serverseitig aus Konfiguration/DB bestimmen; E-Mail, Betreff, Nachricht und Request-Größe serverseitig begrenzen; Rate-Limit für den öffentlichen Endpunkt und bedarfsgerechten Bot-Schutz ergänzen. Ein Login ist für ein öffentliches Kontaktformular nicht erforderlich.

### F2 – Hoch bei aktiviertem Editor: Cookie-Präsenz ersetzt Authentifizierung

Quelle: src/proxy.ts:7–8, 28–30, 36–37.
OWASP: A01, A07.

authorized() gibt immer true zurück. Danach entscheidet allein die Existenz von next-auth.session-token über isAuth. Weder gültige Sitzung noch Admin-Rolle werden an dieser Stelle verlangt. Der Matcher erfasst außerdem nur /admin, nicht /admin/:path*.

Nachweis am laufenden Stack:
- GET /admin ohne Cookie: 307 nach /.
- GET /admin mit frei erfundenem Cookie: 404 ohne Weiterleitung.
- GET /admin/settings: 404 ohne Weiterleitung.
- GET /api/auth/session: 404.

Die 404 ist eine wichtige Einschränkung: Es wurden keine Admin-Daten erreicht. Im vorhandenen App-Router gibt es derzeit keine Admin-Seiten und keinen NextAuth-Handler. Der Befund betrifft den fehlerhaften Schutzmechanismus, der vor Implementierung eines Editors ersetzt werden muss.

Empfehlung: gültige serverseitige Sitzung und explizite Admin-Rolle prüfen, Unterpfade erfassen und Berechtigungen zusätzlich an jeder lesenden/schreibenden Admin-Serverfunktion erzwingen.

### F3 – Mittel: Ungefiltertes HTML in Kontakt-E-Mails

Quelle: src/lib/helpers/send-mail.ts:30–38.
OWASP: A03.

topic, message und senderEmail werden ungefiltert in ein HTML-Template eingefügt. Ein Angreifer kann Darstellung, Links und eingebettete Inhalte der E-Mail beeinflussen. Das ist HTML-Injection im E-Mail-Inhalt; JavaScript-Ausführung im Mail-Client ist damit nicht nachgewiesen.

Nachweis: Ein harmloser HTML-Testmarker im Betreff blieb im erzeugten HTML unverändert erhalten.

Empfehlung: Nutzereingaben HTML-escapen oder ausschließlich als Klartext versenden; Absenderadresse validieren.

### F4 – Mittel: Asynchroner SMTP-Fehler entkommt dem Fehlerhandler

Quelle: src/lib/helpers/send-mail.ts:41–47.
OWASP: A04, A09.

sendMail wird mit Callback gestartet und nicht auf Versandabschluss gewartet. Ein späterer Fehler wird innerhalb des Callbacks geworfen und erreicht den äußeren try/catch nicht. Die API kann bereits Erfolg gemeldet haben; ein unbehandelter Fehler kann die Verfügbarkeit des Node-Prozesses beeinträchtigen.

Nachweis mit verzögertem Mock-Callback: Die Route lieferte 200 vor SMTP-Abschluss; der danach ausgelöste Fehler entkam dem Funktions-Fehlerhandler. Kein Absturz des laufenden App-Servers provoziert.

Empfehlung: die Promise-Variante von sendMail awaiten, Fehler kontrolliert beantworten und bereinigt protokollieren. Die bestehenden Tests rufen den Callback synchron auf und erfassen diesen Fehlerfall nicht.

### F5 – Mittel: Dev-Server und Datenbank auf allen Host-Schnittstellen

Quelle: compose.yaml:13–15 und 48–49.
OWASP: A05.

Docker bestätigt Bindungen auf 0.0.0.0 und [::] für 3000 und 5432. Die App läuft als Next-Dev-Server. Damit ist der Stack nicht auf Loopback beschränkt; tatsächliche Erreichbarkeit aus LAN/Internet hängt zusätzlich von Firewall und Routing ab.

Empfehlung für diesen Dev-Stack: 127.0.0.1:3000:3000 und, falls Host-Zugriff gebraucht wird, 127.0.0.1:5432:5432. Die DB benötigt für app/worker keinen veröffentlichten Host-Port. Für Produktion ein separates Build-/Start-Setup.

Zusätzliche Härtung: Der Dockerfile legt keinen nichtprivilegierten USER fest, der Quellcode ist schreibbar eingebunden, und Compose nutzt einen fest vorgegebenen Development-Auth-Secret. Diese Dev-Einstellungen nicht als Produktionskonfiguration übernehmen. Das lokale Test-DB-Passwort selbst wurde nicht als Produktionsleck bewertet.

### F6 – Mittel: Bekannte verwundbare transitive Abhängigkeiten

Nachweis: docker compose exec -T app yarn audit --groups dependencies --json.
Ergebnis: 40 Audit-Pfadmeldungen: 26 hoch, 12 mittel, 2 niedrig, 0 kritisch; 24 unterschiedliche Advisory-IDs. Mehrfachmeldungen je Abhängigkeitspfad sind keine 40 unabhängig erreichbaren Website-Lücken.

npm ls bestätigt unter anderem:
- next-auth > openid-client > jose@4.15.4.
- react-email > socket.io > socket.io-parser@4.2.4.
- react-email > socket.io > socket.io-adapter > ws@8.11.0.
- prisma > mysql2@3.15.3.

jose@4.15.4 hat eine dokumentierte JWE-Dekompressionsschwachstelle; die 4.x-Korrektur beginnt bei 4.15.5. Die tatsächliche Ausnutzbarkeit setzt Verarbeitung entsprechender untrusted JWEs in Node.js voraus. Der derzeit fehlende Auth-Handler begrenzt die Aussage zur Erreichbarkeit.
Quelle: https://github.com/panva/jose/security/advisories/GHSA-hhhv-q57g-882q

Viele hohe Treffer liegen in ESLint-/Glob-Werkzeugen und der React-Email-Vorschau. Diese Pakete stehen hier in dependencies, werden dadurch im „Laufzeit“-Audit mit erfasst, sind aber nicht automatisch öffentlich erreichbare Serverfunktionen. mysql2 ist transitiv über Prisma installiert; die Anwendung verwendet PostgreSQL.

Empfehlung: transitive Abhängigkeiten gezielt aktualisieren, inkompatible Major-Overrides vermeiden, Entwicklungswerkzeuge in devDependencies verschieben und nach Aktualisierung Installation, Tests sowie Audit erneut prüfen.

### F7 – Mittel, bedingter Angriffspfad: Datenbank-HTML wird ungefiltert gerendert

Quelle: src/components/main/About.tsx:37–42 und src/lib/db/functions.ts:9–11.
OWASP: A03.

AboutMe.textDe/textEn gelangen über dangerouslySetInnerHTML in die Seite. Eine Sanitization ist in diesem Datenpfad nicht vorhanden. Wer über einen späteren Editor, Import oder anderweitig Schreibzugriff auf diese Felder erhält, kann aktives HTML einschleusen.

Ein öffentlich erreichbarer Schreibweg wurde nicht gefunden; deshalb keine behauptete unauthentifizierte Stored-XSS-Ausnutzung und kein Testeintrag in der Datenbank.

Empfehlung: Wenn Formatierung unnötig ist, normale React-Textausgabe verwenden. Andernfalls eng begrenzte HTML-Allowlist mit einem gepflegten Sanitizer vor der Ausgabe.

## Weitere Härtung und offene Prüfungen

- GET / liefert lokal weder Content-Security-Policy noch X-Frame-Options noch X-Content-Type-Options. CSP inklusive frame-ancestors sowie nosniff planen. Fehlendes HSTS auf lokalem HTTP ist kein eigenständiger Befund; Produktions-TLS-Konfiguration nicht geprüft.
- .env und .env.local werden ignoriert, .env.production und .env.test laut git check-ignore nicht. .scannerwork ist untracked und nicht ignoriert.
- backup.sql ist von Git erfasst und wird von .dockerignore nicht ausgeschlossen; COPY . . nimmt die Datei in Images auf. Inhalt nicht gelesen: keine Behauptung, dass der Dump Passwörter oder persönliche Daten enthält. Vor Veröffentlichung separat klassifizieren und geeignete Backup-Ablage wählen.
- Der Mail-Endpunkt gibt das rohe Fehlerobjekt als JSON zurück. Gewöhnliche Error-Objekte serialisieren oft zu {}; eine konkrete Geheimnisoffenlegung wurde nicht beobachtet. Trotzdem stabile öffentliche Fehlermeldungen verwenden.
- Ein Formular-Upload-UI ist vorhanden, aber kein Upload-Serverendpunkt im aktuellen App-Router gefunden.
- getCachedGithubStats greift bei DB-Ausfall wieder direkt auf GitHub zu. Viele Seitenaufrufe können dann zusätzliche API-Abfragen auslösen. Rate-Limit-Resilienz durch letzten bekannten Snapshot/in-memory Fallback und Bündelung gleichzeitiger Refreshes verbessern.
- Sonar schließt API-/Komponenten-/Proxy-Dateien von der Coverage aus. Hohe Gesamt-Coverage und ein grünes Quality Gate belegen deshalb keine ausreichenden Sicherheitstests dieser Pfade.

## OWASP-Abdeckung

| Kategorie | Ergebnis |
| --- | --- |
| A01 Zugriffskontrolle | Fehlerhafte Cookie-Prüfung; freie Wahl des Mail-Empfängers |
| A02 Kryptographie | SMTP-TLS und HTTPS für GitHub vorhanden; echte Secrets, Speicherung/Rotation und Produktions-TLS nicht geprüft |
| A03 Injection | Mail-HTML-Injection; bedingter Stored-XSS-Pfad; kein Raw-SQL in den geprüften DB-Helfern |
| A04 Unsicheres Design | Mail-Missbrauch und fehlende serverseitige Validierung; SMTP-Fehlerbehandlung |
| A05 Fehlkonfiguration | Netzfreigaben; fehlende lokale Schutz-Header; Dev-Container-Härtung |
| A06 Verwundbare Komponenten | Audit-Treffer vorhanden; Erreichbarkeit je Paket unterschiedlich |
| A07 Authentifizierung | Vorhandener Proxy ist kein belastbarer Auth-/Admin-Schutz; Auth-Handler fehlt aktuell |
| A08 Integrität | Frozen Lockfile vorhanden; CI/Signaturen/Git-Historie nicht umfassend geprüft |
| A09 Logging/Monitoring | Unbehandelte SMTP-Fehler; unstrukturierte Fehlerlogs; externes Monitoring nicht geprüft |
| A10 SSRF | Kein direkt durch HTTP-Nutzer steuerbarer serverseitiger Ziel-URL-Pfad gefunden; GitHub-Endpunkte und Bild-Host-Allowlist vorhanden |

## Positive Kontrollen

Prisma verwendet in den geprüften Helfern strukturierte Abfragen statt zusammengesetztem SQL. Mail-Transport nutzt TLS auf Port 465. GitHub-Anfragen nutzen HTTPS; der Token wird serverseitig aus der Umgebung gelesen. Next-Image erlaubt nur ausgewählte HTTPS-Hosts. Docker schließt .env-Dateien aus dem Build-Kontext aus. Der GitHub-Worker verhindert überlappende eigene Refreshes.

## Priorität für die Behebung

1. Mail-Empfänger serverseitig festlegen, Inputs/Größe prüfen, Versand begrenzen, HTML escapen und SMTP-Promise korrekt behandeln.
2. Dev-Ports auf Loopback begrenzen; Admin-Authentifizierung vor Aktivierung eines Editors korrigieren.
3. Abhängigkeiten gezielt aktualisieren und den About-HTML-Pfad absichern.
4. Schutz-Header, Ignore-Regeln, Backup-Handhabung und Monitoring vervollständigen.
