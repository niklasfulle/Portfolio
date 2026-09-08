$ErrorActionPreference = "Stop"

Write-Host "Starte einmalige GitHub-Stats-Aktualisierung..."
docker compose run --rm github-stats-worker sh -c "yarn prisma generate && yarn prisma db push && yarn worker:github-stats:once"

if ($LASTEXITCODE -ne 0) {
  throw "Die einmalige GitHub-Stats-Aktualisierung ist fehlgeschlagen."
}

Write-Host "GitHub-Stats wurden aktualisiert."
