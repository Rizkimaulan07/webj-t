import fs from "node:fs"

const CDP = "http://127.0.0.1:9223"
const version = await fetch(`${CDP}/json/version`).then((r) => r.json())
console.log(version)

const target = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" }).then(
  (r) => r.json(),
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
  if (!message.id) return
  const entry = pending.get(message.id)
  if (!entry) return
  pending.delete(message.id)
  if (message.error) entry.reject(new Error(JSON.stringify(message.error)))
  else entry.resolve(message.result)
})
function send(method, params = {}) {
  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function pdfFor(css) {
  const html = `<style>${css}body{margin:0;font-family:sans-serif}div{height:100mm;border:1px solid #000}</style><div>Uji</div>`
  await send("Page.navigate", {
    url: "data:text/html," + encodeURIComponent(html),
  })
  await sleep(300)
  const { data } = await send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
  })
  const raw = Buffer.from(data, "base64").toString("latin1")
  return raw.match(/\/MediaBox\s*\[([^\]]+)\]/)?.[1]
}

await send("Page.enable")
for (const css of [
  "@page{size:A6;margin:6mm}",
  "@page{size:A6 portrait;margin:6mm}",
  "@page{size:105mm 148mm;margin:6mm}",
  "@page{size:297.64pt 419.53pt;margin:6mm}",
  "@page{size:4.13in 5.83in;margin:6mm}",
  "@page{size:JIS-B6;margin:6mm}",
]) {
  console.log(css, "->", await pdfFor(css))
}

await send("Target.closeTarget", { targetId: target.id })
socket.close()
