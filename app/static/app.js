const TOTAL_QUESTIONS = 10;

/* -----------------------------
   GET CURRENT LEVEL
----------------------------- */
function getCurrentLevel() {
  const params = new URLSearchParams(window.location.search);
  return params.get("level") || "easy";
}

/* -----------------------------
   STORAGE KEYS (PER LEVEL)
----------------------------- */
function getAnsweredKey() {
  return `answeredQids_${getCurrentLevel()}`;
}

/* -----------------------------
   PROGRESS BAR (LEVEL AWARE)
----------------------------- */
function getAnsweredSet() {
  const stored = sessionStorage.getItem(getAnsweredKey());
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

function saveAnsweredSet(set) {
  sessionStorage.setItem(getAnsweredKey(), JSON.stringify([...set]));
}

function updateProgress() {
  const answered = getAnsweredSet();
  const count = Math.min(answered.size, TOTAL_QUESTIONS);

  const percent = (count / TOTAL_QUESTIONS) * 100;

  const bar = document.getElementById("progressBar");
  const text = document.getElementById("progressText");

  if (bar) bar.style.width = percent + "%";
  if (text) text.innerText = `Progress: ${count} / ${TOTAL_QUESTIONS}`;
}

function markAnswered(qid) {
  const answered = getAnsweredSet();

  if (answered.has(qid)) return;
  if (answered.size >= TOTAL_QUESTIONS) return;

  answered.add(qid);
  saveAnsweredSet(answered);
  updateProgress();
}

document.addEventListener("DOMContentLoaded", updateProgress);
