import fs from "node:fs"
const CDP = "http://127.0.0.1:9223"
const target = await fetch(CDP + "/json/new?about:blank", { method: "PUT" }).then((r) => r.json())
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true })
  ws.addEventListener("error", rej, { once: true })
})
let id = 1
const pending = new Map()
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data)
  if (m.id) {
    const p = pending.get(m.id)
    if (p) {
      pending.delete(m.id)
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result)
    }
  }
})
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const i = id++
    pending.set(i, { resolve, reject })
    ws.send(JSON.stringify({ id: i, method, params }))
  })
await send("Page.enable")
await send("Emulation.setDeviceMetricsOverride", {
  width: 1100,
  height: 420,
  deviceScaleFactor: 1,
  mobile: false,
})
await send("Page.navigate", {
  url: "file:///C:/Users/Rizki%20Maulana/jnt-express/.cache/logo-preview.svg",
})
await new Promise((r) => setTimeout(r, 800))
const { data } = await send("Page.captureScreenshot", { format: "png" })
fs.writeFileSync(".cache/logo-preview.png", Buffer.from(data, "base64"))
await send("Target.closeTarget", { targetId: target.id })
ws.close()
console.log("done")
