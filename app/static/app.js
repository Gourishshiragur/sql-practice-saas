console.log("✅ app.js loaded");

/* ================= PWA INSTALL ================= */

let deferredPrompt = null;

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("installBtn");
  if (btn) btn.style.display = "inline-block";
});

window.addEventListener("load", () => {
  if (isIOS()) {
    const hint = document.getElementById("installHint");
    if (hint) hint.style.display = "block";
  }
});

window.installApp = async function () {
  if (!deferredPrompt) {
    alert("Install option not available yet. Use browser menu.");
    return;
  }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
};

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
  window.speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

/* ================= UTIL ================= */

function renderTable(cols, rows) {
  let html = "<table border='1'><tr>";
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

function cleanForSpeech(text) {
  return text
    .replace(/[*`]/g, "")
    .replace(/\n/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ================= SPEAK ================= */

function speak(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(cleanForSpeech(text));
  utter.lang = "en-IN";
  speechSynthesis.speak(utter);
}

/* ================= SHOW TABLES (FIXED) ================= */

window.toggleTables = async function () {
  const panel = document.getElementById("tablePanel");
  const left = document.querySelector(".left");
  if (!panel) return;

  if (panel.style.display === "block") {
    panel.style.display = "none";
    if (left) left.style.width = "100%";
    return;
  }

  try {
    const res = await fetch("/tables");
    const data = await res.json();

    let html = "";
    for (const [table, obj] of Object.entries(data)) {
      html += `<h4>${table}</h4>`;
      html += renderTable(obj.columns, obj.rows);
    }

    panel.innerHTML = html;   // ✅ FIX: render into panel itself
    panel.style.display = "block";
    if (left) left.style.width = "65%";
  } catch (e) {
    panel.innerHTML = "❌ Failed to load tables";
    panel.style.display = "block";
  }
};

/* ================= RUN SQL (UNCHANGED) ================= */

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

/* ================= NEW YEAR BANNER (FIXED) ================= */

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("newYearBanner");
  if (!banner) return;

  const now = new Date();
  const start = new Date("2026-01-01T00:00:00");
  const end = new Date("2026-01-01T23:59:59");

  banner.style.display =
    now >= start && now <= end ? "block" : "none";

  // Optional voice greeting (mobile only)
  if (now >= start && now <= end && isMobileDevice()) {
    setTimeout(() => {
      try {
        speak("Happy New Year! Welcome to SQL Practice.");
      } catch {}
    }, 300);
  }
});
