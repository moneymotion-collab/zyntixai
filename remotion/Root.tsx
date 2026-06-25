import { Composition, type CalculateMetadataFunction } from "remotion";
import FitCoreVideoTemplate, {
  calcFitCoreVideoTemplateDuration,
} from "../components/video/FitCoreVideoTemplate";
import MemeVideoComposition from "../components/video/MemeVideoComposition";
import WorkflowDemoComposition from "../components/video/WorkflowDemoComposition";
import { buildPlatformShowcaseScenes } from "../lib/video/platform-showcase";
import { REELS_FPS, REELS_HEIGHT, REELS_WIDTH } from "../lib/video/reels-safe-layout";

type MemeScene = { duration?: number };

const FPS = REELS_FPS;

const calcMemeMetadata: CalculateMetadataFunction<{
  hook: string;
  scenes: MemeScene[];
  cta: string;
}> = ({ props }) => {
  const hookSeconds = 2;
  const ctaSeconds = 2;
  const scenesSeconds = (props.scenes ?? []).reduce(
    (sum, scene) => sum + (typeof scene.duration === "number" ? scene.duration : 2),
    0,
  );

  return {
    fps: FPS,
    durationInFrames: Math.max(1, Math.round((hookSeconds + scenesSeconds + ctaSeconds) * FPS)),
  };
};

type FitCoreScene = {
  text?: string;
  duration?: number;
  module?: string;
  visual_description?: string;
  image_url?: string;
  screenshot_url?: string;
  asset_url?: string;
};

const calcFitCoreTemplateMetadata: CalculateMetadataFunction<{
  title?: string;
  brandName?: string;
  hook?: string;
  scenes?: FitCoreScene[];
  cta?: string;
}> = ({ props }) => ({
  fps: FPS,
  durationInFrames: calcFitCoreVideoTemplateDuration(
    props.scenes as { text: string; duration: number }[] | undefined,
    props.title,
    props.cta,
  ),
});

type WorkflowScene = { duration?: number; animation_duration?: number };

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

const calcWorkflowMetadata: CalculateMetadataFunction<{
  scenes: WorkflowScene[];
  hook: string;
  cta: string;
}> = ({ props }) => {
  const introFrames = Math.round(FPS * 1.2);
  const outroFrames = Math.round(FPS * 1.3);
  const overlapFrames = Math.round(FPS * 0.35);
  const sceneDurationsFrames = (props.scenes ?? []).map((scene) => {
    const seconds = clampNumber(
      scene.animation_duration ?? scene.duration,
      3,
      1,
      30,
    );
    return Math.max(1, Math.round(seconds * FPS));
  });

  const totalScenesFrames =
    sceneDurationsFrames.length === 0
      ? 0
      : sceneDurationsFrames.reduce((sum, frames) => sum + frames, 0) -
        overlapFrames * Math.max(0, sceneDurationsFrames.length - 1);

  return {
    fps: FPS,
    durationInFrames: Math.max(1, introFrames + totalScenesFrames + outroFrames),
  };
};

const DEFAULT_SHOWCASE_SCENES = buildPlatformShowcaseScenes();

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MemeVideo"
        component={MemeVideoComposition}
        durationInFrames={360}
        fps={FPS}
        width={REELS_WIDTH}
        height={REELS_HEIGHT}
        calculateMetadata={calcMemeMetadata}
        defaultProps={{
          title: "Preview",
          hook: "Your hook",
          scenes: [
            { text: "Scene one", duration: 2 },
            { text: "Scene two", duration: 2 },
          ],
          cta: "Your call to action",
          style: "viral_caption",
          voiceoverUrl: undefined,
          usedFallback: false,
        }}
      />
      <Composition
        id="FitCoreVideoTemplate"
        component={FitCoreVideoTemplate}
        durationInFrames={900}
        fps={FPS}
        width={REELS_WIDTH}
        height={REELS_HEIGHT}
        calculateMetadata={calcFitCoreTemplateMetadata}
        defaultProps={{
          title: "FitCore AI",
          brandName: "FitCore AI",
          hook: DEFAULT_SHOWCASE_SCENES[0].text,
          scenes: DEFAULT_SHOWCASE_SCENES,
          cta: "Replace every tool. Run FitCore AI →",
        }}
      />
      <Composition
        id="WorkflowDemo"
        component={WorkflowDemoComposition}
        durationInFrames={900}
        fps={FPS}
        width={REELS_WIDTH}
        height={REELS_HEIGHT}
        calculateMetadata={calcWorkflowMetadata}
        defaultProps={{
          hook: "See it in action",
          cta: "Start your free trial",
          voiceoverUrl: undefined,
          scenes: [
            {
              duration: 3,
              overlay_text: "Scene one",
              narration: "Your narration here.",
              asset_url: "/placeholder.png",
              workflow_step: "Step 1",
            },
          ],
        }}
      />
    </>
  );
};
