import fs from "node:fs"
import path from "node:path"
import { compile } from "@tailwindcss/node"
import { Scanner } from "@tailwindcss/oxide"

const root = process.cwd()
const css = fs.readFileSync(path.join(root, "src/index.css"), "utf8")
const compiler = await compile(css, {
  base: path.join(root, "src"),
  onDependency: () => {},
})
console.log("root:", JSON.stringify(compiler.root))
console.log("sources:", JSON.stringify(compiler.sources))
const sources =
  compiler.root === "none"
    ? []
    : compiler.root === null
      ? [{ base: root, pattern: "**/*", negated: false }]
      : [{ ...compiler.root, negated: false }]
const scanner = new Scanner({ sources: sources.concat(compiler.sources) })
const candidates = [...scanner.scan()]
console.log("files:", scanner.files.length, scanner.files.slice(0, 8))
console.log("globs:", JSON.stringify(scanner.globs))
console.log("candidates:", candidates.length, candidates.slice(0, 30))
const built = compiler.build(["flex", "bg-primary", "grid"])
console.log("built length:", built.length)
console.log(built.slice(0, 300))
