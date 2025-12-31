console.log("✅ app.js loaded");
let isSpeaking = false;

// Ensure voices are loaded
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

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
  return text
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\n/g, "<br>");
}

/* ================= SQL ================= */

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

  const res = await fetch("/tables");
  const data = await res.json();

  let html = "";
  for (const [table, obj] of Object.entries(data)) {
    html += `<h4>${table}</h4>`;
    html += renderTable(obj.columns, obj.rows);
  }

  info.innerHTML = html;
  panel.style.display = "block";
  if (left) left.style.width = "65%";
};

window.runQuery = async function () {
  const qidEl = document.getElementById("qid");
  const sqlEl = document.getElementById("sql");
  const out = document.getElementById("output");
  if (!qidEl || !sqlEl || !out) return;

  const sql = sqlEl.value.trim();
  if (!sql) {
    out.innerText = "Enter SQL query";
    return;
  }

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid: qidEl.value, user_sql: sql })
  });

  const data = await res.json();
  out.innerHTML = `
    <b>${data.status === "correct" ? "✅ Correct" : "❌ Wrong"}</b>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
};

window.showAnswer = async function () {
  const qidEl = document.getElementById("qid");
  const out = document.getElementById("output");
  if (!qidEl || !out) return;

  const res = await fetch("/show-answer", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid: qidEl.value })
  });

  const data = await res.json();
  out.innerHTML = `
    <h4>Correct Query</h4>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
};

/* ================= YOUTUBE AUTO PLAY ================= */

function tryPlayYouTube(text) {
  const lower = text.toLowerCase();

  if (!lower.startsWith("play")) return false;

  let query = text
    .replace(/play/gi, "")
    .replace(/song/gi, "")
    .replace(/music/gi, "")
    .trim();

  if (!query) query = "music";

  const url =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(query);

  window.open(url, "_blank");

  const out = document.getElementById("aiOutput");
  if (out) out.innerText = "🎵 Opening YouTube…";

  speak("Opening YouTube", "en-US");
  return true;
}

/* ================= AI (TEXT) ================= */

window.askAIMentor = function () {
  const input = document.getElementById("aiInput");
  const out = document.getElementById("aiOutput");
  if (!input || !out) return;

  const text = input.value.trim();
  if (!text) return;

  // 🎵 YouTube first
  if (tryPlayYouTube(text)) return;

  fetch("/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
    .then(res => res.text())
    .then(reply => {
      out.innerHTML = formatForDisplay(reply);
    });
};

/* ================= VOICE ================= */

let lastSpokenLang = "en-US";

function detectLanguage(text) {
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
  return "en-US";
}

function cleanForSpeech(text) {
  return text
    .replace(/\\"/g, '"')
    .replace(/\\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function speak(text, lang) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(cleanForSpeech(text));
  const voices = speechSynthesis.getVoices();

  utter.voice =
    voices.find(v => v.lang === lang) ||
    voices.find(v => v.lang.startsWith(lang.split("-")[0])) ||
    voices.find(v => v.lang.startsWith("en"));

  if (!utter.voice) return;

  utter.onstart = () => isSpeaking = true;
  utter.onend = () => isSpeaking = false;

  speechSynthesis.speak(utter);
}

window.startVoiceInput = function () {
  speechSynthesis.cancel();

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  const recog = new SR();
  recog.lang = "en-IN";

  recog.onresult = e => {
    const text = e.results[0][0].transcript;
    document.getElementById("aiInput").value = text;
    lastSpokenLang = detectLanguage(text);

    // 🎵 YouTube first
    if (tryPlayYouTube(text)) return;

    fetch("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    })
      .then(res => res.text())
      .then(reply => {
        const out = document.getElementById("aiOutput");
        out.innerHTML = formatForDisplay(reply);
        speak(reply, lastSpokenLang);
      });
  };

  recog.start();
};
