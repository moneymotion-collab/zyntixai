export type LandingFaqItem = {
  id: string
  question: string
  answer: string
}

export const LANDING_FAQ_ITEMS: readonly LandingFaqItem[] = [
  {
    id: "what-is-fitcore-ai",
    question: "What is FitCore AI?",
    answer:
      "FitCore AI is an all-in-one coaching platform that helps fitness professionals manage clients, build workouts and nutrition plans, track progress, and grow their business with AI-powered marketing tools — from a single dashboard.",
  },
  {
    id: "who-is-it-for",
    question: "Who is FitCore AI for?",
    answer:
      "FitCore AI is built for personal trainers, online coaches, gym owners, and growing fitness businesses that want to run client delivery and marketing without juggling multiple apps.",
  },
  {
    id: "workout-programming",
    question: "Does FitCore AI include workout programming?",
    answer:
      "Yes. You can build and assign training plans, use workout templates, and work with a full exercise library including custom exercises, search, filters, and exercise instructions.",
  },
  {
    id: "nutrition-planning",
    question: "Does FitCore AI include nutrition planning?",
    answer:
      "Yes. Create and assign nutrition plans for clients, manage meal guidance, and keep nutrition coaching alongside workouts and progress in one workflow.",
  },
  {
    id: "client-progress",
    question: "Can I track client progress?",
    answer:
      "Yes. Track weight trends, progress photos, check-ins, habits, and goals from a dedicated progress dashboard so you always know how clients are doing.",
  },
  {
    id: "marketing-ai",
    question: "Does FitCore AI include Marketing AI?",
    answer:
      "Yes. Marketing AI helps you generate content ideas, plan your calendar, analyze performance, and create video content. It is included on the Pro plan and above.",
  },
  {
    id: "instagram-publishing",
    question: "Can I publish content to Instagram?",
    answer:
      "Yes. FitCore AI supports Instagram publishing as part of the marketing workflow — draft content, schedule posts, and track results from your marketing dashboard.",
  },
  {
    id: "credit-card",
    question: "Do I need a credit card to start?",
    answer:
      "No. You can start your 7-day free trial by creating an account — no credit card required. You only add payment details when you choose a paid plan from your dashboard.",
  },
  {
    id: "free-trial",
    question: "How does the 7-day free trial work?",
    answer:
      "Sign up as a coach and get full platform access for 7 days. Explore client management, workouts, nutrition, progress tracking, and marketing tools. When you're ready, pick a plan that fits your business.",
  },
  {
    id: "cancel-anytime",
    question: "Can I cancel anytime?",
    answer:
      "Yes. Paid subscriptions can be cancelled anytime. There are no long-term contracts — you're always in control of your plan.",
  },
  {
    id: "demo-workspace",
    question: "Can I try the demo workspace first?",
    answer:
      "Yes. Choose Try Demo Workspace to create a coach account with a fully populated demo environment — sample clients, workouts, marketing content, and more — so you can explore before committing.",
  },
  {
    id: "online-coaches-gyms",
    question: "Is FitCore AI suitable for online coaches and gyms?",
    answer:
      "Absolutely. Online coaches use FitCore AI to deliver remote programming, nutrition, and check-ins at scale. Gym owners and multi-coach teams can use the Agency plan for team management and shared workflows.",
  },
] as const
