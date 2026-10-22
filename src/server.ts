import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { BrandBrief } from "./schema.js";
import { analyse } from "./strategist.js";
import { toMarkdown } from "./report.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(here, "..", "public")));
// Front-end libraries served from node_modules so the page works without a CDN.
const modules = path.join(here, "..", "node_modules");
app.get("/vendor/marked.umd.js", (_req, res) => res.sendFile(path.join(modules, "marked/lib/marked.umd.js")));
app.get("/vendor/purify.min.js", (_req, res) => res.sendFile(path.join(modules, "dompurify/dist/purify.min.js")));

// Streams newline-delimited JSON: progress events, then a final result or error.
app.post("/api/analyse", async (req, res) => {
  const parsed = BrandBrief.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
    return;
  }
  const brief = parsed.data;

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache");
  const send = (obj: unknown) => res.write(JSON.stringify(obj) + "\n");

  try {
    const { dossier, strategy } = await analyse(brief, send);
    send({ type: "result", strategy, dossier, markdown: toMarkdown(brief, strategy, dossier) });
  } catch (err) {
    console.error(err);
    send({ type: "error", message: err instanceof Error ? err.message : String(err) });
  } finally {
    res.end();
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Brand Strategist running at http://localhost:${port}`));
