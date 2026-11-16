// Build guard: stops the build if hidden / obfuscated code appears in project config files.
// Background: in Oct and Nov 2026 suspicious scrambled code was found in postcss.config.mjs.
// This check makes Vercel refuse to publish a build if known obfuscation indicators recur.
import { readFileSync, existsSync } from "node:fs";

const files = [
  "postcss.config.mjs",
  "next.config.ts",
  "eslint.config.mjs",
  "proxy.ts",
  "playwright.config.ts",
];
const suspicious = [
  /fromCharCode/,
  /createRequire/,
  /global\s*\[/,
  /_\$_[0-9a-f]{4}/i,
  /\beval\s*\(/,
  /new\s+Function\s*\(/,
];

const problems = [];
for (const file of files) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, "utf8");
  text.split(/\r?\n/).forEach((line, i) => {
    if (line.length > 400) problems.push(`${file}:${i + 1} is ${line.length} characters long (hidden code?)`);
    if (/\S\s{60,}\S/.test(line)) problems.push(`${file}:${i + 1} hides content after a long run of spaces`);
    for (const pattern of suspicious) {
      if (pattern.test(line)) problems.push(`${file}:${i + 1} contains suspicious code (${pattern})`);
    }
  });
}

if (problems.length) {
  console.error("\n[SECURITY] Build stopped: suspicious code found in config files:\n  - " + problems.join("\n  - "));
  console.error("Restore the clean file and check the computer that made the change for malware.\n");
  process.exit(1);
}
console.log("[security] Config integrity check passed.");
