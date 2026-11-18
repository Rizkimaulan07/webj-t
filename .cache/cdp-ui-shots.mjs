import fs from "node:fs"
import path from "node:path"

const CDP = "http://127.0.0.1:9223"
const BASE = "http://localhost:5173"
const OUT = path.join(process.cwd(), ".cache", "shots-ui")
fs.mkdirSync(OUT, { recursive: true })

const target = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true })
  socket.addEventListener("error", reject, { once: true })
})
let nextId = 1
const pending = new Map()
const problems = []
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const entry = pending.get(message.id)
    if (!entry) return
    pending.delete(message.id)
    if (message.error) entry.reject(new Error(JSON.stringify(message.error)))
    else entry.resolve(message.result)
    return
  }
  if (message.method === "Runtime.exceptionThrown") {
    problems.push(`EXCEPTION ${message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text}`)
  }
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    problems.push(`CONSOLE ${message.params.args.map((a) => a.value ?? a.description).join(" ")}`)
  }
})
function send(method, params = {}) {
  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function evaluate(expression) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
  return result.value
}
async function viewport(width, height, mobile = false) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile })
}
async function goto(url) {
  await send("Page.navigate", { url: BASE + url })
  await sleep(1400)
}
async function waitForH1() {
  for (let i = 0; i < 60; i += 1) {
    const ok = await evaluate(`Boolean(document.querySelector("h1"))`)
    if (ok) return
    await sleep(200)
  }
  throw new Error("Halaman tidak selesai dimuat: h1 tidak ditemukan")
}
async function shot(name, full = true) {
  for (let i = 0; i < 40; i += 1) {
    const skeletons = await evaluate(
      `document.querySelectorAll('[data-slot="skeleton"]').length`,
    )
    if (skeletons === 0) break
    await sleep(150)
  }
  let params = { format: "png" }
  if (full) {
    const metrics = await send("Page.getLayoutMetrics")
    params = {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: Math.ceil(metrics.cssContentSize.width), height: Math.ceil(metrics.cssContentSize.height), scale: 1 },
    }
  }
  const { data } = await send("Page.captureScreenshot", params)
  fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(data, "base64"))
  console.log("shot", name)
}

await send("Page.enable")
await send("Runtime.enable")

const report = []
const publicPages = [
  ["/", "home"],
  ["/tarif", "tarif"],
  ["/cabang", "cabang"],
  ["/bantuan", "bantuan"],
  ["/lacak", "lacak"],
  ["/masuk", "masuk"],
]

await viewport(1280, 900)
await goto("/")
await waitForH1()
for (const [url, name] of publicPages) {
  await goto(url)
  const info = await evaluate(`(() => {
    const logo = document.querySelector('header svg');
    const h1 = document.querySelector('h1');
    const style = getComputedStyle(document.querySelector('header a') || document.body);
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: h1?.textContent?.trim() ?? null,
      logoWidth: logo ? Math.round(logo.getBoundingClientRect().width) : 0,
      primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
      color: style.color,
    };
  })()`)
  report.push({ viewport: "1280", url, ...info })
  console.log("DESKTOP", url, JSON.stringify(info))
  await shot(`1280-${name}`)
}

await viewport(768, 1024)
for (const [url, name] of publicPages.slice(0, 4)) {
  await goto(url)
  const info = await evaluate(`({ overflow: document.documentElement.scrollWidth - window.innerWidth })`)
  report.push({ viewport: "768", url, ...info })
  console.log("TABLET", url, JSON.stringify(info))
  await shot(`768-${name}`)
}

await viewport(360, 800, true)
for (const [url, name] of publicPages) {
  await goto(url)
  const info = await evaluate(`({ overflow: document.documentElement.scrollWidth - window.innerWidth })`)
  report.push({ viewport: "360", url, ...info })
  console.log("MOBILE", url, JSON.stringify(info))
  await shot(`360-${name}`)
}

console.log("PROBLEMS", JSON.stringify(problems, null, 2))
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ report, problems }, null, 2))
await send("Target.closeTarget", { targetId: target.id })
socket.close()
