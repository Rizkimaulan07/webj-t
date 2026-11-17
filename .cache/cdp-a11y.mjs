const CDP = "http://127.0.0.1:9223"
const BASE = "http://127.0.0.1:5173"
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
  if (exceptionDetails)
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
  return result.value
}
async function goto(url) {
  await send("Page.navigate", { url: BASE + url })
  await sleep(1800)
}

await send("Page.enable")
await send("Runtime.enable")
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
})

for (const url of ["/", "/tarif", "/lacak", "/cabang", "/kirim", "/akun/pesanan", "/akun/alamat"]) {
  await goto(url)
  const data = await evaluate(`(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const isAriaHidden = (el) => el.closest('[aria-hidden="true"]') || el.tabIndex < 0;
    const inputs = [...document.querySelectorAll('input:not([type="hidden"]), textarea, select')].filter((el) => vis(el) && !isAriaHidden(el));
    const hasLabel = (el) => Boolean(
      (el.getAttribute("aria-label") || "").trim() ||
      el.getAttribute("aria-labelledby") ||
      (el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]')) ||
      el.closest("label")
    );
    const unlabeled = inputs.filter((el) => !hasLabel(el)).map((el) => el.id || el.name || el.outerHTML.slice(0, 120));
    const targets = [...document.querySelectorAll('button, a[href], [role="radio"], [role="checkbox"], [role="tab"], [role="combobox"]')].filter((el) => vis(el) && !isAriaHidden(el));
    const effectiveRect = (el) => {
      const own = el.getBoundingClientRect();
      const role = el.getAttribute("role");
      if (role !== "checkbox" && role !== "radio") return own;
      const label = el.id ? document.querySelector('label[for="' + CSS.escape(el.id) + '"]') : el.closest("label");
      if (!label) return own;
      const lr = label.getBoundingClientRect();
      return { width: Math.max(own.width, lr.width), height: Math.max(own.height, lr.height) };
    };
    const small = targets.map((el) => {
      const r = effectiveRect(el);
      return {
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute("role") || "",
        text: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 44),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    }).filter((t) => t.w < 44 || t.h < 44);
    return { inputs: inputs.length, unlabeled, targets: targets.length, small };
  })()`)
  console.log(`\n${url}`, JSON.stringify(data, null, 2))
}
await send("Target.closeTarget", { targetId: target.id })
socket.close()
