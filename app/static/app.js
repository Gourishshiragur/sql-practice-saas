console.log("✅ app.js loaded");

const TOTAL_QUESTIONS = 10;

/* -----------------------------
   LEVEL HELPERS
----------------------------- */
function getLevel() {
  return new URLSearchParams(window.location.search).get("level") || "easy";
}

function answeredKey() {
  return "answered_" + getLevel();
}

function correctKey() {
  return "correct_" + getLevel();
}

function completedKey() {
  return "completed_" + getLevel();
}

function getSet(key) {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  sessionStorage.setItem(key, JSON.stringify([...set]));
}

/* -----------------------------
   LEVEL COMPLETION MESSAGE
----------------------------- */
function showCompletionMessage() {
  const level = getLevel();
  const out = document.getElementById("output");

  const nextLevel =
    level === "easy" ? "medium" :
    level === "medium" ? "hard" :
    null;

  let msg = `🎉 You completed ${level.toUpperCase()} level!`;

  if (nextLevel) {
    msg += `<br>👉 Try <b>${nextLevel.toUpperCase()}</b> level next.`;
  } else {
    msg += `<br>🏆 You completed ALL levels!`;
  }

  out.innerHTML = `
    <div style="
      background:#ecfeff;
      border-left:6px solid #06b6d4;
      padding:16px;
      border-radius:8px;
      font-weight:600;
    ">
      ${msg}
    </div>
  `;
}

/* -----------------------------
   PROGRESS + ACCURACY
----------------------------- */
function updateProgress() {
  const answered = getSet(answeredKey());
  const correct = getSet(correctKey());

  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const accuracyText = document.getElementById("accuracyText");

  const percent = Math.min((answered.size / TOTAL_QUESTIONS) * 100, 100);
  progressBar.style.width = percent + "%";

  progressText.innerText =
    `Progress: ${answered.size} / ${TOTAL_QUESTIONS}`;

  const accuracy =
    answered.size === 0
      ? 0
      : Math.round((correct.size / answered.size) * 100);

  accuracyText.innerText =
    `Accuracy: ${accuracy}% (${correct.size} correct out of ${answered.size})`;
      // ✅ COMPLETION CHECK (THIS IS THE DECIDING POINT)
  const completed = sessionStorage.getItem(completedKey());

  if (answered.size === TOTAL_QUESTIONS && !completed) {
    sessionStorage.setItem(completedKey(), "true");
    showCompletionMessage();   // 🔥 YOUR FUNCTION CALLED HERE
  }
}

  /* ✅ LEVEL COMPLETION CHECK */
  const completed = sessionStorage.getItem(completedKey());
  if (answered.size === TOTAL_QUESTIONS && !completed) {
    sessionStorage.setItem(completedKey(), "true");
    showCompletionMessage();
  }
}

/*
  ✅ Count each question ONLY ONCE
*/
function markAnswered(qid, isCorrect) {
  const answered = getSet(answeredKey());
  const correct = getSet(correctKey());

  if (answered.has(qid)) {
    updateProgress();
    return;
  }

  answered.add(qid);
  saveSet(answeredKey(), answered);

  if (isCorrect) {
    correct.add(qid);
    saveSet(correctKey(), correct);
  }

  updateProgress();
}

document.addEventListener("DOMContentLoaded", () => {
  updateProgress();
  const panel = document.getElementById("tablePanel");
  if (panel) panel.style.display = "none";
});

/* -----------------------------
   TABLE RENDER
----------------------------- */
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

/* -----------------------------
   RUN QUERY
----------------------------- */
async function runQuery() {
  const qid = document.getElementById("qid").value;
  const sql = document.getElementById("sql").value.trim();
  const out = document.getElementById("output");

  if (!sql) {
    out.innerHTML =
      `<p style="color:red">⚠️ Please enter a SQL query before clicking Run.</p>`;
    return;
  }

  out.innerHTML = "⏳ Running...";

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid, user_sql: sql })
  });

  const data = await res.json();
  const isCorrect = data.status === "correct";

  markAnswered(qid, isCorrect);

  out.innerHTML = `
    <p>${isCorrect ? "✅ Correct" : "❌ Wrong"}</p>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
}

/* -----------------------------
   SHOW ANSWER
----------------------------- */
async function showAnswer() {
  const qid = document.getElementById("qid").value;
  const out = document.getElementById("output");

  const res = await fetch("/show-answer", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid })
  });

  const data = await res.json();

  markAnswered(qid, false);

  out.innerHTML = `
    <h4>Correct Query</h4>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
}

/* -----------------------------
   SHOW AVAILABLE TABLES
----------------------------- */
let tablesVisible = false;

async function toggleTables() {
  const panel = document.getElementById("tablePanel");
  const info = document.getElementById("tableInfo");
  const left = document.querySelector(".left");

  if (!tablesVisible) {
    const res = await fetch("/tables");
    const data = await res.json();

    let html = "";
    for (const [table, obj] of Object.entries(data)) {
      html += `<h5>${table}</h5>`;
      html += renderTable(obj.columns, obj.rows);
    }

    info.innerHTML = html;
    panel.style.display = "block";
    if (left) left.style.width = "65%";
  } else {
    panel.style.display = "none";
    if (left) left.style.width = "100%";
  }

  tablesVisible = !tablesVisible;
}
