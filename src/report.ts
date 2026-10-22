import type { BrandBrief, BrandStrategy } from "./schema.js";

const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

/** Render a strategy as a shareable Markdown document. */
export function toMarkdown(brief: BrandBrief, s: BrandStrategy, dossier?: string): string {
  const title = brief.businessName ? `${brief.name} — ${brief.businessName}` : brief.name;
  const out: string[] = [];

  out.push(`# Brand Strategy: ${title}`, "", s.executiveSummary, "");

  const a = s.presenceAudit;
  out.push(`## 1. Digital Presence Audit — ${a.overallScore}/100`, "", a.verdict, "");
  for (const p of a.platforms) {
    out.push(`### ${p.platform} — ${p.score}/100`, p.url ? `<${p.url}>` : "", "");
    out.push("**What works**", list(p.whatWorks), "", "**Gaps**", list(p.gaps), "", `**Do next:** ${p.recommendation}`, "");
  }
  out.push(`**Consistency:** ${a.consistency}`, "");
  out.push("**Strengths**", list(a.strengths), "", "**Weaknesses**", list(a.weaknesses), "");
  out.push("**Untapped assets**", list(a.untappedAssets), "");

  const c = s.brandCore;
  out.push("## 2. Brand Core", "", `**Purpose:** ${c.purpose}`, "", `**Mission:** ${c.mission}`, "", `**Vision:** ${c.vision}`, "");
  out.push("**Values**", ...c.values.map((v) => `- **${v.value}** — ${v.inPractice}`), "");
  out.push(`**Archetype:** ${c.archetype.primary} (with ${c.archetype.secondary}) — ${c.archetype.rationale}`, "");

  const p = s.positioning;
  out.push("## 3. Positioning", "", `> ${p.statement}`, "", `**Category:** ${p.category}`, "");
  out.push("**Differentiators**", list(p.differentiators), "", "**Alternatives they're up against**", list(p.alternatives), "");
  out.push(`**Unfair advantage:** ${p.unfairAdvantage}`, "");

  out.push("## 4. Audience Personas", "");
  for (const per of s.audience.personas) {
    out.push(`### ${per.name}`, per.snapshot, "");
    out.push("**Desires**", list(per.desires), "", "**Pains**", list(per.pains), "");
    out.push("**Where they hang out**", list(per.whereTheyHangOut), "", "**Buying triggers**", list(per.buyingTriggers), "");
    out.push("**Objections**", list(per.objections), "");
  }

  const b = s.belonging;
  out.push("## 5. Belonging — the Community People Want to Join", "");
  out.push(`**Community name:** ${b.communityName}`, "", `**Shared identity:** ${b.sharedIdentity}`, "", `**What we stand against:** ${b.commonEnemy}`, "");
  out.push("**Manifesto**", list(b.beliefs), "", "**Rituals**", list(b.rituals), "", "**Insider lexicon**", list(b.lexicon), "");
  out.push("**Ways to participate**", list(b.participationIdeas), "");

  const st = s.brandStory;
  out.push("## 6. Brand Story", "", st.originStory, "", `**Transformation:** ${st.transformationPromise}`, "", "**Story hooks**", list(st.storyHooks), "");

  const v = s.voice;
  out.push("## 7. Voice & Messaging", "", `**Personality:** ${v.personality.join(", ")}`, "");
  out.push("**Do**", list(v.do), "", "**Don't**", list(v.dont), "");
  out.push(`**Tagline:** ${v.tagline}`, "", `**Bio:** ${v.bio}`, "", `**Elevator pitch:** ${v.elevatorPitch}`, "");
  out.push("**Sample post**", "", ...v.samplePost.split("\n").map((l) => `> ${l}  `), "");

  const vi = s.visualIdentity;
  out.push("## 8. Visual Identity", "", vi.direction, "");
  out.push("| Colour | Hex | Use |", "|---|---|---|", ...vi.palette.map((c) => `| ${c.name} | \`${c.hex}\` | ${c.usage} |`), "");
  out.push(`**Typography:** ${vi.typography}`, "", `**Imagery:** ${vi.imagery}`, "");

  const cs = s.contentStrategy;
  out.push("## 9. Content Strategy", "");
  for (const pil of cs.pillars) {
    out.push(`### ${pil.name}`, pil.purpose, "", `**Formats:** ${pil.formats.join(", ")}`, "", "**Post ideas**", list(pil.examplePosts), "");
  }
  out.push("| Platform | Role | Cadence |", "|---|---|---|", ...cs.platformPlan.map((x) => `| ${x.platform} | ${x.role} | ${x.cadence} |`), "");
  out.push("**Scroll-stopping hooks**", list(cs.hooks), "");

  const o = s.offerEcosystem;
  out.push("## 10. Offer Ecosystem", "");
  out.push("| Tier | Offer | Price | Role |", "|---|---|---|---|", ...o.ladder.map((x) => `| ${x.tier} | **${x.name}** — ${x.description} | ${x.pricePoint} | ${x.role} |`), "");
  out.push(`**Conversion path:** ${o.conversionPath}`, "", "**Trust builders**", list(o.trustBuilders), "");

  out.push("## 11. 90-Day Roadmap", "", "**Quick wins (this week)**", list(s.roadmap.quickWins), "");
  for (const ph of s.roadmap.phases) {
    out.push(`### ${ph.name}`, ph.focus, "", list(ph.actions), "", `*KPIs:* ${ph.kpis.join("; ")}`, "");
  }

  out.push("## 12. KPIs", "", "| Metric | Target | Why |", "|---|---|---|", ...s.kpis.map((k) => `| ${k.metric} | ${k.target} | ${k.why} |`), "");
  out.push("## Assumptions & Gaps", "", list(s.assumptionsAndGaps), "");

  if (dossier) out.push("---", "", "## Appendix: Research Dossier", "", dossier, "");
  return out.join("\n");
}
