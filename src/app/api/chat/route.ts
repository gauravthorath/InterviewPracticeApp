import { NextResponse } from "next/server";
import { blockedReason } from "@/lib/guards";
import { assertLiveRunBudget, clientIp, readVisitorKey } from "@/lib/http";
import { systemPrompt } from "@/lib/prompts";
import {
  MAX_COMPLETION_TOKENS,
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_TURNS_PER_SESSION,
  type ChatMessage,
  type InterviewSettings,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

type Body = {
  messages?: ChatMessage[];
  settings?: InterviewSettings;
};

export async function POST(req: Request) {
  try {
    const visitorKey = readVisitorKey(req);
    const serverKey = process.env.OPENROUTER_API_KEY?.trim();
    const apiKey = visitorKey || serverKey;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No OpenRouter key. Paste one in settings for a live interview, or stay in demo mode.",
        },
        { status: 400 },
      );
    }

    assertLiveRunBudget(clientIp(req), !visitorKey && Boolean(serverKey));

    const body = (await req.json()) as Body;
    const settings = body.settings;
    const messages = body.messages ?? [];
    if (!settings) {
      return NextResponse.json({ error: "Missing settings." }, { status: 400 });
    }
    if (messages.length > MAX_TURNS_PER_SESSION * 2) {
      return NextResponse.json(
        { error: `Session hit the ${MAX_TURNS_PER_SESSION}-reply limit.` },
        { status: 429 },
      );
    }
    if ((settings.jobDescription ?? "").length > MAX_JOB_DESCRIPTION_CHARS) {
      return NextResponse.json(
        { error: "Job description is too long." },
        { status: 400 },
      );
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      const blocked = blockedReason(lastUser.content);
      if (blocked) {
        return NextResponse.json({ error: blocked }, { status: 400 });
      }
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/gauravthorath/InterviewPracticeApp",
        "X-Title": "Interview Practice App",
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: "system", content: systemPrompt(settings) },
          ...messages,
        ],
        temperature: settings.temperature,
        top_p: settings.topP,
        max_tokens: Math.min(settings.maxTokens, MAX_COMPLETION_TOKENS),
      }),
    });

    const data = (await res.json()) as {
      error?: { message?: string };
      choices?: { message?: { content?: string } }[];
    };
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || `OpenRouter returned ${res.status}` },
        { status: res.status === 429 ? 429 : 502 },
      );
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "Empty model reply. Raise max tokens and try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ reply, mock: false });
  } catch (err) {
    const status = (err as { status?: number }).status === 429 ? 429 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Interview request failed." },
      { status },
    );
  }
}
