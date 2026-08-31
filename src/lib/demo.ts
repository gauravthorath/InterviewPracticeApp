import type { InterviewSettings } from "./types";

const QUESTIONS: Record<string, string[]> = {
  "Backend Developer": [
    "Walk me through how you would design a REST API for creating and listing orders.",
    "How would you handle retries and idempotency if a payment webhook fires twice?",
    "What is the difference between a process-level lock and a database unique constraint here?",
    "How would you observe this service in production — which three signals matter first?",
  ],
  "Frontend Developer": [
    "A list of 10,000 rows janks while scrolling. How do you diagnose and fix it?",
    "The API streams incomplete JSON. Why might the React UI crash, and what do you change?",
    "How do you keep client state consistent across two pages that share the same user object?",
    "When would you skip a client-side cache and go straight to the network?",
  ],
  "Data Analyst": [
    "A dashboard shows a 30% drop in conversions this week. How do you investigate?",
    "What is the difference between a ratio of averages and an average of ratios here?",
    "How would you explain a confidence interval to a product manager who wants a yes/no?",
    "Which chart would you *not* use for this, and why?",
  ],
  "Data Scientist": [
    "Your classifier is 94% accurate and still useless in production. What happened?",
    "How would you split data so leakage does not inflate the offline score?",
    "When is a simple logistic regression the right ship, not a larger model?",
    "How do you decide the metric that actually matches the business cost of errors?",
  ],
  "Product Manager": [
    "Two stakeholders want opposite roadmaps. How do you decide what ships this quarter?",
    "A feature is loved in interviews and unused after launch. What do you do next?",
    "How do you write an acceptance criterion that an engineer can test without you?",
    "When would you kill a project that is already 70% built?",
  ],
};

const fallback = [
  "Tell me about a hard problem you recently shipped and how you knew it worked.",
  "What would you do in the first 30 days in this role?",
  "Describe a disagreement you had with a teammate and how it ended.",
  "What do you want to get better at this year, and how will we measure it?",
];

const tone = (persona: string, encouraging: string, flat: string, hard: string) => {
  if (persona === "Friendly Coach") return encouraging;
  if (persona === "Tough Bar-Raiser") return hard;
  return flat;
};

export const demoReply = (
  settings: InterviewSettings,
  turnIndex: number,
  userText: string | null,
) => {
  const bank = QUESTIONS[settings.role] ?? fallback;
  const next = bank[turnIndex % bank.length];
  const jd = settings.jobDescription.trim()
    ? " I am steering this toward the posting you pasted."
    : "";

  if (!userText) {
    return tone(
      settings.persona,
      `Welcome — I will keep this practical and coaching-oriented.${jd} First question: ${next}`,
      `We will keep this to one question at a time.${jd} First question: ${next}`,
      `I will not lower the bar.${jd} First question: ${next}`,
    );
  }

  const snippet = userText.trim().slice(0, 80) || "that";
  const feedback = tone(
    settings.persona,
    `Solid start on "${snippet}". Push one level deeper: name a constraint, a failure mode, or a metric so I can hear how you think, not only what you know.`,
    `Noted. Strengthen the answer with a concrete example and the trade-off you rejected.`,
    `Too thin. A ${settings.seniority} ${settings.role} should already have numbers, failure modes, and a decision. Try again with evidence.`,
  );

  if (settings.technique === "Structured output") {
    const score = userText.trim().length > 120 ? 3 : 2;
    return `**Feedback:** ${feedback}\n**Score:** ${score}/5\n**Next question:** ${next}`;
  }

  if (settings.technique === "Chain-of-thought") {
    return `(Checking correctness, depth for ${settings.seniority}, and clarity.) ${feedback} Next: ${next}`;
  }

  return `${feedback} Next question: ${next}`;
};
