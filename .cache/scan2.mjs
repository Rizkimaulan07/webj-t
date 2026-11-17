import { Scanner } from "@tailwindcss/oxide"

const root = process.cwd()
for (const source of [
  { base: root, pattern: "src/**/*.tsx", negated: false },
  { base: root, pattern: "**/*.tsx", negated: false },
  { base: root + "/src", pattern: "**/*.tsx", negated: false },
  { base: root, pattern: "**/*", negated: false },
]) {
  try {
    const scanner = new Scanner({ sources: [source] })
    const candidates = [...scanner.scan()]
    console.log(JSON.stringify(source), "files:", scanner.files.length, "candidates:", candidates.length)
    console.log("  sample files:", scanner.files.slice(0, 3))
  } catch (error) {
    console.log(JSON.stringify(source), "ERROR", error.message)
  }
}
