console.log("✅ app.js loaded");

/* ================= GLOBAL ================= */
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
    // ❌ remove emojis
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")

    // ❌ remove SQL & special symbols
    .replace(/[^a-zA-Z0-9., ]+/g, " ")

    // ❌ remove newlines completely
    .replace(/\n+/g, " ")

    // cleanup spaces
    .replace(/\s+/g, " ")
    .trim();
}

function setSpeakActive(active) {
  const btn = document.getElementById("speakBtn");
  if (!btn) return;
  btn.classList.toggle("listening", active);
}

function speak(text) {
  if (!window.speechSynthesis || !text) return;

  // 🔁 toggle OFF
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

/* ================= SPEAK BUTTON (AI ONLY) ================= */
window.handleSpeakClick = function () {
  const aiText = document.getElementById("aiOutput")?.innerText || "";
  speak(aiText);
};

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
  const qidEl = document.getElementById("qid");
  const sqlEl = document.getElementById("sql");
  const out = document.getElementById("output");

  if (!qidEl || !sqlEl || !out) return;

  const sql = sqlEl.value.trim();
  const qid = qidEl.value;

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

  <b style="color:${isCorrect ? "green" : "red"}; font-size:16px;">
    ${isCorrect ? "CORRECT" : "WRONG"}
  </b>
  ${
    !isCorrect
      ? `<div><b>Correct Query:</b><pre>${data.expected_sql}</pre></div>`
      : ""
  }
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
    <b>Correct Query</b>
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

  if (!input.trim()) {
    out.innerText = "Please type a question.";
    return;
  }

  fetch("/tools/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  })
    .then(r => r.text())
    .then(reply => {
      out.innerHTML = formatForDisplay(reply);
      // ❌ NO AUTO SPEECH
    })
    .catch(() => out.innerText = "AI error");
};
