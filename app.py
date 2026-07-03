import streamlit as st

st.title("Interview Practice 🎤")

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
