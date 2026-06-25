import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const entry = path.resolve("remotion/index.ts");
const outputLocation = path.resolve("out/generated-video.mp4");

const inputProps = {
  title: "Preview",
  brandName: "Your brand",
  scenes: [
    {
      text: "Scene one from your script",
      duration: 3,
      asset_url: "/app-showcase/dashboard.png",
    },
    {
      text: "Scene two from your script",
      duration: 3,
      visual_description: "FitCore AI coaching dashboard",
    },
  ],
  cta: "Your call to action",
};

const serveUrl = await bundle({
  entryPoint: entry,
});

const composition = await selectComposition({
  serveUrl,
  id: "FitCoreVideoTemplate",
  inputProps,
});

await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation,
  inputProps,
});

console.log(`Rendered video to ${outputLocation}`);
