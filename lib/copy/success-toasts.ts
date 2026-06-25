export type SuccessToastCopy = {
  title: string
  description?: string
}

export const SUCCESS_TOAST = {
  workoutCreated: {
    title: "Workout Created",
    description: "Your workout plan is ready to assign to members.",
  },
  workoutUpdated: {
    title: "Workout Updated",
    description: "Changes to your workout plan have been saved.",
  },
  workoutAssigned: {
    title: "Workout Assigned",
    description: "The member can now see this plan in their portal.",
  },
  workoutAssignmentRemoved: {
    title: "Assignment Removed",
    description: "The workout plan is no longer linked to this member.",
  },
  workoutTemplateSaved: {
    title: "Template Saved",
    description: "Reuse this template when building future workouts.",
  },
  customExerciseCreated: {
    title: "Custom Exercise Created",
    description: "It is now available in your library and workout picker.",
  },
  exerciseAddedToWorkout: {
    title: "Exercise Added to Workout",
    description: "The exercise is now part of your workout plan.",
  },
  memberAdded: {
    title: "Member Added",
    description: "They can now be assigned workouts, nutrition, and sessions.",
  },
  memberDeleted: {
    title: "Member Removed",
    description: "The member has been removed from your roster.",
  },
  nutritionPlanCreated: {
    title: "Nutrition Plan Created",
    description: "Assign it to members from the Nutrition page.",
  },
  nutritionPlanUpdated: {
    title: "Nutrition Plan Updated",
    description: "Your changes have been saved.",
  },
  nutritionAssigned: {
    title: "Nutrition Assigned",
    description: "The member can view their plan in the app.",
  },
  nutritionUnassigned: {
    title: "Nutrition Removed",
    description: "The plan is no longer assigned to this member.",
  },
  sessionScheduled: {
    title: "Session Scheduled",
    description: "The session appears on your calendar and member profile.",
  },
  campaignPublished: {
    title: "Campaign Published",
    description: "Your campaign is live in the publishing pipeline.",
  },
  campaignSaved: {
    title: "Campaign Saved",
    description: "Open it anytime from saved campaigns to refine and publish.",
  },
  campaignGenerated: {
    title: "Campaign Generated",
    description: "Review posts, save the campaign, then schedule or publish.",
  },
  hookLibraryGenerated: {
    title: "Hook Library Ready",
    description: "Copy hooks into reels, ads, or your campaign posts.",
  },
  ctaGeneratorGenerated: {
    title: "CTAs Ready",
    description: "Copy CTA variations into video outros, ads, and landing pages.",
  },
  storyStructureGenerated: {
    title: "Story Structure Ready",
    description: "Use the 7-scene arc in Video Generator or refine each beat.",
  },
  contentIdeasGenerated: {
    title: "Content Ideas Ready",
    description: "Add your favorites to the calendar when you're ready.",
  },
  postAddedToCalendar: {
    title: "Added to Calendar",
    description: "Open the calendar to schedule or publish this post.",
  },
  postScheduled: {
    title: "Post Scheduled",
    description: "It will publish automatically at the scheduled time.",
  },
  postPublished: {
    title: "Post Published",
    description: "Track performance in Marketing Analytics.",
  },
  postApproved: {
    title: "Post Approved",
    description: "Ready to schedule or publish from the pipeline.",
  },
  postImproved: {
    title: "Post Improved",
    description: "AI suggestions have been applied to this content.",
  },
  postOptimized: {
    title: "Optimization Applied",
    description: "The optimized version is now active for this post.",
  },
  videoAddedToCalendar: {
    title: "Video Added to Calendar",
    description: "Review the draft in Scheduled before publishing.",
  },
  brandSaved: {
    title: "Brand Profile Saved",
    description: "Marketing AI will use your updated brand context.",
  },
  checkInSubmitted: {
    title: "Check-in Submitted",
    description: "Wellness data will update health scores and insights.",
  },
  progressPhotoUploaded: {
    title: "Photo Uploaded",
    description: "The progress photo is saved and ready to compare.",
  },
  clientNoteCreated: {
    title: "Note Saved",
    description: "The coaching note is added to this member profile.",
  },
  clientNoteUpdated: {
    title: "Note Updated",
    description: "Pin status and note order have been refreshed.",
  },
  clientNoteDeleted: {
    title: "Note Deleted",
    description: "The coaching note has been removed.",
  },
  clientReminderCreated: {
    title: "Reminder Saved",
    description: "The reminder is active on this member profile.",
  },
  clientReminderUpdated: {
    title: "Reminder Updated",
    description: "Reminder status has been refreshed.",
  },
  clientReminderDeleted: {
    title: "Reminder Deleted",
    description: "The reminder has been removed.",
  },
  habitLogged: {
    title: "Habit Logged",
    description: "The habit entry is saved and reflected in reminders and timeline.",
  },
  coachNotesSaved: {
    title: "Coach Notes Saved",
    description: "Notes are visible on the member profile and reports.",
  },
  intakeSummarySaved: {
    title: "Intake Summary Saved",
    description: "The intake overview is updated on this member profile.",
  },
  profileSaved: {
    title: "Profile Saved",
    description: "Member details have been updated.",
  },
  progressLogged: {
    title: "Progress Logged",
    description: "Charts and coaching insights will reflect this entry.",
  },
  postScored: {
    title: "Post Scored",
    description: "Viral score and engagement insights are ready.",
  },
  similarPostGenerated: {
    title: "Similar Post Generated",
    description: "Review the draft in your publishing pipeline.",
  },
  analyticsSynced: {
    title: "Analytics Synced",
    description: "Performance metrics are up to date for this post.",
  },
  instagramPublished: {
    title: "Published to Instagram",
    description: "Track reach and engagement in Marketing Analytics.",
  },
  goalCreated: {
    title: "Goal Created",
    description: "Track milestones and deadlines from the progress dashboard.",
  },
  memberTargetsSaved: {
    title: "Targets Saved",
    description: "Nutrition targets are updated for this member.",
  },
  memberPlanSaved: {
    title: "Plan Saved",
    description: "Workout and nutrition plan preferences are updated.",
  },
  videoImagesGenerated: {
    title: "Scene Images Ready",
    description: "Review visuals before rendering your final video.",
  },
  videoVoiceoverGenerated: {
    title: "Voiceover Ready",
    description: "Preview audio before completing the video render.",
  },
  videoScheduled: {
    title: "Video Scheduled",
    description: "It will publish automatically at the scheduled time.",
  },
  postsSentToScheduler: {
    title: "Posts Sent to Scheduler",
    description: "Open the calendar to review and publish.",
  },
  gymSettingsSaved: {
    title: "Gym Settings Saved",
    description: "Your workspace preferences have been updated.",
  },
  instagramConnectionSaved: {
    title: "Instagram Connected",
    description: "Publishing and analytics will use this connection.",
  },
  workoutCompleted: {
    title: "Workout Completed",
    description: "Great work — your progress has been logged.",
  },
  videoScriptGenerated: {
    title: "Video Script Ready",
    description: "Review scenes and generate visuals when ready.",
  },
  postsCleared: {
    title: "Posts Cleared",
    description: "Your publishing pipeline has been reset.",
  },
  sessionRescheduled: {
    title: "Session Rescheduled",
    description: "The updated time is reflected on your calendar.",
  },
  sessionNoteSaved: {
    title: "Session Note Saved",
    description: "Notes are visible on the session and member profile.",
  },
  conversationCleared: {
    title: "Conversation Cleared",
    description: "Start a fresh thread with Marketing Coach.",
  },
  demoDataGenerated: {
    title: "Demo Data Ready",
    description: "Explore the workspace with sample members and content.",
  },
  demoDataCleared: {
    title: "Demo Data Removed",
    description: "Sample data has been cleared from your workspace.",
  },
} as const satisfies Record<string, SuccessToastCopy>

export type SuccessToastKey = keyof typeof SUCCESS_TOAST

export function successToast(
  key: SuccessToastKey,
  overrides?: Partial<SuccessToastCopy>,
): SuccessToastCopy {
  return { ...SUCCESS_TOAST[key], ...overrides }
}
