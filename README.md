# Interview Practice App

A Streamlit mock interviewer. Pick a job role, seniority and interviewer style, optionally paste a real job posting, and the model asks one question at a time, gives feedback, and continues. Powered by OpenRouter.

Live runs need an [OpenRouter API key](https://openrouter.ai/keys). Paste it in the sidebar (this browser tab only) or set `OPENROUTER_API_KEY` in `.env` for local use. The key is never written to disk from the UI.

## What it does

- Five prompting techniques you can switch live: zero-shot, few-shot, chain-of-thought, persona, structured output
- Temperature, top-p, penalties, and max reply tokens
- Layered guards: 4,000-character input cap, injection-phrase scan (before any tokens are spent), system-prompt hardening, and fenced job-description text
- **API cost guards:** 20 model replies per browser session, max 2,048 completion tokens per call, no request without a key

## Setup

Python 3.11+ and an OpenRouter key.

```bash
git clone https://github.com/gauravthorath/InterviewPracticeApp.git
cd InterviewPracticeApp
uv sync
cp .env.example .env   # optional if you paste the key in the sidebar
uv run streamlit run app.py
```

Or: `pip install -r requirements.txt` then `streamlit run app.py`.

Opens at `http://localhost:8501`.

This is a Streamlit app, so it does not deploy on Vercel. Run it locally or on Streamlit Community Cloud with secrets, still using the session and token caps above.

## Security

1. Length cap on chat input
2. Injection-phrase scan before the API call
3. System-prompt hardening
4. Job postings treated as untrusted data, fenced, placed *before* the hardening instruction
5. Session reply cap and completion-token cap so a public demo cannot drain a key

## Licence

Use and fork freely for your own interview practice. Do not commit `.env`.
