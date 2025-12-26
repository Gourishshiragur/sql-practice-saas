let level = "easy";
let index = 0;
let attempted = new Set();

async function loadQuestion() {
  const res = await fetch("/question", {
    method: "POST",
    body: new URLSearchParams({ level, index })
  });
  const q = await res.json();

  document.getElementById("questionText").innerText = q.text;
  document.getElementById("questionNumber").innerText =
    `Question ${q.number} of ${q.total}`;
}

async function runQuery() {
  if (!attempted.has(index)) attempted.add(index);

  const sql = document.getElementById("sql").value;
  const res = await fetch("/run", {
    method: "POST",
    body: new URLSearchParams({ user_sql: sql, level, index })
  });
  const data = await res.json();

  document.getElementById("output").innerText =
    data.status === "correct" ? "✅ Correct" : "❌ Wrong";

  updateProgress();
}

function updateProgress() {
  document.getElementById("progressText").innerText =
    `Progress: ${attempted.size} / 10`;
}

function nextQuestion() {
  if (index < 9) index++;
  loadQuestion();
}

function resetLevel() {
  level = document.getElementById("level").value;
  index = 0;
  attempted.clear();
  updateProgress();
  loadQuestion();
}

document.addEventListener("DOMContentLoaded", loadQuestion);
