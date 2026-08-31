# Interview Practice App

A mock interviewer. Pick a job role, seniority and interviewer style, optionally paste a real job posting, and the interviewer asks one question at a time, gives feedback, and continues.

**Public demo (no API key):** [interview-practice-app on Vercel](https://github.com/gauravthorath/InterviewPracticeApp) — fixture replies so you can try the flow. Paste your own [OpenRouter](https://openrouter.ai/keys) key for a live model interview. The key stays in this browser tab.

The Python Streamlit app is still here for local use.

## What it does

- Five prompting techniques you can switch live: zero-shot, few-shot, chain-of-thought, persona, structured output
- Temperature and model (live mode)
- Layered guards: 4,000-character input cap, injection-phrase scan (before any tokens are spent), system-prompt hardening, and fenced job-description text
- **API cost guards:** 20 model replies per session, max 2,048 completion tokens per call, IP rate limit on live runs, no live request without a key

## Web demo (Vercel)

```bash
git clone https://github.com/gauravthorath/InterviewPracticeApp.git
cd InterviewPracticeApp
pnpm install
pnpm dev
```

Opens at `http://localhost:3000`. Demo mode needs no `.env`. Do not set `OPENROUTER_API_KEY` on a public Vercel project.

## Streamlit (local)

Python 3.11+.

```bash
uv sync
cp .env.example .env   # optional if you paste the key in the sidebar
uv run streamlit run app.py
```

Or: `pip install -r requirements.txt` then `streamlit run app.py`. Opens at `http://localhost:8501`.

## Security

1. Length cap on chat input
2. Injection-phrase scan before the API call
3. System-prompt hardening
4. Job postings treated as untrusted data, fenced, placed *before* the hardening instruction
5. Session reply cap, completion-token cap, and live IP rate limit so a public demo cannot drain a key

## Licence

Use and fork freely for your own interview practice. Do not commit `.env`.
