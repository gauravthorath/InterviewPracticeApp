# Interview Practice App 🎤

A Streamlit chatbot that runs a **mock job interview** with you. Pick a job role, seniority and interviewer style in the sidebar (optionally paste a real job posting), and the AI interviewer asks one question at a time, gives feedback on each answer, and moves on to the next like a real interview, but with instant coaching. Powered by OpenAI GPT-5 models via the OpenRouter API.

## Features → course requirements

### Core requirements


| Requirement                                                | Where it is implemented                                                                                                                                                                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **≥5 system prompts using different prompting techniques** | The `TECHNIQUES` dict in `app.py`: **Zero-shot**, **Few-shot**, **Chain-of-thought**, **Persona (role-prompting)** and **Structured output**. Switch between them live via *Advanced settings → Prompt technique* to compare behaviour. |
| **Tune ≥1 OpenAI setting**                                 | *Advanced settings* exposes **temperature, top-p, frequency penalty, presence penalty and max reply tokens**, all wired into every API call.                                                                                            |
| **≥1 security guard against misuse**                       | Three layered guards: an input **length cap** (4,000 chars), an **injection-phrase scan** (both run *before* the API call, so blocked input costs nothing), and **system-prompt hardening** appended to every technique.                |




### Optional tasks (target: ≥2 Medium + ≥1 Hard)


| Task                                                                | Where it is implemented                                                                                                                                               |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hard #1** — full chatbot instead of a one-time call               | Multi-turn chat via `st.chat_input` + `st.session_state`; the full history is resent on every call (the API is stateless).                                            |
| **Medium #1** — model settings as UI controls                       | The five sliders + model selector in *Advanced settings*.                                                                                                             |
| **Medium #6** — job-description field folded into the system prompt | Sidebar `st.text_area`; the pasted posting is fenced as untrusted *data* inside the system prompt so questions target its skills and tech stack (see Security below). |
| **Easy #7** — interviewer personas                                  | *Interviewer style* chips: Friendly Coach / Neutral Professional / Tough Bar-Raiser.                                                                                  |




## Setup & run

Requires **Python 3.11+** and an [OpenRouter API key](https://openrouter.ai/keys).

### With uv (recommended)

```bash
git clone <this-repo-url>
cd InterviewPracticeApp
uv sync                      # creates .venv and installs pinned dependencies
cp .env.example .env         # then edit .env and paste your real OpenRouter key
uv run streamlit run app.py
```



### With pip

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # then edit .env and paste your real OpenRouter key
streamlit run app.py
```

The app opens at `http://localhost:8501`. If you see a *"Missing OPENROUTER_API_KEY"*
error, your `.env` isn't set up — the app refuses to start without a key rather than
crash mid-conversation.

## How to use it

1. In the sidebar, pick a **job role** (or choose *Custom…* and type your own),
  **seniority** and **interviewer style**.
2. Optionally paste a **job description** — questions will target that specific posting.
3. Type your answer in the chat box; the interviewer gives feedback and asks the next question.
4. Open **⚙️ Advanced settings** to switch prompting technique, model, or sampling settings.
5. **🔄 Start new interview** clears the conversation (changing sidebar settings mid-interview
  affects the *next* reply, since the system prompt is rebuilt on every call).



## Security guards

Defense in depth — each layer is weak alone, together they stop casual misuse:

1. **Length cap** (4,000 chars) on chat input — blocks paste-bombs before any tokens are spent.
2. **Injection-phrase scan** — known attack phrases ("ignore previous instructions",
  "reveal your system prompt", …) are refused client-side.
3. **System-prompt hardening** — every technique's prompt ends with an instruction to stay
  in the interviewer role and decline instruction changes.
4. **Job-description fencing** — pasted postings go into the system prompt as explicitly
  *untrusted data* inside `--- JOB POSTING ---` delimiters, capped at 6,000 chars, with the
   hardening instruction placed *after* the posting so it gets the last word.



## Design decisions & assumptions

- **OpenRouter instead of the OpenAI API directly** — one key reaches all course-allowed
models (`openai/gpt-5-mini` default, `gpt-5-nano` cheaper, `gpt-5` stronger), and the
official `openai` Python client works unchanged by pointing `base_url` at OpenRouter.
- **Secrets stay out of git** — the key lives in `.env` (gitignored); `.env.example`
documents the expected variable. Assumes the reviewer supplies their own funded OpenRouter key.
- **Session state is per browser tab and in-memory** — refreshing the page or restarting
the server clears the conversation. No persistence layer, by design, for a practice tool.
- **Prompting techniques are hot-swappable mid-conversation** — the system prompt is rebuilt from the sidebar on every call, which is deliberate: it allows to A/B test the five techniques inside one conversation.
- **English-language interviews assumed** — the injection scan is a lowercase English
substring match.



## Known limitations (and what I'd improve next)

- The keyword-based injection scan is bypassable by paraphrasing, other languages, or
encodings — the next step would be an LLM-based moderation pass on each input.
- Costs are not shown in the UI; surfacing per-turn token cost from `response.usage`
(Medium #3) would make the pricing of long interviews visible.
- Question difficulty is only controlled indirectly through seniority; an explicit
Easy/Medium/Hard selector would make it a first-class setting.
- Reasoning models spend part of the `max_tokens` budget thinking, so setting the
"Max reply tokens" slider very low can produce empty-looking replies.

