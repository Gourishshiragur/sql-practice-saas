console.log("✅ app.js loaded");
// Ensure voices are loaded (important for Chrome/Edge)
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
  if (!text) return "";
  return text
    .replace(/\\n/g, "\n")
    .replace(/\n/g, "<br>");
}

/* ================= SQL ================= */

window.toggleTables = async function () {
  console.log("toggleTables clicked");

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
  console.log("runQuery clicked");

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
  console.log("showAnswer clicked");

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

/* ================= AI (TEXT ONLY) ================= */
function tryPlayYouTube(text) {
  const lower = text.toLowerCase();

  if (!lower.startsWith("play")) return false;

  let song = lower
    .replace(/^play/, "")
    .replace("this song", "")
    .replace("song", "")
    .trim();

  if (!song) {
    const out = document.getElementById("aiOutput");
    out.innerText = "🎵 Which song should I play?";
    speak("Which song should I play?", "en-US");
    return true;
  }

  showYouTubePlayButton(song);
  return true;
}

function showYouTubePlayButton(songText) {
  const out = document.getElementById("aiOutput");

  const query = encodeURIComponent(songText);

  out.innerHTML = `
    🎵 Ready to play: <b>${songText}</b><br><br>
    <button onclick="window.open(
      'https://www.youtube.com/results?search_query=${query}',
      '_blank'
    )">
      ▶️ Open YouTube
    </button>
  `;

  // Speak ONLY in English (reliable)
  speak("Opening YouTube. Tap the play button.", "en-US");
}

window.askAIMentor = function () {
  console.log("askAIMentor clicked");

  const input = document.getElementById("aiInput");
  const out = document.getElementById("aiOutput");
  if (!input || !out) return;

  const text = input.value.trim();
  if (!text) {
    out.innerText = "Please type your question or use 🎤 Speak";
    return;
  }

  fetch("/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
    .then(res => res.text())
  .then(reply => {
  if (tryPlayYouTube(text)) return;   // 👈 ADD THIS
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

function speak(text, lang) {
  if (!window.speechSynthesis) return;

  // Clean text (important)
  const cleanText = text
    .replace(/\\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const utter = new SpeechSynthesisUtterance(cleanText);
  const voices = speechSynthesis.getVoices();

  let selectedVoice = null;

  // 1️⃣ Try FEMALE Indian Kannada
  if (lang === "kn-IN") {
    selectedVoice = voices.find(v =>
      v.lang === "kn-IN" &&
      /female|woman|zira|heera|kavya|siri/i.test(v.name)
    );
  }

  // 2️⃣ Try FEMALE Indian Hindi
  if (!selectedVoice && lang === "hi-IN") {
    selectedVoice = voices.find(v =>
      v.lang === "hi-IN" &&
      /female|woman|swara|zira|heera/i.test(v.name)
    );
  }

  // 3️⃣ Try ANY Indian female
  if (!selectedVoice) {
    selectedVoice = voices.find(v =>
      v.lang.startsWith("en-IN") &&
      /female|woman/i.test(v.name)
    );
  }

  // 4️⃣ Fallback: any Indian voice
  if (!selectedVoice) {
    selectedVoice = voices.find(v =>
      v.lang.startsWith(lang.split("-")[0])
    );
  }

  // 5️⃣ Final fallback: English female
  if (!selectedVoice) {
    selectedVoice = voices.find(v =>
      v.lang.startsWith("en") &&
      /female|woman/i.test(v.name)
    );
  }

  if (!selectedVoice) {
    console.warn("No suitable voice found, skipping speech");
    return;
  }

  utter.voice = selectedVoice;
  utter.lang = selectedVoice.lang;
  utter.rate = 1;
  utter.pitch = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}


window.startVoiceInput = function () {
  console.log("startVoiceInput clicked");

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert("Voice not supported");
    return;
  }

  const micBtn = document.getElementById("micBtn");
  micBtn.classList.add("listening");
  micBtn.innerText = "🎤 Listening...";

  const recog = new SR();
  recog.lang = "en-IN";

  recog.onresult = e => {
    const text = e.results[0][0].transcript;
    document.getElementById("aiInput").value = text;
    lastSpokenLang = detectLanguage(text);

    fetch("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    })
      .then(res => res.text())
     .then(reply => {
  if (tryPlayYouTube(text)) return;   // 👈 ADD THIS

   const out = document.getElementById("aiOutput");
   out.innerHTML = formatForDisplay(reply);
    speak(reply, lastSpokenLang);
    });

  };

  recog.onend = () => {
    micBtn.classList.remove("listening");
    micBtn.innerText = "🎤 Speak";
  };

  recog.start();
};
