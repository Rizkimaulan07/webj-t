const CDP = "http://127.0.0.1:9223"
const BASE = "http://localhost:5173"
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
async function evaluate(expression) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (exceptionDetails) throw new Error(exceptionDetails.text)
  return result.value
}

await send("Page.enable")
await send("Runtime.enable")
await send("Page.navigate", { url: `${BASE}/label/LJX1272756281` })
await sleep(2000)

for (const [label, width] of [
  ["screen-390", 390],
  ["print-105mm", 397],
  ["print-93mm", 352],
  ["print-87mm", 329],
  ["print-84mm", 319],
]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 1300,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await send("Emulation.setEmulatedMedia", {
    media: label.startsWith("print") ? "print" : "screen",
  })
  await sleep(200)
  const m = await evaluate(`(() => {
    const sheet = document.querySelector('.label-sheet');
    const container = sheet.parentElement;
    const header = sheet.querySelector('header');
    const barcode = sheet.querySelector('svg');
    const r = sheet.getBoundingClientRect();
    return {
      sheetWidth: Math.round(r.width),
      sheetHeight: Math.round(r.height),
      sheetHeightMm: +(r.height / 96 * 25.4).toFixed(1),
      containerWidth: Math.round(container.getBoundingClientRect().width),
      headerHeight: Math.round(header.getBoundingClientRect().height),
      barcodeHeight: barcode ? Math.round(barcode.getBoundingClientRect().height) : null,
      bodyScroll: document.body.scrollHeight,
      font: getComputedStyle(sheet).fontSize,
      padding: getComputedStyle(sheet).padding,
    };
  })()`)
  console.log(label, width, JSON.stringify(m))
}
await send("Emulation.setEmulatedMedia", { media: "screen" })
await send("Target.closeTarget", { targetId: target.id })
socket.close()
