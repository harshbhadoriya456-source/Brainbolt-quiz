// ── Seen Questions Tracker ──
function getSeenKey(cat, diff) {
  return `bb_seen_${cat}_${diff}`;
}

function getUnseenShuffled(cat, diff) {
  const all = puzzles[cat][diff];
  const seen = JSON.parse(localStorage.getItem(getSeenKey(cat, diff)) || '[]');

  // If all questions seen, reset automatically
  if (seen.length >= all.length) {
    localStorage.removeItem(getSeenKey(cat, diff));
    return shuffle(all.map((p, i) => ({ ...p, _i: i })));
  }

  const unseen = all
    .map((p, i) => ({ ...p, _i: i }))
    .filter(p => !seen.includes(p._i));

  return shuffle(unseen);
}

function markSeen(cat, diff, idx) {
  const key = getSeenKey(cat, diff);
  const seen = JSON.parse(localStorage.getItem(key) || '[]');
  if (!seen.includes(idx)) {
    seen.push(idx);
    localStorage.setItem(key, JSON.stringify(seen));
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Holds this session's questions
let sessionPuzzles = [];
// ── Puzzle Data ──
const puzzles = {
  logic: {
    easy: [
      { q: "If all Bloops are Razzles and all Razzles are Lazzles, are Bloops definitely Lazzles?", a: "yes", hint: "A=B, B=C, so A=C" },
      { q: "A rooster lays an egg on top of a barn. Which way does it roll?", a: "roosters don't lay eggs", hint: "Read very carefully..." },
      { q: "Tom's mother has 3 children: Monday, Tuesday and ___?", a: "tom", hint: "Re-read who the question is about" },
    ],
    medium: [
      { q: "You have 3 boxes labelled Apples, Oranges, Both — all wrong. Pick ONE fruit from ONE box to identify all. Which box do you pick from?", a: "apples and oranges", hint: "Pick from the 'Both' box" },
      { q: "A man builds a house with 4 sides, all facing south. A bear walks by. What color is the bear?", a: "white", hint: "Where on Earth can all sides face south?" },
      { q: "Two fathers and two sons go fishing. They catch 3 fish total, one each. How?", a: "grandfather father son", hint: "Count the people carefully" },
    ],
    hard: [
      { q: "I am taken from a mine and shut in a wooden case, from which I am never released, and yet almost every person uses me. What am I?", a: "pencil lead", hint: "Think about what's inside a pencil" },
      { q: "A man is looking at a photo and says 'Brothers and sisters I have none, but that man's father is my father's son.' Who is in the photo?", a: "his son", hint: "Work backwards from 'my father's son'" },
      { q: "You are in a room with 3 light switches, each controls one of 3 bulbs in the next room. You can only enter the next room once. How do you figure out which switch controls which bulb?", a: "turn one on wait then off turn another on go check", hint: "Think about heat, not just light" },
    ]
  },
  riddles: {
    easy: [
      { q: "I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?", a: "echo", hint: "Sound bouncing back..." },
      { q: "The more you take, the more you leave behind. What am I?", a: "footsteps", hint: "Think about walking..." },
      { q: "I have cities but no houses. Mountains but no trees. Water but no fish. What am I?", a: "map", hint: "You use me for navigation" },
    ],
    medium: [
      { q: "I have hands but cannot clap. I have a face but cannot smile. What am I?", a: "clock", hint: "You check me many times a day" },
      { q: "The more you have of me, the less you see. What am I?", a: "darkness", hint: "Think about light..." },
      { q: "I go up but never come down. What am I?", a: "age", hint: "Think about time passing..." },
    ],
    hard: [
      { q: "I have cities, but no houses live there. I have rivers, but no water flows. I have forests, but no trees grow. I have mountains, but no snow falls. What am I?", a: "map", hint: "A representation of the world" },
      { q: "What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?", a: "river", hint: "Found in nature, always moving" },
      { q: "The person who makes it sells it. The person who buys it never uses it. The person who uses it doesn't know they're using it. What is it?", a: "coffin", hint: "Think about the end of life..." },
    ]
  },
  math: {
    easy: [
      { q: "What is the next number in this sequence? 2, 6, 12, 20, 30, ?", a: "42", hint: "Gaps are 4, 6, 8, 10, 12..." },
      { q: "If you have 6 oranges and take away 4, how many do YOU have?", a: "4", hint: "Focus on the word YOU" },
      { q: "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much is the ball?", a: "5 cents", hint: "Don't say 10 cents — do the algebra!" },
    ],
    medium: [
      { q: "I am a 3-digit number. My tens digit is 5 more than my ones digit. My hundreds digit is 8 less than my tens digit. What am I?", a: "194", hint: "Work backwards from tens digit" },
      { q: "If there are 3 apples and you take away 2, how many apples do you have?", a: "2", hint: "You TOOK 2, so you HAVE 2" },
      { q: "A snail climbs 3 feet up a wall during the day and slides 2 feet down at night. The wall is 10 feet tall. How many days to reach the top?", a: "8", hint: "Net progress is 1 foot per day, but check the last day!" },
    ],
    hard: [
      { q: "If you have a 3-gallon jug and a 5-gallon jug, how do you measure exactly 4 gallons?", a: "fill 5 pour into 3 empty 3 pour remaining into 3 fill 5 pour into 3", hint: "Fill the 5, pour into 3..." },
      { q: "What is 1/2 of 2/3 of 3/4 of 4/5 of 500?", a: "100", hint: "Multiply all fractions together first" },
      { q: "A number doubled is 40 less than triple the number. What is the number?", a: "40", hint: "Set up: 2x = 3x - 40" },
    ]
  }
};

// ── State ──
let currentCategory = '';
let currentDifficulty = 'easy';
let currentIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 90;
let correctCount = 0;
let totalTimeUsed = 0;
let bestStreak = 0;
let currentStreak = 0;
let leaderboard = JSON.parse(localStorage.getItem('bb_leaderboard') || '[]');

const timeLimits = { easy: 90, medium: 60, hard: 40 };
const diffInfo = {
  easy: '90s timer • Hints allowed • 3 puzzles',
  medium: '60s timer • Hints cost more • 3 puzzles',
  hard: '40s timer • No hints • 3 harder puzzles'
};

// ── Audio ──
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function getAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playSound(type) {
  try {
    const ac = getAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ac.currentTime);
      osc.frequency.setValueAtTime(659, ac.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ac.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
      osc.start(); osc.stop(ac.currentTime + 0.5);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(200, ac.currentTime);
      osc.frequency.setValueAtTime(150, ac.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
      osc.start(); osc.stop(ac.currentTime + 0.4);
    } else if (type === 'tick') {
      osc.frequency.setValueAtTime(800, ac.currentTime);
      gain.gain.setValueAtTime(0.05, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);
      osc.start(); osc.stop(ac.currentTime + 0.05);
    } else if (type === 'complete') {
      [523, 659, 784, 1047].forEach((f, i) => {
        const o2 = ac.createOscillator();
        const g2 = ac.createGain();
        o2.connect(g2); g2.connect(ac.destination);
        o2.frequency.value = f;
        g2.gain.setValueAtTime(0.2, ac.currentTime + i * 0.12);
        g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.12 + 0.3);
        o2.start(ac.currentTime + i * 0.12);
        o2.stop(ac.currentTime + i * 0.12 + 0.3);
      });
    }
  } catch (e) { }
}

// ── Difficulty ──
function selectDifficulty(d, btn) {
  currentDifficulty = d;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('diff-info').textContent = diffInfo[d];
}

// ── Game flow ──
function startGame(category) {
  currentCategory = category;
  currentIndex = 0;
  score = 0;
  correctCount = 0;
  totalTimeUsed = 0;
  bestStreak = 0;
  currentStreak = 0;
  show('puzzle-screen');
  document.getElementById('difficulty-badge').textContent =
    currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  loadPuzzle();
}

function loadPuzzle() {
  const list = puzzles[currentCategory][currentDifficulty];
  if (currentIndex >= list.length) { endGame(); return; }

  const p = list[currentIndex];
  document.getElementById('question-text').textContent = p.q;
  document.getElementById('answer-input').value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('hint-text').textContent = '';
  document.getElementById('hint-text').classList.add('hidden');
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('score').textContent = score;
  document.getElementById('timer-display').classList.remove('danger');
  document.getElementById('q-number').textContent =
    `Question ${currentIndex + 1} of ${list.length}`;
  document.getElementById('progress-bar').style.width =
    `${((currentIndex) / list.length) * 100}%`;

  // Hide hint button on hard
  document.querySelector('.hint-btn').style.display =
    currentDifficulty === 'hard' ? 'none' : 'inline-block';

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = timeLimits[currentDifficulty];
  document.getElementById('timer').textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 10) {
      document.getElementById('timer-display').classList.add('danger');
      playSound('tick');
    }
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showWrong();
      document.getElementById('feedback').textContent = "Time's up!";
      document.getElementById('feedback').style.color = '#f87171';
      document.getElementById('next-btn').classList.remove('hidden');
      currentStreak = 0;
    }
  }, 1000);
}

function checkAnswer() {
  const raw = document.getElementById('answer-input').value.trim().toLowerCase();
  const correct = puzzles[currentCategory][currentDifficulty][currentIndex].a.toLowerCase();

  if (!raw) return;

  clearInterval(timerInterval);
  totalTimeUsed += timeLimits[currentDifficulty] - timeLeft;

  if (raw === correct || correct.includes(raw) && raw.length > 3) {
    const pts = Math.round(100 + timeLeft * (currentDifficulty === 'hard' ? 8 : currentDifficulty === 'medium' ? 6 : 4));
    score += pts;
    correctCount++;
    currentStreak++;
    if (currentStreak > bestStreak) bestStreak = currentStreak;

    document.getElementById('feedback').textContent = `✓ Correct! +${pts} pts`;
    document.getElementById('feedback').style.color = '#34d399';
    document.getElementById('score').textContent = score;

    showCorrect();
    playSound('correct');
    spawnScoreFloat(`+${pts}`, true);
  } else {
    currentStreak = 0;
    document.getElementById('feedback').textContent = `✗ Answer: ${puzzles[currentCategory][currentDifficulty][currentIndex].a}`;
    document.getElementById('feedback').style.color = '#f87171';

    showWrong();
    playSound('wrong');
    document.getElementById('answer-input').classList.add('shake');
    setTimeout(() => document.getElementById('answer-input').classList.remove('shake'), 500);
  }

  document.getElementById('next-btn').classList.remove('hidden');
}

function showHint() {
  if (currentDifficulty === 'hard') return;
  const hint = puzzles[currentCategory][currentDifficulty][currentIndex].hint;
  document.getElementById('hint-text').textContent = 'Hint: ' + hint;
  document.getElementById('hint-text').classList.remove('hidden');
  const penalty = currentDifficulty === 'medium' ? 30 : 20;
  score = Math.max(0, score - penalty);
  document.getElementById('score').textContent = score;
  spawnScoreFloat(`-${penalty}`, false);
}

function nextPuzzle() {
  clearInterval(timerInterval);
  currentIndex++;
  loadPuzzle();
}

function endGame() {
  saveScoreToSheet(score, currentCategory, currentDifficulty);
  playSound('complete');
  const avgTime = correctCount > 0 ? Math.round(totalTimeUsed / puzzles[currentCategory][currentDifficulty].length) : 0;

  document.getElementById('final-score').textContent = score;
  document.getElementById('stat-correct').textContent = correctCount + '/' + puzzles[currentCategory][currentDifficulty].length;
  document.getElementById('stat-time').textContent = avgTime + 's';
  document.getElementById('stat-streak').textContent = bestStreak;
  document.getElementById('progress-bar').style.width = '100%';

  // Result icon & message
  const pct = correctCount / puzzles[currentCategory][currentDifficulty].length;
  const icons = ['😅', '🤔', '🧠', '🏆'];
  const msgs = ['Keep practicing!', 'Not bad!', 'Great thinking!', 'Genius level!'];
  const idx = pct === 0 ? 0 : pct < 0.5 ? 1 : pct < 1 ? 2 : 3;
  document.getElementById('result-icon').textContent = icons[idx];
  document.getElementById('result-message').textContent = msgs[idx];

  // Best score
  const prevBest = parseInt(localStorage.getItem('bb_best') || '0');
  document.getElementById('best-score-home').textContent = Math.max(prevBest, score);
  if (score > prevBest) {
    localStorage.setItem('bb_best', score);
    document.getElementById('new-best').classList.remove('hidden');
  }

  // Save to leaderboard
  leaderboard.push({ score, category: currentCategory, difficulty: currentDifficulty, correct: correctCount, date: new Date().toLocaleDateString() });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem('bb_leaderboard', JSON.stringify(leaderboard));

  show('result-screen');
}

function showLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  if (leaderboard.length === 0) {
    list.innerHTML = '<p style="color:#4c4575;margin:20px 0">No scores yet. Play a round first!</p>';
  } else {
    const rankClass = ['gold', 'silver', 'bronze'];
    const rankSymbol = ['🥇', '🥈', '🥉'];
    list.innerHTML = leaderboard.map((e, i) => `
      <div class="lb-row">
        <div class="lb-rank ${rankClass[i] || ''}">${rankSymbol[i] || (i + 1)}</div>
        <div class="lb-name">${e.category.charAt(0).toUpperCase() + e.category.slice(1)} · ${e.difficulty}</div>
        <div class="lb-meta">${e.correct} correct · ${e.date}</div>
        <div class="lb-score">${e.score}</div>
      </div>`).join('');
  }
  show('leaderboard-screen');
}

function goHome() {
  show('home-screen');
  document.getElementById('best-score-home').textContent =
    localStorage.getItem('bb_best') || '0';
}

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── Visual effects ──
function showCorrect() {
  const el = document.getElementById('correct-overlay');
  el.classList.remove('hidden');
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'flashOverlay 0.8s ease forwards';
  setTimeout(() => el.classList.add('hidden'), 800);
}

function showWrong() {
  const el = document.getElementById('wrong-overlay');
  el.classList.remove('hidden');
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'flashOverlay 0.8s ease forwards';
  setTimeout(() => el.classList.add('hidden'), 800);
}

function spawnScoreFloat(text, positive) {
  const el = document.createElement('div');
  el.className = 'score-float';
  el.textContent = text;
  el.style.color = positive ? '#34d399' : '#f87171';
  el.style.left = (window.innerWidth / 2 - 30) + 'px';
  el.style.top = (window.innerHeight / 2) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ── Canvas background ──
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

const symbols = ['?', '!', '+', '×', '÷', '=', '∑', 'π', '∞', '◆', '▲', '●', '★', '√', '%', 'Ω'];
const colors = ['#a78bfa', '#60a5fa', '#34d399', '#f59e0b', '#f472b6', '#818cf8'];

class Particle {
  constructor() { this.reset(true); }
  reset(rand) {
    this.x = Math.random() * canvas.width;
    this.y = rand ? Math.random() * canvas.height : canvas.height + 20;
    this.size = Math.random() * 18 + 10;
    this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.speedY = (Math.random() - 0.5) * 0.6;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
    this.pulseAngle = Math.random() * Math.PI * 2;
  }
  update() {
    this.x += this.speedX; this.y += this.speedY;
    this.rotation += this.rotSpeed;
    this.pulseAngle += 0.01;
    this.opacity = 0.05 + Math.abs(Math.sin(this.pulseAngle)) * 0.18;
    if (this.x < -50) this.x = canvas.width + 50;
    if (this.x > canvas.width + 50) this.x = -50;
    if (this.y < -50) this.y = canvas.height + 50;
    if (this.y > canvas.height + 50) this.y = -50;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.font = `bold ${this.size}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  }
}

class Streak {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height * 0.5;
    this.length = Math.random() * 100 + 50;
    this.speed = Math.random() * 3 + 1.5;
    this.opacity = Math.random() * 0.3 + 0.1;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
  }
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.opacity -= 0.004;
    if (this.opacity <= 0 || this.y > canvas.height + 50) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    const g = ctx.createLinearGradient(this.x, this.y,
      this.x - Math.cos(this.angle) * this.length,
      this.y - Math.sin(this.angle) * this.length);
    g.addColorStop(0, this.color);
    g.addColorStop(1, 'transparent');
    ctx.strokeStyle = g; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - Math.cos(this.angle) * this.length, this.y - Math.sin(this.angle) * this.length);
    ctx.stroke();
    ctx.restore();
  }
}

const particles = Array.from({ length: 55 }, () => new Particle());
const streaks = Array.from({ length: 10 }, () => new Streak());

function drawOrbs() {
  [{ x: .1, y: .2, r: 280, c: 'rgba(124,58,237,0.08)' }, { x: .9, y: .8, r: 320, c: 'rgba(96,165,250,0.06)' }, { x: .5, y: 0, r: 220, c: 'rgba(52,211,153,0.05)' }]
    .forEach(o => {
      const g = ctx.createRadialGradient(o.x * canvas.width, o.y * canvas.height, 0, o.x * canvas.width, o.y * canvas.height, o.r);
      g.addColorStop(0, o.c); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++)
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 140) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(167,139,250,${(1 - d / 140) * 0.07})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawOrbs(); drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  streaks.forEach(s => { s.update(); s.draw(); });
  requestAnimationFrame(animate);
}

animate();
function loginUser() {

  const name = document.getElementById("player-name").value;
  const email = document.getElementById("player-email").value;

  if (!name) {
    alert("Please enter your name");
    return;
  }

  // save name locally
  localStorage.setItem("bb_user", name);

  // send data to Google Sheet
  fetch("https://script.google.com/macros/s/AKfycbxtN9nNIlpYYTW0zlWJv9Zuu3ntuChcZcV8cYPKuSaoAaZ7obqdOnSKcncyjnnilRq3/exec", {
    method: "POST",
    body: JSON.stringify({
      name: name,
      email: email,
      time: new Date().toLocaleString()
    })
  });

  // go to home screen
  show("home-screen");

}
function saveScoreToSheet(score, currentCategory, currentDifficulty) {

  const name = localStorage.getItem("bb_user");
  const email = document.getElementById("player-email").value;

  fetch("https://script.google.com/macros/s/AKfycbxtN9nNIlpYTW0zlWJv9Zuw3ntuChcZcV8cYPKuSaoAa/exec", {
    method: "POST",
    body: JSON.stringify({
      name: name,
      email: email,
      score: score,
      category: currentCategory,
      difficulty: currentDifficulty,
      time: new Date().toLocaleString()
    })
  });

}
