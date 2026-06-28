-- Run if auth_db is missing (auth-service needs this database)
-- PowerShell:
--   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -f scripts/create-auth-db.sql
-- Git Bash:
--   "/c/Program Files/PostgreSQL/16/bin/psql.exe" -U postgres -f scripts/create-auth-db.sql

CREATE DATABASE auth_db OWNER revest;
GRANT ALL PRIVILEGES ON DATABASE auth_db TO revest;

\c auth_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
