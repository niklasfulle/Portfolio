# Wiederherstellbarer Portfolio-Datenbank-Seed

Der Compose-Service `db` ist ein PostgreSQL-18-Container mit zwei logischen
Datenbanken: `portfolio` und `portfolio_admin`. Beide liegen im persistenten
Docker-Volume `portfolio_portfolio_postgres18`; ein normaler Compose-Neustart
behält die Daten. Der Portfolio-Seed verändert ausschließlich die Datenbank
`portfolio`, niemals `portfolio_admin`. Die Seed-Datei ist für eine
Wiederherstellung oder das Initialisieren einer neuen Portfolio-Datenbank
gedacht.

## Seed aus der laufenden Datenbank aktualisieren

Der Export liest ausschließlich die Portfolio-Tabellen aus dem laufenden
Compose-Dienst `db`. Standardmäßig ist die derzeitige Quell-Container-ID
hinterlegt. Bei späteren Container-Neuerstellungen kann der Dienstname benutzt
werden:

```powershell
$env:PORTFOLIO_SEED_SOURCE = "portfolio-db-1"
yarn db:seed:export
```

Die Datei wird lokal unter `.local/portfolio-seed.json` abgelegt und ist in
Git sowie im Docker-Build-Kontext ausgeschlossen. Sie enthält persönliche
Portfolio-Inhalte, die Kontaktadresse und den GitHub-Stats-Snapshot. Deshalb
wird sie nicht ins Repository eingecheckt. Ein vorhandener Seed wird nicht
stillschweigend überschrieben; mit `yarn db:seed:export --force` kann er
bewusst aktualisiert werden.

## Automatischer Startversuch und manuelles Einspielen

Beim Start des Admin-Containers wird der Seed über die geschützte
Portfolio-Content-API versucht. Der App-Service wendet vorher das Prisma-Schema
an. Die API importiert den Seed nur, wenn die Zieldatenbank leer ist; bei
vorhandenen Daten wird nichts überschrieben. Ein Marker verhindert, dass ein
bereits angewendeter Seed bei jedem Admin-Neustart erneut geschrieben wird.
Ist die Portfolio-API noch nicht erreichbar, versucht der Admin-Start bis zu
etwa 60 Sekunden lang erneut und startet danach trotzdem.

Manuell kann derselbe Startversuch so ausgeführt werden:

```powershell
docker compose exec -T app yarn db:seed
```

Mehrfaches Ausführen ist sicher: Ein bereits angewendeter Seed wird über den
Marker erkannt; bei einer bereits befüllten Datenbank wird er übersprungen.
Der Schreibvorgang läuft atomar in einer Transaktion. Es werden keine
Datensätze gelöscht oder vorhandene Inhalte überschrieben.

Die Admin-Datenbank ist innerhalb desselben PostgreSQL-Containers separat
angelegt und wird von diesem Portfolio-Seed nicht verändert.
