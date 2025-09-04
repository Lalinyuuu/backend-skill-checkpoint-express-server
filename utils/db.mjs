import pg from "pg";
const { Pool } = pg;


const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://localhost:5432/quora_db",
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export default pool;