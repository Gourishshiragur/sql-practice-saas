console.log("✅ app.js loaded");

/* ================= GLOBAL STATE ================= */

let isListening = false;
let isSpeaking = false;
let recognition = null;
let newYearGreetingPending = false;

/* ================= DEVICE ================= */

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/* ================= VOICE INIT ================= */

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = function () {
    speechSynthesis.getVoices();
  };
}

/* ================= SPEAK BUTTON UI ================= */

function setSpeakListening(active) {
  const btn = document.getElementById("speakBtn");
  if (!btn) return;
  if (active) btn.classList.add("listening");
  else btn.classList.remove("listening");
}

/* ================= STOP ALL ================= */

function stopAllVoice() {
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      console.warn("recognition stop failed");
    }
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

/* ================= SPEAK (INDIAN ENGLISH ONLY) ================= */

function speak(text) {
  if (!window.speechSynthesis) return;

  const utter = new SpeechSynthesisUtterance(cleanForSpeech(text));
  utter.lang = "en-IN";

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
git 

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
  const qid = document.getElementById("qid");
  const sqlEl = document.getElementById("sql");
  const out = document.getElementById("output");
  if (!qid || !sqlEl || !out) return;

  const sql = sqlEl.value.trim();
  if (!sql) {
    out.innerText = "Enter SQL query";
    return;
  }

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid: qid.value, user_sql: sql })
  });

  const data = await res.json();
  out.innerHTML = `
    <b>${data.status === "correct" ? "✅ Correct" : "❌ Wrong"}</b>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
};

window.showAnswer = async function () {
  const qid = document.getElementById("qid");
  const out = document.getElementById("output");
  if (!qid || !out) return;

  const res = await fetch("/show-answer", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid: qid.value })
  });

  const data = await res.json();
  out.innerHTML = `
    <h4>Correct Query</h4>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
};

/* ================= ASK ================= */

window.askAIMentor = function () {
  playPendingNewYearGreeting();

  const input = document.getElementById("aiInput");
  const out = document.getElementById("aiOutput");
  if (!input || !out) return;

  const text = input.value.trim();
  if (!text) {
    out.innerHTML = `
      👋 <b>Welcome to SQL Practice!</b><br><br>
      Type your question or use 🎤 Speak to ask by voice.
    `;
    return;
  }

  fetch("/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
    .then(r => r.text())
    .then(reply => out.innerHTML = formatForDisplay(reply));
};

/* ================= MIC ================= */

window.startVoiceInput = function () {
  playPendingNewYearGreeting();

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

  recognition.onresult = function (e) {
    const text = e.results[0][0].transcript;
    document.getElementById("aiInput").value = text;

    fetch("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    })
      .then(r => r.text())
      .then(reply => {
        document.getElementById("aiOutput").innerHTML = formatForDisplay(reply);
        setTimeout(() => speak(reply), 150);
      });
  };

  recognition.onend = function () {
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
  speak("Happy New Year! Welcome to SQL Practice.");
}

document.addEventListener("DOMContentLoaded", function () {
  const d = new Date();
  const isNewYear = d.getDate() === 1 && d.getMonth() === 0;

  if (!isNewYear) return;

  // 📱 Mobile auto-greet attempt (safe)
  if (isMobileDevice() && !sessionStorage.getItem("newYearGreeted")) {
    sessionStorage.setItem("newYearGreeted", "true");

    // ⏱ small delay lets WebView / PWA settle
    setTimeout(function () {
      try {
        speak("Happy New Year! Welcome to SQL Practice.");
      } catch (e) {
        // silently ignore if browser blocks
      }
    }, 300);
  }
});

