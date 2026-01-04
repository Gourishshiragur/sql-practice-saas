console.log("✅ app.js loaded");

/* ================= GLOBAL ================= */
let recognition = null;
let isListening = false;
let isSpeaking = false;

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
    .replace(/\|/g, "")
    .replace(/_/g, " ")
    .replace(/\n/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function speak(text) {
  if (!window.speechSynthesis || !text) return;

  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
    return;
  }

  const u = new SpeechSynthesisUtterance(normalizeForSpeech(text));
  u.lang = "en-IN";
  u.onend = () => isSpeaking = false;

  isSpeaking = true;
  speechSynthesis.speak(u);
}

/* ================= TABLES ================= */
window.toggleTables = async function () {
  const panel = document.getElementById("tablePanel");
  const info = document.getElementById("tableInfo");
  const left = document.querySelector(".left");

  if (!panel || !info) return;

  if (panel.style.display === "block") {
    panel.style.display = "none";
    if (left) left.style.width = "100%";
    return;
  }

  panel.style.display = "block";
  info.innerHTML = "Loading...";

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
  const sql = document.getElementById("sql").value;
  const out = document.getElementById("output");

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid, user_sql: sql })
  });

  const data = await res.json();
  out.innerHTML = `
    <b>${data.status}</b>
    <pre>${data.expected_sql}</pre>
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
  out.innerHTML = `
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
};

/* ================= NAVIGATION ================= */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

window.nextQuestion = function () {
  const idx = Number(getParam("q_index") || 0);
  const level = getParam("level") || "easy";
  window.location.href = `/?level=${level}&q_index=${idx + 1}`;
};

window.prevQuestion = function () {
  const idx = Number(getParam("q_index") || 0);
  const level = getParam("level") || "easy";
  if (idx > 0) {
    window.location.href = `/?level=${level}&q_index=${idx - 1}`;
  }
};

/* ================= AI ================= */
window.askAIMentor = function () {
  const input = document.getElementById("aiInput").value;
  const out = document.getElementById("aiOutput");

  fetch("/tools/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  })
    .then(r => r.text())
    .then(reply => {
      out.innerHTML = formatForDisplay(reply);
      speak(reply);
    })
    .catch(() => out.innerText = "AI error");
};
