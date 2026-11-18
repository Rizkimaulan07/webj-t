import fs from "node:fs"
import path from "node:path"

const CDP = "http://127.0.0.1:9223"
const BASE = "http://localhost:5173"
const OUT = path.join(process.cwd(), ".cache", "shots")
fs.mkdirSync(OUT, { recursive: true })

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
const errors = []
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
    errors.push(`EXCEPTION: ${message.params.exceptionDetails.text} ${message.params.exceptionDetails.exception?.description ?? ""}`)
  }
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    errors.push(`CONSOLE: ${message.params.args.map((arg) => arg.value ?? arg.description).join(" ")}`)
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    errors.push(`LOG: ${message.params.entry.text}`)
  }
})

function send(method, params = {}) {
  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function evaluate(expression) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
  }
  return result.value
}

async function waitFor(expression, timeout = 8000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await evaluate(`Boolean(${expression})`)) return true
    await sleep(120)
  }
  throw new Error(`Timeout menunggu: ${expression}`)
}

async function goto(url) {
  await send("Page.navigate", { url: BASE + url })
  await waitFor("document.readyState === 'complete'")
  await sleep(700)
}

async function shot(name, full = false) {
  let params = { format: "png" }
  if (full) {
    const metrics = await send("Page.getLayoutMetrics")
    const width = Math.ceil(metrics.cssContentSize.width)
    const height = Math.ceil(metrics.cssContentSize.height)
    params = {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    }
  }
  const { data } = await send("Page.captureScreenshot", params)
  fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(data, "base64"))
  console.log("shot", name)
}

async function setInput(selector, value) {
  await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error("Tidak ada elemen " + ${JSON.stringify(selector)});
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`)
  await sleep(150)
}

async function click(selector) {
  const clicked = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.click();
    return true;
  })()`)
  if (!clicked) throw new Error(`Elemen tidak ditemukan: ${selector}`)
  await sleep(250)
}

async function clickText(selector, text) {
  const clicked = await evaluate(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find((node) => node.textContent.includes(${JSON.stringify(text)}));
    if (!el) return false;
    el.click();
    return true;
  })()`)
  if (!clicked) throw new Error(`Teks tidak ditemukan: ${text} dalam ${selector}`)
  await sleep(300)
}

async function pickCity(inputSelector, city) {
  await click(inputSelector)
  await setInput(inputSelector, city)
  await sleep(300)
  await clickText('[role="option"]', city)
  await sleep(200)
}

await send("Page.enable")
await send("Runtime.enable")
await send("Log.enable")
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
})

await goto("/")
await shot("01-home-mobile")

await goto("/tarif")
await pickCity("#tarif-asal", "Bandung")
await pickCity("#tarif-tujuan", "Surabaya")
await setInput("#tarif-berat", "2")
await clickText("button", "Hitung Tarif")
await sleep(1400)
const tariffText = await evaluate(`document.body.innerText`)
console.log("TARIF has Same Day:", tariffText.includes("Same Day"))
console.log("TARIF option count:", await evaluate(`document.querySelectorAll('article').length`))
console.log("TARIF text:\n", tariffText.slice(tariffText.indexOf("Pilihan layanan"), tariffText.indexOf("Pilihan layanan") + 900))
await shot("02-tariff-results")

await goto("/lacak/LJX1234567890")
await waitFor(`document.body.innerText.includes("Bandung")`)
const trackingText = await evaluate("document.body.innerText")
console.log("TRACKING has status:", trackingText.includes("Dalam Perjalanan"))
await shot("03-tracking")

await goto("/masuk")
await clickText("button", "Isi kredensial demo")
await clickText("button", "Masuk")
await sleep(1200)
console.log("AFTER LOGIN URL:", await evaluate("location.pathname"))
console.log("AUTH storage:", await evaluate("localStorage.getItem('jnt-auth')"))
await shot("04-orders-mobile")
const ordersText = await evaluate("document.body.innerText")
console.log("ORDERS has seed:", ordersText.includes("LJX1234567890"), ordersText.includes("LJX0000000001"))

await goto("/akun/alamat")
await shot("05-address-empty")

await goto("/kirim")
await shot("06-shipment-step1")

await send("Emulation.setDeviceMetricsOverride", {
  width: 1280,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
})
await goto("/")
await shot("07-home-desktop")
await goto("/tarif")
await shot("08-tariff-desktop")
await goto("/kirim")
await shot("09-shipment-desktop")

console.log("ERRORS:", errors.length ? errors : "none")
await send("Target.closeTarget", { targetId: target.id })
socket.close()
