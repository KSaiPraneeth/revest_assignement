-- Run once after installing PostgreSQL locally (no Docker required)
-- Example: psql -U postgres -f scripts/init-databases.sql

CREATE USER revest WITH PASSWORD 'revest_secret';

CREATE DATABASE product_db OWNER revest;
CREATE DATABASE order_db OWNER revest;
CREATE DATABASE auth_db OWNER revest;

GRANT ALL PRIVILEGES ON DATABASE product_db TO revest;
GRANT ALL PRIVILEGES ON DATABASE order_db TO revest;
GRANT ALL PRIVILEGES ON DATABASE auth_db TO revest;

\c product_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c order_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c auth_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
