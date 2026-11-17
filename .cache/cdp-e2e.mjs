import fs from "node:fs"
import path from "node:path"

const CDP = "http://127.0.0.1:9223"
const BASE = "http://127.0.0.1:5173"
const OUT = path.join(process.cwd(), ".cache", "shots")
fs.mkdirSync(OUT, { recursive: true })

const results = []
let failures = 0

function check(name, ok, detail = "") {
  results.push({ name, ok, detail })
  if (!ok) failures += 1
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`)
}

function assert(ok, message) {
  if (!ok) throw new Error(`ASSERT: ${message}`)
}

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
    errors.push(
      `EXCEPTION: ${message.params.exceptionDetails.text} ${message.params.exceptionDetails.exception?.description ?? ""}`,
    )
  }
  if (
    message.method === "Runtime.consoleAPICalled" &&
    message.params.type === "error"
  ) {
    errors.push(
      `CONSOLE: ${message.params.args.map((arg) => arg.value ?? arg.description).join(" ")}`,
    )
  }
  if (
    message.method === "Log.entryAdded" &&
    message.params.entry.level === "error"
  ) {
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
    throw new Error(
      exceptionDetails.exception?.description ?? exceptionDetails.text,
    )
  }
  return result.value
}

async function waitFor(expression, timeout = 8000, label = expression) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await evaluate(`Boolean(${expression})`)) return true
    await sleep(120)
  }
  throw new Error(`Timeout menunggu: ${label}`)
}

const waitForText = (text, timeout = 8000) =>
  waitFor(
    `document.body.innerText.includes(${JSON.stringify(text)})`,
    timeout,
    `teks "${text}"`,
  )

const waitForNoDialog = (timeout = 8000) =>
  waitFor(
    `!document.querySelector('[role="dialog"]')`,
    timeout,
    "dialog tertutup",
  )

async function goto(url) {
  await send("Page.navigate", { url: BASE + url })
  await waitFor("document.readyState === 'complete'")
  await sleep(600)
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
  const ok = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, ${JSON.stringify(String(value))});
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`)
  if (!ok) throw new Error(`Input tidak ditemukan: ${selector}`)
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
  if (!clicked)
    throw new Error(`Teks tidak ditemukan: ${text} dalam ${selector}`)
  await sleep(300)
}

// Radix Tabs aktif lewat mousedown/pointerdown, bukan click programatik.
async function pressTab(text) {
  const pressed = await evaluate(`(() => {
    const el = [...document.querySelectorAll('[role="tab"]')].find((node) => node.textContent.includes(${JSON.stringify(text)}));
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    const rect = el.getBoundingClientRect();
    const options = {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    };
    el.focus();
    el.dispatchEvent(new PointerEvent("pointerdown", { ...options, buttons: 1, pointerId: 1 }));
    el.dispatchEvent(new MouseEvent("mousedown", { ...options, buttons: 1 }));
    el.dispatchEvent(new PointerEvent("pointerup", { ...options, buttons: 0, pointerId: 1 }));
    el.dispatchEvent(new MouseEvent("mouseup", { ...options, buttons: 0 }));
    el.dispatchEvent(new MouseEvent("click", { ...options, buttons: 0 }));
    return true;
  })()`)
  if (!pressed) throw new Error(`Tab tidak ditemukan: ${text}`)
  await sleep(400)
}

async function clickTextUntil(selector, text, expression, timeout = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await evaluate(`Boolean(${expression})`)) return true
    try {
      await clickText(selector, text)
    } catch {
      // elemen mungkin belum tampil
    }
    await sleep(300)
  }
  throw new Error(`Timeout aksi "${text}" menuju ${expression}`)
}

async function pickCity(inputSelector, city) {
  await click(inputSelector)
  await setInput(inputSelector, city)
  await waitFor(
    `document.querySelector('[role="option"]')`,
    5000,
    `opsi kota ${city}`,
  )
  await clickText('[role="option"]', city)
  await sleep(250)
}

async function fillAddressDialog(values) {
  await waitFor(
    `document.querySelector('[role="dialog"]')`,
    5000,
    "dialog alamat",
  )
  await setInput("#alamat-label", values.label)
  await setInput("#alamat-nama", values.name)
  await setInput("#alamat-telepon", values.phone)
  await setInput("#alamat-lengkap", values.address)
  await pickCity("#alamat-kota", values.city)
  await setInput("#alamat-kodepos", values.postalCode)
}

const inputValue = (selector) =>
  evaluate(`document.querySelector(${JSON.stringify(selector)})?.value ?? null`)

async function clickInArticle(awb, text) {
  const clicked = await evaluate(`(() => {
    const article = [...document.querySelectorAll('article')].find((node) => node.textContent.includes(${JSON.stringify(awb)}));
    if (!article) return false;
    const button = [...article.querySelectorAll('button, a')].find((node) => node.textContent.includes(${JSON.stringify(text)}));
    if (!button) return false;
    button.click();
    return true;
  })()`)
  if (!clicked) throw new Error(`Tombol "${text}" tidak ditemukan di kartu ${awb}`)
  await sleep(300)
}

async function auditA11y(label) {
  const data = await evaluate(`(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const hasLabel = (el) => Boolean(
      (el.getAttribute("aria-label") || "").trim() ||
      el.getAttribute("aria-labelledby") ||
      (el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]')) ||
      el.closest("label")
    );
    const isAriaHidden = (el) => el.closest('[aria-hidden="true"]') || el.tabIndex < 0;
    const inputs = [...document.querySelectorAll('input:not([type="hidden"]), textarea, select')].filter((el) => vis(el) && !isAriaHidden(el));
    const unlabeled = inputs.filter((el) => !hasLabel(el)).map((el) => el.id || el.name || el.outerHTML.slice(0, 90));
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
    const small = targets
      .map((el) => {
        const r = effectiveRect(el);
        return {
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute("role") || "",
          text: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 36),
          w: Math.round(r.width),
          h: Math.round(r.height),
        };
      })
      .filter((t) => t.w < 44 || t.h < 44);
    const imgs = [...document.images].filter((img) => !img.hasAttribute("alt")).map((img) => img.src);
    const emptyLinks = [...document.querySelectorAll("a[href]")].filter((a) => vis(a) && !(a.getAttribute("aria-label") || a.textContent.trim())).length;
    return {
      inputs: inputs.length,
      unlabeled,
      targets: targets.length,
      smallCount: small.length,
      small: small.slice(0, 15),
      imgs,
      emptyLinks,
      h1: document.querySelectorAll("h1").length,
      main: Boolean(document.querySelector("main")),
    };
  })()`)
  console.log(`A11Y ${label}:`, JSON.stringify(data))
  check(`A11y ${label}: semua input berlabel`, data.unlabeled.length === 0, data.unlabeled.join(" | "))
  check(`A11y ${label}: ada landmark main`, data.main)
  check(`A11y ${label}: tepat satu h1`, data.h1 === 1, `h1=${data.h1}`)
  check(`A11y ${label}: semua gambar punya alt`, data.imgs.length === 0, data.imgs.join(" | "))
  check(`A11y ${label}: tautan punya nama aksesibel`, data.emptyLinks === 0)
  check(
    `A11y ${label}: target sentuh >=44px`,
    data.smallCount === 0,
    `${data.smallCount}/${data.targets} kecil: ${data.small.map((t) => `${t.tag}(${t.w}x${t.h}) ${t.text}`).join("; ")}`,
  )
}

const setMobile = () =>
  send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })

const setTablet = () =>
  send("Emulation.setDeviceMetricsOverride", {
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: false,
  })

const setDesktop = () =>
  send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })

try {
  await send("Page.enable")
  await send("Runtime.enable")
  await send("Log.enable")
  await setMobile()

  // Bersihkan data uji pada profil Chrome ini agar hasil deterministik.
  await goto("/")
  await evaluate(
    `localStorage.removeItem("jnt.addresses"); localStorage.removeItem("jnt.orders"); localStorage.removeItem("jnt-shipment-draft"); true`,
  )

  // Login demo
  await goto("/masuk")
  await clickText("button", "Isi kredensial demo")
  await clickText("button", "Masuk")
  await waitFor(`location.pathname === "/akun/pesanan"`, 12000, "redirect login")
  await waitForText("LJX1234567890", 12000)
  check("Login demo redirect ke riwayat pesanan", true)
  console.log(
    "AUTH:",
    await evaluate(
      `JSON.parse(localStorage.getItem("jnt-auth")).state.user.identifier`,
    ),
  )

  // === BUKU ALAMAT: CREATE, UPDATE ===
  await goto("/akun/alamat")
  await waitForText("Buku alamat")
  await sleep(900)
  await clickText("button", "Tambah alamat")
  await fillAddressDialog({
    label: "Rumah",
    name: "Rizki Maulana",
    phone: "0812-3456-7890",
    address: "Jl. Cihampelas No. 123, RT 01/RW 02, Sukajadi",
    city: "Bandung",
    postalCode: "40162",
  })
  await clickText("button", "Simpan alamat")
  await waitForNoDialog(8000)
  await waitForText("Rizki Maulana", 8000)
  const afterFirst = await evaluate(
    `[...document.querySelectorAll('article')].map((a) => a.innerText).join("\\n---\\n")`,
  )
  check("Alamat pertama tersimpan", afterFirst.includes("Rumah"))
  check(
    "Nomor telepon dinormalisasi",
    afterFirst.includes("081234567890"),
    afterFirst.includes("0812-3456-7890")
      ? "masih berformat asli"
      : "format bersih",
  )

  await clickText("button", "Tambah alamat")
  await fillAddressDialog({
    label: "Kantor",
    name: "Siti Aminah",
    phone: "081377788899",
    address: "Jl. Raya Darmo No. 45, RT 03/RW 06, Wonokromo",
    city: "Surabaya",
    postalCode: "60241",
  })
  await clickText("button", "Simpan alamat")
  await waitForNoDialog(8000)
  await waitForText("Siti Aminah", 8000)
  check(
    "Alamat kedua tersimpan",
    (await evaluate(`document.querySelectorAll('article').length`)) === 2,
  )

  await click('[aria-label="Ubah alamat Rumah"]')
  await waitForText("Ubah alamat", 5000)
  await setInput("#alamat-nama", "Rizki Maulana Putra")
  await clickText("button", "Simpan perubahan")
  await waitForNoDialog(8000)
  await waitForText("Rizki Maulana Putra", 8000)
  check("Alamat berhasil diubah", true)
  await shot("10-address-book")

  // === PENGIRIMAN 1: QRIS Bandung -> Surabaya ===
  await evaluate(`localStorage.removeItem("jnt-shipment-draft"); true`)
  await goto("/kirim")
  await waitForText("Data pengirim")
  await waitFor(
    `document.querySelectorAll('button[aria-pressed]').length >= 2`,
    8000,
    "dua alamat tersimpan",
  )

  await clickText("button[aria-pressed]", "Rumah")
  await sleep(400)
  check(
    "Pilih alamat tersimpan mengisi form pengirim",
    (await inputValue("#sender-nama")) === "Rizki Maulana Putra",
    await inputValue("#sender-nama"),
  )
  check(
    "Kota alamat tersimpan terisi",
    (await inputValue("#sender-kota")) === "Bandung",
    await inputValue("#sender-kota"),
  )
  await shot("11-shipment-step1-filled")
  await clickText("button", "Lanjut ke penerima")
  await waitForText("Data penerima")

  // Validasi form kosong
  await clickText("button", "Lanjut ke paket")
  await sleep(500)
  const validationAlerts = await evaluate(
    `[...document.querySelectorAll('[role="alert"]')].map((el) => el.textContent.trim())`,
  )
  check(
    "Validasi penerima kosong tampil",
    validationAlerts.length >= 5 &&
      validationAlerts.some((text) => text.includes("Nama minimal 3 karakter")),
    validationAlerts.join(" | "),
  )
  check(
    "Tetap di langkah penerima saat tidak valid",
    (await evaluate(`document.body.innerText.includes("Data penerima")`)) ===
      true,
  )

  await clickText("button[aria-pressed]", "Kantor")
  await sleep(400)
  check(
    "Pilih alamat tersimpan mengisi form penerima",
    (await inputValue("#receiver-nama")) === "Siti Aminah",
    await inputValue("#receiver-nama"),
  )
  await clickText("button", "Lanjut ke paket")
  await waitForText("Detail paket & layanan")

  await setInput("#paket-deskripsi", "Pakaian dan oleh-oleh")
  await setInput("#paket-berat", "2")
  await setInput("#paket-panjang", "30")
  await setInput("#paket-lebar", "20")
  await setInput("#paket-tinggi", "15")
  await click("#paket-asuransi")
  await setInput("#paket-nilai", "750000")
  check(
    "Asuransi tercentang",
    (await evaluate(
      `document.querySelector("#paket-asuransi")?.getAttribute("aria-checked")`,
    )) === "true",
  )
  await clickText("button", "Hitung Tarif")
  await waitFor(
    `document.querySelector('[id^="paket-layanan-"]')`,
    12000,
    "opsi layanan",
  )
  await sleep(500)
  const count1 = await evaluate(
    `document.querySelectorAll('[id^="paket-layanan-"]').length`,
  )
  const quotesText = await evaluate(
    `[...document.querySelectorAll('[id^="paket-layanan-"]')].map((el) => el.closest("div.relative")?.innerText ?? "").join("\\n---\\n")`,
  )
  check(
    "Bandung→Surabaya 2 kg menghasilkan 3 opsi",
    count1 === 3,
    `opsi=${count1}`,
  )
  check(
    "Same Day tidak muncul untuk beda kota",
    !quotesText.includes("Same Day"),
  )
  check(
    "Opsi termurah berlabel Termurah",
    quotesText.includes("Termurah") && quotesText.includes("Reguler"),
  )
  console.log("TARIF 1:\n" + quotesText.slice(0, 900))
  await shot("12-tariff-options")
  await click("#paket-layanan-REGULER")
  await sleep(300)
  check(
    "Layanan Reguler terpilih",
    (await evaluate(`document.body.innerText`)).includes(
      "Layanan terpilih: Reguler",
    ),
  )
  await clickText("button", "Lanjut ke pembayaran")
  await waitForText("Metode pengantaran", 10000)

  await click("#bayar-QRIS")
  await sleep(300)
  const qrisText = await evaluate(`document.body.innerText`)
  check("Simulasi QRIS tampil", qrisText.includes("QRIS simulasi"))
  check(
    "Ringkasan pembayaran QRIS",
    qrisText.includes("QRIS") && qrisText.includes("Asuransi"),
  )
  await shot("13-payment-qris")
  await clickText("button", "Bayar & Buat Resi")
  await waitFor(
    `location.pathname.startsWith("/kirim/sukses/")`,
    15000,
    "halaman sukses",
  )
  const awb1 = decodeURIComponent(
    await evaluate(`location.pathname.split("/").pop()`),
  )
  await waitForText("Paketmu siap berangkat", 12000)
  await waitForText(awb1, 12000)
  const success1 = await evaluate(`document.body.innerText`)
  check(
    "Halaman sukses menampilkan resi baru",
    /^LJX\d{10}$/.test(awb1),
    awb1,
  )
  check("Ringkasan QRIS di halaman sukses", success1.includes("QRIS diterima"))
  check(
    "Total dan layanan tampil di halaman sukses",
    success1.includes("Reguler") && success1.includes("Rp"),
  )
  console.log("AWB-1:", awb1)
  await shot("14-success-qris", true)

  // === LABEL & CETAK A6 ===
  await goto(`/label/${awb1}`)
  await waitForText("Label pengiriman", 10000)
  await waitFor(
    `document.querySelector(".label-sheet")`,
    10000,
    "label sheet",
  )
  const labelData = await evaluate(`(() => {
    const sheet = document.querySelector(".label-sheet");
    const svgs = [...sheet.querySelectorAll("svg")].map((svg) => svg.querySelectorAll("rect").length);
    return {
      text: sheet.innerText,
      barcodeRects: Math.max(...svgs, 0),
      svgCount: svgs.length,
      width: Math.round(sheet.getBoundingClientRect().width),
    };
  })()`)
  check(
    "Barcode Code128 SVG ter-render",
    labelData.barcodeRects > 20,
    `rect=${labelData.barcodeRects}, svg=${labelData.svgCount}`,
  )
  check("Label memuat nomor resi", labelData.text.includes(awb1))
  check("Label memuat rute dan layanan", labelData.text.includes("Surabaya"))
  check(
    "Label memuat status pembayaran lunas",
    labelData.text.includes("Lunas (simulasi)"),
  )
  console.log("LABEL:", JSON.stringify(labelData).slice(0, 500))
  await shot("15-label", true)

  const cssHasA6 = await evaluate(`(() => {
    const parts = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) parts.push(rule.cssText);
      } catch {}
    }
    return parts.join("\\n");
  })()`)
  check(
    "CSS print mendefinisikan halaman 105mm x 148mm",
    cssHasA6.includes("105mm 148mm"),
  )

  await send("Emulation.setEmulatedMedia", { media: "print" })
  await sleep(400)
  const printState = await evaluate(`(() => {
    const noPrint = document.querySelector(".no-print");
    const sheet = document.querySelector(".label-sheet");
    return {
      noPrint: noPrint ? getComputedStyle(noPrint).display : null,
      maxWidth: getComputedStyle(sheet).maxWidth,
      border: getComputedStyle(sheet).borderTopWidth,
      shadow: getComputedStyle(sheet).boxShadow,
    };
  })()`)
  check("Elemen no-print disembunyikan saat cetak", printState.noPrint === "none")
  check(
    "Label selebar halaman saat cetak",
    printState.maxWidth === "none",
    JSON.stringify(printState),
  )
  await shot("16-label-print")
  const pdf = await send("Page.printToPDF", {
    preferCSSPageSize: true,
    printBackground: true,
  })
  const pdfBuffer = Buffer.from(pdf.data, "base64")
  fs.writeFileSync(path.join(OUT, "label-a6.pdf"), pdfBuffer)
  const pdfRaw = pdfBuffer.toString("latin1")
  const mediaBox = pdfRaw.match(/\/MediaBox\s*\[([^\]]+)\]/)
  const pdfPages = (pdfRaw.match(/\/Type\s*\/Page\b/g) ?? []).length
  const mediaBoxNumbers = (mediaBox?.[1] ?? "")
    .trim()
    .split(/\s+/)
    .map(Number)
  const pdfWidth = mediaBoxNumbers[2]
  const pdfHeight = mediaBoxNumbers[3]
  check("PDF label hanya 1 halaman", pdfPages === 1, `halaman=${pdfPages}`)
  check(
    "Ukuran PDF A6 (297.6 x 419.5 pt)",
    Math.abs(pdfWidth - 297.64) < 2 && Math.abs(pdfHeight - 419.53) < 2,
    `${pdfWidth} x ${pdfHeight}`,
  )
  await send("Emulation.setEmulatedMedia", { media: "screen" })
  await sleep(250)

  // === RIWAYAT: PENCARIAN, FILTER, DETAIL ===
  await goto("/akun/pesanan")
  await waitForText(awb1, 12000)
  await setInput("#cari-pesanan", awb1)
  await waitForText("1 pesanan ditampilkan", 6000)
  check(
    "Pencarian resi menyaring pesanan",
    (await evaluate(`document.querySelectorAll("article").length`)) === 1,
  )
  await setInput("#cari-pesanan", "")
  await pressTab("Diproses")
  await waitForText("1 pesanan ditampilkan", 6000)
  check(
    "Filter status Diproses menampilkan pesanan baru",
    (await evaluate(`document.body.innerText`)).includes(awb1),
  )
  await shot("17-orders-filter")
  await pressTab("Terkirim")
  await waitForText("1 pesanan ditampilkan", 6000)
  check(
    "Filter Terkirim menampilkan pesanan seed",
    (await evaluate(`document.body.innerText`)).includes("LJX0000000001"),
  )
  await pressTab("Semua")
  await waitForText("3 pesanan ditampilkan", 6000)
  await clickInArticle(awb1, "Detail")
  await waitFor(`document.querySelector('[role="dialog"]')`, 5000)
  await sleep(400)
  const detailText = await evaluate(
    `document.querySelector('[role="dialog"]').innerText`,
  )
  check(
    "Dialog detail menampilkan timeline",
    detailText.includes("Riwayat perjalanan") &&
      detailText.includes("Pesanan dibuat"),
  )
  check(
    "Dialog detail memuat data pengirim/penerima",
    detailText.includes("Rizki Maulana Putra") &&
      detailText.includes("Siti Aminah"),
  )
  await shot("18-order-detail")
  await clickText('[role="dialog"] button', "Tutup")
  await waitForNoDialog()

  // === BUKU ALAMAT: DELETE ===
  await goto("/akun/alamat")
  await waitForText("Rizki Maulana Putra", 8000)
  await click('[aria-label="Hapus alamat Rumah"]')
  await waitForText("Hapus alamat?", 5000)
  await clickText('[role="dialog"] button', "Hapus alamat")
  await waitForNoDialog(8000)
  await waitFor(
    `document.querySelectorAll("article").length === 1`,
    8000,
    "alamat berkurang",
  )
  const afterDelete = await evaluate(`document.body.innerText`)
  check(
    "Alamat berhasil dihapus",
    afterDelete.includes("Kantor") && !afterDelete.includes("Rumah"),
  )
  await shot("19-address-after-delete")

  // === PENGIRIMAN 2: SAME DAY + DROP OFF + COD ===
  await evaluate(`localStorage.removeItem("jnt-shipment-draft"); true`)
  await goto("/kirim")
  await waitForText("Data pengirim")
  await waitFor(
    `document.querySelectorAll('button[aria-pressed]').length >= 1`,
    8000,
    "alamat tersimpan",
  )
  await clickText("button", "Alamat baru")
  await fillAddressDialog({
    label: "Gudang",
    name: "Andi Wijaya",
    phone: "0812-9876-5432",
    address: "Jl. Braga No. 5, RT 03/RW 04, Sumur Bandung",
    city: "Bandung",
    postalCode: "40111",
  })
  await clickText("button", "Simpan alamat")
  await waitForNoDialog(8000)
  await sleep(600)
  check(
    "Tambah alamat dari stepper langsung mengisi pengirim",
    (await inputValue("#sender-nama")) === "Andi Wijaya",
    await inputValue("#sender-nama"),
  )
  check(
    "Alamat baru dari stepper langsung terpilih",
    (await evaluate(
      `Boolean([...document.querySelectorAll('button[aria-pressed="true"]')].find((el) => el.textContent.includes("Gudang")))`,
    )) === true,
  )
  await clickText("button", "Lanjut ke penerima")
  await waitForText("Data penerima")
  await setInput("#receiver-nama", "Budi Santoso")
  await setInput("#receiver-telepon", "081377788899")
  await setInput(
    "#receiver-alamat",
    "Jl. Buah Batu No. 88, RT 02/RW 05, Lengkong",
  )
  await pickCity("#receiver-kota", "Bandung")
  await setInput("#receiver-kodepos", "40265")
  await clickText("button", "Lanjut ke paket")
  await waitForText("Detail paket & layanan")

  await setInput("#paket-deskripsi", "Dokumen penting")
  await setInput("#paket-berat", "1")
  await clickText("button", "Hitung Tarif")
  await waitFor(
    `document.querySelector("#paket-layanan-SAME_DAY")`,
    12000,
    "opsi Same Day",
  )
  await sleep(500)
  const count2 = await evaluate(
    `document.querySelectorAll('[id^="paket-layanan-"]').length`,
  )
  const sameCityText = await evaluate(
    `[...document.querySelectorAll('[id^="paket-layanan-"]')].map((el) => el.closest("div.relative")?.innerText ?? "").join("\\n---\\n")`,
  )
  check(
    "Bandung→Bandung memunculkan Same Day",
    count2 === 4 && sameCityText.includes("Same Day"),
    `opsi=${count2}`,
  )
  console.log("TARIF 2:\n" + sameCityText.slice(0, 900))
  await shot("20-same-day-options")
  await click("#paket-layanan-SAME_DAY")
  await sleep(300)
  await clickText("button", "Lanjut ke pembayaran")
  await waitForText("Metode pengantaran", 10000)

  await click("#antar-DROP_OFF")
  await waitFor(`document.querySelector("#cabang-dropoff")`, 5000)
  await click("#cabang-dropoff")
  await waitFor(`document.querySelector('[role="option"]')`, 5000)
  const branch = await evaluate(
    `document.querySelector('[role="option"]').textContent.trim()`,
  )
  await click('[role="option"]')
  await sleep(300)
  check("Cabang drop-off bisa dipilih", Boolean(branch), branch)
  await click("#bayar-COD")
  await sleep(300)
  const codText = await evaluate(`document.body.innerText`)
  check(
    "Simulasi COD tampil",
    codText.toLowerCase().includes("bayar di tempat"),
  )
  check(
    "Ringkasan COD menampilkan total",
    codText.includes("Rp") && codText.includes("Antar ke cabang"),
  )
  await shot("21-payment-cod-dropoff")
  await clickText("button", "Buat Resi (COD)")
  await waitFor(
    `location.pathname.startsWith("/kirim/sukses/")`,
    15000,
    "halaman sukses COD",
  )
  const awb2 = decodeURIComponent(
    await evaluate(`location.pathname.split("/").pop()`),
  )
  await waitForText("Paketmu siap berangkat", 12000)
  await waitForText(awb2, 12000)
  const success2 = await evaluate(`document.body.innerText`)
  check("Resi COD baru terbit", /^LJX\d{10}$/.test(awb2), awb2)
  check(
    "Halaman sukses COD menampilkan instruksi tunai",
    success2.toLowerCase().includes("bayar di tempat") &&
      success2.includes("Siapkan"),
  )
  check(
    "Halaman sukses menampilkan cabang drop-off",
    success2.includes("Antar paket ke") && success2.includes(branch.split(" — ")[0]),
  )
  console.log("AWB-2:", awb2)
  await shot("22-success-cod", true)

  await goto(`/label/${awb2}`)
  await waitFor(`document.querySelector(".label-sheet")`, 10000)
  const label2 = await evaluate(`document.querySelector(".label-sheet").innerText`)
  check(
    "Label COD menampilkan tagihan",
    label2.includes("Tagihan") && label2.includes("COD"),
  )
  check(
    "Label Same Day menampilkan layanan",
    label2.toLowerCase().includes("same day"),
  )

  await goto("/akun/pesanan")
  await waitForText(awb2, 12000)
  await waitForText("4 pesanan ditampilkan", 6000)
  check("Pesanan kedua masuk riwayat", true)
  await setInput("#cari-pesanan", awb2)
  await waitForText("1 pesanan ditampilkan", 6000)
  check(
    "Pencarian resi kedua bekerja",
    (await evaluate(`document.querySelectorAll("article").length`)) === 1,
  )
  await setInput("#cari-pesanan", "")
  await waitForText("4 pesanan ditampilkan", 6000)
  await shot("23-orders-two-new")

  await clickInArticle(awb2, "Detail")
  await waitFor(`document.querySelector('[role="dialog"]')`, 5000)
  await sleep(300)
  const detail2 = await evaluate(
    `document.querySelector('[role="dialog"]').innerText`,
  )
  check(
    "Detail COD memuat status pembayaran saat diterima",
    detail2.includes("COD") && detail2.includes("Bayar di Tempat"),
  )
  check(
    "Detail COD memuat cabang drop-off",
    detail2.includes("Drop-off di") && detail2.includes(branch.split(" — ")[0]),
  )
  await clickText('[role="dialog"] button', "Tutup")
  await waitForNoDialog()

  // === A11Y ===
  await setMobile()
  await goto("/")
  await auditA11y("home-mobile")
  await goto("/tarif")
  await auditA11y("tarif-mobile")
  await goto("/kirim")
  await waitForText("Data pengirim")
  await auditA11y("kirim-mobile")
  await goto("/akun/pesanan")
  await waitForText("LJX1234567890", 12000)
  await auditA11y("pesanan-mobile")

  // === PROTEKSI RUTE ===
  const authRaw = await evaluate(`localStorage.getItem("jnt-auth")`)
  await evaluate(`localStorage.removeItem("jnt-auth"); true`)
  await goto("/akun/pesanan")
  await waitFor(`location.pathname === "/masuk"`, 8000, "redirect protected")
  check("Rute terproteksi redirect ke /masuk", true)
  await evaluate(
    `localStorage.setItem("jnt-auth", ${JSON.stringify(authRaw)}); true`,
  )
  await goto("/akun/pesanan")
  await waitForText("LJX1234567890", 12000)
  check("Sesi login pulih setelah restore storage", true)

  // === 404 ===
  await goto("/halaman-tidak-ada")
  await waitForText("404", 6000)
  check("Halaman 404 tampil", true)

  // === RESPONSIVE ===
  await setTablet()
  await goto("/akun/pesanan")
  await waitForText("LJX1234567890", 12000)
  await shot("24-tablet-orders", true)
  await goto("/kirim")
  await waitForText("Data pengirim")
  await shot("25-tablet-shipment", true)

  await setDesktop()
  await goto("/akun/alamat")
  await waitForText("Buku alamat")
  await sleep(900)
  await shot("26-desktop-address")
  await goto(`/label/${awb1}`)
  await waitFor(`document.querySelector(".label-sheet")`, 10000)
  await shot("27-desktop-label")
  await goto("/")
  await shot("28-desktop-home")

  // Ringkasan
  console.log("\n=== RINGKASAN ===")
  console.log(`Total pemeriksaan: ${results.length}`)
  console.log(`Gagal: ${failures}`)
  console.log("Console errors:", errors.length ? errors : "none")
  fs.writeFileSync(
    path.join(process.cwd(), ".cache", "e2e-results.json"),
    JSON.stringify({ results, errors, awb1, awb2, branch }, null, 2),
  )
  if (errors.length) {
    check("Tidak ada error console/runtime", false, errors.join(" | "))
  } else {
    check("Tidak ada error console/runtime", true)
  }
} catch (error) {
  console.error("\nE2E GAGAL:", error)
  failures += 1
  console.log("Console errors:", errors.length ? errors : "none")
  try {
    const debug = await evaluate(`document.body.innerText.slice(0, 1200)`)
    console.log("BODY SAAT GAGAL:\n", debug)
  } catch {
    // abaikan
  }
  fs.writeFileSync(
    path.join(process.cwd(), ".cache", "e2e-results.json"),
    JSON.stringify({ results, errors, fatal: String(error) }, null, 2),
  )
  process.exitCode = 1
} finally {
  await send("Target.closeTarget", { targetId: target.id }).catch(() => {})
  socket.close()
}
