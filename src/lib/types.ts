export const ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Data Analyst",
  "Data Scientist",
  "Product Manager",
] as const;

export const SENIORITIES = ["Junior", "Mid-level", "Senior"] as const;

export const PERSONAS = [
  "Friendly Coach",
  "Neutral Professional",
  "Tough Bar-Raiser",
] as const;

export const TECHNIQUES = [
  "Zero-shot",
  "Few-shot",
  "Chain-of-thought",
  "Persona (role-prompting)",
  "Structured output",
] as const;

export const MODELS = [
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "openai/gpt-5",
] as const;

export const MAX_TURNS_PER_SESSION = 20;
export const MAX_COMPLETION_TOKENS = 2048;
export const MAX_INPUT_CHARS = 4000;
export const MAX_JOB_DESCRIPTION_CHARS = 6000;

export type Role = (typeof ROLES)[number] | string;
export type Seniority = (typeof SENIORITIES)[number];
export type Persona = (typeof PERSONAS)[number];
export type Technique = (typeof TECHNIQUES)[number];

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type InterviewSettings = {
  role: string;
  seniority: Seniority;
  persona: Persona;
  technique: Technique;
  jobDescription: string;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
};
