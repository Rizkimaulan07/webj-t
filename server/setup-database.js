import "dotenv/config"

import { execFileSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const { Client } = pg
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL belum diatur. Salin .env.example menjadi .env.")
}

const databaseUrl = new URL(connectionString)
const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1))

if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error("Nama database hanya boleh berisi huruf, angka, dan garis bawah.")
}

databaseUrl.pathname = "/postgres"
const client = new Client({ connectionString: databaseUrl.toString() })

try {
  await client.connect()
  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName],
  )

  if (result.rowCount === 0) {
    await client.query(`CREATE DATABASE "${databaseName}"`)
    console.log(`Database ${databaseName} berhasil dibuat.`)
  } else {
    console.log(`Database ${databaseName} sudah tersedia; tidak ada database lain yang diubah.`)
  }
} catch (error) {
  console.error("Gagal menyiapkan database PostgreSQL:", error)
  process.exitCode = 1
} finally {
  await client.end()
}

if (process.exitCode !== 1) {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url))
  execFileSync(process.execPath, [join(scriptDirectory, "migrate.js")], {
    stdio: "inherit",
  })
}
