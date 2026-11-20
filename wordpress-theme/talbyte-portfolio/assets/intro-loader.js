(() => {
  const root = document.documentElement;
  if (root.dataset.intro !== "pending") return;

  const intro = document.getElementById("site-intro");
  const board = document.getElementById("site-intro-board");
  const pctEl = document.getElementById("site-intro-pct");
  const barEl = document.getElementById("site-intro-bar");
  const msgEl = document.getElementById("site-intro-msg");
  const skipBtn = document.getElementById("site-intro-skip");
  if (!intro || !board || !pctEl || !barEl || !msgEl) {
    root.dataset.intro = "done";
    return;
  }

  const STORAGE_KEY = "talbyte_loader_seen";
  const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const MESSAGES = [
    "Shuffling letters",
    "Locking them in",
    "Almost cleared",
    "Ready for takeoff",
  ];
  const text = String(
    (window.talbyteIntro && window.talbyteIntro.text) || "TALHA Q."
  )
    .toUpperCase()
    .slice(0, 14);

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const timers = [];
  let raf = 0;
  let finished = false;
  let prevOverflow = "";

  function markSeen() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (_) {
      /* ignore */
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    markSeen();
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    window.removeEventListener("keydown", onKey);
    intro.classList.add("is-leaving");
    document.body.style.overflow = prevOverflow || "";
    root.dataset.intro = "done";
    timers.push(
      setTimeout(() => {
        intro.remove();
      }, 520)
    );
  }

  function onKey(e) {
    if (e.key === "Escape") finish();
  }

  function makeHalf(cls, ch) {
    const el = document.createElement("div");
    el.className = "site-intro__half " + cls;
    el.innerHTML = "<span>" + ch + "</span>";
    return el;
  }

  function makeTile(target, accent) {
    const el = document.createElement("div");
    el.className = "site-intro__tile" + (accent ? " is-accent" : "");
    const crease = document.createElement("div");
    crease.className = "site-intro__crease";
    el.appendChild(crease);
    const top = makeHalf("is-top", " ");
    const bot = makeHalf("is-bot", " ");
    const f1 = makeHalf("is-flip1", " ");
    const f2 = makeHalf("is-flip2", " ");
    [top, bot, f1, f2].forEach((node) => el.appendChild(node));
    return {
      el,
      target,
      cur: " ",
      busy: false,
      locked: false,
      last: 0,
      thr: 0,
      top,
      bot,
      f1,
      f2,
    };
  }

  function paint(tile, ch) {
    [tile.top, tile.bot, tile.f1, tile.f2].forEach((half) => {
      if (half.firstElementChild) half.firstElementChild.textContent = ch;
    });
  }

  function flip(tile, next, fast = false) {
    if (tile.busy || tile.cur === next) return false;
    tile.busy = true;
    if (tile.top.firstElementChild) tile.top.firstElementChild.textContent = next;
    if (tile.f1.firstElementChild) tile.f1.firstElementChild.textContent = tile.cur;
    if (tile.bot.firstElementChild) tile.bot.firstElementChild.textContent = tile.cur;
    if (tile.f2.firstElementChild) tile.f2.firstElementChild.textContent = next;
    tile.f1.style.visibility = "visible";
    tile.f2.style.visibility = "visible";

    const duration = fast ? 50 : 70;
    const a1 = tile.f1.animate(
      [
        { transform: "rotateX(0deg) translateZ(0px)" },
        { transform: "rotateX(-45deg) translateZ(12px)", offset: 0.5 },
        { transform: "rotateX(-90deg) translateZ(0px)" },
      ],
      {
        duration,
        easing: "cubic-bezier(0.45, 0, 0.7, 0.3)",
        fill: "forwards",
      }
    );

    a1.onfinish = () => {
      tile.f1.style.visibility = "hidden";
      const a2 = tile.f2.animate(
        [
          { transform: "rotateX(90deg) translateZ(0px)" },
          { transform: "rotateX(45deg) translateZ(12px)", offset: 0.5 },
          { transform: "rotateX(0deg) translateZ(0px)" },
        ],
        {
          duration,
          easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
          fill: "forwards",
        }
      );
      a2.onfinish = () => {
        paint(tile, next);
        a1.cancel();
        a2.cancel();
        tile.f1.style.visibility = "visible";
        tile.f2.style.visibility = "hidden";
        tile.cur = next;
        tile.busy = false;
      };
    };
    return true;
  }

  prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  skipBtn?.addEventListener("click", finish);
  window.addEventListener("keydown", onKey);
  timers.push(setTimeout(finish, 3200));

  board.innerHTML = "";
  const tiles = [];
  [...text].forEach((ch) => {
    if (ch === " ") {
      const gap = document.createElement("div");
      gap.className = "site-intro__gap";
      board.appendChild(gap);
      return;
    }
    const tile = makeTile(ch, ch === ".");
    tile.thr = 0.15 + (tiles.length / Math.max(text.replace(/\s/g, "").length, 1)) * 0.7;
    tiles.push(tile);
    board.appendChild(tile.el);
  });

  board.setAttribute("aria-label", text + " on a split-flap board");

  const started = performance.now();
  const duration = reduceMotion ? 500 : 1900;

  const tick = (now) => {
    if (finished) return;
    const progress = Math.min((now - started) / duration, 1);
    const pct = Math.round(progress * 100);
    pctEl.textContent = String(pct);
    barEl.style.transform = "scaleX(" + pct / 100 + ")";
    msgEl.textContent = MESSAGES[Math.min(3, Math.floor(pct / 34))];

    let allLocked = true;
    tiles.forEach((tile) => {
      if (tile.locked) return;
      if (progress >= 1) {
        paint(tile, tile.target);
        tile.cur = tile.target;
        tile.locked = true;
        tile.busy = false;
        tile.el.classList.add("is-locked");
        return;
      }
      allLocked = false;
      if (progress >= tile.thr) {
        if (tile.cur === tile.target || flip(tile, tile.target)) {
          tile.locked = true;
          tile.el.classList.add("is-locked");
        }
      } else if (now - tile.last > 110 + Math.random() * 65) {
        if (flip(tile, CHARSET[(Math.random() * CHARSET.length) | 0])) {
          tile.last = now;
        }
      }
    });

    if (allLocked && pct >= 100 && !finished && tiles.every((t) => !t.busy)) {
      finished = true;
      markSeen();
      cancelAnimationFrame(raf);
      timers.push(
        setTimeout(() => {
          tiles.forEach((tile, i) => {
            timers.push(
              setTimeout(() => {
                flip(tile, " ", true);
              }, i * 30)
            );
          });
        }, 240)
      );
      timers.push(
        setTimeout(() => {
          intro.classList.add("is-leaving");
          document.body.style.overflow = prevOverflow || "";
          root.dataset.intro = "done";
          window.removeEventListener("keydown", onKey);
          timers.push(
            setTimeout(() => {
              intro.remove();
            }, 520)
          );
        }, 240 + tiles.length * 30 + 50)
      );
      return;
    }

    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
})();
