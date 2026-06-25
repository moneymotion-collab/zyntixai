import type { MarketingCoachContext } from "@/lib/marketing/coach/load-marketing-coach-context"

type MarketingTopic =
  | "gym"
  | "trainer"
  | "online"
  | "social"
  | "leads"
  | "offers"
  | "funnels"
  | "retention"
  | "general"

function detectTopic(message: string): MarketingTopic {
  const lower = message.toLowerCase()

  if (/\b(gym|fitness center|studio|membership)\b/.test(lower)) return "gym"
  if (/\b(personal trainer|pt\b|1-on-1|one on one)\b/.test(lower)) return "trainer"
  if (/\b(online coach|remote|program|cohort|course)\b/.test(lower)) return "online"
  if (/\b(tiktok|instagram|reels|shorts|social media|followers|viral)\b/.test(lower))
    return "social"
  if (/\b(lead|leads|dm|outreach|prospect|booking)\b/.test(lower)) return "leads"
  if (/\b(offer|pricing|package|guarantee|promo)\b/.test(lower)) return "offers"
  if (/\b(funnel|landing page|webinar|challenge|nurture)\b/.test(lower)) return "funnels"
  if (/\b(retention|churn|upsell|renewal|check-in)\b/.test(lower)) return "retention"

  return "general"
}

const TOPIC_PLAYBOOKS: Record<MarketingTopic, string> = {
  gym: `**Gym marketing playbook**

1. **Local hook** — Run a "7-day trial + body scan" offer with a deadline; promote with before/after member stories.
2. **Proof loop** — Film 15s Reels at peak hours: busy floor, coach cues, member wins (with permission).
3. **Referral engine** — "Bring a friend" week: both get a free week when the friend signs up.
4. **CTA** — "DM TRIAL" or book via link in bio; follow up within 2 hours.`,

  trainer: `**Personal trainer marketing playbook**

1. **Positioning** — Pick one niche (e.g. busy professionals, postpartum, strength). Lead every post with that outcome.
2. **Content** — 3 pillars: client transformation, myth-busting education, behind-the-scenes coaching.
3. **Lead magnet** — Free "form check" or 20-min strategy call; qualify with a 3-question DM script.
4. **Offer** — 12-week package with weekly check-ins + nutrition basics; anchor price, show payment plans.`,

  online: `**Online coaching playbook**

1. **Program clarity** — One flagship offer (8–12 weeks) with weekly calls, app check-ins, and a community channel.
2. **Funnel** — Free challenge (5–7 days) → application → sales call → onboarding sequence.
3. **Content** — Teach one framework per week on Shorts/Reels; CTA to join the challenge.
4. **Retention** — Alumni tier, monthly Q&A, and win celebrations to reduce churn after week 8.`,

  social: `**Social media growth playbook**

1. **Format** — 3 posts/week: 1 transformation, 1 hot take, 1 how-to (filmable in under 60s).
2. **Hooks** — Open with tension: "Stop doing X if you want Y" or POV client moments.
3. **Distribution** — Repurpose every win across TikTok + Reels; test 2 hooks per idea.
4. **CTA** — Comment keyword → auto-DM or link to lead magnet; track which hook drives DMs.`,

  leads: `**Lead generation playbook**

1. **Magnet** — Free audit, meal plan sample, or 7-day challenge aligned to your niche.
2. **Outbound** — 10 targeted DMs/day to engaged followers; personalize line 1, offer line 2.
3. **Landing** — Single page: headline, 3 bullets, social proof, calendar embed.
4. **Follow-up** — 3-touch sequence: instant resource → day-2 case study → day-4 scarcity invite.`,

  offers: `**Offer design playbook**

1. **Outcome** — Name the transformation in 8 words or fewer (e.g. "Lose 8kg in 12 weeks without cardio").
2. **Stack** — Core delivery + bonuses (nutrition guide, form checks, community) with stated value.
3. **Risk reversal** — Guarantee aligned to behavior (show up + log meals = results or extra coaching).
4. **Urgency** — Cohort cap or bonus deadline; never fake scarcity.`,

  funnels: `**Funnel playbook**

1. **Top** — Short-form content → lead magnet (challenge or guide).
2. **Middle** — Email/DM nurture: story, proof, objection handling (time, price, skepticism).
3. **Bottom** — Application or call; close with one clear package.
4. **Onboard** — Welcome video + week-1 win within 48 hours to reduce buyer's remorse.`,

  retention: `**Retention playbook**

1. **Early wins** — Week-1 milestone + public shout-out (opt-in) to cement commitment.
2. **Rhythm** — Weekly check-in template: wins, struggles, next focus.
3. **Community** — Monthly challenge or leaderboard for members/clients.
4. **Upsell** — At day 60, offer maintenance or advanced tier before they plateau.`,

  general: `**Quick growth priorities**

1. **Clarify ICP** — Who you serve, their #1 pain, and the promise you can prove in 90 days.
2. **One channel** — Master TikTok or Instagram Reels before spreading thin.
3. **One offer** — Single flagship package with a clear CTA everywhere.
4. **Measure** — Track leads/week, show rate, close rate, and 90-day retention.`,
}

function formatBusinessSnapshot(context: MarketingCoachContext | null): string {
  if (!context) return ""

  const lines: string[] = []

  if (context.brand?.name?.trim()) {
    lines.push(`**Your brand:** ${context.brand.name}`)
    if (context.brand.niche?.trim()) {
      lines.push(`**Niche:** ${context.brand.niche}`)
    }
    if (context.brand.goals?.trim()) {
      lines.push(`**Goals:** ${context.brand.goals}`)
    }
  }

  if (context.marketingSettings?.business_goal?.trim()) {
    lines.push(`**Business goal:** ${context.marketingSettings.business_goal}`)
  }

  if (context.marketingSettings?.preferred_platform?.trim()) {
    lines.push(`**Platform:** ${context.marketingSettings.preferred_platform}`)
  }

  if (context.contentPerformance.length > 0) {
    const totalViews = context.contentPerformance.reduce((s, r) => s + r.views, 0)
    lines.push(
      `**Performance:** ${context.contentPerformance.length} posts tracked, ${totalViews.toLocaleString()} total views`,
    )
  }

  if (context.recentPosts.length > 0) {
    const latest = context.recentPosts[0]
    const title = latest.title?.trim() || latest.topic?.trim() || "Untitled"
    lines.push(`**Latest content:** "${title}" (${latest.status}, ${latest.platform})`)
  }

  if (lines.length === 0) return ""

  return `${lines.join("\n")}\n\n`
}

export function generateStrategyFallbackResponse(
  userMessage: string,
  context: MarketingCoachContext | null = null,
): string {
  const topic = detectTopic(userMessage)
  const playbook = TOPIC_PLAYBOOKS[topic]
  const snapshot = formatBusinessSnapshot(context)

  const analysisNote = snapshot
    ? snapshot.trim()
    : "Limited business data on file — complete your brand profile and marketing settings for more tailored advice."

  return `*Strategy mode — AI provider unavailable. Structured guidance based on your question and available business data.*

## 1. Analysis
${analysisNote}
Your question maps to **${topic.replace("_", " ")}** growth. The playbook below is prioritized for gyms, personal trainers, and online coaches.

## 2. Recommendations
${playbook}

## 3. Action Plan
1. **Today** — Pick one recommendation above and draft the hook, CTA, and channel.
2. **This week** — Publish or schedule 2–3 pieces aligned to your preferred platform.
3. **Track** — Log views, DMs, and leads so the next session uses real performance data.

## 4. Expected Outcome
If you execute for 7 days: more qualified conversations, clearer positioning, and a repeatable content-to-lead loop — measurable via DMs, saves, and trial sign-ups.

---
*Tip: Add OPENAI_API_KEY to .env.local for fully personalized FitCore AI coaching.*`
}
