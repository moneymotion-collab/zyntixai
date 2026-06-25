"use client";

type Scene = {
  text: string;
  duration: number;
};

type Props = {
  hook: string;
  scenes: Scene[];
  cta: string;
  style?: string;
};

export default function AnimatedMemePreview({
  hook,
  scenes,
  cta,
  style,
}: Props) {
  return (
    <div className="mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-3xl bg-black text-white shadow-2xl">
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-white/50">
          {style || "viral_caption"}
        </p>

        <h2 className="animate-pulse text-4xl font-black leading-tight">
          {hook}
        </h2>

        <div className="mt-8 space-y-4">
          {scenes.map((scene, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
            >
              <p className="text-lg font-bold">{scene.text}</p>
              <p className="mt-1 text-xs text-white/50">
                {scene.duration}s
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-full bg-white px-5 py-3 text-sm font-black text-black">
          {cta}
        </div>
      </div>
    </div>
  );
}
