"use client";

import { useState } from "react";
import { demoReply } from "@/lib/demo";
import { blockedReason } from "@/lib/guards";
import {
  MAX_COMPLETION_TOKENS,
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_TURNS_PER_SESSION,
  MODELS,
  PERSONAS,
  ROLES,
  SENIORITIES,
  TECHNIQUES,
  type ChatMessage,
  type InterviewSettings,
  type Persona,
  type Seniority,
  type Technique,
} from "@/lib/types";

const defaultSettings = (): InterviewSettings => ({
  role: "Backend Developer",
  seniority: "Mid-level",
  persona: "Friendly Coach",
  technique: "Zero-shot",
  jobDescription: "",
  model: MODELS[0],
  temperature: 0.7,
  topP: 1,
  maxTokens: 2048,
});

export const InterviewApp = () => {
  const [settings, setSettings] = useState<InterviewSettings>(defaultSettings);
  const [customRole, setCustomRole] = useState("");
  const [visitorKey, setVisitorKey] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const live = visitorKey.startsWith("sk-or-");
  const role =
    settings.role === "Custom…" ? customRole.trim() || "Backend Developer" : settings.role;
  const active: InterviewSettings = { ...settings, role };
  const turns = messages.filter((m) => m.role === "assistant").length;

  const ask = async (nextMessages: ChatMessage[]) => {
    if (turns >= MAX_TURNS_PER_SESSION) {
      setError(
        `This session hit the ${MAX_TURNS_PER_SESSION}-reply limit. Start a new interview.`,
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (!live) {
        const reply = demoReply(
          active,
          turns,
          nextMessages.at(-1)?.role === "user"
            ? nextMessages.at(-1)?.content ?? null
            : null,
        );
        setMessages([...nextMessages, { role: "assistant", content: reply }]);
        return;
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openrouter-key": visitorKey,
        },
        body: JSON.stringify({ messages: nextMessages, settings: active }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "The interviewer could not respond.");
      }
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const startInterview = () => {
    setMessages([]);
    void ask([]);
  };

  const send = () => {
    const text = draft.trim();
    if (!text || busy) return;
    const blocked = blockedReason(text);
    if (blocked) {
      setError(blocked);
      return;
    }
    setDraft("");
    void ask([...messages, { role: "user", content: text }]);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <p className="brand">Interview practice</p>
        <h1>One question. Then feedback.</h1>
        <div className={live ? "banner live" : "banner"}>
          {live
            ? "Live mode: your OpenRouter key stays in this tab and is sent only as a request header."
            : "Demo mode — no API key, no model calls. Paste an OpenRouter key below for a live interview."}
        </div>

        <label htmlFor="or-key">OpenRouter key (optional)</label>
        <input
          id="or-key"
          type="password"
          autoComplete="off"
          placeholder="sk-or-v1-…"
          value={visitorKey}
          onChange={(e) => setVisitorKey(e.target.value.trim())}
        />
        <p className="hint">
          {MAX_TURNS_PER_SESSION} replies/session · max {MAX_COMPLETION_TOKENS}{" "}
          tokens · live runs capped per IP
        </p>

        <label htmlFor="role">Job role</label>
        <select
          id="role"
          value={ROLES.includes(settings.role as (typeof ROLES)[number]) ? settings.role : "Custom…"}
          onChange={(e) => setSettings((s) => ({ ...s, role: e.target.value }))}
        >
          {ROLES.map((item) => (
            <option key={item}>{item}</option>
          ))}
          <option>Custom…</option>
        </select>
        {settings.role === "Custom…" && (
          <input
            style={{ marginTop: 8 }}
            placeholder="e.g. DevOps Engineer"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
          />
        )}

        <label htmlFor="seniority">Seniority</label>
        <select
          id="seniority"
          value={settings.seniority}
          onChange={(e) =>
            setSettings((s) => ({ ...s, seniority: e.target.value as Seniority }))
          }
        >
          {SENIORITIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <label htmlFor="persona">Interviewer style</label>
        <select
          id="persona"
          value={settings.persona}
          onChange={(e) =>
            setSettings((s) => ({ ...s, persona: e.target.value as Persona }))
          }
        >
          {PERSONAS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <label htmlFor="jd">Job description (optional)</label>
        <textarea
          id="jd"
          maxLength={MAX_JOB_DESCRIPTION_CHARS}
          placeholder="Paste a posting and questions will target its stack…"
          value={settings.jobDescription}
          onChange={(e) =>
            setSettings((s) => ({ ...s, jobDescription: e.target.value }))
          }
        />

        <details>
          <summary>Advanced settings</summary>
          <label htmlFor="technique">Prompt technique</label>
          <select
            id="technique"
            value={settings.technique}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                technique: e.target.value as Technique,
              }))
            }
          >
            {TECHNIQUES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <label htmlFor="model">Model</label>
          <select
            id="model"
            value={settings.model}
            onChange={(e) => setSettings((s) => ({ ...s, model: e.target.value }))}
          >
            {MODELS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <label htmlFor="temp">Temperature {settings.temperature.toFixed(1)}</label>
          <input
            id="temp"
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature}
            onChange={(e) =>
              setSettings((s) => ({ ...s, temperature: Number(e.target.value) }))
            }
          />
        </details>

        <button className="btn" type="button" onClick={startInterview} disabled={busy}>
          {messages.length ? "Start new interview" : "Begin interview"}
        </button>
      </aside>

      <main className="main">
        <div className="thread">
          {messages.length === 0 && (
            <p className="empty">
              Pick a role and style, then begin. Without a key you get a scripted
              interviewer so you can try the flow. With a key, every reply is a
              real model call.
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={`${msg.role}-${i}`} className={`msg ${msg.role}`}>
              {msg.content}
            </div>
          ))}
        </div>
        {error && <p className="warn">{error}</p>}
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            value={draft}
            disabled={busy || messages.length === 0}
            placeholder={
              messages.length === 0 ? "Begin the interview first…" : "Your answer…"
            }
            onChange={(e) => setDraft(e.target.value)}
          />
          <button className="btn" type="submit" disabled={busy || messages.length === 0}>
            {busy ? "Thinking…" : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
};
