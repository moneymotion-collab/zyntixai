function parseString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseDuration(value, fallback = 3) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.min(30, Math.max(1, Math.round(value)));
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(30, Math.max(1, Math.round(parsed)));
    }
  }

  return fallback;
}

export function parseScriptInput(script) {
  if (script == null) return null;

  if (typeof script === "object" && !Array.isArray(script)) {
    return script;
  }

  if (typeof script === "string") {
    const trimmed = script.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return { text: trimmed };
    }
  }

  return null;
}

function sceneTextFromItem(item) {
  return (
    parseString(item.text) ||
    parseString(item.on_screen_text) ||
    parseString(item.onScreenText) ||
    parseString(item.overlay_text) ||
    parseString(item.overlayText) ||
    parseString(item.narration) ||
    parseString(item.visual) ||
    parseString(item.visual_description) ||
    parseString(item.visualDescription) ||
    parseString(item.headline) ||
    parseString(item.caption) ||
    ""
  );
}

export function normalizeSceneItem(item) {
  if (!item || typeof item !== "object") return null;

  const text = sceneTextFromItem(item);
  if (!text) return null;

  const image_url = parseString(item.image_url) || parseString(item.imageUrl) || undefined;
  const screenshot_url =
    parseString(item.screenshot_url) || parseString(item.screenshotUrl) || undefined;
  const asset_url =
    parseString(item.asset_url) || parseString(item.assetUrl) || undefined;
  const visual_description =
    parseString(item.visual_description) ||
    parseString(item.visualDescription) ||
    parseString(item.visual) ||
    undefined;

  return {
    text,
    duration: parseDuration(item.duration ?? item.animation_duration),
    visual: parseString(item.visual) || visual_description || text,
    visual_description,
    image_url,
    imageUrl: image_url,
    screenshot_url,
    asset_url,
    overlay_text:
      parseString(item.overlay_text) || parseString(item.overlayText) || undefined,
    asset_key: parseString(item.asset_key) || parseString(item.assetKey) || undefined,
    crop_focus: parseString(item.crop_focus) || parseString(item.cropFocus) || undefined,
    highlight_area:
      parseString(item.highlight_area) || parseString(item.highlightArea) || undefined,
    blur_background:
      typeof item.blur_background === "boolean"
        ? item.blur_background
        : typeof item.blurBackground === "boolean"
          ? item.blurBackground
          : undefined,
    zoom_level:
      typeof item.zoom_level === "number"
        ? item.zoom_level
        : typeof item.zoomLevel === "number"
          ? item.zoomLevel
          : undefined,
    layout_style:
      parseString(item.layout_style) || parseString(item.layoutStyle) || undefined,
    ui_focus_area:
      parseString(item.ui_focus_area) || parseString(item.uiFocusArea) || undefined,
    camera_motion:
      parseString(item.camera_motion) || parseString(item.cameraMotion) || undefined,
    workflow_step:
      parseString(item.workflow_step) || parseString(item.workflowStep) || undefined,
    module: parseString(item.module) || undefined,
    animation_duration:
      typeof item.animation_duration === "number"
        ? item.animation_duration
        : typeof item.animationDuration === "number"
          ? item.animationDuration
          : undefined,
  };
}

function scenesFromArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map(normalizeSceneItem)
    .filter((scene) => scene != null);
}

function scenesArrayExists(parsed) {
  for (const key of ["scenes", "slides", "items"]) {
    if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
      return true;
    }
  }
  return false;
}

export function hasRenderableScriptSource(input) {
  if (scenesFromArray(input.dbScenes ?? []).length > 0) {
    return true;
  }

  const parsed = parseScriptInput(input.script);
  if (!parsed) {
    return Boolean(parseString(input.hook) || parseString(input.prompt));
  }

  if (scenesArrayExists(parsed)) {
    return true;
  }

  return Boolean(
    parseString(parsed.hook) ||
      parseString(input.hook) ||
      parseString(parsed.text) ||
      parseString(input.prompt),
  );
}

function synthesizeScenesFromScriptFields(input) {
  const parsed = input.parsedScript;
  const hook =
    parseString(input.hook) ||
    parseString(parsed?.hook) ||
    "";
  const cta =
    parseString(input.cta) ||
    parseString(parsed?.cta) ||
    "";
  const prompt = parseString(input.prompt) || "";
  const plainText = parseString(parsed?.text);
  const synthesized = [];

  if (hook) {
    synthesized.push({ text: hook, duration: 3 });
  }
  if (plainText && plainText !== hook) {
    synthesized.push({ text: plainText, duration: 4 });
  }
  if (prompt && prompt !== hook && prompt !== plainText) {
    synthesized.push({ text: prompt.slice(0, 160), duration: 4 });
  }
  if (cta && cta !== hook && cta !== prompt && cta !== plainText) {
    synthesized.push({ text: cta, duration: 3 });
  }

  return synthesized;
}

/** Extract scenes from script.scenes, .slides, or .items only. */
export function extractScenesFromParsed(parsed) {
  for (const key of ["scenes", "slides", "items"]) {
    const scenes = scenesFromArray(parsed[key]);
    if (scenes.length > 0) return scenes;
  }

  return [];
}

export function buildDefaultFallbackScenes(context = {}) {
  const title =
    typeof context.title === "string" && context.title.trim()
      ? context.title.trim()
      : "Your video";
  const prompt =
    typeof context.prompt === "string" && context.prompt.trim()
      ? context.prompt.trim()
      : "Add scenes to render your marketing video.";

  return [
    { text: title, duration: 3 },
    { text: prompt.slice(0, 160), duration: 4 },
  ];
}

export function resolveRenderScript(input) {
  const parsedScript = parseScriptInput(input.script);
  const contextHook =
    parseString(parsedScript?.hook) || parseString(input.hook) || "";
  const contextCta =
    parseString(parsedScript?.cta) || parseString(input.cta) || "";
  const style =
    parseString(parsedScript?.style) || parseString(input.style) || undefined;
  const title =
    parseString(parsedScript?.title) || parseString(input.title) || "Your video";

  let scenes = [];
  let usedFallback = false;
  let sceneSource = "none";

  const dbSceneList = scenesFromArray(input.dbScenes ?? []);
  if (dbSceneList.length > 0) {
    scenes = dbSceneList;
    sceneSource = "video_scenes";
  } else if (parsedScript) {
    scenes = extractScenesFromParsed(parsedScript);
    if (scenes.length > 0) {
      sceneSource = "generated_videos.script";
    }
  }

  if (scenes.length === 0 && hasRenderableScriptSource(input)) {
    scenes = synthesizeScenesFromScriptFields({
      hook: input.hook ?? contextHook,
      cta: input.cta ?? contextCta,
      prompt: input.prompt,
      parsedScript,
    });
    if (scenes.length > 0) {
      sceneSource = parsedScript ? "script_synthesized" : "project_synthesized";
    }
  }

  if (scenes.length === 0) {
    scenes = buildDefaultFallbackScenes({
      title,
      prompt: input.prompt,
    });
    usedFallback = true;
    sceneSource = "fallback";
  }

  const hook =
    parseString(input.hook) || contextHook || scenes[0]?.text || title;
  const cta =
    parseString(input.cta) ||
    contextCta ||
    scenes[scenes.length - 1]?.text ||
    "";

  return {
    hook,
    cta,
    style,
    title,
    scenes,
    usedFallback,
    parsedScript,
    sceneSource,
  };
}

export function computeVideoDurationSeconds(
  hook,
  scenes,
  cta,
  hookSeconds = 2,
  ctaSeconds = 2,
) {
  const bodySeconds = scenes.reduce(
    (sum, scene) => sum + (scene.duration > 0 ? scene.duration : 3),
    0,
  );

  return hookSeconds + bodySeconds + ctaSeconds;
}

export function logRenderCompositionDebug(label, payload) {
  console.log(`[VIDEO_RENDER ${label}] parsed script:`, payload.parsedScript);
  console.log(`[VIDEO_RENDER ${label}] extracted scenes:`, payload.scenes);
  if (payload.frame != null && payload.sceneIndex != null) {
    console.log(
      `[VIDEO_RENDER ${label}] frame ${payload.frame} → scene ${payload.sceneIndex}`,
    );
  }
  console.log(`[VIDEO_RENDER ${label}] video duration: ${payload.durationSeconds}s`);
  console.log(`[VIDEO_RENDER ${label}] composition props:`, payload.compositionProps);
}
