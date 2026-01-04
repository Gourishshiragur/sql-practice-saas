console.log("✅ app.js loaded");
/* ================= PWA SERVICE WORKER ================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/static/service-worker.js")
      .then(() => console.log("✅ Service Worker registered"))
      .catch(err => console.error("❌ SW registration failed", err));
  });
}
/* ================= PWA INSTALL PROMPT ================= */
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

/* ================= GLOBAL ================= */
let isSpeaking = false;
let recognition = null;
let isListening = false;

/* ================= UTIL ================= */
function renderTable(cols, rows) {
  let html = "<table><tr>";
  cols.forEach(c => html += `<th>${c}</th>`);
  html += "</tr>";

  rows.forEach(r => {
    html += "<tr>";
    r.forEach(v => html += `<td>${v}</td>`);
    html += "</tr>";
  });

  return html + "</table>";
}

function formatForDisplay(text) {
  return text.replace(/\n/g, "<br>");
}

/* ================= SPEECH ================= */
function normalizeForSpeech(text) {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[^a-zA-Z0-9., ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function setSpeakActive(active) {
  const btn = document.getElementById("speakBtn");
  if (btn) btn.classList.toggle("listening", active);
}

function speak(text) {
  if (!window.speechSynthesis || !text) return;

  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
    setSpeakActive(false);
    return;
  }

  const cleanText = normalizeForSpeech(text);
  if (!cleanText) return;

  const u = new SpeechSynthesisUtterance(cleanText);
  u.lang = "en-IN";

  u.onend = () => {
    isSpeaking = false;
    setSpeakActive(false);
  };

  isSpeaking = true;
  setSpeakActive(true);
  speechSynthesis.speak(u);
}

/* ================= VOICE INPUT ================= */
function startVoiceInput() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert("Voice input not supported");
    return;
  }

  if (isListening) {
    recognition.stop();
    isListening = false;
    setSpeakActive(false);
    return;
  }

  recognition = new SR();
  recognition.lang = "en-IN";
  recognition.continuous = false;

  isListening = true;
  setSpeakActive(true);

  recognition.onresult = function (e) {
    const text = e.results[0][0].transcript;
    document.getElementById("aiInput").value = text;
    isListening = false;
    setSpeakActive(false);
    askAIMentor();
  };

  recognition.onend = recognition.onerror = function () {
    isListening = false;
    setSpeakActive(false);
  };

  recognition.start();
}

/* ================= SPEAK BUTTON ================= */
window.handleSpeakClick = function () {
  startVoiceInput();
};

/* ================= TABLES ================= */
window.toggleTables = async function () {
  const panel = document.getElementById("tablePanel");
  const info = document.getElementById("tableInfo");
  const left = document.querySelector(".left");

  if (panel.style.display === "block") {
    panel.style.display = "none";
    if (left) left.style.width = "100%";
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

  out.innerHTML = `
    <small style="color:#64748b;">
      Query result based on applied SQL conditions
    </small><br><br>

    <b style="color:${isCorrect ? "green" : "red"};">
      ${isCorrect ? "CORRECT" : "WRONG"}
    </b>

    ${!isCorrect ? `<pre>${data.expected_sql}</pre>` : ""}
    ${renderTable(data.cols, data.rows)}
  `;
};

window.showAnswer = async function () {
  const qid = document.getElementById("qid").value;
  const out = document.getElementById("output");

  const res = await fetch("/show-answer", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid })
  });

  const data = await res.json();
  out.innerHTML = `<pre>${data.expected_sql}</pre>${renderTable(data.cols, data.rows)}`;
};

/* ================= NAV ================= */
window.nextQuestion = () => {
  const idx = Number(new URLSearchParams(location.search).get("q_index") || 0);
  const level = new URLSearchParams(location.search).get("level") || "easy";
  location.href = `/?level=${level}&q_index=${idx + 1}`;
};

window.prevQuestion = () => {
  const idx = Number(new URLSearchParams(location.search).get("q_index") || 0);
  const level = new URLSearchParams(location.search).get("level") || "easy";
  if (idx > 0) location.href = `/?level=${level}&q_index=${idx - 1}`;
};

/* ================= AI ================= */
window.askAIMentor = function () {
  const input = document.getElementById("aiInput").value;
  const out = document.getElementById("aiOutput");

if (!input.trim()) {
  out.innerText = "Type something to ask";
  return;
}


  fetch("/tools/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  })
    .then(r => r.text())
    .then(reply => out.innerHTML = formatForDisplay(reply))
    .catch(() => out.innerText = "AI error");
};
