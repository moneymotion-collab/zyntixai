/**
 * ZyntixAI design tokens — dark SaaS shell (coach app).
 * CSS definitions live in `app/globals.css`.
 */

/** Dark-shell form controls */
export const saasInputClass =
  "saas-input w-full min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white shadow-sm outline-none transition placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"

export const saasSelectClass =
  "saas-select w-full min-h-11 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"

export const saasTextareaClass =
  "saas-textarea w-full min-h-24 resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white shadow-sm outline-none transition placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"

export const saasLabelClass = "saas-label mb-2 block text-sm font-medium text-slate-300"

export const saasHelperClass = "saas-helper mt-1.5 text-xs leading-relaxed text-slate-500"

export const saasFieldErrorClass =
  "saas-field-error mt-1.5 text-xs font-medium text-red-300"

export const saasFieldSuccessClass =
  "saas-field-success mt-1.5 text-xs font-medium text-emerald-300"

/** Tables on dark shell */
export const saasTableClass = "saas-table w-full text-left text-sm"

export const saasTableHeadClass =
  "border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"

export const saasTableThClass = "px-5 py-3.5 font-medium sm:px-6 sm:py-4"

export const saasTableRowClass =
  "border-b border-white/5 transition last:border-b-0 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/40"

export const saasTableTdClass = "px-5 py-3.5 sm:px-6 sm:py-4"

/** Chart / analytics panels */
export const saasChartCardClass = "saas-chart-card glass-panel p-5 sm:p-6"

/** Accessible focus ring utility */
export const saasFocusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080f]"
