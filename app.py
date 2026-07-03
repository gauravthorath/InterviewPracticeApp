import os

import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI

# Load OPENROUTER_API_KEY from the (gitignored) .env file into the
# process environment. Keys live in .env — never in code — because
# public GitHub repos are scraped for secrets within minutes of a push.
load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

st.title("Interview Practice 🎤")

if not API_KEY:
    st.error(
        "Missing OPENROUTER_API_KEY. Copy `.env.example` to `.env` and add "
        "your key from https://openrouter.ai/keys, then reload."
    )
    st.stop()  # halt the script here — nothing below runs without a key

# OpenRouter clones the OpenAI API shape, so the official openai client
# works as-is — we only point base_url at OpenRouter.
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=API_KEY)
MODEL = "openai/gpt-5-mini"

# --- Sidebar: interview configuration -------------------------------------
# Convention: sidebar = settings, main area = the conversation itself.
with st.sidebar:
    st.header("Interview setup")

    ROLES = [
        "Backend Developer",
        "Frontend Developer",
        "Data Analyst",
        "Data Scientist",
        "Product Manager",
        "Custom…",
    ]
    role = st.selectbox("Job role", ROLES)
    if role == "Custom…":
        # Conditional UI: this text input only exists while "Custom…" is
        # selected — the `if` re-decides on every rerun.
        role = st.text_input("Enter your job role", placeholder="e.g. DevOps Engineer")

    seniority = st.selectbox("Seniority", ["Junior", "Mid-level", "Senior"])

    persona = st.selectbox(
        "Interviewer style",
        ["Friendly Coach", "Neutral Professional", "Tough Bar-Raiser"],
    )

    if st.button("Start new interview"):
        st.session_state.messages = []
        st.rerun()

    # Temporary smoke test: verify key/network/model with ONE trivial call,
    # isolated from the chat loop. Removed once the real integration works.
    if st.button("Test connection"):
        try:
            resp = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": "Say 'connection OK' and nothing else."}],
            )
            st.success(resp.choices[0].message.content)
        except Exception as e:
            st.error(f"API call failed: {e}")

# --- Chat history ----------------------------------------------------------
# The whole script reruns on every interaction, so a plain list would reset
# to [] each time. st.session_state persists across reruns (per browser tab).
if "messages" not in st.session_state:
    st.session_state.messages = []

# Repaint the full history on every rerun.
# Each message dict is {"role": ..., "content": ...} — deliberately the exact
# shape the OpenRouter/OpenAI API expects, so this list becomes our API
# payload in a later step.
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# --- Chat input ------------------------------------------------------------
# st.chat_input returns None on most reruns; it returns the typed text only
# on the rerun immediately after the user presses Enter.
if user_input := st.chat_input("Your answer…"):
    st.session_state.messages.append({"role": "user", "content": user_input})

    # Placeholder reply — replaced by a real OpenRouter call in step 6.
    reply = (
        f"*(AI coming soon — {seniority} {role} interview, {persona} style)* "
        f"You said: {user_input}"
    )
    st.session_state.messages.append({"role": "assistant", "content": reply})
    st.rerun()
