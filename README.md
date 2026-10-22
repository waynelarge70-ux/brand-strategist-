# Brand Strategist

An AI brand strategist that analyses a person's social profiles and wider digital presence, then builds a brand people want to be part of and buy from.

You give it a name, a few links and (ideally) some pasted posts. It returns a full strategy:

1. **Digital presence audit**: a score for each channel, what works, gaps, consistency, untapped assets
2. **Brand core**: purpose, mission, vision, values, archetype
3. **Positioning**: positioning statement, differentiators, alternatives, unfair advantage
4. **Audience personas**: desires, pains, buying triggers, objections
5. **Belonging system**: community name, shared identity, common enemy, manifesto, rituals, insider language, ways to participate
6. **Brand story**: origin story, transformation promise, story hooks
7. **Voice and messaging**: ready-to-use bio, tagline, elevator pitch, sample post
8. **Visual identity**: palette with hex codes, typography, imagery
9. **Content strategy**: pillars with post ideas, a per-platform plan, hooks
10. **Offer ecosystem**: value ladder from free to premium, conversion path, trust builders
11. **90-day roadmap**: quick wins plus three phases with KPIs
12. **KPIs**, and the assumptions and gaps behind the strategy

## How it works

Two calls to Claude (`claude-opus-5-5`):

1. **Research**: Claude uses the server-side `web_search` and `web_fetch` tools to look at the profiles, website, press and competitors. It writes a research dossier that keeps verified facts (with sources) apart from its own inferences.
2. **Strategy**: Claude turns the dossier into the strategy, returned as **structured output** that is checked against a Zod schema (`src/schema.ts`). The result is shown in the browser and can be exported as Markdown or JSON.

Instagram, TikTok and LinkedIn often block automated reading. For the best results, paste bios, recent captions and engagement numbers into the "Paste content" box.

## Setup

Requires Node 20 or later and an [Anthropic API key](https://console.anthropic.com/).

1. Get an API key: sign in at [console.anthropic.com](https://console.anthropic.com), add billing under **Settings → Billing**, then go to **Settings → API Keys → Create Key**.
2. Copy `.env.example` to a new file called `.env` in the project folder, and paste your key after the `=`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   `.env` is git-ignored, so the key never gets committed. Setting `ANTHROPIC_API_KEY` in your shell also works.
3. Install and run:
   ```bash
   npm install
   npm start            # http://localhost:3000
   ```

### Command line

```bash
npm run cli -- examples/brief.json my-strategy.md
```

This writes `my-strategy.md` and `my-strategy.json`.

### Configuration

| Env var | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | (none) | API key |
| `BRAND_MODEL` | `claude-opus-5-5` | Model used for both phases |
| `PORT` | `3000` | Web server port |

Requests opt into the API's server-side refusal fallback (`fallbacks: "default"`). If the model declines a request, the API retries it on a substitute model.

## Project layout

```
src/schema.ts      input brief + strategy schemas (Zod)
src/prompts.ts     research and strategist prompts
src/strategist.ts  research (web tools) → strategy (structured output)
src/report.ts      strategy → Markdown report
src/server.ts      Express server, streams progress as NDJSON
src/cli.ts         command-line runner
public/index.html  web UI
```

## Responsible use

Analyse your own brand, or a client's brand with their permission. The research prompt limits Claude to public, professional information and tells it not to speculate about sensitive personal traits.
