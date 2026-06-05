import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src", "public", "index.html"];
const mojibake = /[ÄĹĂÂâ]/;
const visibleAsciiWords = /\b(poisci|tocenje|juzni|skladisce|rocni|vec|pomocnik|cvetlicni|maticniki|medisce)\b/i;
const ignoredDirs = new Set(["node_modules", "dist", ".git", ".pnpm-store"]);
const textExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".json", ".md"]);

function extensionOf(file) {
 const match = file.match(/\.[^.]+$/);
 return match ? match[0] : "";
}

function filesIn(path) {
 const stats = statSync(path);
 if (stats.isFile()) return textExtensions.has(extensionOf(path)) ? [path] : [];
 return readdirSync(path).flatMap((name) => {
  if (ignoredDirs.has(name)) return [];
  return filesIn(join(path, name));
 });
}

const findings = [];

for (const root of roots) {
 for (const file of filesIn(root)) {
  const lines = readFileSync(file, "utf8").split(/\r\n/);
  lines.forEach((line, index) => {
   if (mojibake.test(line)) findings.push(`${file}:${index + 1}: pokvarjen šumnik: ${line.trim()}`);
   const isIntentionalParserRule = line.includes("[/") || line.includes(".replace(/") || line.includes("normalizeSl") || line.includes("keys:");
   if (visibleAsciiWords.test(line) && !isIntentionalParserRule) {
    findings.push(`${file}:${index + 1}: preveri šumnike: ${line.trim()}`);
   }
  });
 }
}

if (findings.length) {
 console.error("Najdena so besedila, ki jih je treba preveriti:");
 console.error(findings.slice(0, 120).join("\n"));
 if (findings.length > 120) console.error(`... še ${findings.length - 120} zadetkov`);
 process.exit(1);
}

console.log("Slovenska besedila so videti v redu.");
