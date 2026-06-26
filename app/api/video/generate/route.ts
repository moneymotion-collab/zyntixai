import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import {
  getBrandMascotDefaults,
  loadOrCreateBrandProfile,
} from "@/lib/marketing/brand-profile"
import { loadLearningContextBlock } from "@/lib/marketing/learning/load-learning-context"
import { FITCORE_COACH_MASCOT } from "@/lib/marketing/brand-mascot"
import { parseVideoScriptWithResult } from "@/lib/marketing/parse-video-script"
import { addVideoToCalendar } from "@/lib/marketing/schedule-marketing-video"
import { applyMascotToVideoScript } from "@/lib/marketing/resolve-video-script-mascot"
import {
  buildShowcaseUserPrompt,
  isAppShowcaseStyle,
} from "@/lib/marketing/saas-showcase-engine"
import {
  normalizeVideoScenesForInsert,
  normalizeWorkflowProjectFields,
} from "@/lib/marketing/normalize-video-scene-insert"
import { buildVideoDirectorSystemPrompt } from "@/lib/marketing/video-director-prompt"
import {
  buildWorkflowIntelligencePlan,
  getWorkflowIntelligenceMetadata,
} from "@/lib/workflow-intelligence"
import {
  GENERATED_VIDEO_STATUS,
  insertGeneratedVideoDraft,
  linkGeneratedVideoToProject,
  updateGeneratedVideo,
} from "@/lib/marketing/generated-video-record"
import {
  isGeneratorVideoStyle,
  normalizeGeneratorVideoStyle,
} from "@/lib/marketing/video-styles"
import {
  buildStoryStructureUserPromptBlock,
  isStoryStructureCompatibleStyle,
} from "@/lib/marketing/story-structure"
import type { Database, Json } from "@/lib/database.types"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      )
    }

    const { profile: brandProfile } = await loadOrCreateBrandProfile(
      supabase,
      user.id,
    )
    const { context: learningContext } = await loadLearningContextBlock(
      supabase,
      user.id,
    )
    const brandMascot = brandProfile
      ? getBrandMascotDefaults(brandProfile)
      : null

    const body = await req.json()

    const {
      prompt,
      brandName,
      platform = "instagram",
      style: requestedStyle,
      targetAudience,
      goal,
      mascotName,
      mascotDescription,
      mascotStyle,
      mascotVoiceTone,
      storyStructure,
    } = body

    const useStoryStructure =
      storyStructure === true &&
      isStoryStructureCompatibleStyle(
        typeof requestedStyle === "string" ? requestedStyle : undefined,
      )

    if (!prompt || !brandName) {
      return NextResponse.json(
        { error: "Prompt and brandName are required" },
        { status: 400 },
      )
    }

    const resolvedBrandNameEarly =
      (typeof brandName === "string" && brandName.trim()) ||
      brandProfile?.name.trim() ||
      FITCORE_COACH_MASCOT.name

    const stylePreferenceEarly =
      typeof requestedStyle === "string" && requestedStyle.trim()
        ? requestedStyle.trim()
        : "auto"

    let generatedVideo: Awaited<ReturnType<typeof insertGeneratedVideoDraft>> | null =
      null

    try {
      generatedVideo = await insertGeneratedVideoDraft(supabase, {
        userId: user.id,
        title: resolvedBrandNameEarly,
        prompt: String(prompt).trim(),
        videoType: stylePreferenceEarly,
      })
    } catch (draftError) {
      console.warn("GENERATED_VIDEOS_EARLY_INSERT_DEFERRED:", draftError)
    }

    const stylePreference = stylePreferenceEarly

    if (
      stylePreference !== "auto" &&
      !isGeneratorVideoStyle(stylePreference)
    ) {
      return NextResponse.json(
        { error: "Invalid video style." },
        { status: 400 },
      )
    }

    const forcedStyle =
      stylePreference !== "auto" ? stylePreference : undefined

    const mascotOverrides = {
      name:
        (typeof mascotName === "string" ? mascotName : undefined) ??
        brandMascot?.name,
      description:
        (typeof mascotDescription === "string" ? mascotDescription : undefined) ??
        brandMascot?.description,
      style:
        (typeof mascotStyle === "string" ? mascotStyle : undefined) ??
        brandMascot?.style,
      voiceTone:
        (typeof mascotVoiceTone === "string" ? mascotVoiceTone : undefined) ??
        brandMascot?.voiceTone,
    }

    const resolvedBrandName =
      (typeof brandName === "string" && brandName.trim()) ||
      brandProfile?.name.trim() ||
      FITCORE_COACH_MASCOT.name

    const resolvedTargetAudience =
      (typeof targetAudience === "string" && targetAudience.trim()) ||
      brandProfile?.target_audience?.trim() ||
      "Fitness coaches and gym owners"
    const resolvedGoal =
      (typeof goal === "string" && goal.trim()) ||
      brandProfile?.goals?.trim() ||
      "Showcase platform features and drive sign-ups"

    const brandContext = brandProfile
      ? `
Brand niche: ${brandProfile.niche || "Not specified"}
Target audience: ${brandProfile.target_audience || resolvedTargetAudience}
Brand goals: ${brandProfile.goals || resolvedGoal}
Tone of voice: ${brandProfile.tone_of_voice || "Not specified"}
Platform focus: ${brandProfile.platform_focus || platform}
`.trim()
      : ""

    const styleUserInstruction = forcedStyle
      ? `Style preference: use "${forcedStyle}" exactly.`
      : "Style preference: auto — choose the best matching style from the allowed list based on the goal below."

    const intelligence = buildWorkflowIntelligencePlan({
      prompt,
      goal: resolvedGoal,
      targetAudience: resolvedTargetAudience,
      brandName: resolvedBrandName,
      style: forcedStyle,
    })
    const { workflowId, workflow } = intelligence
    const workflowMetadata = getWorkflowIntelligenceMetadata({
      prompt,
      goal: resolvedGoal,
    })

    const userPromptBase = isAppShowcaseStyle(forcedStyle)
      ? buildShowcaseUserPrompt({
          prompt,
          targetAudience: resolvedTargetAudience,
          platform,
          goal: resolvedGoal,
          brandName: resolvedBrandName,
          brandContext,
        })
      : forcedStyle === "saas_demo"
        ? intelligence.userPrompt
        : `
Brand name: ${resolvedBrandName}
Platform: ${platform}
Target audience: ${resolvedTargetAudience}
Goal: ${resolvedGoal}
${styleUserInstruction}
${useStoryStructure ? "\nStory Structure Engine: ENABLED — use the 7-scene narrative arc (Hook → Problem → Why it happens → Solution → Features → Results → CTA).\n" : ""}

User goal / video request:
${prompt}

${brandContext}
          `.trim()

    const storyStructureBlock = useStoryStructure
      ? buildStoryStructureUserPromptBlock({
          campaignName: resolvedBrandName,
          targetAudience: resolvedTargetAudience,
          platform: String(platform),
          goal: resolvedGoal,
          topic: String(prompt).trim(),
        })
      : ""

    const userPrompt = learningContext
      ? `${userPromptBase}${storyStructureBlock ? `\n\n${storyStructureBlock}` : ""}\n\n${learningContext}`
      : storyStructureBlock
        ? `${userPromptBase}\n\n${storyStructureBlock}`
        : userPromptBase

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: buildVideoDirectorSystemPrompt(mascotOverrides, {
            forceStyle: forcedStyle,
            prompt,
            workflow,
            useStoryStructure,
          }),
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = aiResponse.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "AI did not return content" },
        { status: 500 },
      )
    }

    const parsed = parseVideoScriptWithResult(JSON.parse(content), {
      forcedStyle,
      prompt,
      workflow,
      workflowType: intelligence.plan.workflowType,
      workflowSummary: intelligence.plan.workflowSummary,
      scenePlans: intelligence.plan.scenes,
      useStoryStructure,
    })
    if (!parsed.ok) {
      console.error("VIDEO_SCRIPT_PARSE_ERROR:", parsed.reason, content)
      return NextResponse.json(
        {
          error: `Could not parse video script from AI response: ${parsed.reason}`,
        },
        { status: 500 },
      )
    }

    const normalizedStyle = forcedStyle
      ? normalizeGeneratorVideoStyle(forcedStyle)
      : normalizeGeneratorVideoStyle(parsed.script.style)

    const videoScriptBase = applyMascotToVideoScript(
      normalizedStyle,
      { ...parsed.script, style: normalizedStyle },
      mascotOverrides,
    )

    const normalizedScenes = videoScriptBase.scenes.map((scene) => ({
      ...scene,
      image_prompt:
        scene.image_prompt?.trim() ||
        `Modern 3D cartoon SaaS commercial scene featuring the Zyntix Coach mascot. ${scene.visual || scene.text}. Premium business style, cinematic lighting, clean professional layout, vertical 9:16. No celebrities, no public figures, no copyrighted characters.`,
    }))

    const videoScript = {
      ...videoScriptBase,
      scenes: normalizedScenes,
      workflow_type:
        videoScriptBase.workflow_type ?? workflowMetadata.workflowType,
      workflow_summary:
        videoScriptBase.workflow_summary ?? workflowMetadata.workflowSummary,
    }

    const { workflow_type, workflow_summary } = normalizeWorkflowProjectFields({
      workflowType: videoScript.workflow_type,
      workflowSummary: videoScript.workflow_summary,
      fallbackWorkflowType: workflowMetadata.workflowType,
      fallbackWorkflowSummary: workflowMetadata.workflowSummary,
    })

    const { data: insertedVideoProject, error: projectError } = await supabase
      .from("video_projects")
      .insert({
        user_id: user.id,
        brand_name: resolvedBrandName,
        prompt,
        platform,
        status: "draft",
        hook: videoScript.hook,
        cta: videoScript.cta,
        style: videoScript.style,
        workflow_type,
        workflow_summary,
        music_mood: videoScript.musicMood ?? null,
        mascot_name: videoScript.mascot?.name ?? null,
        mascot_description: videoScript.mascot?.description ?? null,
        mascot_style: videoScript.mascot?.style ?? null,
        caption: videoScript.caption ?? null,
        hashtags: videoScript.hashtags ?? [],
        thumbnail_title: videoScript.thumbnail_title,
        thumbnail_text: videoScript.thumbnail_text,
        thumbnail_visual: videoScript.thumbnail_visual,
        video_url: null,
      })
      .select()
      .single()

    if (projectError) {
      return NextResponse.json(
        { error: projectError.message },
        { status: 500 },
      )
    }

    const scenesToInsert = normalizeVideoScenesForInsert(normalizedScenes, {
      videoId: insertedVideoProject.id,
      style: videoScript.style,
      workflowType: workflow_type,
      scenePlans: intelligence.plan.scenes,
    })

    const { error: scenesError } = await supabase
      .from("video_scenes")
      .insert(scenesToInsert)

    if (scenesError) {
      return NextResponse.json(
        { error: scenesError.message },
        { status: 500 },
      )
    }

    if (!generatedVideo) {
      generatedVideo = await insertGeneratedVideoDraft(supabase, {
        userId: user.id,
        title: videoScript.thumbnail_title || resolvedBrandName,
        prompt: String(prompt).trim(),
        videoType: videoScript.style,
        script: videoScript,
        videoProjectId: insertedVideoProject.id,
      })
    } else {
      generatedVideo = await updateGeneratedVideo(supabase, generatedVideo.id, {
        script: videoScript as unknown as Json,
        video_project_id: insertedVideoProject.id,
        video_type: videoScript.style,
        title: videoScript.thumbnail_title || resolvedBrandName,
        status: GENERATED_VIDEO_STATUS.CREATED,
      })
    }

    try {
      await linkGeneratedVideoToProject(
        supabase,
        insertedVideoProject.id,
        generatedVideo.id,
      )
    } catch (linkError) {
      console.warn("GENERATED_VIDEOS_LINK_SKIPPED:", linkError)
    }

    let videoProject = insertedVideoProject
    let contentPost = null
    let calendarUrl: string | null = null

    try {
      const draftResult = await addVideoToCalendar({
        supabase,
        userId: user.id,
        isAdmin: false,
        videoId: insertedVideoProject.id,
      })
      contentPost = draftResult.contentPost
      calendarUrl = draftResult.calendarUrl
      videoProject = draftResult.video
    } catch (draftError) {
      console.error("VIDEO_DRAFT_CREATE_ERROR:", draftError)
    }

    return NextResponse.json({
      success: true,
      generatedVideoId: generatedVideo.id,
      generatedVideo,
      videoProject,
      contentPost,
      calendarUrl,
      script: videoScript,
      workflowId,
      workflow_type,
      workflow_summary,
      workflowIntelligence: {
        workflow_type: workflowMetadata.workflowType,
        workflow_summary: workflowMetadata.workflowSummary,
        sceneCount: workflowMetadata.sceneCount,
        goal: workflowMetadata.goal,
        workflow: workflowMetadata.workflow,
        scenePlans: workflowMetadata.scenePlans.map((scene) => ({
          step: scene.step,
          stepId: scene.stepId,
          feature: scene.featureId,
          text: scene.overlay_text,
          overlay_text: scene.overlay_text,
          visual: scene.cinematicDirection,
          image_prompt: scene.image_prompt,
          ui_focus_area: scene.ui_focus_area,
          cursor_action: scene.cursor_action,
          narration: scene.narration,
          camera_motion: scene.camera_motion,
          transition: scene.transition,
          duration: scene.duration,
          professional_purpose: scene.professional_purpose,
          asset_key: scene.asset_key,
          asset_url: scene.asset_url,
          screenshot_available: scene.screenshot_available,
        })),
        workflowDescription: workflowMetadata.workflowDescription,
      },
    })
  } catch (error) {
    console.error("VIDEO_GENERATE_ERROR:", error)

    const message =
      error instanceof Error ? error.message : "Failed to generate video script"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
