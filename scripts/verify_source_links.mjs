#!/usr/bin/env node
/**
 * Verify Reddit source links in showcase-data.js and app.js hydration logic.
 * Run: node scripts/verify_source_links.mjs
 */
import vm from "vm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadShowcaseData() {
  const code = fs.readFileSync(path.join(root, "showcase-data.js"), "utf8");
  const match = code.match(/window\.showcaseData\s*=\s*(\{[\s\S]*\});/);
  if (!match) throw new Error("Could not parse showcase-data.js");
  return JSON.parse(match[1]);
}

function isPlaceholder(url) {
  return !url || /\/sample_|\/comments\/sample/i.test(url);
}

const data = loadShowcaseData();
const excerpts = data.excerpts || [];
const items = data.allItems || [];
let failed = 0;

for (const row of [...excerpts, ...items]) {
  const url = row.source_url;
  const label = row.source_link_label;
  if (isPlaceholder(url)) {
    console.error(`FAIL placeholder URL: ${row.id || row.theme} ${url}`);
    failed += 1;
    continue;
  }
  if (!label || !label.startsWith("Search r/")) {
    console.error(`FAIL bad label: ${row.id || row.theme} label=${label}`);
    failed += 1;
    continue;
  }
  if (!url.includes("/search/?q=")) {
    console.error(`FAIL not a search URL: ${url}`);
    failed += 1;
  }
}

// Simulate app.js merge for first theme
const themesFirst = excerpts.filter((r) => r.theme === "accuracy_trust").sort((a, b) => a.rank - b.rank);
const samplePlaceholder =
  "https://www.reddit.com/r/ChatGPT/comments/sample_lawyer_warning/";
const merged = {
  source_url: themesFirst[0]?.source_url,
  source_link_label: themesFirst[0]?.source_link_label,
  source_link_type: themesFirst[0]?.source_link_type,
  url: samplePlaceholder,
  subreddit: "ChatGPT",
  text: "Lawyer here — stop using ChatGPT",
};

const linksJs = fs.readFileSync(path.join(root, "links.js"), "utf8");
const sandbox = { window: { corpusProvenance: { mode: "sample_corpus" } }, console };
vm.runInNewContext(linksJs, sandbox);
const link = sandbox.window.redditLinkFromRow(merged);
if (link.label !== "Search r/ChatGPT" || isPlaceholder(link.href)) {
  console.error("FAIL dashboard link resolver:", link);
  failed += 1;
} else {
  console.log("OK dashboard resolver:", link.label, link.href.slice(0, 72) + "…");
}

if (failed) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}

console.log(`\nOK ${excerpts.length} excerpts + ${items.length} items — all use subreddit search links.`);
console.log("Sample:", themesFirst[0]?.source_url);
