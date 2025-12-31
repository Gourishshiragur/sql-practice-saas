console.log("✅ app.js loaded");

let isSpeaking = false;
let isListening = false;
let recognition = null;

/* ================= VOICE INIT ================= */
function setSpeakListening(active) {
  const btn = document.getElementById("speakBtn");
  if (!btn) return;

  if (active) {
    btn.classList.add("listening");
  } else {
    btn.classList.remove("listening");
  }
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

/* ================= SPEAK BUTTON UI ================= */

function setSpeakButtonState(active) {
  const btn = document.getElementById("speakBtn");
  if (!btn) return;

  if (active) {
    btn.style.backgroundColor = "red";
    btn.style.color = "white";
  } else {
    btn.style.backgroundColor = "";
    btn.style.color = "";
  }
}

function stopAllVoice() {
  if (window.speechSynthesis) {
    speechSynthesis.cancel();
  }
  if (recognition && isListening) {
    recognition.stop();
  }
  isSpeaking = false;
  isListening = false;
  setSpeakButtonState(false);
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

window.askAIMentor = function () {
  const input = document.getElementById("aiInput");
  const out = document.getElementById("aiOutput");
  if (!input || !out) return;

  const text = input.value.trim();
  if (!text) return;

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

/* ================= SPEECH ================= */

function speak(text, lang) {
  stopAllVoice();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang || "en-IN";
utter.onstart = () => {
  isSpeaking = true;
  setSpeakListening(true);
};

utter.onend = () => {
  isSpeaking = false;
  setSpeakListening(false);
};

  utter.onstart = () => {
    isSpeaking = true;
    setSpeakButtonState(true);
  };

  utter.onend = () => {
    isSpeaking = false;
    setSpeakButtonState(false);
  };

  speechSynthesis.speak(utter);
}

/* ================= MIC (SPEAK BUTTON) ================= */

wwindow.startVoiceInput = function () {
  // toggle: if already listening or speaking → stop
  if (isListening || isSpeaking) {
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (recognition) recognition.stop();
    isListening = false;
    isSpeaking = false;
    setSpeakListening(false);
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  recognition = new SR();
  recognition.lang = "en-IN";

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
        speak(reply, detectLanguage(text));
      });
  };

  recognition.onend = () => {
    isListening = false;
    if (!isSpeaking) setSpeakListening(false);
  };

  recognition.start();
};


/* ================= NEW YEAR BANNER + GREETING ================= */

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const isNewYear = today.getDate() === 1 && today.getMonth() === 0;

  const banner = document.getElementById("newYearBanner");
  if (isNewYear && banner) {
    banner.style.display = "block";
  }

  if (isNewYear && !sessionStorage.getItem("newYearGreeted")) {
    sessionStorage.setItem("newYearGreeted", "true");
    speak("Happy New Year! Wishing you success and growth", "en-IN");
  }
});
