/**
 * ZyntixAI — global light-surface typography & form tokens.
 * Styles live in `app/globals.css`.
 */
export const fitcoreInputClass = "fitcore-input"
export const fitcoreSelectClass = "fitcore-select"
export const fitcoreTextareaClass = "fitcore-textarea"
export const fitcoreLabelClass = "fitcore-label block mb-2"
export const fitcoreCardClass = "fitcore-card"
export const fitcoreMutedClass = "fitcore-muted"
export const fitcoreHeadingClass = "fitcore-heading"
export const fitcoreSurfaceClass = "fitcore-surface"
export const fitcoreTextClass = "fitcore-text"
export const fitcoreBtnPrimaryClass = "fitcore-btn-primary"
export const fitcoreBtnSecondaryClass = "fitcore-btn-secondary"

/** @deprecated Use `fitcoreInputClass` */
export const premiumInputClass = fitcoreInputClass
/** @deprecated Use `fitcoreSelectClass` */
export const premiumSelectClass = fitcoreSelectClass
/** @deprecated Use `fitcoreTextareaClass` */
export const premiumTextareaClass = fitcoreTextareaClass

export {
  saasInputClass,
  saasSelectClass,
  saasTextareaClass,
  saasLabelClass,
  saasHelperClass,
  saasFieldErrorClass,
  saasFieldSuccessClass,
} from "@/lib/ui/saas-tokens"
