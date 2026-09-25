const sideBar = document.querySelector(".sidebar");
const menu = document.querySelector(".menu-icon");
const closeIcon = document.querySelector(".close-icon");
const navOverlay = document.getElementById("nav-overlay");
const modeToggle = document.getElementById("mode-toggle");
const year = document.getElementById("year");
const contactForm = document.getElementById("contact-form");

if (year) year.textContent = String(new Date().getFullYear());

document.querySelectorAll(".sidebar ul li").forEach((li, i) => {
  li.style.setProperty("--i", String(i));
});
document.querySelectorAll(".social-sidebar a").forEach((a, i) => {
  a.style.setProperty("--i", String(i));
});

function setMenuOpen(open, { focus = true } = {}) {
  if (!sideBar || !menu) return;
  sideBar.classList.toggle("open-sidebar", open);
  sideBar.classList.toggle("close-sidebar", !open);
  sideBar.setAttribute("aria-hidden", open ? "false" : "true");
  menu.setAttribute("aria-expanded", open ? "true" : "false");
  menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("nav-open", open);
  if (navOverlay) {
    navOverlay.hidden = !open;
    navOverlay.classList.toggle("is-visible", open);
  }
  if (!focus) return;
  if (open) {
    closeIcon?.focus();
  } else {
    menu.focus();
  }
}

function closeSidebar(options) {
  setMenuOpen(false, options);
}

function openSidebar() {
  setMenuOpen(true);
}

menu?.addEventListener("click", () => {
  const isOpen = sideBar?.classList.contains("open-sidebar");
  setMenuOpen(!isOpen);
});

closeIcon?.addEventListener("click", () => closeSidebar());
navOverlay?.addEventListener("click", () => closeSidebar());

document.querySelectorAll(".sidebar a").forEach((link) => {
  link.addEventListener("click", () => closeSidebar({ focus: false }));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sideBar?.classList.contains("open-sidebar")) {
    closeSidebar();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900 && sideBar?.classList.contains("open-sidebar")) {
    closeSidebar({ focus: false });
  }
});

function setMode(mode) {
  const next = mode === "light" ? "light" : "dark";
  document.documentElement.dataset.mode = next;
  try {
    localStorage.setItem("talha-mode", next);
  } catch (err) {
    /* private mode */
  }
  const toLight = next === "dark";
  modeToggle.setAttribute("aria-label", toLight ? "Switch to light mode" : "Switch to dark mode");
  modeToggle.title = toLight ? "Switch to light mode" : "Switch to dark mode";
  const meta = document.getElementById("theme-color");
  if (meta) meta.setAttribute("content", next === "light" ? "#eef2ff" : "#050816");
}

setMode(document.documentElement.dataset.mode || "dark");

modeToggle.addEventListener("click", () => {
  setMode(document.documentElement.dataset.mode === "light" ? "dark" : "light");
});

const CONTACT_EMAIL = "m.talha.qamar.1st@gmail.com";
const contactStatus = document.getElementById("contact-status");
const contactSubmit = document.getElementById("contact-submit");

function setContactStatus(message, type) {
  if (!contactStatus) return;
  contactStatus.hidden = !message;
  contactStatus.textContent = message || "";
  contactStatus.classList.remove("is-success", "is-error", "is-pending");
  if (type) contactStatus.classList.add(`is-${type}`);
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const honey = String(formData.get("_honey") || "").trim();

    if (honey) return;

    if (contactSubmit) contactSubmit.disabled = true;
    setContactStatus("Sending your message…", "pending");

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Portfolio message from ${name}`,
          _template: "table",
          _captcha: "false",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === "false" || result.success === false) {
        throw new Error(result.message || "Unable to send message.");
      }

      contactForm.reset();
      setContactStatus(`Thanks, ${name}! Your message was sent. I'll get back to you soon.`, "success");
    } catch (err) {
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setContactStatus(
        "Couldn't send from the page — your email app should open with the message ready.",
        "error"
      );
    } finally {
      if (contactSubmit) contactSubmit.disabled = false;
    }
  });
}

document.querySelectorAll(".project-vidbox img").forEach((img) => {
  const sign = img.parentElement.querySelector(".hover-sign");
  img.parentElement.addEventListener("mouseenter", () => {
    if (sign) sign.classList.add("active");
  });
  img.parentElement.addEventListener("mouseleave", () => {
    if (sign) sign.classList.remove("active");
  });
});

/* Interactive passion keyboard — key borders glow toward the cursor */
(() => {
  const root = document.querySelector("[data-passion-keys]");
  if (!root) return;

  const keys = [...root.querySelectorAll("[data-key]")];
  if (!keys.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const glowRadius = 150;
  const state = keys.map(() => 0);
  const target = keys.map(() => 0);
  let raf = 0;
  let active = false;

  function distanceToRect(px, py, rect) {
    const dx = Math.max(rect.left - px, 0, px - rect.right);
    const dy = Math.max(rect.top - py, 0, py - rect.bottom);
    return Math.hypot(dx, dy);
  }

  function paint() {
    let moving = false;
    for (let i = 0; i < keys.length; i += 1) {
      state[i] += (target[i] - state[i]) * (reduceMotion ? 1 : 0.28);
      if (Math.abs(state[i] - target[i]) > 0.004) moving = true;
      keys[i].style.setProperty("--glow", state[i].toFixed(3));
    }
    root.classList.toggle("is-lit", state.some((v) => v > 0.03));
    if (moving || active) raf = requestAnimationFrame(paint);
    else raf = 0;
  }

  function ensurePaint() {
    if (!raf) raf = requestAnimationFrame(paint);
  }

  function updateFromPoint(clientX, clientY) {
    for (let i = 0; i < keys.length; i += 1) {
      const dist = distanceToRect(clientX, clientY, keys[i].getBoundingClientRect());
      const t = Math.max(0, 1 - dist / glowRadius);
      // Strong center glow with soft falloff across neighboring keys
      target[i] = Math.min(1, t * t * (0.55 + 0.9 * t));
    }
    ensurePaint();
  }

  function clearGlow() {
    active = false;
    for (let i = 0; i < target.length; i += 1) target[i] = 0;
    ensurePaint();
  }

  if (finePointer) {
    root.addEventListener(
      "pointermove",
      (e) => {
        active = true;
        updateFromPoint(e.clientX, e.clientY);
      },
      { passive: true }
    );
    root.addEventListener("pointerenter", (e) => {
      active = true;
      updateFromPoint(e.clientX, e.clientY);
    });
    root.addEventListener("pointerleave", clearGlow);
  } else {
    root.addEventListener(
      "pointerdown",
      (e) => {
        active = true;
        updateFromPoint(e.clientX, e.clientY);
        window.setTimeout(clearGlow, 700);
      },
      { passive: true }
    );
  }
})();

/* ——— Extreme reactivity ——— */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;
  const header = document.querySelector("header");
  const orb = document.querySelector(".cursor-orb");
  const ring = document.querySelector(".cursor-ring");
  const progress = document.getElementById("scroll-progress");
  const navLinks = [
    ...document.querySelectorAll("header ul a, .nav-links a, .sidebar ul a"),
  ];
  const sections = ["home", "about", "projects", "skills", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  root.classList.add("is-reactive");
  if (reduceMotion) {
    root.classList.add("reduce-motion");
    if (progress) {
      window.addEventListener("scroll", () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? window.scrollY / max : 0;
        progress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
      }, { passive: true });
    }
    return;
  }

  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: 0, ty: 0 };
  const ringPos = { x: pointer.x, y: pointer.y };
  let pointerTick = false;
  let scrollTick = false;

  const lerp = (a, b, n) => a + (b - a) * n;

  function setPointerVars() {
    const nx = (pointer.x / window.innerWidth) * 2 - 1;
    const ny = (pointer.y / window.innerHeight) * 2 - 1;
    root.style.setProperty("--mx", `${pointer.x}px`);
    root.style.setProperty("--my", `${pointer.y}px`);
    root.style.setProperty("--mxn", nx.toFixed(4));
    root.style.setProperty("--myn", ny.toFixed(4));
  }

  function updateParallax() {
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const depth = Number(el.dataset.parallax) || 0.1;
      const x = pointer.tx * depth * 40;
      const y = pointer.ty * depth * 40;
      el.style.setProperty("--px", `${x.toFixed(2)}px`);
      el.style.setProperty("--py", `${y.toFixed(2)}px`);
    });
  }

  function updateCursor() {
    if (!finePointer || !orb || !ring) return;
    orb.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
    ringPos.x = lerp(ringPos.x, pointer.x, 0.18);
    ringPos.y = lerp(ringPos.y, pointer.y, 0.18);
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
  }

  function onPointerMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    if (!pointerTick) {
      pointerTick = true;
      requestAnimationFrame(() => {
        setPointerVars();
        updateParallax();
        pointerTick = false;
      });
    }
  }

  function cursorLoop() {
    updateCursor();
    requestAnimationFrame(cursorLoop);
  }

  if (finePointer) {
    root.classList.add("has-cursor");
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseenter", () => root.classList.add("cursor-on"));
    document.addEventListener("mouseleave", () => root.classList.remove("cursor-on"));
    cursorLoop();

    document.querySelectorAll("a, button, .card, .skill-panel, .project-vidbox, input, textarea").forEach((el) => {
      el.addEventListener("pointerenter", () => root.classList.add("cursor-hover"));
      el.addEventListener("pointerleave", () => root.classList.remove("cursor-hover"));
    });
  }

  /* Smooth 3D tilt + spotlight */
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const max = Number(el.dataset.tiltMax) || 10;
    const state = { rx: 0, ry: 0, sx: 50, sy: 50, trx: 0, tryY: 0, tsx: 50, tsy: 50, active: false };
    let raf = 0;

    function tick() {
      state.rx = lerp(state.rx, state.trx, 0.16);
      state.ry = lerp(state.ry, state.tryY, 0.16);
      state.sx = lerp(state.sx, state.tsx, 0.18);
      state.sy = lerp(state.sy, state.tsy, 0.18);
      el.style.setProperty("--rx", `${state.rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${state.ry.toFixed(2)}deg`);
      el.style.setProperty("--sx", `${state.sx.toFixed(1)}%`);
      el.style.setProperty("--sy", `${state.sy.toFixed(1)}%`);
      const moving =
        Math.abs(state.rx - state.trx) > 0.02 ||
        Math.abs(state.ry - state.tryY) > 0.02 ||
        state.active;
      if (moving) raf = requestAnimationFrame(tick);
      else raf = 0;
    }

    function ensureTick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      state.trx = (0.5 - py) * max;
      state.tryY = (px - 0.5) * max;
      state.tsx = px * 100;
      state.tsy = py * 100;
      state.active = true;
      el.classList.add("is-tilting");
      ensureTick();
    });

    el.addEventListener("pointerleave", () => {
      state.trx = 0;
      state.tryY = 0;
      state.tsx = 50;
      state.tsy = 50;
      state.active = false;
      el.classList.remove("is-tilting");
      ensureTick();
    });
  });

  /* Interactive globe — cursor-driven tilt, parallax & specular */
  if (finePointer) {
    document.querySelectorAll("[data-globe]").forEach((globe) => {
      const card = globe.closest(".card") || globe;
      const state = {
        gx: 0,
        gy: 0,
        gtx: 0,
        gty: 0,
        gs: 1,
        glx: 50,
        gly: 40,
        tgx: 0,
        tgy: 0,
        tgtx: 0,
        tgty: 0,
        tgs: 1,
        tglx: 50,
        tgly: 40,
        active: false,
      };
      let raf = 0;

      function apply() {
        globe.style.setProperty("--gx", `${state.gx.toFixed(2)}deg`);
        globe.style.setProperty("--gy", `${state.gy.toFixed(2)}deg`);
        globe.style.setProperty("--gtx", `${state.gtx.toFixed(2)}px`);
        globe.style.setProperty("--gty", `${state.gty.toFixed(2)}px`);
        globe.style.setProperty("--gs", state.gs.toFixed(3));
        globe.style.setProperty("--glx", `${state.glx.toFixed(1)}%`);
        globe.style.setProperty("--gly", `${state.gly.toFixed(1)}%`);
      }

      function tick() {
        state.gx = lerp(state.gx, state.tgx, 0.14);
        state.gy = lerp(state.gy, state.tgy, 0.14);
        state.gtx = lerp(state.gtx, state.tgtx, 0.16);
        state.gty = lerp(state.gty, state.tgty, 0.16);
        state.gs = lerp(state.gs, state.tgs, 0.12);
        state.glx = lerp(state.glx, state.tglx, 0.2);
        state.gly = lerp(state.gly, state.tgly, 0.2);
        apply();
        const moving =
          Math.abs(state.gx - state.tgx) > 0.03 ||
          Math.abs(state.gy - state.tgy) > 0.03 ||
          Math.abs(state.gtx - state.tgtx) > 0.08 ||
          state.active;
        if (moving) raf = requestAnimationFrame(tick);
        else raf = 0;
      }

      function ensureTick() {
        if (!raf) raf = requestAnimationFrame(tick);
      }

      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const nx = px * 2 - 1;
        const ny = py * 2 - 1;
        state.tgx = -ny * 18;
        state.tgy = nx * 22;
        state.tgtx = nx * 14;
        state.tgty = ny * 10;
        state.tgs = 1.08;
        state.tglx = px * 100;
        state.tgly = py * 100;
        state.active = true;
        globe.classList.add("is-tracking");
        ensureTick();
      });

      card.addEventListener("pointerleave", () => {
        state.tgx = 0;
        state.tgy = 0;
        state.tgtx = 0;
        state.tgty = 0;
        state.tgs = 1;
        state.tglx = 50;
        state.tgly = 40;
        state.active = false;
        globe.classList.remove("is-tracking");
        ensureTick();
      });
    });
  }

  /* Magnetic buttons with spring return */
  if (finePointer) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.32;
      const state = { x: 0, y: 0, tx: 0, ty: 0 };
      let raf = 0;

      function tick() {
        state.x = lerp(state.x, state.tx, 0.18);
        state.y = lerp(state.y, state.ty, 0.18);
        el.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`;
        if (
          Math.abs(state.x - state.tx) > 0.05 ||
          Math.abs(state.y - state.ty) > 0.05
        ) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = 0;
          if (state.tx === 0 && state.ty === 0) el.style.transform = "";
        }
      }

      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        state.tx = (e.clientX - (rect.left + rect.width / 2)) * strength;
        state.ty = (e.clientY - (rect.top + rect.height / 2)) * strength;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener("pointerleave", () => {
        state.tx = 0;
        state.ty = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  }

  /* Image hover parallax — all major pictures */
  if (finePointer) {
    const motionTargets = [
      { box: ".project-vidbox", media: "img:not(.project-thumb--gaze), video", x: 28, y: 20, scale: 1.12, follow: 0.14 },
      { box: ".card", media: "img", x: 18, y: 14, scale: 1.08, follow: 0.14 },
      { box: ".hero-photo-wrap", media: ".hero-photo, img", x: 12, y: 9, scale: 1.08, follow: 0.14 },
      { box: ".passion-keyboard", media: ".passion-img, img", x: 14, y: 10, scale: 1.05, follow: 0.14 },
      { box: ".left", media: "img", x: 6, y: 6, scale: 1.08, follow: 0.14 },
      { box: ".footer-brand", media: "img", x: 6, y: 6, scale: 1.08, follow: 0.14 },
      { box: ".slider .item", media: "img", x: 10, y: 10, scale: 1.1, follow: 0.14 },
    ];

    const boundMedia = new WeakSet();

    motionTargets.forEach(({ box, media, x, y, scale, follow }) => {
      document.querySelectorAll(box).forEach((host) => {
        const el = host.querySelector(media);
        if (!el || boundMedia.has(el)) return;
        boundMedia.add(el);
        el.classList.add("img-motion");
        host.classList.add("img-motion-host");

        const state = { x: 0, y: 0, tx: 0, ty: 0, s: 1, ts: 1 };
        let raf = 0;
        const ease = follow || 0.14;

        function tick() {
          state.x = lerp(state.x, state.tx, ease);
          state.y = lerp(state.y, state.ty, ease);
          state.s = lerp(state.s, state.ts, ease);
          el.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) scale(${state.s.toFixed(3)})`;
          const moving =
            Math.abs(state.x - state.tx) > 0.05 ||
            Math.abs(state.y - state.ty) > 0.05 ||
            Math.abs(state.s - state.ts) > 0.002;
          if (moving) raf = requestAnimationFrame(tick);
          else raf = 0;
        }

        function ensureTick() {
          if (!raf) raf = requestAnimationFrame(tick);
        }

        host.addEventListener("pointermove", (e) => {
          const rect = host.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          state.tx = px * x;
          state.ty = py * y;
          state.ts = scale;
          ensureTick();
        });

        host.addEventListener("pointerleave", () => {
          state.tx = 0;
          state.ty = 0;
          state.ts = 1;
          ensureTick();
        });
      });
    });

    /* Man in DepthForge preview — turns to look at the cursor */
    document.querySelectorAll(".project-thumb--gaze").forEach((el) => {
      const host = el.closest(".project-vidbox") || el.parentElement;
      if (!host || boundMedia.has(el)) return;
      boundMedia.add(el);
      el.classList.add("img-motion");
      host.classList.add("img-motion-host", "gaze-host");

      const maxX = 16;
      const maxY = 22;
      const state = { rx: 0, ry: 0, trx: 0, tryY: 0, s: 1, ts: 1 };
      let raf = 0;

      function tick() {
        state.rx = lerp(state.rx, state.trx, 0.16);
        state.ry = lerp(state.ry, state.tryY, 0.16);
        state.s = lerp(state.s, state.ts, 0.14);
        el.style.transform =
          `perspective(700px) rotateX(${state.rx.toFixed(2)}deg) rotateY(${state.ry.toFixed(2)}deg)` +
          ` scale(${state.s.toFixed(3)})`;
        const moving =
          Math.abs(state.rx - state.trx) > 0.02 ||
          Math.abs(state.ry - state.tryY) > 0.02 ||
          Math.abs(state.s - state.ts) > 0.002;
        if (moving) raf = requestAnimationFrame(tick);
        else raf = 0;
      }

      function ensureTick() {
        if (!raf) raf = requestAnimationFrame(tick);
      }

      host.addEventListener("pointermove", (e) => {
        const rect = host.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        /* Face turns toward the cursor */
        state.tryY = px * maxY * 2;
        state.trx = -py * maxX * 2;
        state.ts = 1.06;
        ensureTick();
      });

      host.addEventListener("pointerleave", () => {
        state.trx = 0;
        state.tryY = 0;
        state.ts = 1;
        ensureTick();
      });
    });
  }

  /* Skills digital brain — ambient drift + cursor steer */
  {
    const brain = document.querySelector(".skills-image");
    if (brain) {
      const stage = brain.closest(".skills-stage");
      brain.classList.add("img-motion", "skills-brain-live");
      if (stage) stage.classList.add("img-motion-host");

      const state = {
        x: 0,
        y: 0,
        r: 0,
        s: 1,
        cx: 0,
        cy: 0,
        tcx: 0,
        tcy: 0,
        hovering: false,
      };
      const idleAmpX = 20;
      const idleAmpY = 16;
      const cursorAmpX = 42;
      const cursorAmpY = 32;
      const t0 = performance.now();
      let visible = true;

      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
          },
          { rootMargin: "80px", threshold: 0 }
        );
        io.observe(brain);
      }

      function frame(now) {
        if (visible) {
          const t = (now - t0) / 1000;
          const idleX =
            Math.sin(t * 0.75) * idleAmpX + Math.sin(t * 1.35) * 7;
          const idleY =
            Math.cos(t * 0.6) * idleAmpY + Math.sin(t * 0.95) * 6;
          const idleR = Math.sin(t * 0.45) * 5 + Math.cos(t * 0.8) * 2;
          const idleS = 1 + Math.sin(t * 0.7) * 0.035;

          state.cx = lerp(state.cx, state.tcx, 0.18);
          state.cy = lerp(state.cy, state.tcy, 0.18);

          const targetX = idleX + state.cx;
          const targetY = idleY + state.cy;
          const targetR = idleR + (state.hovering ? state.cx * 0.08 : 0);
          const targetS = state.hovering ? 1.1 : idleS;

          state.x = lerp(state.x, targetX, 0.12);
          state.y = lerp(state.y, targetY, 0.12);
          state.r = lerp(state.r, targetR, 0.1);
          state.s = lerp(state.s, targetS, 0.12);

          brain.style.transform =
            `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)` +
            ` rotate(${state.r.toFixed(2)}deg)` +
            ` scale(${state.s.toFixed(3)})`;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      if (finePointer) {
        brain.addEventListener("pointerenter", () => {
          state.hovering = true;
        });
        brain.addEventListener("pointerleave", () => {
          state.hovering = false;
          state.tcx = 0;
          state.tcy = 0;
        });
        brain.addEventListener("pointermove", (e) => {
          /* Use layout box (ignores transform) so steering stays stable */
          const cx = brain.offsetLeft + brain.offsetWidth / 2;
          const cy = brain.offsetTop + brain.offsetHeight / 2;
          const origin = stage || brain.offsetParent;
          const originRect = origin
            ? origin.getBoundingClientRect()
            : brain.getBoundingClientRect();
          const px =
            (e.clientX - originRect.left - cx) / Math.max(brain.offsetWidth / 2, 1);
          const py =
            (e.clientY - originRect.top - cy) / Math.max(brain.offsetHeight / 2, 1);
          state.tcx = Math.max(-1, Math.min(1, px)) * cursorAmpX;
          state.tcy = Math.max(-1, Math.min(1, py)) * cursorAmpY;
        });
      }
    }
  }

  /* Scroll: progress + header + active nav */
  function onScroll() {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 24);
    root.style.setProperty("--scroll", String(Math.min(y / 800, 1)));

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? y / max : 0;
      progress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
    }

    let current = sections[0]?.id || "home";
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) {
        current = section.id;
      }
    }
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === `#${current}`);
    });
  }

  window.addEventListener("scroll", () => {
    if (!scrollTick) {
      requestAnimationFrame(() => {
        onScroll();
        scrollTick = false;
      });
      scrollTick = true;
    }
  }, { passive: true });
  onScroll();

  /* Reveal-on-view for section titles */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-revealed"));
  }

  /* Skill chips: staggered lift */
  document.querySelectorAll(".skill-list").forEach((list) => {
    [...list.children].forEach((item, i) => {
      item.style.setProperty("--i", String(i));
    });
  });

  /* Ripple on primary actions */
  document.querySelectorAll(".hero-btn, .card-btn, .project-btn, .contact-box button, .theme-toggle").forEach((el) => {
    el.addEventListener("pointerdown", (e) => {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });

  /* Smooth section focus for keyboard nav */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });

  /* Interactive cosmos — max spectacle */
  const canvas = document.getElementById("bg-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      px: window.innerWidth / 2,
      py: window.innerHeight / 2,
      active: false,
      speed: 0,
      down: false,
      charge: 0,
      chargeX: 0,
      chargeY: 0,
    };
    let particles = [];
    let orbs = [];
    let trail = [];
    let bursts = [];
    let meteors = [];
    let pulses = [];
    let ripples = [];
    let dust = [];
    let spirals = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let rafId = 0;
    let lastScrollY = window.scrollY;
    let scrollVel = 0;
    let warp = 0;
    let tick = 0;
    let pulseTimer = 0;

    const chargeEl = document.createElement("div");
    chargeEl.className = "charge-ring";
    chargeEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(chargeEl);

    function particleCount() {
      return Math.min(150, Math.max(50, Math.floor((w * h) / 14000)));
    }

    function makeParticle() {
      const depth = 0.3 + Math.random() * 0.7;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * depth,
        vy: (Math.random() - 0.5) * 0.25 * depth,
        r: (0.5 + Math.random() * 1.9) * depth,
        depth,
        twinkle: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.65 ? 210 : Math.random() > 0.45 ? 265 : 185,
      };
    }

    function makeOrb() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 40 + Math.random() * 90,
        hue: 190 + Math.random() * 90,
        phase: Math.random() * Math.PI * 2,
      };
    }

    function makeDust() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.4 + Math.random() * 0.6,
        r: 0.4 + Math.random() * 1.2,
        hue: 200 + Math.random() * 60,
      };
    }

    function spawnMeteor() {
      const fromLeft = Math.random() > 0.5;
      meteors.push({
        x: fromLeft ? -40 : w + 40,
        y: Math.random() * h * 0.5,
        vx: fromLeft ? 7 + Math.random() * 6 : -(7 + Math.random() * 6),
        vy: 2.8 + Math.random() * 4,
        life: 1,
        len: 60 + Math.random() * 90,
        hue: Math.random() > 0.5 ? 200 : 280,
      });
    }

    function spawnBurst(x, y, count = 28, power = 1) {
      const sparks = [];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
        const speed = (1.8 + Math.random() * 5.5) * power;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          r: (1.2 + Math.random() * 2.6) * power,
          hue: 170 + Math.random() * 120,
        });
      }
      bursts.push({ sparks, ring: 0, x, y, life: 1, power });
      ripples.push({ x, y, r: 8, life: 1, max: 120 * power });
    }

    function spawnSpiral(x, y) {
      for (let i = 0; i < 10; i++) {
        const a = tick * 0.2 + i * 0.55;
        spirals.push({
          x: x + Math.cos(a) * 8,
          y: y + Math.sin(a) * 8,
          vx: Math.cos(a) * 2.2,
          vy: Math.sin(a) * 2.2,
          life: 1,
          hue: 200 + i * 8,
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = particleCount();
      if (particles.length !== count) particles = Array.from({ length: count }, makeParticle);
      if (orbs.length < 5) orbs = Array.from({ length: 5 }, makeOrb);
      if (dust.length < 40) dust = Array.from({ length: 40 }, makeDust);
    }

    function drawAuroraOverlay(light) {
      const ay = h * 0.18 + Math.sin(tick * 0.01) * 20;
      for (let i = 0; i < 3; i++) {
        const ox = w * (0.2 + i * 0.3) + Math.sin(tick * 0.008 + i) * 40 + pointer.tx * 30;
        const g = ctx.createRadialGradient(ox, ay + i * 30, 10, ox, ay, 180 + i * 40);
        g.addColorStop(0, `hsla(${170 + i * 40}, 80%, ${light ? 45 : 65}%, ${light ? 0.06 : 0.1})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h * 0.55);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      tick += 1;
      const light = root.dataset.mode === "light";
      const mx = mouse.x;
      const my = mouse.y;
      const connectDist = Math.min(140, w * 0.12);

      const sy = window.scrollY;
      scrollVel = lerp(scrollVel, sy - lastScrollY, 0.25);
      lastScrollY = sy;
      warp = lerp(warp, Math.min(Math.abs(scrollVel) / 24, 1), 0.14);

      drawAuroraOverlay(light);

      /* Nebula orbs */
      for (const o of orbs) {
        const dx = mx - o.x;
        const dy = my - o.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (mouse.active && dist < 320) {
          o.vx -= (dx / dist) * 0.02;
          o.vy -= (dy / dist) * 0.02;
        }
        o.phase += 0.008;
        o.vx += Math.sin(o.phase) * 0.01;
        o.vy += Math.cos(o.phase * 0.8) * 0.01;
        o.vx *= 0.99;
        o.vy *= 0.99;
        o.x += o.vx + pointer.tx * 0.15;
        o.y += o.vy + pointer.ty * 0.15;
        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r;
        if (o.y > h + o.r) o.y = -o.r;
        const pulse = 1 + Math.sin(o.phase) * 0.12;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * pulse);
        g.addColorStop(0, `hsla(${o.hue}, 80%, ${light ? 50 : 60}%, ${light ? 0.08 : 0.14})`);
        g.addColorStop(0.55, `hsla(${o.hue + 30}, 70%, 50%, ${light ? 0.03 : 0.06})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Charge visual */
      if (mouse.down) {
        mouse.charge = Math.min(mouse.charge + 0.02, 1);
        chargeEl.style.left = `${mouse.chargeX}px`;
        chargeEl.style.top = `${mouse.chargeY}px`;
        chargeEl.classList.add("is-charging");
        /* suck particles in */
        for (const p of particles) {
          const dx = mouse.chargeX - p.x;
          const dy = mouse.chargeY - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 280) {
            const f = mouse.charge * 0.08 * (1 - dist / 280);
            p.vx += (dx / dist) * f;
            p.vy += (dy / dist) * f;
          }
        }
      }

      /* Idle pulse rings from cursor */
      pulseTimer += 1;
      if (mouse.active && pulseTimer > 55) {
        pulseTimer = 0;
        pulses.push({ x: mx, y: my, r: 12, life: 1 });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 2.8;
        p.life -= 0.016;
        if (p.life <= 0) {
          pulses.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(150, 190, 255, ${p.life * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      /* Comet trail + spiral on fast move */
      if (mouse.active && mouse.speed > 0.7) {
        trail.push({ x: mx, y: my, life: 1, r: 2 + Math.min(mouse.speed * 0.18, 6) });
        if (trail.length > 34) trail.shift();
        if (mouse.speed > 18) spawnSpiral(mx, my);
      }
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        t.life -= 0.04;
        if (t.life <= 0) {
          trail.splice(i, 1);
          continue;
        }
        const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.r * 5);
        grad.addColorStop(0, `rgba(190, 220, 255, ${t.life * 0.6})`);
        grad.addColorStop(0.35, `rgba(130, 170, 255, ${t.life * 0.25})`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      for (let i = spirals.length - 1; i >= 0; i--) {
        const s = spirals[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.life -= 0.03;
        if (s.life <= 0) {
          spirals.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2 * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${s.life})`;
        ctx.fill();
      }

      /* Stars + constellation links */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.hypot(dx, dy) || 1;

        if (mouse.active && !mouse.down && dist < 260) {
          const force = (1 - dist / 260) * 0.06 * p.depth;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.983;
        p.vy *= 0.983;
        const streak = warp * 22 * p.depth * Math.sign(scrollVel || 1);
        p.x += p.vx + pointer.tx * 0.45 * p.depth;
        p.y += p.vy + pointer.ty * 0.45 * p.depth + streak * 0.1;
        p.twinkle += 0.022 + p.depth * 0.012;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const alpha =
          (0.35 + Math.sin(p.twinkle) * 0.28 + p.depth * 0.28) * (light ? 0.48 : 1);

        if (warp > 0.07) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y - streak);
          ctx.strokeStyle = `hsla(${p.hue}, 85%, ${light ? 40 : 78}%, ${alpha * warp})`;
          ctx.lineWidth = p.r;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, ${light ? 42 : 74}%, ${alpha})`;
        ctx.fill();

        if (mouse.active && dist < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `hsla(${p.hue}, 90%, ${light ? 45 : 72}%, ${(1 - dist / 160) * 0.35})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < connectDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = light
              ? `rgba(70, 100, 180, ${(1 - d / connectDist) * 0.15})`
              : `rgba(140, 175, 255, ${(1 - d / connectDist) * 0.22})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      }

      /* Foreground dust parallax */
      for (const d of dust) {
        d.x += pointer.tx * 1.2 * d.z;
        d.y += pointer.ty * 1.2 * d.z + warp * d.z * 2;
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * d.z, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue}, 80%, ${light ? 40 : 80}%, ${0.25 * d.z})`;
        ctx.fill();
      }

      /* Meteors — more frequent */
      if (Math.random() < 0.012 + warp * 0.04 && meteors.length < 5) spawnMeteor();
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.011;
        if (m.life <= 0 || m.x < -100 || m.x > w + 100 || m.y > h + 100) {
          meteors.splice(i, 1);
          continue;
        }
        const ang = Math.atan2(m.vy, m.vx);
        const tx = m.x - Math.cos(ang) * m.len;
        const ty = m.y - Math.sin(ang) * m.len;
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
        g.addColorStop(0, `hsla(${m.hue}, 95%, 85%, ${m.life})`);
        g.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${m.hue}, 95%, 90%, ${m.life})`;
        ctx.fill();
      }

      /* Shockwave ripples */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 5;
        r.life -= 0.02;
        if (r.life <= 0 || r.r > r.max) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(170, 210, 255, ${r.life * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      /* Bursts */
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.life -= 0.016;
        b.ring += 5 * b.power;
        if (b.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.ring, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(160, 200, 255, ${b.life * 0.5})`;
        ctx.lineWidth = 1.8 * b.power;
        ctx.stroke();
        for (let s = b.sparks.length - 1; s >= 0; s--) {
          const sp = b.sparks[s];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.955;
          sp.vy *= 0.955;
          sp.life -= 0.018;
          if (sp.life <= 0) {
            b.sparks.splice(s, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.r * sp.life, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${sp.hue}, 92%, 70%, ${sp.life})`;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    function isUiTarget(t) {
      return !!(
        t &&
        t.closest &&
        t.closest(
          "a, button, input, textarea, label, .sidebar, header, .card, .project-vidbox, .skill-panel, .contact-box, .menu-icon, .close-icon"
        )
      );
    }

    window.addEventListener(
      "pointermove",
      (e) => {
        const dx = e.clientX - mouse.px;
        const dy = e.clientY - mouse.py;
        mouse.speed = Math.hypot(dx, dy);
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
        if (mouse.down) {
          mouse.chargeX = e.clientX;
          mouse.chargeY = e.clientY;
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      mouse.active = false;
      mouse.down = false;
      mouse.charge = 0;
      trail.length = 0;
      chargeEl.classList.remove("is-charging");
    });

    window.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || isUiTarget(e.target)) return;
      mouse.down = true;
      mouse.charge = 0;
      mouse.chargeX = e.clientX;
      mouse.chargeY = e.clientY;
      chargeEl.style.left = `${e.clientX}px`;
      chargeEl.style.top = `${e.clientY}px`;
      chargeEl.classList.remove("is-charging");
      void chargeEl.offsetWidth;
      chargeEl.classList.add("is-charging");
    });

    window.addEventListener("pointerup", (e) => {
      if (!mouse.down) return;
      mouse.down = false;
      chargeEl.classList.remove("is-charging");
      const power = 0.7 + mouse.charge * 2.2;
      const count = Math.floor(24 + mouse.charge * 50);
      spawnBurst(mouse.chargeX || e.clientX, mouse.chargeY || e.clientY, count, power);
      if (mouse.charge > 0.55) {
        for (let i = 0; i < 3; i++) spawnMeteor();
      }
      mouse.charge = 0;
    });

    window.addEventListener("dblclick", (e) => {
      if (isUiTarget(e.target)) return;
      spawnBurst(e.clientX, e.clientY, 60, 2.4);
      for (let i = 0; i < 5; i++) spawnMeteor();
    });

    /* Theme toggle flash */
    modeToggle?.addEventListener("click", () => {
      spawnBurst(window.innerWidth / 2, window.innerHeight * 0.2, 36, 1.4);
    });

    window.addEventListener("resize", resize, { passive: true });
    resize();
    draw();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId) {
        draw();
      }
    });
  }

  /* Magnetic split letters on headings */
  if (finePointer) {
    document.querySelectorAll("[data-split]").forEach((el) => {
      const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (!text || !text.trim()) return;
          const frag = document.createDocumentFragment();
          // Keep whole words together so letter-spans don't wrap mid-word
          text.split(/(\s+)/).forEach((token) => {
            if (!token) return;
            if (/^\s+$/.test(token)) {
              frag.appendChild(document.createTextNode(token));
              return;
            }
            const word = document.createElement("span");
            word.className = "split-word";
            [...token].forEach((ch) => {
              const span = document.createElement("span");
              span.className = "split-char";
              span.textContent = ch;
              word.appendChild(span);
            });
            frag.appendChild(word);
          });
          node.parentNode.replaceChild(frag, node);
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          [...node.childNodes].forEach(walk);
        }
      };
      [...el.childNodes].forEach(walk);

      const chars = [...el.querySelectorAll(".split-char")];
      chars.forEach((ch, i) => {
        ch.style.setProperty("--char-i", String(i));
      });

      if (el.classList.contains("hero-title")) {
        requestAnimationFrame(() => el.classList.add("is-split-ready"));
        chars.forEach((ch) => {
          const release = (e) => {
            if (e.animationName !== "charRise") return;
            ch.removeEventListener("animationend", release);
            ch.classList.add("is-risen");
            ch.style.removeProperty("transform");
            ch.style.removeProperty("translate");
          };
          ch.addEventListener("animationend", release);
        });
      }

      el.addEventListener("pointermove", (e) => {
        chars.forEach((ch) => {
          const rect = ch.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const max = 130;
          if (dist < max) {
            const force = (1 - dist / max) * 18;
            const tx = (dx / dist) * -force;
            const ty = (dy / dist) * -force;
            ch.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${(1 + (1 - dist / max) * 0.28).toFixed(3)})`;
            ch.style.textShadow = `0 0 ${(16 * (1 - dist / max)).toFixed(1)}px rgba(140, 180, 255, 0.9)`;
          } else {
            ch.style.transform = "";
            ch.style.textShadow = "";
          }
        });
      });
      el.addEventListener("pointerleave", () => {
        chars.forEach((ch) => {
          ch.style.transform = "";
          ch.style.textShadow = "";
        });
      });
    });
  } else {
    document.querySelector(".hero-title")?.classList.add("is-split-ready");
  }

  /* Scroll-triggered motion for skill chips + data-animate */
  const motionEls = [
    ...document.querySelectorAll("[data-animate]"),
    ...document.querySelectorAll(".skill-panel"),
  ];
  if (motionEls.length && "IntersectionObserver" in window) {
    const motionIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          motionIo.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
    );
    motionEls.forEach((el, i) => {
      el.style.setProperty("--stagger", String(i % 4));
      motionIo.observe(el);
    });
  } else {
    motionEls.forEach((el) => el.classList.add("is-inview"));
  }

  /* Scramble / decode section titles on hover */
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789▓░▒#@$%";
  document.querySelectorAll("[data-scramble]").forEach((el) => {
    const original = el.textContent;
    let timer = 0;
    let running = false;

    el.addEventListener("pointerenter", () => {
      if (running) return;
      running = true;
      let frame = 0;
      const total = 14;
      cancelAnimationFrame(timer);
      const step = () => {
        frame += 1;
        el.textContent = [...original]
          .map((ch, i) => {
            if (ch === " " || ch === "'" || ch === ",") return ch;
            if (frame / total > i / original.length) return original[i];
            return glyphs[(Math.random() * glyphs.length) | 0];
          })
          .join("");
        if (frame < total) timer = requestAnimationFrame(step);
        else {
          el.textContent = original;
          running = false;
        }
      };
      timer = requestAnimationFrame(step);
    });
  });
})();
