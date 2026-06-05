import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const roots = ["src", "netlify", "public", "index.html"];
const ignoredDirs = new Set(["node_modules", "dist", ".git", ".pnpm-store"]);
const textExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".json", ".md"]);

const badPatterns = [
 { pattern: /AĹ˝|Ĺľ|Ĺˇ|ÄŤ|ÄŚ|Ĺ˝|Ă©|WarrĂ©|â‚¬|Â°|Â·/, label: "pokvarjen UTF-8 zapis" },
 { pattern: /\b(osve\?itev|Vpra\?anje|Dana\?nji|prika\?em|s te\?o|te\?a|ro\?no|to\?enje|medi\?\?e)\b/i, label: "vprašaj namesto šumnika" },
 { pattern: /\b(poisci|tocenje|juzni|skladisce|rocni|medisce|cebelar|kolicina)\b/i, label: "manjkajoči šumnik" },
];

function filesIn(path) {
 const stats = statSync(path);
 if (stats.isFile()) return textExtensions.has(extname(path)) ? [path] : [];
 return readdirSync(path).flatMap((name) => {
  if (ignoredDirs.has(name)) return [];
  return filesIn(join(path, name));
 });
}

function isIntentionalParserRule(line) {
 return line.includes("[/")
  || line.includes(".replace(/")
  || line.includes(".replaceAll(")
  || line.includes("normalizeSl")
  || line.includes("keys:")
  || line.includes("pametnipanj-cebelar-data")
  || line.includes("cebelar@example.com");
}

const findings = [];

for (const root of roots) {
 for (const file of filesIn(root)) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
   for (const { pattern, label } of badPatterns) {
    if (pattern.test(line) && !isIntentionalParserRule(line)) {
     findings.push(`${file}:${index + 1}: ${label}: ${line.trim()}`);
    }
   }
  });
 }
}

if (findings.length) {
 console.error("Najdena so besedila, ki jih je treba popraviti:");
 console.error(findings.slice(0, 120).join("\n"));
 if (findings.length > 120) console.error(`... še ${findings.length - 120} zadetkov`);
 process.exit(1);
}

console.log("Slovenska besedila so videti v redu.");
