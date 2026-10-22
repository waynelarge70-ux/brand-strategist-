import { z } from "zod";

// What the user tells us about the person / business being analysed.
export const ProfileLink = z.object({
  platform: z.string(),
  url: z.string(),
});

export const BrandBrief = z.object({
  name: z.string({ error: "Name is required" }).trim().min(1, "Name is required"),
  businessName: z.string().optional().default(""),
  whatTheyDo: z.string().optional().default(""),
  goals: z.string().optional().default(""),
  targetAudience: z.string().optional().default(""),
  profiles: z.array(ProfileLink).optional().default([]),
  pastedContent: z.string().optional().default(""),
});
export type BrandBrief = z.infer<typeof BrandBrief>;

// The structured strategy Claude returns. Kept to plain strings/arrays/objects
// so it is compatible with structured outputs.
const PlatformAudit = z.object({
  platform: z.string(),
  url: z.string().describe("Profile URL or handle, or empty if unknown"),
  score: z.number().describe("0-100 rating of how well this channel builds the brand"),
  whatWorks: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendation: z.string(),
});

const Persona = z.object({
  name: z.string().describe("Memorable persona nickname"),
  snapshot: z.string(),
  desires: z.array(z.string()),
  pains: z.array(z.string()),
  whereTheyHangOut: z.array(z.string()),
  buyingTriggers: z.array(z.string()),
  objections: z.array(z.string()),
});

const ContentPillar = z.object({
  name: z.string(),
  purpose: z.string(),
  formats: z.array(z.string()),
  examplePosts: z.array(z.string()).describe("Concrete post ideas with a hook"),
});

const Offer = z.object({
  tier: z.string().describe("e.g. Free / Entry / Core / Premium"),
  name: z.string(),
  description: z.string(),
  pricePoint: z.string(),
  role: z.string().describe("Its job in moving people up the ladder"),
});

const Phase = z.object({
  name: z.string().describe("e.g. Days 1-30: Foundation"),
  focus: z.string(),
  actions: z.array(z.string()),
  kpis: z.array(z.string()),
});

export const BrandStrategy = z.object({
  executiveSummary: z.string(),
  presenceAudit: z.object({
    overallScore: z.number().describe("0-100 rating of the current digital brand"),
    verdict: z.string(),
    platforms: z.array(PlatformAudit),
    consistency: z.string().describe("How consistent name, visuals, voice and message are across channels"),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    untappedAssets: z.array(z.string()).describe("Things they already have that the brand is not using"),
  }),
  brandCore: z.object({
    purpose: z.string().describe("Why the brand exists beyond money"),
    mission: z.string(),
    vision: z.string(),
    values: z.array(z.object({ value: z.string(), inPractice: z.string() })),
    archetype: z.object({ primary: z.string(), secondary: z.string(), rationale: z.string() }),
  }),
  positioning: z.object({
    statement: z.string().describe("For [audience] who [need], [brand] is the [category] that [benefit] because [reason to believe]"),
    category: z.string(),
    differentiators: z.array(z.string()),
    alternatives: z.array(z.string()).describe("Competitors or status-quo options the audience currently chooses"),
    unfairAdvantage: z.string(),
  }),
  audience: z.object({ personas: z.array(Persona) }),
  belonging: z.object({
    communityName: z.string().describe("What members of the tribe call themselves"),
    sharedIdentity: z.string().describe("'People like us do things like this'"),
    commonEnemy: z.string().describe("The status quo, belief or problem the community stands against"),
    beliefs: z.array(z.string()).describe("A short manifesto of shared beliefs"),
    rituals: z.array(z.string()).describe("Recurring touchpoints that make people feel part of it"),
    lexicon: z.array(z.string()).describe("Insider words and phrases"),
    participationIdeas: z.array(z.string()).describe("Ways followers can contribute, be featured, or co-create"),
  }),
  brandStory: z.object({
    originStory: z.string(),
    transformationPromise: z.string().describe("Before -> after the audience experiences"),
    storyHooks: z.array(z.string()),
  }),
  voice: z.object({
    personality: z.array(z.string()),
    do: z.array(z.string()),
    dont: z.array(z.string()),
    tagline: z.string(),
    bio: z.string().describe("Ready-to-use social bio"),
    elevatorPitch: z.string(),
    samplePost: z.string(),
  }),
  visualIdentity: z.object({
    direction: z.string(),
    palette: z.array(z.object({ name: z.string(), hex: z.string(), usage: z.string() })),
    typography: z.string(),
    imagery: z.string(),
  }),
  contentStrategy: z.object({
    pillars: z.array(ContentPillar),
    platformPlan: z.array(z.object({ platform: z.string(), role: z.string(), cadence: z.string() })),
    hooks: z.array(z.string()),
  }),
  offerEcosystem: z.object({
    ladder: z.array(Offer),
    conversionPath: z.string().describe("How a stranger becomes a follower, then a buyer, then a fan"),
    trustBuilders: z.array(z.string()),
  }),
  roadmap: z.object({
    quickWins: z.array(z.string()).describe("Changes they can make this week"),
    phases: z.array(Phase),
  }),
  kpis: z.array(z.object({ metric: z.string(), target: z.string(), why: z.string() })),
  assumptionsAndGaps: z.array(z.string()).describe("What could not be verified and what extra info would sharpen the strategy"),
});
export type BrandStrategy = z.infer<typeof BrandStrategy>;
