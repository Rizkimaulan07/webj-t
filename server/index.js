import "dotenv/config"

import { randomInt } from "node:crypto"
import { existsSync } from "node:fs"
import { join } from "node:path"
import bcrypt from "bcryptjs"
import connectPgSimple from "connect-pg-simple"
import express from "express"
import session from "express-session"
import pg from "pg"
import { z } from "zod"

const { Pool } = pg
const connectionString = process.env.DATABASE_URL
const sessionSecret = process.env.SESSION_SECRET
const port = Number(process.env.API_PORT ?? 3001)

if (!connectionString) {
  throw new Error("DATABASE_URL belum diatur. Salin .env.example menjadi .env.")
}
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET harus diatur dengan nilai acak minimal 32 karakter.")
}

const pool = new Pool({ connectionString })
pool.on("error", (error) => {
  console.error("Kesalahan koneksi PostgreSQL:", error.message)
})

const app = express()
const PgSessionStore = connectPgSimple(session)
const sessionStore = new PgSessionStore({
  pool,
  tableName: "user_sessions",
  createTableIfMissing: true,
})

app.disable("x-powered-by")
app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff")
  response.setHeader("X-Frame-Options", "DENY")
  response.setHeader("Referrer-Policy", "same-origin")
  next()
})
app.use(express.json({ limit: "32kb" }))
app.use(
  session({
    name: "jnt.sid",
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
)

const publicUser = (row) => ({
  id: row.id,
  name: row.name,
  identifier: row.identifier,
})

const identifierSchema = z
  .string()
  .trim()
  .min(5)
  .max(80)
  .refine((value) => {
    const compact = value.replace(/[\s-]/g, "")
    return (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
      /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(compact)
    )
  }, "Format email atau nomor HP belum valid.")

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  identifier: identifierSchema,
  password: z.string().min(6).max(72),
})

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(80),
  password: z.string().min(1).max(72),
})

const addressSchema = z.object({
  label: z.string().trim().min(1).max(60),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().min(5).max(500),
  cityId: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(3).max(12),
})

const partySchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().min(5).max(500),
  cityId: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(3).max(12),
})

const goodsSchema = z.object({
  description: z.string().trim().min(1).max(200),
  weightKg: z.number().positive().max(1000),
  lengthCm: z.number().positive().max(1000),
  widthCm: z.number().positive().max(1000),
  heightCm: z.number().positive().max(1000),
  value: z.number().nonnegative().max(1_000_000_000),
  insurance: z.boolean(),
})

const shipmentSchema = z.object({
  sender: partySchema,
  receiver: partySchema,
  goods: goodsSchema,
  service: z.enum(["REGULER", "EXPRESS", "SAME_DAY", "KARGO"]),
  deliveryMethod: z.enum(["PICKUP", "DROP_OFF"]),
  paymentMethod: z.enum(["VA", "EWALLET", "QRIS", "COD"]),
  total: z.number().nonnegative().max(1_000_000_000),
  estimated: z.string().trim().min(1).max(80),
  zone: z.number().int().min(0).max(10),
  chargeableWeightKg: z.number().positive().max(1000),
  dropBranchName: z.string().trim().max(160).optional(),
})

const CITY_NAMES = {
  jakarta: "Jakarta",
  bandung: "Bandung",
  semarang: "Semarang",
  yogyakarta: "Yogyakarta",
  surabaya: "Surabaya",
  malang: "Malang",
  denpasar: "Denpasar",
  mataram: "Mataram",
  medan: "Medan",
  palembang: "Palembang",
  padang: "Padang",
  "bandar-lampung": "Bandar Lampung",
  balikpapan: "Balikpapan",
  pontianak: "Pontianak",
  banjarmasin: "Banjarmasin",
  makassar: "Makassar",
  manado: "Manado",
  jayapura: "Jayapura",
  ambon: "Ambon",
}

function normalizeIdentifier(identifier) {
  const trimmed = identifier.trim().toLowerCase()
  if (!/^[+\d][\d\s-]+$/.test(trimmed)) {
    return trimmed
  }

  const digits = trimmed.replace(/\D/g, "")
  if (digits.startsWith("0")) return `62${digits.slice(1)}`
  if (digits.startsWith("8")) return `62${digits}`
  return digits
}

function identifierCandidates(identifier) {
  const canonical = normalizeIdentifier(identifier)
  const candidates = new Set([canonical])
  // Kompatibilitas dengan akun lama yang tersimpan memakai awalan 0 atau +62.
  if (/^62\d+$/.test(canonical)) {
    candidates.add(`0${canonical.slice(2)}`)
    candidates.add(`+${canonical}`)
  }
  return [...candidates]
}

function sendValidationError(response, error) {
  return response.status(400).json({
    error: {
      code: "VALIDATION",
      message: error.issues[0]?.message ?? "Data yang dikirim belum valid.",
    },
  })
}

function parseBody(schema, request, response) {
  const result = schema.safeParse(request.body)
  if (!result.success) {
    sendValidationError(response, result.error)
    return null
  }
  return result.data
}

function sendUnauthorized(response) {
  return response.status(401).json({
    error: {
      code: "UNAUTHORIZED",
      message: "Sesi sudah berakhir. Silakan masuk kembali.",
    },
  })
}

async function requireUser(request, response, next) {
  if (!request.session.userId) {
    return sendUnauthorized(response)
  }

  const result = await pool.query(
    "SELECT id, name, identifier FROM users WHERE id = $1",
    [request.session.userId],
  )

  if (!result.rows[0]) {
    request.session.destroy(() => {})
    return sendUnauthorized(response)
  }

  request.user = publicUser(result.rows[0])
  next()
}

function createSession(request, userId) {
  return new Promise((resolve, reject) => {
    request.session.regenerate((regenerateError) => {
      if (regenerateError) {
        reject(regenerateError)
        return
      }

      request.session.userId = userId
      request.session.save((saveError) => {
        if (saveError) reject(saveError)
        else resolve()
      })
    })
  })
}

function destroySession(request) {
  return new Promise((resolve, reject) => {
    if (!request.session) {
      resolve()
      return
    }

    request.session.destroy((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function cityName(cityId) {
  return CITY_NAMES[cityId] ?? cityId
}

function maskName(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0]}${"*".repeat(Math.max(3, part.length - 1))}`)
    .join(" ")
}

function createTrackingEvents(input, now, origin, destination) {
  const at = (hours) =>
    new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString()

  return [
    {
      time: now.toISOString(),
      title:
        input.paymentMethod === "COD"
          ? "Pesanan dibuat. Pembayaran dilakukan saat paket diterima (COD)"
          : "Pesanan dibuat dan pembayaran diterima",
      location: origin,
      done: true,
    },
    {
      time: at(2),
      title:
        input.deliveryMethod === "PICKUP"
          ? "Paket dijemput oleh kurir"
          : input.dropBranchName
            ? `Paket diantar ke ${input.dropBranchName}`
            : "Paket diantar ke drop point",
      location: origin,
      done: false,
    },
    {
      time: at(8),
      title: `Paket dalam perjalanan ke ${destination}`,
      location: origin,
      done: false,
    },
    {
      time: at(30),
      title: "Paket diantar ke alamat penerima",
      location: destination,
      done: false,
    },
  ]
}

function serializeOrder(row, events) {
  return {
    ...row.payload,
    awb: row.awb,
    ownerId: row.owner_id,
    status: row.status,
    service: row.service,
    from: row.origin,
    to: row.destination,
    receiverMasked: row.receiver_masked,
    weightKg: Number(row.weight_kg),
    events,
  }
}

function serializeEvents(rows) {
  return rows.map((row) => ({
    time: new Date(row.event_time).toISOString(),
    title: row.title,
    location: row.location,
    done: row.done,
  }))
}

function publicTracking(order) {
  return {
    awb: order.awb,
    status: order.status,
    service: order.service,
    from: order.from,
    to: order.to,
    receiverMasked: order.receiverMasked,
    weightKg: order.weightKg,
    events: order.events,
  }
}

async function getTrackingEvents(awb) {
  const result = await pool.query(
    `SELECT event_time, title, location, done
     FROM tracking_events
     WHERE awb = $1
     ORDER BY event_time`,
    [awb],
  )
  return serializeEvents(result.rows)
}

app.get("/api/health", async (_request, response) => {
  await pool.query("SELECT 1")
  response.json({ status: "ok", database: "connected" })
})

app.post("/api/auth/register", async (request, response) => {
  const input = parseBody(registerSchema, request, response)
  if (!input) return

  const identifier = normalizeIdentifier(input.identifier)
  const passwordHash = await bcrypt.hash(input.password, 12)
  const result = await pool.query(
    `INSERT INTO users (name, identifier, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, identifier`,
    [input.name, identifier, passwordHash],
  )
  const user = publicUser(result.rows[0])
  await createSession(request, user.id)
  response.status(201).json(user)
})

app.post("/api/auth/login", async (request, response) => {
  const input = parseBody(loginSchema, request, response)
  if (!input) return

  const candidates = identifierCandidates(input.identifier)
  const result = await pool.query(
    "SELECT id, name, identifier, password_hash FROM users WHERE identifier = ANY($1::text[])",
    [candidates],
  )
  const account = result.rows[0]
  if (!account || !(await bcrypt.compare(input.password, account.password_hash))) {
    return response.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Email/nomor HP atau kata sandi belum tepat.",
      },
    })
  }

  const user = publicUser(account)
  await createSession(request, user.id)
  response.json(user)
})

app.get("/api/auth/me", async (request, response) => {
  if (!request.session.userId) {
    return response.json(null)
  }

  const result = await pool.query(
    "SELECT id, name, identifier FROM users WHERE id = $1",
    [request.session.userId],
  )

  if (!result.rows[0]) {
    request.session.destroy(() => {})
    return response.json(null)
  }

  response.json(publicUser(result.rows[0]))
})

app.post("/api/auth/logout", async (request, response) => {
  await destroySession(request)
  response.clearCookie("jnt.sid", { httpOnly: true, sameSite: "lax" })
  response.json({ success: true })
})

app.get("/api/addresses", requireUser, async (request, response) => {
  const result = await pool.query(
    `SELECT id, user_id AS "userId", label, name, phone, address,
            city_id AS "cityId", postal_code AS "postalCode"
     FROM addresses
     WHERE user_id = $1
     ORDER BY label`,
    [request.user.id],
  )
  response.json(result.rows)
})

app.post("/api/addresses", requireUser, async (request, response) => {
  const input = parseBody(addressSchema, request, response)
  if (!input) return

  const result = await pool.query(
    `INSERT INTO addresses (user_id, label, name, phone, address, city_id, postal_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id AS "userId", label, name, phone, address,
               city_id AS "cityId", postal_code AS "postalCode"`,
    [
      request.user.id,
      input.label,
      input.name,
      input.phone,
      input.address,
      input.cityId,
      input.postalCode,
    ],
  )
  response.status(201).json(result.rows[0])
})

app.put("/api/addresses/:id", requireUser, async (request, response) => {
  const input = parseBody(addressSchema, request, response)
  if (!input) return

  const result = await pool.query(
    `UPDATE addresses
     SET label = $1, name = $2, phone = $3, address = $4,
         city_id = $5, postal_code = $6
     WHERE id = $7 AND user_id = $8
     RETURNING id, user_id AS "userId", label, name, phone, address,
               city_id AS "cityId", postal_code AS "postalCode"`,
    [
      input.label,
      input.name,
      input.phone,
      input.address,
      input.cityId,
      input.postalCode,
      request.params.id,
      request.user.id,
    ],
  )

  if (!result.rows[0]) {
    return response.status(404).json({
      error: { code: "NOT_FOUND", message: "Alamat tidak ditemukan." },
    })
  }
  response.json(result.rows[0])
})

app.delete("/api/addresses/:id", requireUser, async (request, response) => {
  const result = await pool.query(
    "DELETE FROM addresses WHERE id = $1 AND user_id = $2",
    [request.params.id, request.user.id],
  )

  if (result.rowCount === 0) {
    return response.status(404).json({
      error: { code: "NOT_FOUND", message: "Alamat tidak ditemukan." },
    })
  }
  response.json({ success: true })
})

app.get("/api/shipments", requireUser, async (request, response) => {
  const result = await pool.query(
    `SELECT s.awb, s.owner_id, s.status, s.service, s.origin, s.destination,
            s.receiver_masked, s.weight_kg, s.payload,
            COALESCE(
              json_agg(
                json_build_object(
                  'time', e.event_time,
                  'title', e.title,
                  'location', e.location,
                  'done', e.done
                ) ORDER BY e.event_time
              ) FILTER (WHERE e.id IS NOT NULL),
              '[]'::json
            ) AS events
     FROM shipments s
     LEFT JOIN tracking_events e ON e.awb = s.awb
     WHERE s.owner_id = $1
     GROUP BY s.awb
     ORDER BY s.created_at DESC`,
    [request.user.id],
  )

  response.json(
    result.rows.map((row) =>
      serializeOrder(row, serializeEvents(row.events.map((event) => ({
        event_time: event.time,
        title: event.title,
        location: event.location,
        done: event.done,
      })))),
    ),
  )
})

app.post("/api/shipments", requireUser, async (request, response) => {
  const input = parseBody(shipmentSchema, request, response)
  if (!input) return

  const now = new Date()
  const origin = cityName(input.sender.cityId)
  const destination = cityName(input.receiver.cityId)
  const awb = `LJX${String(randomInt(0, 10_000_000_000)).padStart(10, "0")}`
  const events = createTrackingEvents(input, now, origin, destination)
  const order = {
    awb,
    status: "DIPROSES",
    service: input.service,
    from: origin,
    to: destination,
    receiverMasked: maskName(input.receiver.name),
    weightKg: input.chargeableWeightKg,
    events,
    createdAt: now.toISOString(),
    total: input.total,
    estimated: input.estimated,
    paymentMethod: input.paymentMethod,
    deliveryMethod: input.deliveryMethod,
    sender: input.sender,
    receiver: input.receiver,
    goods: input.goods,
    ownerId: request.user.id,
    zone: input.zone,
    ...(input.dropBranchName
      ? { dropBranchName: input.dropBranchName }
      : {}),
  }
  const { events: _events, ownerId: _ownerId, ...payload } = order
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    await client.query(
      `INSERT INTO shipments
       (awb, owner_id, status, service, origin, destination, receiver_masked,
        weight_kg, created_at, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)`,
      [
        awb,
        request.user.id,
        order.status,
        order.service,
        origin,
        destination,
        order.receiverMasked,
        order.weightKg,
        now,
        JSON.stringify(payload),
      ],
    )

    for (const event of events) {
      await client.query(
        `INSERT INTO tracking_events (awb, event_time, title, location, done)
         VALUES ($1, $2, $3, $4, $5)`,
        [awb, event.time, event.title, event.location, event.done],
      )
    }

    await client.query("COMMIT")
    response.status(201).json(order)
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
})

app.get("/api/shipments/:awb", requireUser, async (request, response) => {
  const result = await pool.query(
    `SELECT awb, owner_id, status, service, origin, destination,
            receiver_masked, weight_kg, payload
     FROM shipments
     WHERE awb = $1 AND owner_id = $2`,
    [request.params.awb.trim().toUpperCase(), request.user.id],
  )

  if (!result.rows[0]) {
    return response.status(404).json({
      error: { code: "NOT_FOUND", message: "Pesanan tidak ditemukan." },
    })
  }

  const row = result.rows[0]
  response.json(serializeOrder(row, await getTrackingEvents(row.awb)))
})

app.get("/api/tracking/:awb", async (request, response) => {
  const result = await pool.query(
    `SELECT awb, owner_id, status, service, origin, destination,
            receiver_masked, weight_kg, payload
     FROM shipments
     WHERE awb = $1`,
    [request.params.awb.trim().toUpperCase()],
  )

  if (!result.rows[0]) {
    return response.status(404).json({
      error: { code: "NOT_FOUND", message: "Resi tidak ditemukan." },
    })
  }

  const row = result.rows[0]
  const order = serializeOrder(row, await getTrackingEvents(row.awb))
  response.json(publicTracking(order))
})

const publicDirectory = join(process.cwd(), "dist")
const indexFile = join(publicDirectory, "index.html")

if (existsSync(indexFile)) {
  app.use(express.static(publicDirectory))
  app.use((request, response, next) => {
    if (request.method !== "GET" || request.path.startsWith("/api/")) {
      next()
      return
    }
    response.sendFile(indexFile, (error) => {
      if (error) next(error)
    })
  })
}

app.use("/api", (_request, response) => {
  response.status(404).json({
    error: { code: "NOT_FOUND", message: "Endpoint API tidak ditemukan." },
  })
})

app.use((error, _request, response, next) => {
  if (response.headersSent) {
    next(error)
    return
  }

  if (error?.name === "ZodError") {
    sendValidationError(response, error)
    return
  }
  if (error?.code === "23505") {
    response.status(409).json({
      error: { code: "CONFLICT", message: "Email atau nomor HP sudah terdaftar." },
    })
    return
  }

  console.error("Kesalahan API:", error)
  response.status(500).json({
    error: {
      code: "SERVER_ERROR",
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
    },
  })
})

try {
  await pool.query("SELECT id FROM users LIMIT 0")
  app.listen(port, () => {
    console.log(`API J&T berjalan di http://localhost:${port}`)
  })
} catch (error) {
  console.error("API gagal terhubung ke PostgreSQL. Periksa .env dan jalankan npm run db:setup.")
  console.error(error.message)
  await pool.end()
  process.exitCode = 1
}
