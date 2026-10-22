import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { BrandStrategy, type BrandBrief } from "./schema.js";
import { RESEARCH_SYSTEM, STRATEGY_SYSTEM, researchPrompt, strategyPrompt } from "./prompts.js";

const MODEL = process.env.BRAND_MODEL ?? "claude-opus-5-5";
// Server-side fallback: if the model declines for policy reasons, the API
// re-runs the request on Anthropic's recommended substitute model.
const BETAS = ["server-side-fallback-2026-07-01"];
const MAX_RESEARCH_TURNS = 6;

export type ProgressEvent =
  | { type: "status"; message: string }
  | { type: "search"; query: string }
  | { type: "fetch"; url: string };

export interface AnalysisResult {
  dossier: string;
  strategy: BrandStrategy;
}

const client = new Anthropic();

function checkRefusal(message: Anthropic.Beta.BetaMessage): void {
  if (message.stop_reason === "refusal") {
    const why = message.stop_details?.explanation ?? "no explanation given";
    throw new Error(`The model declined this request: ${why}`);
  }
}

/** Phase 1: Claude browses the public footprint and writes a research dossier. */
export async function research(
  brief: BrandBrief,
  onProgress: (e: ProgressEvent) => void = () => {},
): Promise<string> {
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: researchPrompt(brief) },
  ];

  for (let turn = 0; turn < MAX_RESEARCH_TURNS; turn++) {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      betas: BETAS,
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: RESEARCH_SYSTEM,
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 10 },
        { type: "web_fetch_20260209", name: "web_fetch", max_uses: 12 },
      ],
      messages,
    });

    stream.on("contentBlock", (block) => {
      if (block.type !== "server_tool_use") return;
      const input = block.input as { query?: string; url?: string };
      if (block.name === "web_search" && input.query) onProgress({ type: "search", query: input.query });
      if (block.name === "web_fetch" && input.url) onProgress({ type: "fetch", url: input.url });
    });

    const message = await stream.finalMessage();
    checkRefusal(message);

    if (message.stop_reason === "pause_turn") {
      // Long server-tool turn: hand the partial turn back so Claude continues.
      messages.push({ role: "assistant", content: message.content });
      continue;
    }

    const dossier = message.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (!dossier) throw new Error("Research finished without producing a dossier.");
    return dossier;
  }
  throw new Error("Research did not finish within the turn limit.");
}

/** Phase 2: turn the dossier into a structured brand strategy. */
export async function buildStrategy(brief: BrandBrief, dossier: string): Promise<BrandStrategy> {
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    betas: BETAS,
    fallbacks: "default",
    output_config: { effort: "high", format: betaZodOutputFormat(BrandStrategy) },
    system: STRATEGY_SYSTEM,
    messages: [{ role: "user", content: strategyPrompt(brief, dossier) }],
  });

  const message = await stream.finalMessage();
  checkRefusal(message);
  if (message.stop_reason === "max_tokens") {
    throw new Error("The strategy was cut off before it finished. Try again with less pasted content.");
  }
  if (!message.parsed_output) throw new Error("The strategy could not be parsed.");
  return message.parsed_output;
}

export async function analyse(
  brief: BrandBrief,
  onProgress: (e: ProgressEvent) => void = () => {},
): Promise<AnalysisResult> {
  onProgress({ type: "status", message: "Researching digital presence…" });
  const dossier = await research(brief, onProgress);
  onProgress({ type: "status", message: "Research complete. Building brand strategy…" });
  const strategy = await buildStrategy(brief, dossier);
  onProgress({ type: "status", message: "Strategy ready." });
  return { dossier, strategy };
}
