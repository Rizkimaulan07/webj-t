import fs from "node:fs"
import path from "node:path"

const CDP = "http://127.0.0.1:9223"
const BASE = "http://localhost:5173"
const OUT = path.join(process.cwd(), ".cache", "shots")
fs.mkdirSync(OUT, { recursive: true })

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
    errors.push(message.params.exceptionDetails.text)
  }
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    errors.push(message.params.args.map((a) => a.value ?? a.description).join(" "))
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
  if (exceptionDetails)
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
  return result.value
}
async function waitFor(expression, timeout = 8000, label = expression) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await evaluate(`Boolean(${expression})`)) return true
    await sleep(120)
  }
  throw new Error(`Timeout: ${label}`)
}
async function goto(url) {
  await send("Page.navigate", { url: BASE + url })
  await waitFor("document.readyState === 'complete'")
  await sleep(700)
}
async function shot(name) {
  const { data } = await send("Page.captureScreenshot", { format: "png" })
  fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(data, "base64"))
  console.log("shot", name)
}
async function setInput(selector, value) {
  const ok = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(String(value))});
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`)
  if (!ok) throw new Error(`Input tidak ada: ${selector}`)
  await sleep(150)
}
async function click(selector) {
  const ok = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`)
  if (!ok) throw new Error(`Elemen tidak ada: ${selector}`)
  await sleep(300)
}
async function clickText(selector, text) {
  const ok = await evaluate(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find((n) => n.textContent.includes(${JSON.stringify(text)}));
    if (!el) return false;
    el.click();
    return true;
  })()`)
  if (!ok) throw new Error(`Teks tidak ada: ${text}`)
  await sleep(300)
}
async function pressKey(key, code, keyCode) {
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
  })
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
  })
  await sleep(300)
}
const overflow = () =>
  evaluate(
    `({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, overflow: document.documentElement.scrollWidth > window.innerWidth })`,
  )

await send("Page.enable")
await send("Runtime.enable")
await send("Emulation.setDeviceMetricsOverride", {
  width: 360,
  height: 800,
  deviceScaleFactor: 1,
  mobile: true,
})

await goto("/")
console.log("HOME 360 overflow:", await overflow())
await shot("29-home-360")

// Navigasi keyboard: Tab pertama harus mencapai skip link, lalu Enter mengaktifkannya.
await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`)
await pressKey("Tab", "Tab", 9)
const focusInfo = await evaluate(`(() => {
  const el = document.activeElement;
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName,
    text: el.textContent.trim(),
    href: el.getAttribute("href"),
    outline: s.outlineWidth + " " + s.outlineStyle + " " + s.outlineColor,
    width: Math.round(r.width),
    height: Math.round(r.height),
  };
})()`)
console.log("FIRST TAB:", focusInfo)
const skipOk =
  focusInfo.tag === "A" &&
  focusInfo.text.includes("Lewati ke konten utama") &&
  focusInfo.height >= 44 &&
  focusInfo.width >= 44 &&
  focusInfo.outline.includes("2px") &&
  focusInfo.outline.includes("solid")
console.log(skipOk ? "PASS skip link + focus visible" : "FAIL skip link/focus")
await pressKey("Enter", "Enter", 13)
const hash = await evaluate("location.hash")
console.log(hash === "#main-content" ? "PASS skip link activates" : "FAIL skip link " + hash)
await shot("30-skip-link-focus")

// Alur cepat ke langkah pembayaran
await evaluate(`localStorage.removeItem("jnt-shipment-draft"); true`)
await goto("/kirim")
await waitFor(`document.querySelectorAll('button[aria-pressed]').length >= 2`, 8000, "alamat")
await clickText("button[aria-pressed]", "Gudang")
await clickText("button", "Lanjut ke penerima")
await waitFor(`document.body.innerText.includes("Data penerima")`)
await clickText("button[aria-pressed]", "Kantor")
await clickText("button", "Lanjut ke paket")
await waitFor(`document.body.innerText.includes("Detail paket & layanan")`)
await setInput("#paket-deskripsi", "Uji pembayaran")
await setInput("#paket-berat", "1")
await clickText("button", "Hitung Tarif")
await waitFor(`document.querySelector("#paket-layanan-REGULER")`, 12000, "tarif")
await click("#paket-layanan-REGULER")
await clickText("button", "Lanjut ke pembayaran")
await waitFor(`document.body.innerText.includes("Metode pengantaran")`, 10000, "pembayaran")
console.log("PAYMENT 360 overflow:", await overflow())

await click("#bayar-VA")
await sleep(300)
await evaluate(`document.querySelector(".border-dashed").scrollIntoView({ block: "center" })`)
await sleep(300)
const vaText = await evaluate(`document.body.innerText`)
console.log(
  vaText.toLowerCase().includes("nomor virtual account simulasi") &&
    /8808\s\d{4}\s\d{4}/.test(vaText)
    ? "PASS VA simulasi tampil"
    : "FAIL VA simulasi",
)
await shot("33-payment-va-detail-360")

await click("#bayar-EWALLET")
await sleep(300)
await evaluate(`document.querySelector(".border-dashed").scrollIntoView({ block: "center" })`)
await sleep(300)
const ewalletText = await evaluate(`document.body.innerText`)
console.log(
  ewalletText.toLowerCase().includes("dompet digital simulasi") &&
    ewalletText.includes("GoPay")
    ? "PASS E-Wallet simulasi tampil"
    : "FAIL E-Wallet simulasi",
)
await shot("34-payment-ewallet-detail-360")

const audit = await evaluate(`(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
  };
  const targets = [...document.querySelectorAll('button, a[href], [role="radio"], [role="checkbox"], [role="tab"]')].filter(vis).filter((el) => el.tabIndex >= 0);
  const small = targets.map((el) => {
    const r = el.getBoundingClientRect();
    return { text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) };
  }).filter((t) => t.w < 44 || t.h < 44);
  return { total: targets.length, small };
})()`)
console.log(
  audit.small.length === 0
    ? `PASS target sentuh pembayaran (${audit.total})`
    : "FAIL target kecil: " + JSON.stringify(audit.small),
)

// Bersihkan draft uji
await evaluate(`localStorage.removeItem("jnt-shipment-draft"); true`)
console.log("CONSOLE ERRORS:", errors.length ? errors : "none")
await send("Target.closeTarget", { targetId: target.id })
socket.close()
