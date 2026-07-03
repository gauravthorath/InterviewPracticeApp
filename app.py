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

# --- Main area -------------------------------------------------------------
# Temporary echo so we can SEE the rerun model at work; the chat UI
# replaces this in the next step.
if role:
    st.write(f"Preparing a **{seniority} {role}** interview with a **{persona}** interviewer.")
else:
    st.info("Enter a job role in the sidebar to begin.")
