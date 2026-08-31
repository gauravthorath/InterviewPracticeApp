import { MAX_INPUT_CHARS } from "./types";

const INJECTION_PATTERNS = [
  "ignore previous instructions",
  "ignore all previous",
  "disregard previous",
  "disregard all previous",
  "forget your instructions",
  "forget you are",
  "you are now",
  "reveal your system prompt",
  "system prompt",
  "developer mode",
  "jailbreak",
];

export const blockedReason = (text: string) => {
  if (text.length > MAX_INPUT_CHARS) {
    return `That message is ${text.length.toLocaleString()} characters; the limit is ${MAX_INPUT_CHARS.toLocaleString()}. Please shorten it.`;
  }
  const lowered = text.toLowerCase();
  if (INJECTION_PATTERNS.some((pattern) => lowered.includes(pattern))) {
    return "That looks like an attempt to change the interviewer's instructions, so I didn't send it. Please just answer the question.";
  }
  return null;
};
