console.log("✅ app.js loaded");

/* ================= PWA INSTALL ================= */

let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("installBtn");
  if (btn) btn.style.display = "inline-block";
});

window.installApp = async function () {
  if (!deferredPrompt) {
    alert("Install option not available yet.");
    return;
  }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
};

/* ================= GLOBAL ================= */

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
/* ================= SPEAK UI STATE (RESTORED) ================= */

function setSpeakListening(active) {
  const btn = document.getElementById("speakBtn");
  const stopBtn = document.getElementById("stopBtn");

  if (btn) btn.classList.toggle("listening", active);
  if (stopBtn) stopBtn.style.display = active ? "inline-block" : "none";
}

function stopSpeaking() {
  if (recognition) {
    try { recognition.stop(); } catch {}
  }
  if (window.speechSynthesis) {
    speechSynthesis.cancel();
  }
  isListening = false;
  setSpeakListening(false);
}

/* ================= SPEAK ================= */
function normalizeForSpeech(text) {
  return text
    .replace(/\|/g, '')        // remove vertical bars
    .replace(/_/g, ' ')        // underscore → space
    .replace(/---+/g, '')      // markdown separators
    .replace(/\n/g, '. ')      // new lines → pause
    .replace(/\s+/g, ' ')      // extra spaces
    .trim();
}

function speak(text) {
  if (!window.speechSynthesis || !text) return;

  // 🔥 NORMALIZE HERE
  const cleanText = normalizeForSpeech(text);

  speechSynthesis.cancel(); // stop previous speech

  const u = new SpeechSynthesisUtterance(cleanText);
  u.lang = "en-IN";
  u.rate = 1;
  u.pitch = 1;

  speechSynthesis.speak(u);
}

/* ================= SHOW TABLES ================= */

/* ================= SQL ================= */

window.toggleTables = async function () {
  const panel = document.getElementById("tablePanel");
  const info = document.getElementById("tableInfo");
  const left = document.querySelector(".left");

  if (!panel || !info) return;

  // toggle close
  if (panel.style.display === "block") {
    panel.style.display = "none";
    if (left) left.style.width = "100%";
    return;
  }

  panel.style.display = "block";
  info.innerHTML = "⏳ Loading tables...";
  if (left) left.style.width = "65%";

  try {
    const res = await fetch("/tables");
    const data = await res.json();

    let html = "";
    for (const [table, obj] of Object.entries(data)) {
      html += `<h4>${table}</h4>`;
      html += renderTable(obj.columns, obj.rows);
    }

    info.innerHTML = html || "⚠️ No tables found";
  } catch (e) {
    console.error(e);
    info.innerHTML = "❌ Failed to load tables";
  }
};


/* ================= SQL ================= */

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
function nextQuestion() {
  const qid = document.getElementById("qid");
  if (!qid) return;

  qid.value = parseInt(qid.value || "1") + 1;
  document.getElementById("output").innerHTML = "";
}

function prevQuestion() {
  const qid = document.getElementById("qid");
  if (!qid) return;

  const current = parseInt(qid.value || "1");
  if (current > 1) {
    qid.value = current - 1;
    document.getElementById("output").innerHTML = "";
  }
}

/* ================= AI ================= */

window.askAIMentor = function () {
  const input = document.getElementById("aiInput");
  const out = document.getElementById("aiOutput");

  if (!input.value.trim()) return;

  fetch("/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input.value })
  })
    .then(r => r.text())
    .then(reply => {
      out.innerHTML = formatForDisplay(reply);
      speak(reply);
    });
};

/* ================= MIC ================= */

window.startVoiceInput = function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  // toggle OFF if already listening
  if (isListening) {
    stopSpeaking();
    return;
  }

  recognition = new SR();
  recognition.lang = "en-IN";
  recognition.continuous = false;

  isListening = true;
  setSpeakListening(true);

  recognition.onresult = function (e) {
    const text = e.results[0][0].transcript;
    document.getElementById("aiInput").value = text;
    askAIMentor();
  };

  recognition.onend = function () {
    isListening = false;
    setSpeakListening(false);
  };

  recognition.onerror = function () {
    isListening = false;
    setSpeakListening(false);
  };

  recognition.start();
};
