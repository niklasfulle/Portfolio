\getenv admin_user POSTGRES_ADMIN_USER
\getenv admin_password POSTGRES_ADMIN_PASSWORD
\getenv admin_database POSTGRES_ADMIN_DB

SELECT format('CREATE ROLE %I WITH LOGIN PASSWORD %L', :'admin_user', :'admin_password')
WHERE NOT EXISTS (
  SELECT 1 FROM pg_roles WHERE rolname = :'admin_user'
)
\gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'admin_database', :'admin_user')
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = :'admin_database'
)
\gexec
