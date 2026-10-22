import fs from "fs";
import { BrandBrief } from "./schema.js";
import { analyse } from "./strategist.js";
import { toMarkdown } from "./report.js";

// Usage: npm run cli -- brief.json [output.md]
const [inputPath, outputPath = "brand-strategy.md"] = process.argv.slice(2);
if (!inputPath) {
  console.error("Usage: npm run cli -- <brief.json> [output.md]");
  process.exit(1);
}

const brief = BrandBrief.parse(JSON.parse(fs.readFileSync(inputPath, "utf8")));

const { dossier, strategy } = await analyse(brief, (e) => {
  if (e.type === "status") console.log(e.message);
  else if (e.type === "search") console.log(`  🔎 ${e.query}`);
  else console.log(`  🌐 ${e.url}`);
});

fs.writeFileSync(outputPath, toMarkdown(brief, strategy, dossier));
fs.writeFileSync(outputPath.replace(/\.md$/, "") + ".json", JSON.stringify(strategy, null, 2));
console.log(`\nSaved ${outputPath}`);
