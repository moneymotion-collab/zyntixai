import fs from "fs";
import {
  buildDefaultFallbackScenes,
  logRenderCompositionDebug,
  resolveRenderScript,
} from "../lib/video/parse-render-script.mjs";

export const RENDER_STATUS = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export function logStep(videoId, step, detail) {
  const suffix = detail ? `: ${detail}` : "";
  console.error(`[VIDEO_RENDER ${videoId}] ${step}${suffix}`);
}

export function logRenderProjectDebug(videoId, payload) {
  console.log(
    `[VIDEO_RENDER ${videoId}] project debug:`,
    JSON.stringify(payload, null, 2),
  );
}

export function isValidVideoUrl(url) {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function extractMissingVideoProjectsColumn(message) {
  const text = String(message ?? "");
  const pgrstMatch = text.match(
    /Could not find the '([^']+)' column of 'video_projects'/i,
  );
  if (pgrstMatch?.[1]) return pgrstMatch[1];

  const pgMatch = text.match(/column video_projects\.([a-z_0-9]+) does not exist/i);
  return pgMatch?.[1] ?? null;
}

function extractMissingGeneratedVideosColumn(message) {
  const text = String(message ?? "");
  const pgrstMatch = text.match(
    /Could not find the '([^']+)' column of 'generated_videos'/i,
  );
  if (pgrstMatch?.[1]) return pgrstMatch[1];

  const pgMatch = text.match(
    /column generated_videos\.([a-z_0-9]+) does not exist/i,
  );
  return pgMatch?.[1] ?? null;
}

function isVideoProjectSchemaMismatch(error) {
  if (!error) return false;
  const message = String(error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    message.includes("could not find") ||
    message.includes("column") ||
    message.includes("schema cache")
  );
}

export async function patchVideoProjectResilient(
  supabase,
  videoProjectId,
  patch,
) {
  let payload = { ...patch };

  for (let attempt = 0; attempt < 12; attempt++) {
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(cleaned).length === 0) {
      return;
    }

    const { error } = await supabase
      .from("video_projects")
      .update(cleaned)
      .eq("id", videoProjectId);

    if (!error) {
      return;
    }

    if (!isVideoProjectSchemaMismatch(error)) {
      throw new Error(`Could not update video_projects: ${error.message}`);
    }

    const missingColumn = extractMissingVideoProjectsColumn(error.message);
    if (!missingColumn || !(missingColumn in cleaned)) {
      throw new Error(`Could not update video_projects: ${error.message}`);
    }

    console.warn(
      `[VIDEO_RENDER ${videoProjectId}] Skipping video_projects.${missingColumn} — column missing`,
    );
    const { [missingColumn]: _omit, ...rest } = cleaned;
    payload = rest;
  }

  throw new Error(
    "Could not update video_projects after removing unknown columns",
  );
}

function isGeneratedVideoSchemaMismatch(error) {
  if (!error) return false;
  const message = String(error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    message.includes("could not find") ||
    message.includes("column") ||
    message.includes("schema cache")
  );
}

export async function patchGeneratedVideoResilient(
  supabase,
  generatedVideoId,
  patch,
) {
  let payload = { ...patch };

  for (let attempt = 0; attempt < 12; attempt++) {
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(cleaned).length === 0) {
      return;
    }

    const { error } = await supabase
      .from("generated_videos")
      .update(cleaned)
      .eq("id", generatedVideoId);

    if (!error) {
      return;
    }

    if (!isGeneratedVideoSchemaMismatch(error)) {
      throw new Error(`Could not update generated_videos: ${error.message}`);
    }

    const missingColumn = extractMissingGeneratedVideosColumn(error.message);
    if (!missingColumn || !(missingColumn in cleaned)) {
      throw new Error(`Could not update generated_videos: ${error.message}`);
    }

    console.warn(
      `[VIDEO_RENDER ${generatedVideoId}] Skipping generated_videos.${missingColumn} — column missing`,
    );
    const { [missingColumn]: _omit, ...rest } = cleaned;
    payload = rest;
  }

  throw new Error(
    "Could not update generated_videos after removing unknown columns",
  );
}

export function buildFallbackScenes(project) {
  logStep(project?.id ?? "unknown", "FALLBACK_SCENES", "Using placeholder scenes");

  return buildDefaultFallbackScenes({
    title: project?.brand_name ?? project?.title,
    prompt: project?.prompt,
  }).map((scene, scene_index) => ({
    ...scene,
    visual: scene.text,
    scene_index,
  }));
}

export async function loadGeneratedVideoRecord(supabase, generatedVideoId) {
  if (!generatedVideoId) return null;

  const { data, error } = await supabase
    .from("generated_videos")
    .select("*")
    .eq("id", generatedVideoId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load generated_videos row: ${error.message}`);
  }

  return data ?? null;
}

export const FITCORE_VIDEO_TEMPLATE_ID = "FitCoreVideoTemplate";

const PLATFORM_SHOWCASE_SCENES = [
  {
    module: "problem",
    text: "Coaches juggle 6+ apps to run their business",
    duration: 3.5,
    visual_description:
      "Fragmented coaching tools vs one unified FitCore AI platform",
  },
  {
    module: "platform_overview",
    text: "One platform for your entire fitness business",
    duration: 3.5,
    visual_description:
      "FitCore AI dashboard with members, workouts, nutrition, sessions, marketing and analytics",
    asset_url: "/app-showcase/dashboard.png",
  },
  {
    module: "members",
    text: "Manage every member from one place",
    duration: 3,
    visual_description: "Members module with client profiles and goals",
    asset_url: "/app-showcase/members.png",
  },
  {
    module: "workouts",
    text: "Build and assign workout plans instantly",
    duration: 3,
    visual_description: "Workout plan builder with exercise blocks",
    asset_url: "/app-showcase/workouts.png",
  },
  {
    module: "nutrition",
    text: "Create personalized nutrition plans",
    duration: 3,
    visual_description: "Nutrition planning with macro targets and meal templates",
    asset_url: "/app-showcase/nutrition.png",
  },
  {
    module: "progress",
    text: "Track every client milestone",
    duration: 3,
    visual_description: "Progress tracking charts and compliance trends",
    asset_url: "/app-showcase/progress.png",
  },
  {
    module: "marketing",
    text: "Generate content and schedule posts with Marketing AI",
    duration: 3,
    visual_description: "Marketing AI content ideas and social calendar",
    asset_url: "/app-showcase/marketing-ai.png",
  },
  {
    module: "analytics",
    text: "Business analytics that drive growth",
    duration: 3.5,
    visual_description: "Revenue, retention and session analytics dashboard",
    asset_url: "/app-showcase/analytics.png",
  },
];

export function buildFitCoreTemplateInputProps({
  project,
  scenes,
  title,
  cta,
  script,
}) {
  const brandName =
    (typeof project?.brand_name === "string" && project.brand_name.trim()) ||
    (typeof title === "string" && title.trim()) ||
    "Your brand";
  const videoTitle =
    (typeof title === "string" && title.trim()) ||
    brandName;
  const videoCta =
    (typeof cta === "string" && cta.trim()) ||
    (typeof project?.cta === "string" && project.cta.trim()) ||
    (typeof script?.cta === "string" && script.cta.trim()) ||
    "";

  const cleanOptional = (value) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const mapTemplateScene = (scene) => {
    const text = (
      scene?.text ??
      scene?.overlay_text ??
      scene?.narration ??
      ""
    ).trim();

    const visual_description =
      cleanOptional(scene?.visual_description) ??
      cleanOptional(scene?.visualDescription) ??
      cleanOptional(scene?.visual);
    const image_url =
      cleanOptional(scene?.image_url) ?? cleanOptional(scene?.imageUrl);
    const screenshot_url =
      cleanOptional(scene?.screenshot_url) ?? cleanOptional(scene?.screenshotUrl);
    const asset_url =
      cleanOptional(scene?.asset_url) ?? cleanOptional(scene?.assetUrl);

    return {
      text,
      duration:
        typeof scene?.duration === "number" && scene.duration > 0
          ? scene.duration
          : 3,
      ...(visual_description ? { visual_description } : {}),
      ...(image_url ? { image_url } : {}),
      ...(screenshot_url ? { screenshot_url } : {}),
      ...(asset_url ? { asset_url } : {}),
    };
  };

  const scriptScenes = Array.isArray(script?.scenes) ? script.scenes : [];
  const dbScenes = Array.isArray(scenes) ? scenes : [];
  const hasScriptScenes = scriptScenes.length > 0;
  const hasDbScenes = dbScenes.length > 0;

  let templateScenes = [];

  if (hasScriptScenes) {
    templateScenes = scriptScenes
      .map(mapTemplateScene)
      .filter((scene) => scene.text.length > 0);
  } else if (hasDbScenes) {
    templateScenes = dbScenes
      .map(mapTemplateScene)
      .filter((scene) => scene.text.length > 0);
  }

  const hasScript =
    hasScriptScenes ||
    hasDbScenes ||
    (typeof project?.hook === "string" && project.hook.trim()) ||
    (typeof script?.hook === "string" && script.hook.trim()) ||
    (typeof project?.prompt === "string" && project.prompt.trim());

  if (templateScenes.length === 0 && hasScript && !hasScriptScenes) {
    const hook =
      (typeof project?.hook === "string" && project.hook.trim()) ||
      (typeof script?.hook === "string" && script.hook.trim()) ||
      "";
    const prompt =
      typeof project?.prompt === "string" ? project.prompt.trim() : "";

    if (hook) {
      templateScenes.push({ text: hook, duration: 3 });
    }
    if (prompt && prompt !== hook) {
      templateScenes.push({ text: prompt.slice(0, 160), duration: 4 });
    }
    if (videoCta && videoCta !== hook && videoCta !== prompt) {
      templateScenes.push({ text: videoCta, duration: 3 });
    }
  }

  if (templateScenes.length === 0) {
    templateScenes = PLATFORM_SHOWCASE_SCENES;
  } else if (templateScenes.length < 5) {
    templateScenes = PLATFORM_SHOWCASE_SCENES.map((beat, index) => {
      const scriptScene = templateScenes[index];
      if (!scriptScene) return beat;
      return {
        ...beat,
        text: scriptScene.text?.trim() || beat.text,
        duration: scriptScene.duration > 0 ? scriptScene.duration : beat.duration,
        visual_description:
          scriptScene.visual_description?.trim() || beat.visual_description,
        ...(scriptScene.asset_url ? { asset_url: scriptScene.asset_url } : {}),
      };
    });
  }

  const explicitHook =
    (typeof project?.hook === "string" && project.hook.trim()) ||
    (typeof script?.hook === "string" && script.hook.trim()) ||
    "";
  const resolvedCta =
    videoCta.trim() || "Replace every tool. Run FitCore AI →";
  const hook =
    explicitHook ||
    templateScenes.find((s) => s.module === "problem")?.text ||
    templateScenes[0]?.text?.trim() ||
    "Coaches juggle 6+ apps to run their business";

  return {
    title: videoTitle,
    brandName,
    hook,
    scenes: templateScenes,
    cta: resolvedCta,
  };
}

export function parseRenderInputPropsFromEnv() {
  const raw = process.env.RENDER_INPUT_PROPS;
  if (!raw?.trim()) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function loadProjectScenesOnly(supabase, videoProjectId, project) {
  const { data: dbScenes, error } = await supabase
    .from("video_scenes")
    .select("*")
    .eq("video_id", videoProjectId)
    .order("scene_index", { ascending: true });

  if (error) {
    throw new Error(`Could not load scenes: ${error.message}`);
  }

  return {
    hook: project?.hook ?? null,
    cta: project?.cta ?? null,
    title: project?.brand_name ?? null,
    prompt: project?.prompt ?? null,
    scenes: (dbScenes ?? []).map((scene, scene_index) => ({
      text: scene.text ?? "",
      visual: scene.visual ?? "",
      visual_description: scene.visual ?? undefined,
      duration: scene.duration ?? 3,
      scene_index,
      overlay_text: scene.overlay_text ?? undefined,
      narration: scene.narration ?? undefined,
      image_url: scene.image_url ?? undefined,
      asset_url: scene.asset_url ?? undefined,
      asset_key: scene.asset_key ?? undefined,
    })),
  };
}

export function verifyOutputFile(outputPath) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(`Output file was not created: ${outputPath}`);
  }

  const stats = fs.statSync(outputPath);
  if (!stats.isFile() || stats.size <= 0) {
    throw new Error(`Output file is empty or invalid: ${outputPath}`);
  }

  return stats.size;
}

export async function validateVideoProject(supabase, videoId) {
  logStep(videoId, "VALIDATE_VIDEO_ID");

  if (!videoId || typeof videoId !== "string") {
    throw new Error("video_id is required");
  }

  const { data: project, error } = await supabase
    .from("video_projects")
    .select("*")
    .eq("id", videoId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load video project: ${error.message}`);
  }

  if (!project) {
    throw new Error(`Video project not found: ${videoId}`);
  }

  logRenderProjectDebug(videoId, {
    loaded_project_id: project.id,
    loaded_project_title: project.brand_name ?? null,
    loaded_project_hook: project.hook ?? null,
    loaded_project_cta: project.cta ?? null,
    loaded_project_prompt: project.prompt ?? null,
    loaded_project_generated_video_id: project.generated_video_id ?? null,
  });

  logStep(videoId, "VALIDATE_VIDEO_ID", "ok");
  return project;
}

export async function loadScenesOrFallback(
  supabase,
  videoId,
  project,
  generatedVideoId,
) {
  logStep(videoId, "VALIDATE_SCENES");
  logStep(videoId, "SELECTED_VIDEO_PROJECT_ID", videoId);
  logStep(videoId, "SELECTED_GENERATED_VIDEO_ID", generatedVideoId ?? "none");

  const generatedVideo = await loadGeneratedVideoRecord(supabase, generatedVideoId);

  if (
    generatedVideo?.video_project_id &&
    generatedVideo.video_project_id !== videoId
  ) {
    logStep(
      videoId,
      "GENERATED_VIDEO_PROJECT_MISMATCH",
      `generated=${generatedVideo.video_project_id} requested=${videoId}`,
    );
  }

  const { data: dbScenes, error } = await supabase
    .from("video_scenes")
    .select("*")
    .eq("video_id", videoId)
    .order("scene_index", { ascending: true });

  if (error) {
    throw new Error(`Could not load scenes: ${error.message}`);
  }

  const resolved = resolveRenderScript({
    script: generatedVideo?.script ?? null,
    title: generatedVideo?.title ?? project?.brand_name,
    prompt: generatedVideo?.prompt ?? project?.prompt,
    hook: project?.hook,
    cta: project?.cta,
    style: project?.style,
    dbScenes: dbScenes ?? [],
  });

  const projectScriptFromDb = {
    hook: project?.hook ?? null,
    cta: project?.cta ?? null,
    scene_count: dbScenes?.length ?? 0,
    scenes: (dbScenes ?? []).map((scene) => ({
      text: scene.text,
      duration: scene.duration,
    })),
  };

  logRenderProjectDebug(videoId, {
    selected_video_project_id: videoId,
    selected_generated_video_id: generatedVideoId ?? null,
    loaded_project_id: project?.id ?? null,
    loaded_project_title: project?.brand_name ?? generatedVideo?.title ?? null,
    loaded_project_script: projectScriptFromDb,
    loaded_generated_video_id: generatedVideo?.id ?? null,
    loaded_generated_video_project_id: generatedVideo?.video_project_id ?? null,
    loaded_generated_video_script: generatedVideo?.script ?? null,
    scene_source: resolved.sceneSource ?? "unknown",
    extracted_scene_count: resolved.scenes.length,
    extracted_scenes: resolved.scenes.map((scene) => ({
      text: scene.text,
      duration: scene.duration,
    })),
  });

  logRenderCompositionDebug(videoId, {
    parsedScript: resolved.parsedScript,
    scenes: resolved.scenes,
    hook: resolved.hook,
    cta: resolved.cta,
    title: resolved.title,
    durationSeconds:
      2 +
      resolved.scenes.reduce((sum, scene) => sum + (scene.duration || 3), 0) +
      2,
    compositionProps: {
      title: resolved.title,
      hook: resolved.hook,
      cta: resolved.cta,
      style: resolved.style ?? project?.style ?? "viral_caption",
      sceneCount: resolved.scenes.length,
      usedFallback: resolved.usedFallback,
    },
  });

  if (resolved.usedFallback) {
    logStep(videoId, "VALIDATE_SCENES", "No scenes — using fallback");
  } else if (generatedVideo?.script) {
    logStep(
      videoId,
      "VALIDATE_SCENES",
      `${resolved.scenes.length} scene(s) from generated_videos.script`,
    );
  } else if (dbScenes?.length) {
    logStep(videoId, "VALIDATE_SCENES", `${dbScenes.length} scene(s) from video_scenes`);
  }

  return {
    scenes: resolved.scenes.map((scene, scene_index) => ({
      ...scene,
      visual: scene.visual ?? scene.text,
      scene_index,
      image_url: scene.imageUrl ?? scene.asset_url,
      imageUrl: scene.imageUrl ?? scene.asset_url,
    })),
    hook: resolved.hook,
    cta: resolved.cta,
    style: resolved.style,
    title: resolved.title,
    usedFallback: resolved.usedFallback,
    parsedScript: resolved.parsedScript,
    sceneSource: resolved.sceneSource,
    generatedVideo,
  };
}

export async function markGeneratedVideoRendering(
  supabase,
  generatedVideoId,
  { videoProjectId, renderType = "preview" },
) {
  if (!generatedVideoId) {
    throw new Error("generated_videos.id is required before rendering");
  }

  const startedAt = new Date().toISOString();
  logStep(generatedVideoId, "MARK_RENDERING", renderType);

  await patchGeneratedVideoResilient(supabase, generatedVideoId, {
    status: "rendering",
    render_type: renderType,
    render_error: null,
    video_url: null,
    render_started_at: startedAt,
    render_finished_at: null,
    video_project_id: videoProjectId ?? null,
  });

  return { generatedVideoId, startedAt };
}

export async function upsertGeneratedVideoProcessing(
  supabase,
  { videoProjectId, userId, renderType, generatedVideoId },
) {
  if (generatedVideoId) {
    return markGeneratedVideoRendering(supabase, generatedVideoId, {
      videoProjectId,
      renderType,
    });
  }

  throw new Error(
    "generated_videos.id is required before rendering. Create a row via the API first.",
  );
}

export async function markProjectProcessing(supabase, videoProjectId, renderType) {
  const startedAt = new Date().toISOString();

  const projectPatch =
    renderType === "final"
      ? {
          status: RENDER_STATUS.PROCESSING,
          final_render_status: RENDER_STATUS.PROCESSING,
          final_render_error: null,
          final_render_url: null,
          render_started_at: startedAt,
          render_finished_at: null,
        }
      : {
          status: RENDER_STATUS.PROCESSING,
          render_status: RENDER_STATUS.PROCESSING,
          render_error: null,
          video_url: null,
          render_started_at: startedAt,
          render_finished_at: null,
        };

  await patchVideoProjectResilient(supabase, videoProjectId, projectPatch);

  return startedAt;
}

export async function markRenderCompleted(
  supabase,
  {
    videoProjectId,
    generatedVideoId,
    videoUrl,
    storagePath,
    renderType,
    userId,
  },
) {
  if (!isValidVideoUrl(videoUrl)) {
    throw new Error("Cannot mark completed without a valid video_url");
  }

  const finishedAt = new Date().toISOString();
  logStep(videoProjectId, "COMPLETED", videoUrl);

  const generatedPatch = {
    status: RENDER_STATUS.COMPLETED,
    video_url: videoUrl,
    render_error: null,
    render_finished_at: finishedAt,
    storage_path: storagePath,
  };

  await patchGeneratedVideoResilient(supabase, generatedVideoId, generatedPatch);

  const projectPatch =
    renderType === "final"
      ? {
          status: RENDER_STATUS.COMPLETED,
          final_render_status: "ready",
          final_render_url: videoUrl,
          final_render_error: null,
          video_url: videoUrl,
          render_finished_at: finishedAt,
        }
      : {
          status: RENDER_STATUS.COMPLETED,
          render_status: RENDER_STATUS.COMPLETED,
          video_url: videoUrl,
          render_error: null,
          render_finished_at: finishedAt,
        };

  await patchVideoProjectResilient(supabase, videoProjectId, projectPatch);

  if (renderType === "preview") {
    await supabase.from("video_outputs").insert({
      video_id: videoProjectId,
      render_url: videoUrl,
      status: "ready",
    });
  }

  const { data: project } = await supabase
    .from("video_projects")
    .select("content_post_id")
    .eq("id", videoProjectId)
    .maybeSingle();

  if (project?.content_post_id && renderType === "final") {
    await supabase
      .from("content_posts")
      .update({
        video_url: videoUrl,
        content_type: "video",
        updated_at: finishedAt,
      })
      .eq("id", project.content_post_id);
  }

  return { videoUrl, finishedAt, userId };
}

export async function markRenderFailed(
  supabase,
  { videoProjectId, generatedVideoId, errorMessage, renderType },
) {
  const finishedAt = new Date().toISOString();
  const message =
    errorMessage instanceof Error ? errorMessage.message : String(errorMessage);

  logStep(videoProjectId, "FAILED", message);

  if (generatedVideoId) {
    await patchGeneratedVideoResilient(supabase, generatedVideoId, {
      status: RENDER_STATUS.FAILED,
      render_error: message,
      render_finished_at: finishedAt,
      video_url: null,
    });
  }

  const projectPatch =
    renderType === "final"
      ? {
          status: RENDER_STATUS.FAILED,
          final_render_status: RENDER_STATUS.FAILED,
          final_render_error: message,
          render_finished_at: finishedAt,
        }
      : {
          status: RENDER_STATUS.FAILED,
          render_status: RENDER_STATUS.FAILED,
          render_error: message,
          render_finished_at: finishedAt,
        };

  await patchVideoProjectResilient(supabase, videoProjectId, projectPatch);

  return message;
}

export async function uploadVideoToStorage({
  supabase,
  bucketName,
  storagePath,
  localPath,
  videoId,
}) {
  logStep(videoId, "UPLOAD_STORAGE", storagePath);

  const mp4Buffer = fs.readFileSync(localPath);

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, mp4Buffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload video: ${uploadError.message}`);
  }

  logStep(videoId, "UPLOAD_STORAGE", "ok");
  return storagePath;
}
