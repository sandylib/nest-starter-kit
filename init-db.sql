-- Initialization script for local PostgreSQL database
-- This script runs automatically when the database container is first created

\c nest_starter_kit_local;

-- Create UUID extension (required for Prisma's @default(uuid()))
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT 'Database nest_starter_kit_local initialized successfully' AS status;
