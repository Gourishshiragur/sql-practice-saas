console.log("✅ app.js loaded");

let isListening = false;
let isSpeaking = false;
let recognition = null;
let newYearGreetingPending = false;

/* ================= VOICE INIT ================= */
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

/* ================= SPEAK BUTTON STATE ================= */

function setSpeakListening(active) {
  const btn = document.getElementById("speakBtn");
  if (!btn) return;

  if (active) btn.classList.add("listening");
  else btn.classList.remove("listening");
}

/* ================= STOP ALL ================= */

function stopAllVoice() {
  if (recognition) {
    try { recognition.stop(); } catch {}
  }
  if (window.speechSynthesis) {
    speechSynthesis.cancel();
  }
  isListening = false;
  isSpeaking = false;
  setSpeakListening(false);
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

function cleanForSpeech(text) {
  return text.replace(/\s+/g, " ").trim();
}

function detectLanguage(text) {
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
  return "en-IN";
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
    body: new URLSearchParams({
      qid: qidEl.value,
      user_sql: sql
    })
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
  if (!qidEl || !out) return;git

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


/* ================= SPEAK ================= */

function speak(text, lang) {
  if (!window.speechSynthesis) return;

  const utter = new SpeechSynthesisUtterance(cleanForSpeech(text));
  utter.lang = lang || "en-IN";

  utter.onstart = () => {
    isSpeaking = true;
    setSpeakListening(true);
  };

  utter.onend = () => {
    isSpeaking = false;
    setSpeakListening(false);
  };

  speechSynthesis.speak(utter);
}

/* ================= AI / YOUTUBE ================= */

function tryPlayYouTube(text) {
  if (!text.toLowerCase().startsWith("play")) return false;

  let query = text.replace(/play|song|music/gi, "").trim();
  if (!query) query = "music";

  window.open(
    "https://www.youtube.com/results?search_query=" +
      encodeURIComponent(query),
    "_blank"
  );

  const out = document.getElementById("aiOutput");
  if (out) out.innerText = "🎵 Opening YouTube…";

  speak("Opening YouTube", "en-US");
  return true;
}

/* ================= ASK BUTTON ================= */

window.askAIMentor = function () {
  playPendingNewYearGreeting();

  const input = document.getElementById("aiInput");
  const out = document.getElementById("aiOutput");
  if (!input || !out) return;

  const text = input.value.trim();

  if (!text) {
    out.innerHTML = `
      👋 <b>Welcome to SQL Practice!</b><br><br>
      You can ask questions in two ways:<br>
      • ✍️ Type your question and click <b>Ask</b><br>
      • 🎤 Use <b>Speak</b> to talk and get voice answers<br><br>
      👉 Try clicking <b>🎤 Speak</b> and ask your doubt by voice.
    `;
    return;
  }

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

/* ================= MIC / SPEAK BUTTON ================= */

window.startVoiceInput = function () {
  playPendingNewYearGreeting();

  // toggle stop
  if (isListening || isSpeaking) {
    stopAllVoice();
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  recognition = new SR();
  recognition.lang = "en-IN";
  recognition.continuous = false;

  isListening = true;
  setSpeakListening(true);

  recognition.onresult = e => {
    const text = e.results[0][0].transcript;
    document.getElementById("aiInput").value = text;

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

        // 🔊 GUARANTEED VOICE RESPONSE
        setTimeout(() => {
          speak(reply, detectLanguage(reply));
        }, 150);
      });
  };

  recognition.onend = () => {
    isListening = false;
    if (!isSpeaking) setSpeakListening(false);
  };

  recognition.start();
};

/* ================= NEW YEAR ================= */

function playPendingNewYearGreeting() {
  if (!newYearGreetingPending) return;

  newYearGreetingPending = false;
  sessionStorage.setItem("newYearGreeted", "true");

  speak("Happy New Year! Welcome to SQL Practice.", "en-IN");
}

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const isNewYear = today.getDate() === 1 && today.getMonth() === 0;

  // Banner already handled by HTML (visible)
  if (!isNewYear) return;

  // 🎉 MOBILE: try auto voice greeting ONCE
  if (isMobileDevice() && !sessionStorage.getItem("newYearGreeted")) {
    sessionStorage.setItem("newYearGreeted", "true");

    try {
      speak("Happy New Year! Welcome to SQL Practice.", "en-IN");
    } catch (e) {
      // silently fail (browser may block)
    }
  }
});

