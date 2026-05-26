'use strict';

require('dotenv').config();
const { Pool } = require('pg');

// Support both DATABASE_URL (preferred) and individual DB_* variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:      { rejectUnauthorized: false },
    };

const pool = new Pool({
  ...poolConfig,
  max:                    20,
  idleTimeoutMillis:      30000,
  connectionTimeoutMillis: 5000,
  // Force IPv4 — Render free tier does not support outbound IPv6
  // Supabase direct host resolves to IPv6; this prevents ENETUNREACH
  family:                 4,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
  console.error('[DB] Pool error stack:', err.stack);
});

/**
 * Execute a query with optional parameters.
 * @param {string} text - SQL query string
 * @param {Array}  params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool (for transactions).
 * Remember to call client.release() when done.
 */
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
