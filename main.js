const reduce = document.documentElement.classList.contains("reduce-motion");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const store = {
  get(key, fallback = "") {
    try {
      const value = localStorage.getItem(key);
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore private mode */
    }
  },
};

const audio = {
  ctx: null,
  enabled: store.get("talha-sound") === "on",
  ensure() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === "suspended") this.ctx.resume();
  },
  tone(freq, dur = 0.08, type = "triangle", gain = 0.045) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, this.ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(amp);
    amp.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  },
  blip(freq = 540) {
    this.tone(freq, 0.07);
  },
  cheer() {
    [523, 659, 784].forEach((freq, i) => {
      setTimeout(() => this.tone(freq, 0.12), i * 90);
    });
  },
};

const $ = (sel) => document.querySelector(sel);
const buddy = $("#buddy");
const buddyWrap = $("#buddy-wrap");
const buddyStatus = $("#buddy-status");
let boops = Number(store.get("talha-boops", "0")) || 0;
let partyOn = false;
let idleTimer = 0;

function toast(message) {
  const box = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  box.appendChild(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 250);
  }, 2800);
}

function spawnFloater(x, y, text) {
  const el = document.createElement("span");
  el.className = "floater";
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 750);
}

function confetti(count = 80) {
  if (reduce) return;
  const colors = ["#6366f1", "#a855f7", "#22d3ee", "#f472b6", "#facc15", "#ffffff"];
  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement("i");
    bit.className = "confetti";
    bit.style.left = `${Math.random() * 100}vw`;
    bit.style.background = colors[i % colors.length];
    bit.style.width = `${6 + Math.random() * 7}px`;
    bit.style.height = `${10 + Math.random() * 10}px`;
    bit.style.animationDuration = `${1.8 + Math.random() * 1.8}s`;
    bit.style.animationDelay = `${Math.random() * 0.2}s`;
    document.body.appendChild(bit);
    setTimeout(() => bit.remove(), 4200);
  }
}

function setParty(on) {
  partyOn = on;
  document.body.classList.toggle("party", on);
  const btn = $("#party-toggle");
  btn.setAttribute("aria-pressed", String(on));
  btn.textContent = on ? "Party on" : "Party";
  document.title = on
    ? "🎉 Muhammad Talha Qamar | Portfolio"
    : "Muhammad Talha Qamar | Portfolio";
}

function boopLine(n) {
  if (n === 1) return "boop.";
  if (n === 5) return "okay that tickles";
  if (n === 10) return "we are friends now";
  if (n === 25) return "achievement: professional booper";
  if (n === 50) return "please stop. (do not stop)";
  if (n % 10 === 0) return `${n} boops. dedicated.`;
  const lines = ["boop.", "again.", "heh.", "squish.", "hello."];
  return n < 5 ? lines[n % lines.length] : `boops: ${n}`;
}

function boop(x, y) {
  boops += 1;
  store.set("talha-boops", String(boops));
  buddy.classList.remove("boop");
  void buddy.offsetWidth;
  buddy.classList.add("boop");
  buddy.classList.toggle("loved", boops >= 10);
  buddyStatus.textContent = boopLine(boops);
  buddy.setAttribute("aria-label", `Boop the blob. ${boops} ${boops === 1 ? "boop" : "boops"} so far.`);
  const rect = buddy.getBoundingClientRect();
  const faces = ["💜", "✨", "👾", "⚡", "🌟"];
  spawnFloater(x ?? rect.left + rect.width / 2, y ?? rect.top + 20, faces[boops % faces.length]);
  audio.blip(480 + (boops % 8) * 40);
  if (boops === 10) toast("Ten boops. The blob accepts you.");
  if (boops === 25) toast("Professional booper. Put it on the resume.");
  if (boops === 50) {
    toast("Fifty. The blob is filing a complaint. Affectionately.");
    confetti(60);
  }
}

function setupBuddy() {
  if (boops > 0) {
    buddyStatus.textContent = `boops: ${boops}`;
    buddy.classList.toggle("loved", boops >= 10);
    buddy.setAttribute("aria-label", `Boop the blob. ${boops} ${boops === 1 ? "boop" : "boops"} so far.`);
  }
  buddy.addEventListener("click", (event) => {
    boop(event.clientX, event.clientY);
  });
  buddy.addEventListener("animationend", () => buddy.classList.remove("boop"));
  if (!reduce) {
    setInterval(() => {
      if (document.hidden || buddy.classList.contains("boop") || partyOn) return;
      buddy.classList.add("wink");
      setTimeout(() => buddy.classList.remove("wink"), 180);
    }, 5200);
  }
}

function aimEyes(x, y) {
  document.querySelectorAll(".pupil").forEach((pupil) => {
    const eye = pupil.parentElement.getBoundingClientRect();
    const cx = eye.left + eye.width / 2;
    const cy = eye.top + eye.height / 2;
    const angle = Math.atan2(y - cy, x - cx);
    const dist = Math.min(7, Math.hypot(x - cx, y - cy) / 18);
    pupil.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
  });
}

function leanBuddy(x, y) {
  const rect = buddy.getBoundingClientRect();
  const dx = (x - (rect.left + rect.width / 2)) / 28;
  const dy = (y - (rect.top + rect.height / 2)) / 36;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  buddyWrap.style.transform = `rotate(${clamp(dx, -8, 8)}deg) translate(${clamp(dx, -6, 6)}px, ${clamp(dy, -4, 6)}px)`;
}

function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    buddyStatus.textContent = "psst. the bugs are winning.";
  }, 28000);
}

const mouse = { x: null, y: null };
let particles = [];
let particleRaf = 0;
let particleLast = 0;
const canvas = $("#particles");
const ctx = canvas.getContext("2d", { alpha: true });

function resizeCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawnParticles() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const count = Math.round(Math.min(w < 700 ? 36 : 80, Math.max(24, (w * h) / 20000)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 42,
    vy: (Math.random() - 0.5) * 42,
    hue: Math.random() * 360,
  }));
}

function drawParticles(dt) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);
  const linkDist = w < 700 ? 90 : 120;

  particles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (mouse.x != null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 170) {
        const pull = (partyOn ? 90 : 42) * dt;
        p.x += (dx / dist) * pull;
        p.y += (dy / dist) * pull;
      }
    }
    if (p.x < -10) p.x = w + 10;
    if (p.x > w + 10) p.x = -10;
    if (p.y < -10) p.y = h + 10;
    if (p.y > h + 10) p.y = -10;

    ctx.beginPath();
    ctx.fillStyle = partyOn
      ? `hsl(${(p.hue + performance.now() / 18) % 360} 90% 72%)`
      : "rgba(199, 196, 255, 0.8)";
    ctx.arc(p.x, p.y, partyOn ? 2.3 : 1.6, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > linkDist) continue;
      const alpha = (1 - dist / linkDist) * (partyOn ? 0.45 : 0.18);
      ctx.strokeStyle = partyOn
        ? `hsla(${(a.hue + performance.now() / 18) % 360}, 90%, 70%, ${alpha})`
        : `rgba(129, 140, 248, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
}

function particleLoop(now) {
  const dt = Math.min(0.033, (now - particleLast) / 1000 || 0.016);
  particleLast = now;
  drawParticles(dt);
  particleRaf = requestAnimationFrame(particleLoop);
}

function startParticles() {
  if (reduce || !ctx || particleRaf) return;
  resizeCanvas();
  if (!particles.length) spawnParticles();
  particleLast = performance.now();
  particleRaf = requestAnimationFrame(particleLoop);
}

function stopParticles() {
  cancelAnimationFrame(particleRaf);
  particleRaf = 0;
}

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let cursorTargetX = cursorX;
let cursorTargetY = cursorY;
let cursorHot = false;
let cursorRaf = 0;

function setupCursor() {
  if (!finePointer || reduce) return;
  document.body.classList.add("has-cursor");
  const ring = $("#cursor");
  const dot = $("#cursor-dot");

  const loop = () => {
    cursorX += (cursorTargetX - cursorX) * 0.18;
    cursorY += (cursorTargetY - cursorY) * 0.18;
    const scale = cursorHot ? 1.55 : 1;
    ring.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) scale(${scale})`;
    dot.style.transform = `translate(${cursorTargetX}px, ${cursorTargetY}px) translate(-50%, -50%)`;
    cursorRaf = requestAnimationFrame(loop);
  };
  cursorRaf = requestAnimationFrame(loop);

  document.addEventListener("mouseover", (event) => {
    cursorHot = Boolean(event.target.closest("a, button, input, textarea, .letter, .skill-card, .bug"));
  });
}

function onMove(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  cursorTargetX = event.clientX;
  cursorTargetY = event.clientY;
  document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
  document.documentElement.style.setProperty("--my", `${event.clientY}px`);
  aimEyes(event.clientX, event.clientY);
  if (finePointer) leanBuddy(event.clientX, event.clientY);
  resetIdle();
}

function splitName() {
  const el = $("#name");
  const text = el.textContent.trim();
  el.textContent = "";
  const letters = [];
  const words = text.split(" ");
  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";
    [...word].forEach((ch) => {
      const span = document.createElement("span");
      span.style.setProperty("--i", String(letters.length));
      if (/[a-z]/i.test(ch)) {
        span.className = "letter";
        span.dataset.ch = ch;
        span.textContent = ch;
        letters.push(span);
      } else {
        span.className = "mark";
        span.textContent = ch;
      }
      wordSpan.appendChild(span);
    });
    el.appendChild(wordSpan);
    if (wordIndex < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
  return letters;
}

function scramble(letters) {
  if (reduce || !letters.length) return;
  const glyphs = "!<>-_\\/[]{}=+*^?#";
  let frame = 0;
  const id = setInterval(() => {
    letters.forEach((letter, index) => {
      letter.textContent = frame > 5 + index * 1.15
        ? letter.dataset.ch
        : glyphs[(Math.random() * glyphs.length) | 0];
    });
    frame += 1;
    if (frame > 28) {
      clearInterval(id);
      letters.forEach((letter) => {
        letter.textContent = letter.dataset.ch;
      });
    }
  }, 36);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function typewriter() {
  if (reduce) return;
  const el = $("#role");
  const words = [
    "building playful interfaces",
    "squashing bugs for sport",
    "making buttons magnetic",
    "teaching pixels to dance",
    "still a frontend developer",
  ];
  let index = 0;
  while (el.isConnected) {
    const word = words[index % words.length];
    for (let i = 1; i <= word.length; i += 1) {
      el.textContent = word.slice(0, i);
      await wait(48);
    }
    await wait(1300);
    for (let i = word.length; i >= 0; i -= 1) {
      el.textContent = word.slice(0, i);
      await wait(24);
    }
    index += 1;
  }
}

function magnetize(el) {
  if (!finePointer) return;
  el.addEventListener("mousemove", (event) => {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * 0.28}px, ${y * 0.35 - 2}px)`;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
  });
}

function addRipple(event) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const dot = document.createElement("span");
  dot.className = "ripple";
  const size = 14;
  dot.style.width = `${size}px`;
  dot.style.height = `${size}px`;
  dot.style.left = `${event.clientX - rect.left - size / 2}px`;
  dot.style.top = `${event.clientY - rect.top - size / 2}px`;
  el.appendChild(dot);
  setTimeout(() => dot.remove(), 600);
}

function setupTilt(card) {
  if (!finePointer || reduce) return;
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * 12;
    const rotX = (0.5 - py) * 10;
    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    card.style.setProperty("--sx", `${px * 100}%`);
    card.style.setProperty("--sy", `${py * 100}%`);
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
}

const extraQuips = [
  "Still true.",
  "Poke received.",
  "This card is now emotionally attached.",
  "The XP is symbolic. The joy is not.",
  "Again? Bold.",
];

function pokeSkill(card) {
  const count = Number(card.dataset.pokes || 0) + 1;
  card.dataset.pokes = String(count);
  card.classList.add("charged");
  card.setAttribute("aria-pressed", "true");
  const quip = card.querySelector(".quip");
  quip.hidden = false;
  quip.textContent = count === 1 ? card.dataset.quip : extraQuips[(count - 2) % extraQuips.length];
  const rect = card.getBoundingClientRect();
  spawnFloater(rect.left + rect.width * 0.72, rect.top + 12, "+XP");
  audio.blip(620);
}

function setupScroll() {
  const bar = $("#progress");
  const onScroll = () => {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    bar.style.width = `${max > 0 ? (root.scrollTop / max) * 100 : 0}%`;
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = [...document.querySelectorAll(".nav-links a")];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-45% 0px -48% 0px", threshold: 0.01 });
  document.querySelectorAll("main section[id]").forEach((section) => spy.observe(section));

  const reveal = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      entry.target.querySelectorAll("[data-level]").forEach((level) => {
        level.style.width = `${level.dataset.level}%`;
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".scroll-target").forEach((el, index) => {
    el.style.transitionDelay = `${(index % 4) * 70}ms`;
    reveal.observe(el);
  });
}

function printLine(text, kind) {
  const out = $("#term-out");
  const line = document.createElement("p");
  line.className = `term-line${kind ? ` ${kind}` : ""}`;
  line.textContent = text;
  out.appendChild(line);
  while (out.children.length > 80) out.firstChild.remove();
  out.scrollTop = out.scrollHeight;
}

const jokes = [
  "Why do frontend devs prefer dark mode? Because light attracts bugs.",
  "I told CSS a joke. It didn't get the float.",
  "There are 10 kinds of people: those who understand binary and those who don't.",
  "Debugging: being the detective in a crime movie where you are also the murderer.",
  "A CSS bug walks into a bar. The bar collapses because of flex-direction.",
];

function runCommand(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  printLine(`talha@portfolio:~$ ${trimmed}`, "cmd");
  const [name, ...args] = trimmed.toLowerCase().split(/\s+/);

  const commands = {
    help: () => [
      "help      list commands",
      "about     who is this",
      "skills    the stack",
      "projects  featured work",
      "party     toggle the chaos",
      "game      jump to the bug hunt",
      "boop      boop the blob",
      "joke      receive one (1) joke",
      "theme     indigo | cyan | pink | lime",
      "secret    ???",
      "clear     wipe the screen",
    ].join("\n"),
    about: () => "Muhammad Talha Qamar — frontend developer. Responsive, clean web apps with HTML, CSS, and JavaScript. This page is the proof and the playground.",
    skills: () => "HTML5 · CSS3 (grid, flex, keyframes) · JavaScript (ES6+) · Git & GitHub\nPoke the cards below if you want them to talk back.",
    projects: () => "1. BYD Dolphin Surf — muhammad-talha-qamar.github.io/BYD-Dolphin-Surf-website\n2. SMIT Clone Website — muhammad-talha-qamar.github.io/SMIT-Clone-Website\n3. This portfolio (you are standing in it)",
    party: () => {
      setParty(!partyOn);
      if (partyOn) confetti(50);
      return partyOn ? "Party mode engaged. The blob found sunglasses." : "Party mode off. The blob is pretending to be professional.";
    },
    game: () => {
      $("#playground").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return "Scrolled to the incident. Press Start shift. The bugs filed a ticket.";
    },
    play: () => commands.game(),
    boop: () => {
      boop();
      return "boop transmitted.";
    },
    joke: () => jokes[Math.floor(Math.random() * jokes.length)],
    secret: () => "Some traditions survive frameworks. Up up down down left right left right B A.",
    sudo: () => "Nice try. This portfolio runs on vibes, not root.",
    ls: () => "about.txt  skills.txt  projects/  bugs.exe  party.sh  blob",
    whoami: () => "guest — but the blob already likes you",
    hi: () => "Hey. Try boop, or go cause a scene with party.",
    hello: () => commands.hi(),
    hey: () => commands.hi(),
    clear: () => {
      $("#term-out").replaceChildren();
      return "";
    },
  };

  if (name === "theme") {
    const theme = args[0];
    const allowed = ["indigo", "cyan", "pink", "lime"];
    if (!allowed.includes(theme)) {
      printLine("usage: theme indigo | cyan | pink | lime", "err");
      return;
    }
    if (theme === "indigo") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    store.set("talha-theme", theme === "indigo" ? "" : theme);
    printLine(`theme set to ${theme}.`);
    audio.blip(700);
    return;
  }

  if (!commands[name]) {
    printLine(`command not found: ${name}. try "help".`, "err");
    return;
  }

  const result = commands[name]();
  if (result) printLine(result);
  audio.blip(name === "sudo" ? 180 : 640);
}

function setupTerminal() {
  const form = $("#term-form");
  const input = $("#term-cmd");
  const history = [];
  let histIndex = -1;

  printLine("Welcome. Type help and press enter.");
  printLine("The colored dots are also buttons. Obviously.");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    if (value.trim()) {
      history.push(value);
      histIndex = history.length;
    }
    runCommand(value);
    input.value = "";
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    if (!history.length) return;
    event.preventDefault();
    if (event.key === "ArrowUp") histIndex = Math.max(0, histIndex - 1);
    else histIndex = Math.min(history.length, histIndex + 1);
    input.value = history[histIndex] || "";
  });

  $("#terminal").addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    input.focus();
  });

  $("#dot-red").addEventListener("click", () => {
    toast("This window does not close. It has tenure.");
    audio.blip(220);
  });
  $("#dot-yellow").addEventListener("click", () => {
    const term = $("#terminal");
    term.classList.add("minimized");
    setTimeout(() => term.classList.remove("minimized"), 650);
    audio.blip(400);
  });
  $("#dot-green").addEventListener("click", () => {
    setParty(!partyOn);
    toast(partyOn ? "Green means party." : "Back to a calm terminal.");
    if (partyOn) confetti(40);
    audio.blip(760);
  });
}

const game = {
  running: false,
  score: 0,
  combo: 0,
  raf: 0,
  last: 0,
  spawnAcc: 0,
  endAt: 0,
  pausedAt: 0,
  bugs: [],
  high: Number(store.get("talha-bug-best", "0")) || 0,
};

const bugFaces = ["🐛", "🐞", "🦗"];

function updateHud() {
  $("#score").textContent = String(game.score);
  $("#combo").textContent = `x${game.combo}`;
  const left = game.running ? Math.max(0, (game.endAt - performance.now()) / 1000) : 20;
  $("#time").textContent = String(Math.ceil(left));
}

function rankFor(score) {
  if (score >= 250) return "Legendary Debugger";
  if (score >= 160) return "Staff Squasher";
  if (score >= 90) return "Senior Exterminator";
  if (score >= 40) return "Junior Debugger";
  return "Intern (the bugs won)";
}

function finishGame() {
  game.running = false;
  cancelAnimationFrame(game.raf);
  game.raf = 0;
  game.bugs.forEach((bug) => bug.el.remove());
  game.bugs = [];
  $("#arena").style.touchAction = "";
  if (game.score > game.high) {
    game.high = game.score;
    store.set("talha-bug-best", String(game.high));
    $("#best").textContent = String(game.high);
  }
  const rank = rankFor(game.score);
  $("#game-title").textContent = rank;
  $("#game-desc").textContent = `You scored ${game.score}. Best is ${game.high}. The backlog remains.`;
  $("#start-game").textContent = "Run it back";
  $("#game-overlay").classList.remove("hidden");
  $("#game-result").textContent = `${rank}. Score ${game.score}.`;
  $("#start-game").focus();
  if (game.score >= 90) {
    confetti(100);
    audio.cheer();
  } else {
    audio.blip(180, 0.12);
  }
  toast(rank);
}

function squash(bug) {
  if (!game.running || bug.dead) return;
  bug.dead = true;
  game.combo += 1;
  const gain = 10 * Math.min(game.combo, 8);
  game.score += gain;
  bug.el.textContent = "💥";
  bug.el.classList.add("squashed");
  const pop = document.createElement("span");
  pop.className = "pop-score";
  pop.textContent = game.combo > 1 ? `+${gain} x${game.combo}` : `+${gain}`;
  pop.style.left = `${bug.x}px`;
  pop.style.top = `${bug.y}px`;
  $("#arena").appendChild(pop);
  setTimeout(() => pop.remove(), 700);
  audio.blip(640 + Math.min(game.combo, 8) * 28);
  updateHud();
}

function spawnBug() {
  const arena = $("#arena");
  const el = document.createElement("button");
  el.type = "button";
  el.className = "bug";
  el.tabIndex = -1;
  el.textContent = bugFaces[(Math.random() * bugFaces.length) | 0];
  el.setAttribute("aria-hidden", "true");
  const bug = {
    el,
    x: 20 + Math.random() * (arena.clientWidth - 70),
    y: 20 + Math.random() * (arena.clientHeight - 70),
    vx: (Math.random() < 0.5 ? -1 : 1) * (70 + Math.random() * 80),
    vy: (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 70),
    rot: Math.random() * 30 - 15,
    dead: false,
  };
  el.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    squash(bug);
  });
  el.style.transform = `translate(${bug.x}px, ${bug.y}px) rotate(${bug.rot}deg)`;
  arena.appendChild(el);
  game.bugs.push(bug);
}

function gameFrame(now) {
  if (!game.running) return;
  const dt = Math.min(0.032, (now - game.last) / 1000 || 0.016);
  game.last = now;
  const left = (game.endAt - now) / 1000;
  if (left <= 0) {
    updateHud();
    finishGame();
    return;
  }

  game.spawnAcc += dt;
  const interval = 0.32 + 0.62 * (left / 20);
  if (game.spawnAcc >= interval && game.bugs.filter((bug) => !bug.dead).length < 12) {
    game.spawnAcc = 0;
    spawnBug();
  }

  const arena = $("#arena");
  const maxX = arena.clientWidth - 48;
  const maxY = arena.clientHeight - 48;
  const speedBoost = 1 + (1 - left / 20) * 0.85;

  game.bugs.forEach((bug) => {
    if (bug.dead) return;
    bug.x += bug.vx * dt * speedBoost;
    bug.y += bug.vy * dt * speedBoost;
    if (bug.x < 0 || bug.x > maxX) bug.vx *= -1;
    if (bug.y < 0 || bug.y > maxY) bug.vy *= -1;
    bug.x = Math.max(0, Math.min(maxX, bug.x));
    bug.y = Math.max(0, Math.min(maxY, bug.y));
    bug.rot += dt * 40;
    bug.el.style.transform = `translate(${bug.x}px, ${bug.y}px) rotate(${bug.rot}deg)`;
  });

  game.bugs = game.bugs.filter((bug) => {
    if (bug.dead && bug.el.classList.contains("squashed")) {
      if (!bug.removeAt) bug.removeAt = now + 200;
      if (now >= bug.removeAt) {
        bug.el.remove();
        return false;
      }
    }
    return true;
  });

  updateHud();
  game.raf = requestAnimationFrame(gameFrame);
}

function startGame() {
  if (game.running) return;
  const arena = $("#arena");
  arena.querySelectorAll(".bug, .pop-score").forEach((node) => node.remove());
  game.bugs = [];
  game.score = 0;
  game.combo = 0;
  game.spawnAcc = 0;
  game.running = true;
  game.last = performance.now();
  game.endAt = game.last + 20000;
  arena.style.touchAction = "none";
  $("#game-overlay").classList.add("hidden");
  updateHud();
  spawnBug();
  audio.blip(520);
  game.raf = requestAnimationFrame(gameFrame);
}

function setupGame() {
  $("#best").textContent = String(game.high);
  $("#start-game").addEventListener("click", startGame);
  $("#arena").addEventListener("pointerdown", (event) => {
    if (!game.running || event.target.closest(".bug")) return;
    game.combo = 0;
    updateHud();
    const arena = $("#arena");
    arena.classList.remove("shake");
    void arena.offsetWidth;
    arena.classList.add("shake");
    audio.tone(120, 0.08, "square", 0.03);
  });
}

function vibeFor(length) {
  if (length === 0) return "…";
  if (length < 20) return "👀";
  if (length < 80) return "✨";
  if (length < 160) return "🔥";
  return "🤯";
}

function updateTransmission() {
  const name = $("#name-input").value.trim();
  const email = $("#email").value.trim();
  const message = $("#message").value;
  $("#tx-who").textContent = name || "someone out there";
  $("#tx-mail").textContent = email || "no email yet";
  const preview = $("#tx-preview");
  preview.textContent = message || "Your message will appear here as you type…";
  preview.classList.toggle("is-empty", message.length === 0);
  $("#vibe-fill").style.width = `${Math.min(100, (message.length / 180) * 100)}%`;
  $("#vibe-emoji").textContent = vibeFor(message.length);
  $("#count").textContent = `${message.length}/500`;
  if (message.length) $("#transmission").classList.remove("sent");
}

function setupForm() {
  ["#name-input", "#email", "#message"].forEach((sel) => {
    $(sel).addEventListener("input", updateTransmission);
  });

  document.querySelectorAll(".stickers button").forEach((button) => {
    button.addEventListener("click", () => {
      const field = $("#message");
      const sticker = button.dataset.sticker;
      if (field.value.length >= 500) return;
      const spacer = field.value && !field.value.endsWith(" ") ? " " : "";
      field.value = `${field.value}${spacer}${sticker}`;
      updateTransmission();
      field.focus();
      audio.blip(700);
      button.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.25) rotate(-8deg)" }, { transform: "scale(1)" }],
        { duration: 280, easing: "ease" },
      );
    });
  });

  $("#contact-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#name-input").value.trim() || "friend";
    $("#transmission").classList.add("sent");
    confetti(110);
    audio.cheer();
    toast(`Got it, ${name}. Confetti is real. Email is not — this form is a demo.`);
    boop();
    buddyStatus.textContent = "message received. allegedly.";
    event.currentTarget.reset();
    updateTransmission();
    $("#transmission").classList.add("sent");
  });
}

function setupChrome() {
  const menu = $("#menu-toggle");
  const closeMenu = () => {
    document.body.classList.remove("nav-open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open menu");
  };

  menu.addEventListener("click", () => {
    const open = !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMenu();
  });

  $("#sound-toggle").setAttribute("aria-pressed", String(audio.enabled));
  $("#sound-toggle").textContent = audio.enabled ? "sfx on" : "sfx off";
  $("#sound-toggle").addEventListener("click", () => {
    audio.enabled = !audio.enabled;
    store.set("talha-sound", audio.enabled ? "on" : "off");
    $("#sound-toggle").setAttribute("aria-pressed", String(audio.enabled));
    $("#sound-toggle").textContent = audio.enabled ? "sfx on" : "sfx off";
    if (audio.enabled) {
      audio.ensure();
      audio.cheer();
      toast("Sound on. Tiny triangle waves only.");
    } else {
      toast("Sound off. The blob mimes now.");
    }
  });

  $("#party-toggle").addEventListener("click", () => {
    setParty(!partyOn);
    toast(partyOn ? "Party mode. The sunglasses were non-negotiable." : "Party over. Back to shipping.");
    if (partyOn) {
      confetti(70);
      audio.cheer();
    }
  });

  $("#surprise").addEventListener("click", () => {
    const spots = [
      ["#skills", "Skills — poke the cards."],
      ["#projects", "Projects — tilt them, they like it."],
      ["#playground", "The bugs would like a word."],
      ["#contact", "Say hi. Stickers encouraged."],
    ];
    const [href, message] = spots[(Math.random() * spots.length) | 0];
    document.querySelector(href).scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    toast(message);
    audio.blip(580);
  });

  let logoHits = 0;
  let logoTimer = 0;
  $(".logo").addEventListener("click", (event) => {
    logoHits += 1;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => {
      logoHits = 0;
    }, 1400);
    spawnFloater(event.clientX, event.clientY, "✨");
    if (logoHits >= 5) {
      event.preventDefault();
      logoHits = 0;
      setParty(true);
      confetti(90);
      toast("Five rapid logo clicks. Chaos authorized.");
      audio.cheer();
    }
  });

  $("#js-word").addEventListener("click", () => {
    confetti(70);
    toast("Yes. All of it.");
    audio.cheer();
  });

  $("#year").textContent = String(new Date().getFullYear());

  document.querySelectorAll(".magnet").forEach((el) => {
    magnetize(el);
    el.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") addRipple(event);
    });
  });
  document.querySelectorAll(".cta-btn, .secondary-btn").forEach((el) => {
    if (el.classList.contains("magnet")) return;
    el.addEventListener("pointerdown", (event) => {
      if (typeof event.clientX === "number") addRipple(event);
    });
  });

  document.querySelectorAll(".tilt").forEach(setupTilt);
  document.querySelectorAll(".skill-card").forEach((card) => {
    card.addEventListener("click", () => pokeSkill(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      pokeSkill(card);
    });
  });
}

const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiIndex = 0;

function onKey(event) {
  if (event.key === "Escape") {
    $("#boot")?.remove();
    document.body.classList.remove("nav-open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
  }

  const typing = event.target.closest("input, textarea");
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === konami[konamiIndex]) {
    konamiIndex += 1;
    if (konamiIndex === konami.length) {
      konamiIndex = 0;
      setParty(true);
      confetti(140);
      toast("Konami code. The old ways still work.");
      audio.cheer();
    }
  } else {
    konamiIndex = key === konami[0] ? 1 : 0;
  }

  if (typing || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
  if (key === "p") {
    setParty(!partyOn);
    toast(partyOn ? "P for party." : "P for please calm down.");
    if (partyOn) confetti(40);
  }
  if (key === "b") boop();
}

function setupBoot() {
  const boot = $("#boot");
  if (!boot || reduce) {
    boot?.remove();
    return;
  }
  const lines = ["teaching pixels to dance…", "hiding bugs in production…", "warming up the blob…", "ready"];
  let step = 0;
  const text = $("#boot-text");
  const cycle = setInterval(() => {
    step += 1;
    if (!text || step >= lines.length) {
      clearInterval(cycle);
      return;
    }
    text.textContent = lines[step];
  }, 380);
  const close = () => boot.remove();
  boot.addEventListener("click", close);
  setTimeout(close, 1750);
}

function onVisibility() {
  if (document.hidden) {
    stopParticles();
    if (game.running) {
      game.pausedAt = performance.now();
      cancelAnimationFrame(game.raf);
      game.raf = 0;
    }
    return;
  }
  startParticles();
  if (game.running && !game.raf) {
    const drift = performance.now() - game.pausedAt;
    game.endAt += drift;
    game.last = performance.now();
    game.raf = requestAnimationFrame(gameFrame);
  }
}

function init() {
  setupBoot();
  setupBuddy();
  scramble(splitName());
  typewriter();
  setupCursor();
  setupScroll();
  setupTerminal();
  setupGame();
  setupForm();
  setupChrome();
  resetIdle();
  startParticles();

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseout", (event) => {
    if (!event.relatedTarget && !event.toElement) mouse.x = mouse.y = null;
  });
  window.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", () => {
    if (reduce) return;
    resizeCanvas();
    spawnParticles();
  });

  document.addEventListener("pointerdown", () => {
    if (audio.enabled) audio.ensure();
  }, { once: true });

  console.log(
    "%cHey, curious. Type help in the on-page terminal — or try the Konami code.",
    "background:#6366f1;color:white;padding:6px 10px;border-radius:8px;font-size:13px;",
  );
}

init();
