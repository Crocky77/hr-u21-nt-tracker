/**
 * Privacy / secret leak checker (simple repo scan)
 * - Detects emails, common API key formats, Supabase keys, JWT-like tokens
 * - Exits with code 1 if suspicious strings are found
 *
 * Run: npm run privacy:check
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

// folders/files to skip
const SKIP_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  ".vercel",
  ".turbo",
  "dist",
  "build",
  "out",
  "coverage"
]);

const SKIP_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml"
]);

// file extensions we scan
const ALLOW_EXT = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".txt",
  ".env",
  ".env.local",
  ".env.example",
  ".sql"
]);

// patterns to detect
const PATTERNS = [
  {
    name: "Email address",
    re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
  },
  {
    name: "Supabase anon/service key (jwt-like)",
    re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g
  },
  {
    name: "Supabase URL hardcoded",
    re: /\bhttps?:\/\/[a-z0-9-]+\.supabase\.co\b/gi
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_(URL|ANON_KEY) hardcoded value",
    re: /\bNEXT_PUBLIC_SUPABASE_(URL|ANON_KEY)\s*[:=]\s*["'][^"']+["']/gi
  },
  {
    name: "SUPABASE_(SERVICE_ROLE_KEY|ANON_KEY) hardcoded value",
    re: /\bSUPABASE_(SERVICE_ROLE_KEY|ANON_KEY)\s*[:=]\s*["'][^"']+["']/gi
  },
  {
    name: "Generic API key token (sk- / pk_ / api_key=)",
    re: /\b(sk-[A-Za-z0-9]{10,}|pk_[A-Za-z0-9]{10,}|api[_-]?key\s*[:=]\s*["'][^"']{8,}["'])\b/gi
  }
];

// allowlist – strings that are OK to exist in repo
// (we allow example placeholders + env var usage)
const ALLOWLIST = [
  "example@example.com",
  "you@example.com",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY"
];

// mask found secrets in console output
function mask(s) {
  if (!s) return s;
  if (s.length <= 8) return "***";
  return s.slice(0, 4) + "…" + s.slice(-4);
}

function isAllowedHit(hit) {
  const h = String(hit || "");
  return ALLOWLIST.some((a) => h.includes(a));
}

function shouldScanFile(fp) {
  const base = path.basename(fp);
  if (SKIP_FILES.has(base)) return false;

  const ext = path.extname(fp).toLowerCase();
  // allow .env files without extension handling
  if (base.startsWith(".env")) return true;

  return ALLOW_EXT.has(ext);
}

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full, out);
      continue;
    }

    if (e.isFile()) {
      if (shouldScanFile(full)) out.push(full);
    }
  }
  return out;
}

function readTextSafe(fp) {
  try {
    return fs.readFileSync(fp, "utf8");
  } catch {
    return null;
  }
}

function main() {
  const files = walk(ROOT);

  const findings = [];

  for (const fp of files) {
    const rel = path.relative(ROOT, fp);
    const text = readTextSafe(fp);
    if (!text) continue;

    for (const p of PATTERNS) {
      let m;
      while ((m = p.re.exec(text)) !== null) {
        const hit = m[0];
        if (isAllowedHit(hit)) continue;

        const idx = m.index;
        // capture a small context around match
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + hit.length + 40);
        const context = text.slice(start, end).replace(/\s+/g, " ");

        findings.push({
          file: rel,
          type: p.name,
          hit,
          context
        });

        // prevent runaway on super-large matches
        if (findings.length > 2000) break;
      }
    }
  }

  if (findings.length === 0) {
    console.log("✅ privacy-check: OK (no suspicious strings found)");
    process.exit(0);
  }

  console.log("❌ privacy-check: FOUND possible leaks:\n");

  // show only first 50 to keep logs readable
  const show = findings.slice(0, 50);
  for (const f of show) {
    console.log(`- [${f.type}] ${f.file}`);
    console.log(`  hit: ${mask(f.hit)}`);
    console.log(`  ctx: ${f.context}\n`);
  }

  if (findings.length > 50) {
    console.log(`… and ${findings.length - 50} more findings.`);
  }

  console.log(
    "\n➡️  Fix: remove hardcoded secrets/emails or move them to ENV vars (Vercel env settings)."
  );
  process.exit(1);
}

main();
