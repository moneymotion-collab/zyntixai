/** Instagram Reels / TikTok vertical video canvas (9:16). */
export const REELS_WIDTH = 1080;
export const REELS_HEIGHT = 1920;
export const REELS_FPS = 30;

/** UI-safe inset from top of frame (profile bar, back button). */
export const REELS_SAFE_TOP = 120;
/** UI-safe inset from bottom (caption field, CTA buttons). */
export const REELS_SAFE_BOTTOM = 260;

/** Important copy must not start above this Y. */
export const REELS_MIN_TEXT_Y = 120;
/** Important copy must not extend below this Y. */
export const REELS_MAX_TEXT_Y = 1650;

export const REELS_SIDE_PADDING = 32;

/** Bottom edge of the safe content band (1660). */
export const REELS_SAFE_CONTENT_BOTTOM = REELS_HEIGHT - REELS_SAFE_BOTTOM;

/** CSS `bottom` value so element's bottom edge sits at {@link REELS_MAX_TEXT_Y}. */
export const REELS_TEXT_BOTTOM_INSET = REELS_HEIGHT - REELS_MAX_TEXT_Y;

/** Brand mark — compact pill under safe top. */
export const REELS_HEADER_TOP = REELS_SAFE_TOP;
export const REELS_HEADER_HEIGHT = 36;

/** Feature badge row under the brand header (two rows — all platform modules). */
export const REELS_FEATURE_BADGES_TOP = REELS_HEADER_TOP + REELS_HEADER_HEIGHT + 6;
export const REELS_FEATURE_BADGES_HEIGHT = 52;

/** Primary app screenshot / SaaS mockup frame — maximized for full UI visibility. */
export const REELS_APP_VISUAL_TOP =
  REELS_FEATURE_BADGES_TOP + REELS_FEATURE_BADGES_HEIGHT + 6;
/** Scene headline sits below the mockup — lower = taller app frame. */
export const REELS_SCENE_TEXT_TOP = 1412;
export const REELS_APP_VISUAL_INSET = 6;
export const REELS_APP_VISUAL_TEXT_GAP = 10;
export const REELS_APP_VISUAL_HEIGHT =
  REELS_SCENE_TEXT_TOP - REELS_APP_VISUAL_TOP - REELS_APP_VISUAL_TEXT_GAP;

/** Scene headline / narration block. */
export const REELS_SCENE_TEXT_SIDE = 56;

/** Full-bleed canvas style for Remotion {@link AbsoluteFill}. */
export const REELS_CANVAS_STYLE = {
  width: REELS_WIDTH,
  height: REELS_HEIGHT,
} as const;

/** Absolute positioning for the centered app visual panel. */
export const REELS_APP_FRAME_STYLE = {
  position: "absolute" as const,
  top: REELS_APP_VISUAL_TOP,
  left: REELS_APP_VISUAL_INSET,
  right: REELS_APP_VISUAL_INSET,
  height: REELS_APP_VISUAL_HEIGHT,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "center",
};

/** Insets for full-bleed backgrounds and images (avoids letterboxing). */
export const REELS_FULL_BLEED_COVER = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
};
