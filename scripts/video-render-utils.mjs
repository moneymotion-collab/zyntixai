import fs from "fs";
import path from "path";
import { spawnSync } from "node:child_process";
import { RenderInternals } from "@remotion/renderer";

const { getExecutablePath } = RenderInternals;

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

function guessImageContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "image/png";
  }
}

export function getInstagramRenderMediaOptions({ fps = 30, hasVoiceover = false } = {}) {
  return {
    codec: "h264",
    pixelFormat: "yuv420p",
    audioCodec: "aac",
    x264Preset: "medium",
    gopSize: fps,
    crf: 23,
    enforceAudioTrack: hasVoiceover,
    timeoutInMilliseconds: 120_000,
    chromiumOptions: {
      disableWebSecurity: true,
    },
  };
}

function inputHasAudioStream(inputPath, ffmpeg) {
  const probe = spawnSync(ffmpeg, ["-hide_banner", "-i", inputPath], {
    encoding: "utf8",
  });

  const details = `${probe.stderr || ""}\n${probe.stdout || ""}`;
  return /Audio:/i.test(details);
}

export function transcodeVideoForInstagram(inputPath, outputPath) {
  const ffmpeg = getExecutablePath({
    type: "ffmpeg",
    indent: false,
    logLevel: "info",
    binariesDirectory: null,
  });

  const hasAudio = inputHasAudioStream(inputPath, ffmpeg);
  const ffmpegArgs = [
    "-y",
    "-i",
    inputPath,
    "-map",
    "0:v:0",
    "-c:v",
    "libx264",
    "-profile:v",
    "main",
    "-level",
    "4.0",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-vf",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
  ];

  if (hasAudio) {
    ffmpegArgs.push(
      "-map",
      "0:a:0?",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ar",
      "44100",
      "-ac",
      "2",
    );
  } else {
    ffmpegArgs.push("-an");
  }

  ffmpegArgs.push(outputPath);

  const result = spawnSync(ffmpeg, ffmpegArgs, { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(
      result.stderr?.trim() ||
        result.stdout?.trim() ||
        "Instagram video transcode failed.",
    );
  }

  if (!fs.existsSync(outputPath)) {
    throw new Error("Instagram video transcode did not produce an output file.");
  }
}

export async function ensurePublicSceneImageUrl({
  imageUrl,
  rootDir,
  supabase,
  bucketName,
  userId,
  videoProjectId,
  sceneIndex,
  getPublicUrl,
}) {
  const trimmed = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (!trimmed) return undefined;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const relative = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  const localPath = path.join(rootDir, "public", relative);

  if (!fs.existsSync(localPath)) {
    const appBase =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    if (appBase) {
      const remoteUrl = `${appBase.replace(/\/$/, "")}/${relative}`;
      try {
        const response = await fetch(remoteUrl, { method: "HEAD" });
        if (response.ok) {
          return remoteUrl;
        }
      } catch {
        // Fall through to warning below.
      }
    }

    console.warn(
      `Scene ${sceneIndex} image missing on disk (${localPath}). Render may show a black frame.`,
    );
    return trimmed;
  }

  const ext = path.extname(localPath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) {
    return trimmed;
  }

  const storagePath = `${userId}/${videoProjectId}/scene-assets/scene-${sceneIndex}${ext}`;
  const buffer = fs.readFileSync(localPath);

  const { error } = await supabase.storage.from(bucketName).upload(storagePath, buffer, {
    contentType: guessImageContentType(localPath),
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload scene image ${sceneIndex}: ${error.message}`);
  }

  return getPublicUrl(storagePath);
}

export async function prepareScenesForRender({
  scenes,
  rootDir,
  supabase,
  bucketName,
  userId,
  videoProjectId,
  getPublicUrl,
}) {
  return Promise.all(
    scenes.map(async (scene, index) => {
      const sourceUrl =
        scene.image_url?.trim() ||
        scene.imageUrl?.trim() ||
        scene.asset_url?.trim() ||
        "";

      const publicUrl = await ensurePublicSceneImageUrl({
        imageUrl: sourceUrl,
        rootDir,
        supabase,
        bucketName,
        userId,
        videoProjectId,
        sceneIndex: index,
        getPublicUrl,
      });

      return {
        ...scene,
        asset_url: publicUrl ?? scene.asset_url ?? undefined,
        image_url: publicUrl ?? scene.image_url ?? undefined,
        imageUrl: publicUrl ?? scene.imageUrl ?? scene.image_url ?? scene.asset_url ?? undefined,
      };
    }),
  );
}
