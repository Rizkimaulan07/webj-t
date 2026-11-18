import "dotenv/config"

import { readFile } from "node:fs/promises"
import pg from "pg"

const { Pool } = pg
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL belum diatur. Salin .env.example menjadi .env.")
}

const pool = new Pool({ connectionString })

try {
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8")
  await pool.query(schema)
  console.log("Skema PostgreSQL berhasil diterapkan.")
} catch (error) {
  console.error("Migrasi database gagal:", error)
  process.exitCode = 1
} finally {
  await pool.end()
}
