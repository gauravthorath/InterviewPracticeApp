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

# Models allowed by the course spec (all reached through the one OpenRouter API).
MODELS = [
    "openai/gpt-5-mini",  # recommended default
    "openai/gpt-5-nano",  # cheaper
    "openai/gpt-5",  # higher capability
]

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
    # st.pills renders chips instead of a dropdown: every option is visible
    # at once, one tap to switch. Caveat vs selectbox: clicking the selected
    # chip DEselects it and the widget returns None, so each pills value
    # gets a fallback below.
    role = st.pills("💼 Job role", ROLES, default="Backend Developer")
    if role == "Custom…":
        # Conditional UI: this text input only exists while "Custom…" is
        # selected — the `if` re-decides on every rerun.
        role = st.text_input("Enter your job role", placeholder="e.g. DevOps Engineer")
    role = role or "Backend Developer"

    # st.divider() draws a horizontal rule — visually separating each
    # setting group so the sidebar reads as distinct sections, not one
    # long wall of chips.
    st.divider()

    seniority = (
        st.pills("📈 Seniority", ["Junior", "Mid-level", "Senior"], default="Mid-level")
        or "Mid-level"
    )

    st.divider()

    persona = (
        st.pills(
            "🎭 Interviewer style",
            ["Friendly Coach", "Neutral Professional", "Tough Bar-Raiser"],
            default="Friendly Coach",
        )
        or "Friendly Coach"
    )

    st.divider()

    # --- Advanced settings (collapsed by default) --------------------------
    # Interview setup above is for every user; LLM knobs are developer
    # territory. An st.expander keeps them one click away without
    # cluttering the main experience (Medium optionals #1 and #9).
    with st.expander("⚙️ Advanced settings"):
        model = st.selectbox(
            "Model",
            MODELS,
            help="mini = balanced default · nano = cheapest · gpt-5 = strongest",
        )
        temperature = st.slider(
            "Temperature",
            0.0,
            2.0,
            0.7,
            0.1,
            help="How the next word is sampled: low = focused and repeatable, "
            "high = creative and varied. ~0.7 suits conversation.",
        )
        top_p = st.slider(
            "Top-p",
            0.0,
            1.0,
            1.0,
            0.05,
            help="Nucleus sampling: only the most likely words whose "
            "probabilities sum to p are considered. Tune this OR "
            "temperature, rarely both.",
        )
        frequency_penalty = st.slider(
            "Frequency penalty",
            -2.0,
            2.0,
            0.0,
            0.1,
            help="Positive values discourage the model from repeating words "
            "it has already used a lot.",
        )
        presence_penalty = st.slider(
            "Presence penalty",
            -2.0,
            2.0,
            0.0,
            0.1,
            help="Positive values nudge the model toward new topics instead "
            "of revisiting ones already mentioned.",
        )
        max_tokens = st.slider(
            "Max reply tokens",
            512,
            8192,
            2048,
            256,
            help="Hard cap on reply length — a cost control. Reasoning "
            "models spend part of this budget thinking, so don't set "
            "it too low or replies may come back empty.",
        )

    st.divider()

    # use_container_width stretches the button to the sidebar's full width,
    # making the primary action easy to hit.
    if st.button("🔄 Start new interview", type="primary", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

# --- System prompt ----------------------------------------------------------
# The model's standing instructions, rebuilt from the sidebar on every rerun
# and sent fresh with every API call (the API itself remembers nothing).
system_prompt = (
    f"You are a {persona} interviewer conducting a mock job interview for a "
    f"{seniority} {role} position. Ask ONE interview question at a time. "
    f"After the candidate answers, give brief constructive feedback on their "
    f"answer, then ask the next question. Stay in character throughout."
)

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

    # The API is stateless: every call must resend the system prompt plus the
    # ENTIRE conversation so far. Our session_state history is already in the
    # exact message format the API expects.
    try:
        with st.spinner("Interviewer is thinking…"):
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "system", "content": system_prompt}]
                + st.session_state.messages,
                temperature=temperature,
                top_p=top_p,
                frequency_penalty=frequency_penalty,
                presence_penalty=presence_penalty,
                max_tokens=max_tokens,
            )
        reply = response.choices[0].message.content
        st.session_state.messages.append({"role": "assistant", "content": reply})
        st.rerun()  # repaint so the new messages appear in the history above
    except Exception as e:
        # Don't crash the app on network/API hiccups — surface the error and
        # drop the unanswered user message so they can simply retry.
        # (No rerun here: a rerun would immediately erase this error message.)
        st.session_state.messages.pop()
        st.error(f"The interviewer couldn't respond ({e}). Please try again.")
