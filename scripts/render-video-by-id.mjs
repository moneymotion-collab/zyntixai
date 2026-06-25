import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { createClient } from "@supabase/supabase-js";
import {
  getInstagramRenderMediaOptions,
  transcodeVideoForInstagram,
} from "./video-render-utils.mjs";
import {
  buildFitCoreTemplateInputProps,
  FITCORE_VIDEO_TEMPLATE_ID,
  isValidVideoUrl,
  loadProjectScenesOnly,
  logRenderProjectDebug,
  logStep,
  markProjectProcessing,
  markRenderCompleted,
  markRenderFailed,
  parseRenderInputPropsFromEnv,
  upsertGeneratedVideoProcessing,
  uploadVideoToStorage,
  validateVideoProject,
  verifyOutputFile,
} from "./render-pipeline-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const VIDEO_BUCKET = process.env.VIDEO_RENDER_BUCKET || "videos";
const RENDER_TYPE = "preview";

function loadEnvLocal() {
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const videoProjectId = process.argv[2] ?? process.env.VIDEO_PROJECT_ID;
const generatedVideoId = process.argv[3] ?? process.env.GENERATED_VIDEO_ID;

if (!videoProjectId) {
  console.error(
    "Missing video_project_id. Usage: node scripts/render-video-by-id.mjs <videoProjectId> <generatedVideoId>",
  );
  process.exit(1);
}

if (!generatedVideoId) {
  console.error("Missing generatedVideoId. Set GENERATED_VIDEO_ID or pass as second argument.");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

function getPublicStorageUrl(bucketName, storagePath) {
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${storagePath}`;
}

async function ensureBucket(bucketName) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`Could not list storage buckets: ${error.message}`);
  }

  const existing = buckets?.find((bucket) => bucket.name === bucketName);
  if (existing) {
    if (!existing.public) {
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
      });
      if (updateError) {
        throw new Error(`Could not make bucket "${bucketName}" public: ${updateError.message}`);
      }
    }
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
  });

  if (createError) {
    throw new Error(`Could not create bucket "${bucketName}": ${createError.message}`);
  }
}

let activeGeneratedVideoId = generatedVideoId;

try {
  logStep(videoProjectId, "PIPELINE_START", RENDER_TYPE);
  logStep(videoProjectId, "SELECTED_VIDEO_PROJECT_ID", videoProjectId);

  await ensureBucket(VIDEO_BUCKET);

  const project = await validateVideoProject(supabase, videoProjectId);
  if (project.id !== videoProjectId) {
    throw new Error(
      `Loaded project id mismatch: expected ${videoProjectId}, got ${project.id}`,
    );
  }

  await markProjectProcessing(supabase, videoProjectId, RENDER_TYPE);
  const generated = await upsertGeneratedVideoProcessing(supabase, {
    videoProjectId,
    userId: project.user_id,
    renderType: RENDER_TYPE,
    generatedVideoId: activeGeneratedVideoId,
  });
  activeGeneratedVideoId = generated.generatedVideoId;

  logStep(videoProjectId, "BUILD_INPUT_PROPS");

  let inputProps = parseRenderInputPropsFromEnv();

  if (inputProps) {
    logStep(videoProjectId, "INPUT_PROPS_SOURCE", "RENDER_INPUT_PROPS env");
  } else {
    logStep(videoProjectId, "INPUT_PROPS_SOURCE", "video_projects + video_scenes");
    const projectScenes = await loadProjectScenesOnly(
      supabase,
      videoProjectId,
      project,
    );
    inputProps = buildFitCoreTemplateInputProps({
      project,
      scenes: projectScenes.scenes,
      title: project.brand_name,
      cta: project.cta,
      script: {
        hook: project.hook,
        cta: project.cta,
        scenes: projectScenes.scenes,
      },
    });
  }

  logRenderProjectDebug(videoProjectId, {
    selected_video_project_id: videoProjectId,
    loaded_project_id: project.id,
    loaded_project_title: project.brand_name,
    loaded_project_prompt: project.prompt,
    render_composition_id: FITCORE_VIDEO_TEMPLATE_ID,
    render_props: inputProps,
  });
  logStep(videoProjectId, "INPUT_PROPS", JSON.stringify(inputProps));

  const rendersDir = path.resolve(rootDir, "public/renders");
  fs.mkdirSync(rendersDir, { recursive: true });

  const rawOutputLocation = path.resolve(
    rendersDir,
    `video-${videoProjectId}-raw.mp4`,
  );
  const outputLocation = path.resolve(rendersDir, `video-${videoProjectId}.mp4`);

  logStep(videoProjectId, "BUNDLE_REMOTION");
  const serveUrl = await bundle({
    entryPoint: path.resolve(rootDir, "remotion/index.ts"),
    webpackOverride: (config) => {
      config.resolve = config.resolve ?? {};
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "@": rootDir,
      };
      return config;
    },
  });

  logStep(videoProjectId, "SELECT_COMPOSITION", FITCORE_VIDEO_TEMPLATE_ID);
  const composition = await selectComposition({
    serveUrl,
    id: FITCORE_VIDEO_TEMPLATE_ID,
    inputProps,
  });

  logStep(videoProjectId, "RENDER_MEDIA");
  await renderMedia({
    composition,
    serveUrl,
    outputLocation: rawOutputLocation,
    inputProps,
    ...getInstagramRenderMediaOptions({
      fps: composition.fps,
      hasVoiceover: false,
    }),
  });

  logStep(videoProjectId, "TRANSCODE");
  transcodeVideoForInstagram(rawOutputLocation, outputLocation);

  try {
    fs.unlinkSync(rawOutputLocation);
  } catch {
    // Best-effort cleanup.
  }

  const fileSize = verifyOutputFile(outputLocation);
  logStep(videoProjectId, "VERIFY_OUTPUT", `${fileSize} bytes`);

  const storagePath = `${project.user_id}/${videoProjectId}/preview.mp4`;
  await uploadVideoToStorage({
    supabase,
    bucketName: VIDEO_BUCKET,
    storagePath,
    localPath: outputLocation,
    videoId: videoProjectId,
  });

  const videoUrl = getPublicStorageUrl(VIDEO_BUCKET, storagePath);
  if (!isValidVideoUrl(videoUrl)) {
    throw new Error("Upload succeeded but public video URL is invalid");
  }

  await markRenderCompleted(supabase, {
    videoProjectId,
    generatedVideoId: activeGeneratedVideoId,
    videoUrl,
    storagePath,
    renderType: RENDER_TYPE,
    userId: project.user_id,
  });

  process.stdout.write(JSON.stringify({ ok: true, videoUrl, status: "completed" }));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  logStep(videoProjectId, "PIPELINE_ERROR", message);

  await markRenderFailed(supabase, {
    videoProjectId,
    generatedVideoId: activeGeneratedVideoId,
    errorMessage: message,
    renderType: RENDER_TYPE,
  }).catch(() => {
    // Avoid masking the original error.
  });

  process.stdout.write(JSON.stringify({ ok: false, error: message, status: "failed" }));
  process.exit(1);
}
