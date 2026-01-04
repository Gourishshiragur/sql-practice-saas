console.log("✅ app.js loaded");

/* ================= LEVEL & STORAGE ================= */
function getLevel() {
  return new URLSearchParams(location.search).get("level") || "easy";
}

function getProgressKey() {
  return `progress_${getLevel()}`;
}

function loadProgress() {
  return JSON.parse(localStorage.getItem(getProgressKey())) || {
    visited: {},
    attempted: {},
    correct: {}
  };
}

function saveProgress(data) {
  localStorage.setItem(getProgressKey(), JSON.stringify(data));
}

/* ================= PROGRESS UI ================= */
function updateProgressUI() {
  const data = loadProgress();

  const total =
    Number(document.querySelector("p")?.innerText.match(/of (\d+)/)?.[1]) || 1;

  const visitedCount = Object.keys(data.visited).length;
  const attemptedCount = Object.keys(data.attempted).length;
  const correctCount = Object.keys(data.correct).length;

  const progressPct = Math.round((visitedCount / total) * 100);
  const scorePct = attemptedCount
    ? Math.round((correctCount / attemptedCount) * 100)
    : 0;

  const bar = document.getElementById("progressBar");
  if (bar) {
    bar.style.width = progressPct + "%";
    bar.style.background =
      scorePct >= 70 ? "#22c55e" : scorePct >= 40 ? "#facc15" : "#ef4444";
  }

  const progressText = document.getElementById("progressText");
  const scoreText = document.getElementById("scoreText");

  if (progressText)
    progressText.innerText = `Visited: ${visitedCount}/${total} (${progressPct}%)`;

  if (scoreText)
    scoreText.innerText = `Score: ${scorePct}%`;
}

/* ================= MARK VISITED ON LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
  const progress = loadProgress();
  const qid = document.getElementById("qid")?.value;

  if (qid && !progress.visited[qid]) {
    progress.visited[qid] = true;
    saveProgress(progress);
  }

  updateProgressUI();
});

/* ================= TABLE RENDER ================= */
function renderTable(cols, rows) {
  let html = "<table><tr>";
  cols.forEach(c => (html += `<th>${c}</th>`));
  html += "</tr>";

  rows.forEach(r => {
    html += "<tr>";
    r.forEach(v => (html += `<td>${v ?? ""}</td>`));
    html += "</tr>";
  });

  return html + "</table>";
}

function formatForDisplay(text) {
  return text.replace(/\n/g, "<br>");
}

/* ================= TABLES ================= */
window.toggleTables = async function () {
  const panel = document.getElementById("tablePanel");
  const info = document.getElementById("tableInfo");

  if (!panel || !info) return;

  if (panel.style.display === "block") {
    panel.style.display = "none";
    return;
  }

  panel.style.display = "block";
  info.innerHTML = "⏳ Loading tables...";

  const res = await fetch("/tables");
  const data = await res.json();

  let html = "";
  for (const [table, obj] of Object.entries(data)) {
    html += `<h4>${table}</h4>`;
    html += renderTable(obj.columns, obj.rows);
  }
  info.innerHTML = html;
};

/* ================= SQL ================= */
window.runQuery = async function () {
  const qid = document.getElementById("qid").value;
  const sql = document.getElementById("sql").value.trim();
  const out = document.getElementById("output");

  if (!sql) {
    out.innerHTML = "⚠️ Please enter a SQL query before running.";
    return;
  }

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid, user_sql: sql })
  });

  const data = await res.json();
  const isCorrect = data.status === "correct";

  // 🔒 SCORE LOCK LOGIC
  const progress = loadProgress();

  if (!progress.attempted[qid]) {
    progress.attempted[qid] = true;
    if (isCorrect) progress.correct[qid] = true;
    saveProgress(progress);
    updateProgressUI();
  }

  out.innerHTML = `
    <b style="color:${isCorrect ? "green" : "red"};">
      ${isCorrect ? "CORRECT" : "WRONG"}
    </b>
    ${!isCorrect ? `<pre>${data.expected_sql}</pre>` : ""}
    ${renderTable(data.cols, data.rows)}
  `;
};

/* ================= SHOW ANSWER ================= */
window.showAnswer = async function () {
  const qid = document.getElementById("qid").value;
  const out = document.getElementById("output");

  const progress = loadProgress();
  if (!progress.attempted[qid]) {
    progress.attempted[qid] = true;
    saveProgress(progress);
    updateProgressUI();
  }

  const res = await fetch("/show-answer", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid })
  });

  const data = await res.json();
  out.innerHTML = `<pre>${data.expected_sql}</pre>${renderTable(data.cols, data.rows)}`;
};

/* ================= NAVIGATION ================= */
window.nextQuestion = () => {
  const idx = Number(new URLSearchParams(location.search).get("q_index") || 0);
  const level = getLevel();
  location.href = `/?level=${level}&q_index=${idx + 1}`;
};

window.prevQuestion = () => {
  const idx = Number(new URLSearchParams(location.search).get("q_index") || 0);
  const level = getLevel();
  if (idx > 0) location.href = `/?level=${level}&q_index=${idx - 1}`;
};

/* ================= AI ================= */
window.askAIMentor = function () {
  const input = document.getElementById("aiInput").value.trim();
  const out = document.getElementById("aiOutput");

  if (!input) {
    out.innerText = "Type something to ask";
    return;
  }

  fetch("/tools/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  })
    .then(r => r.text())
    .then(reply => (out.innerHTML = formatForDisplay(reply)))
    .catch(() => (out.innerText = "AI error"));
};
/* ================= SPEECH ENGINE ================= */
let isSpeaking = false;

function setSpeakActive(active) {
  const btn = document.getElementById("speakBtn");
  if (btn) btn.classList.toggle("listening", active);
}

function normalizeForSpeech(text) {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")   // emojis
    .replace(/[^a-zA-Z0-9., ]+/g, " ")       // symbols
    .replace(/\s+/g, " ")
    .trim();
}

function speak(text) {
  if (!window.speechSynthesis || !text) return;

  // 🔁 toggle stop
  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
    setSpeakActive(false);
    return;
  }

  const cleanText = normalizeForSpeech(text);
  if (!cleanText) return;

  const utter = new SpeechSynthesisUtterance(cleanText);
  utter.lang = "en-IN";

  utter.onend = () => {
    isSpeaking = false;
    setSpeakActive(false);
  };

  isSpeaking = true;
  setSpeakActive(true);
  speechSynthesis.speak(utter);
}

/* ================= SPEAK AI OUTPUT ================= */
window.handleSpeakClick = function () {
  const aiText = document.getElementById("aiOutput")?.innerText || "";

  if (!aiText.trim()) {
    return; // nothing to speak
  }

  speak(aiText);
};
/* ================= PWA INSTALL ================= */
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const btn = document.getElementById("installBtn");
  if (btn) btn.style.display = "inline-block";
});

window.installApp = async function () {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
};
