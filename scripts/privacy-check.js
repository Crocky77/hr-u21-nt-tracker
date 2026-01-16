/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

// stvari koje ne smiju procuriti u repo
const PATTERNS = [
  // emailovi (osnovno)
  {
    name: "email",
    re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  },

  // supabase url / kljucevi (osnovno)
  { name: "supabase anon key", re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9._-]{20,}\.[A-Za-z0-9._-]{10,}\b/ },
  { name: "supabase url", re: /\bhttps:\/\/[a-z0-9-]+\.supabase\.co\b/i },

  // "api_key" / "secret" / "password"
  { name: "secret keyword", re: /\b(api[_-]?key|secret|password|passwd|token)\b/i },
];

const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", ".vercel"]);
const IGNORE_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]);

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);

    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  // skeniramo samo tipične text/JS/TS/MD/JSON/CSS/SQL
  return [
    ".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".txt",
    ".css", ".scss", ".sql", ".env", ".yml", ".yaml",
  ].includes(ext) || path.basename(filePath).startsWith(".env");
}

function main() {
  const files = walk(ROOT).filter((p) => {
    const base = path.basename(p);
    if (IGNORE_FILES.has(base)) return false;
    return isTextFile(p);
  });

  const findings = [];

  for (const f of files) {
    let content;
    try {
      content = fs.readFileSync(f, "utf8");
    } catch {
      continue;
    }

    for (const pat of PATTERNS) {
      const m = content.match(pat.re);
      if (m) {
        findings.push({
          file: path.relative(ROOT, f),
          type: pat.name,
          match: m[0].slice(0, 120),
        });
      }
    }
  }

  if (findings.length) {
    console.log("❌ PRIVACY CHECK FAILED. Found potential leaks:\n");
    for (const x of findings) {
      console.log(`- [${x.type}] ${x.file} -> ${x.match}`);
    }
    console.log("\n➡️  Ukloni/anonimiziraj navedeno pa probaj opet.");
    process.exit(1);
  }

  console.log("✅ PRIVACY CHECK OK (no obvious leaks found).");
  process.exit(0);
}

main();
