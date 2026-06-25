export type MarketingGenerationStage = {
  id: string
  label: string
}

export const CAMPAIGN_GENERATION_STAGES: MarketingGenerationStage[] = [
  { id: "audience", label: "Analyzing audience..." },
  { id: "strategy", label: "Building campaign strategy..." },
  { id: "content", label: "Creating content plan..." },
  { id: "hooks", label: "Optimizing hooks..." },
  { id: "finalize", label: "Finalizing campaign..." },
]

export const HOOK_LIBRARY_GENERATION_STAGES: MarketingGenerationStage[] = [
  { id: "audience", label: "Analyzing audience..." },
  { id: "patterns", label: "Mapping hook patterns..." },
  { id: "hooks", label: "Writing scroll-stoppers..." },
  { id: "categories", label: "Balancing categories..." },
  { id: "finalize", label: "Finalizing hook library..." },
]

export const CTA_GENERATOR_STAGES: MarketingGenerationStage[] = [
  { id: "audience", label: "Analyzing audience..." },
  { id: "goal", label: "Mapping campaign goal..." },
  { id: "ctas", label: "Writing CTAs..." },
  { id: "variations", label: "Balancing variations..." },
  { id: "finalize", label: "Finalizing CTA set..." },
]

export const STORY_STRUCTURE_GENERATION_STAGES: MarketingGenerationStage[] = [
  { id: "hook", label: "Crafting the hook..." },
  { id: "problem", label: "Defining the problem..." },
  { id: "cause", label: "Explaining why it happens..." },
  { id: "solution", label: "Building the solution arc..." },
  { id: "finalize", label: "Finalizing story structure..." },
]

export const CONTENT_IDEAS_GENERATION_STAGES: MarketingGenerationStage[] = [
  { id: "audience", label: "Analyzing audience..." },
  { id: "ideas", label: "Creating content ideas..." },
  { id: "hooks", label: "Optimizing hooks..." },
  { id: "scores", label: "Scoring viral potential..." },
  { id: "finalize", label: "Finalizing posts..." },
]

export const STRATEGY_GENERATION_STAGES: MarketingGenerationStage[] = [
  { id: "brand", label: "Reading brand profile..." },
  { id: "audience", label: "Analyzing audience..." },
  { id: "pillars", label: "Mapping content pillars..." },
  { id: "calendar", label: "Building content calendar..." },
  { id: "finalize", label: "Finalizing strategy..." },
]

export const VIDEO_SCRIPT_GENERATION_STAGES: MarketingGenerationStage[] = [
  { id: "hook", label: "Generating hook..." },
  { id: "scenes", label: "Creating scenes..." },
  { id: "prompts", label: "Writing visual prompts..." },
  { id: "finalize", label: "Finalizing storyboard..." },
]

/** Full pipeline stages shown during visuals + render */
export const VIDEO_PIPELINE_STAGES: MarketingGenerationStage[] = [
  { id: "hook", label: "Generating hook..." },
  { id: "scenes", label: "Creating scenes..." },
  { id: "visuals", label: "Generating visuals..." },
  { id: "render", label: "Rendering final video..." },
]

export const VIDEO_RENDER_SUB_STAGES: MarketingGenerationStage[] = [
  { id: "timeline", label: "Composing timeline..." },
  { id: "animate", label: "Animating scenes..." },
  { id: "encode", label: "Encoding video..." },
  { id: "finalize", label: "Rendering final video..." },
]

export const VIDEO_VISUALS_STAGES: MarketingGenerationStage[] = [
  { id: "queue", label: "Queueing scene assets..." },
  { id: "visuals", label: "Generating visuals..." },
  { id: "enhance", label: "Enhancing frames..." },
  { id: "finalize", label: "Finalizing storyboard..." },
]

export type VideoGenerationPhase = "script" | "visuals" | "render"
