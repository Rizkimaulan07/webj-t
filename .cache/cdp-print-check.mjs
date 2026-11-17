import fs from "node:fs"

const CDP = "http://127.0.0.1:9223"
const BASE = "http://127.0.0.1:5173"
const target = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" }).then(
  (response) => response.json(),
)
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true })
  socket.addEventListener("error", reject, { once: true })
})
let nextId = 1
const pending = new Map()
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const entry = pending.get(message.id)
    if (!entry) return
    pending.delete(message.id)
    if (message.error) entry.reject(new Error(JSON.stringify(message.error)))
    else entry.resolve(message.result)
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
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (exceptionDetails) throw new Error(exceptionDetails.text)
  return result.value
}
async function printPdf(params) {
  const { data } = await send("Page.printToPDF", params)
  const buffer = Buffer.from(data, "base64")
  const raw = buffer.toString("latin1")
  const box = raw.match(/\/MediaBox\s*\[([^\]]+)\]/)
  const pages = (raw.match(/\/Type\s*\/Page\b/g) ?? []).length
  return { box: box?.[1], pages, size: buffer.length }
}

await send("Page.enable")
await send("Runtime.enable")
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
})
await send("Page.navigate", { url: `${BASE}/label/LJX1272756281` })
await sleep(2000)

const cssInfo = await evaluate(`(() => {
  const out = [];
  const walk = (rules, prefix) => {
    for (const rule of rules) {
      const text = rule.cssText;
      if (text.includes("@page") || text.includes("A6") || rule.constructor.name === "CSSPageRule" || rule.constructor.name === "CSSMediaRule") {
        out.push(prefix + rule.constructor.name + ": " + text.slice(0, 700));
      }
      if (rule.cssRules) walk(rule.cssRules, prefix + "  ");
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules, ""); } catch (error) { out.push("ERR " + error.message); }
  }
  return { rules: out, sheets: document.styleSheets.length, cssLinks: [...document.querySelectorAll('link[rel=stylesheet], style')].map((el) => el.tagName + ":" + (el.getAttribute("href") || el.getAttribute("data-vite-dev-id") || "inline")) };
})()`)
console.log(JSON.stringify(cssInfo, null, 2))

console.log("PDF default:", await printPdf({ printBackground: true }))
console.log(
  "PDF preferCSSPageSize:",
  await printPdf({ printBackground: true, preferCSSPageSize: true }),
)
console.log(
  "PDF explicit A6:",
  await printPdf({
    printBackground: true,
    paperWidth: 105 / 25.4,
    paperHeight: 148 / 25.4,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  }),
)
await send("Emulation.setEmulatedMedia", { media: "print" })
console.log(
  "PDF preferCSSPageSize printmedia:",
  await printPdf({ printBackground: true, preferCSSPageSize: true }),
)

// Uji halaman minimal dengan @page A6
await send("Page.navigate", {
  url:
    "data:text/html," +
    encodeURIComponent(
      `<style>@page{size:A6 portrait;margin:6mm}body{margin:0;font-family:sans-serif}div{height:130mm;border:1px solid #000}</style><div>Uji A6</div>`,
    ),
})
await sleep(500)
console.log(
  "PDF data A6 preferCSSPageSize:",
  await printPdf({ printBackground: true, preferCSSPageSize: true }),
)
console.log("PDF data A6 default:", await printPdf({ printBackground: true }))

await send("Target.closeTarget", { targetId: target.id })
socket.close()
