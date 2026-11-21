(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = root.classList.contains("is-lite") || reduceMotion;

  const VARIANTS = [
    "rise",
    "drop",
    "slide-left",
    "slide-right",
    "zoom-blur",
    "flip-x",
    "flip-y",
    "skew",
    "clip",
    "spin",
    "stretch",
    "drift",
  ];

  const AUTO_SELECTORS = [
    ".about__tag",
    ".about__headline",
    ".about__para",
    ".about__fact-item",
    ".skills__title",
    ".skills__col",
    ".skills__footer",
    ".projects__meta-label",
    ".projects__title",
    ".projects__subtitle",
    ".projects__controls",
    ".projects-carousel",
    ".services__section-num",
    ".services__title",
    ".service-card",
    ".contact__section-num",
    ".contact__title",
    ".contact__desc",
    ".contact__icons-dock--desktop .contact__icon-btn",
    ".contact__card-header",
    ".contact__form",
    ".contact__icons-dock--mobile .contact__icon-btn",
    ".footer__brand",
    ".footer__copy",
    ".footer__socials",
    ".hero__role-badge",
    ".hero__word-ashith-wrap",
    ".hero__word-mk-wrap",
    ".hero__stats-strip",
    ".hero__cta-row",
    ".hero__left-rail",
    ".hero-info-title",
    ".hero-title",
    ".hero-info > p",
    ".hero-btn",
    ".skills-video-box",
    ".section-title",
    ".info-cards .card",
    ".projects-lead",
    ".skill-panel",
    ".skills-image",
    ".slider",
    ".contact-lead",
    ".social-box",
    ".contact-box",
    ".footer",
  ];

  /* Keep enter/exit from fighting each other mid-transition */
  const ENTER_LOCK_MS = 420;
  const EXIT_LOCK_MS = 480;
  /*
   * Top quarter = 0–25%. Split that quarter in half and use the upper half
   * (0–12.5%) as the exit band. Symmetric at the bottom (87.5–100%).
   * Alive stage = 12.5%–87.5%.
   */
  const ENTER_RATIO = 0.18;
  const EXIT_RATIO = 0.08;
  const ENTER_VIEWPORT = 0.22;

  function forceVisible(scope) {
    (scope || document).querySelectorAll("[data-fx]").forEach((el) => {
      el.classList.add("fx-in");
      el.classList.remove(
        "fx-out",
        "fx-out-up",
        "fx-out-down",
        "fx-prep",
        "fx-from-top",
        "fx-from-bottom"
      );
    });
  }

  function assignVariant(el, index) {
    if (!el.hasAttribute("data-fx") || el.getAttribute("data-fx") === "") {
      el.setAttribute("data-fx", VARIANTS[index % VARIANTS.length]);
    }
    if (!el.hasAttribute("data-fx-out")) {
      el.setAttribute("data-fx-out", VARIANTS[(index + 7) % VARIANTS.length]);
    }
  }

  function collectTargets() {
    const seen = new Set();
    const list = [];

    function add(el) {
      if (!el || seen.has(el) || el.closest(".site-intro") || el.closest(".navbar")) return;
      if (el.closest("[data-fx-ignore]")) return;
      seen.add(el);
      list.push(el);
    }

    document.querySelectorAll("[data-fx], [data-aos]").forEach(add);
    AUTO_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach(add);
    });

    return list;
  }

  function migrateAos(el) {
    if (!el.hasAttribute("data-aos")) return;
    if (!el.hasAttribute("data-fx") || el.getAttribute("data-fx") === "") {
      const map = {
        "fade-up": "rise",
        "fade-down": "drop",
        "fade-left": "slide-right",
        "fade-right": "slide-left",
        "zoom-in": "zoom-blur",
        "zoom-out": "zoom-blur",
        flip: "flip-y",
      };
      el.setAttribute("data-fx", map[el.getAttribute("data-aos")] || "rise");
    }
    const delay = el.getAttribute("data-aos-delay");
    if (delay && !el.style.getPropertyValue("--fx-delay")) {
      el.style.setProperty("--fx-delay", `${delay}ms`);
    }
  }

  if (lite || !("IntersectionObserver" in window)) {
    collectTargets().forEach((el, i) => {
      migrateAos(el);
      assignVariant(el, i);
    });
    forceVisible(document);
    return;
  }

  const targets = collectTargets();
  targets.forEach((el, i) => {
    migrateAos(el);
    assignVariant(el, i);

    const delayAttr = el.getAttribute("data-fx-delay");
    if (delayAttr) el.style.setProperty("--fx-delay", `${delayAttr}ms`);

    const parent = el.parentElement;
    if (parent) {
      const siblings = [...parent.children].filter((child) => targets.includes(child));
      const idx = siblings.indexOf(el);
      if (idx > 0 && !delayAttr) {
        el.style.setProperty("--fx-delay", `${Math.min(idx * 70, 420)}ms`);
      }
    }
  });

  let scrollY = window.scrollY || 0;
  let scrollDir = "down";
  let ticking = false;
  let userScrolled = false;
  const slideMode = () => root.classList.contains("slide-deck-mode");

  /**
   * Viewport quarters, then top quarter halved:
   *   0–12.5%   → exit zone (upper half of the top 25% quarter)
   *   12.5–87.5% → alive stage
   *   87.5–100% → exit zone (upper half of the bottom quarter, mirrored)
   */
  function measure(el) {
    const vh = window.innerHeight || 1;
    const rect = el.getBoundingClientRect();
    const topQuarter = vh * 0.25;
    const stageTop = topQuarter * 0.5; /* upper half of top quarter → 12.5% */
    const stageBottom = vh - stageTop; /* 87.5% */
    const stageHeight = Math.max(stageBottom - stageTop, 1);

    const overlapTop = Math.max(rect.top, stageTop);
    const overlapBottom = Math.min(rect.bottom, stageBottom);
    const overlap = Math.max(0, overlapBottom - overlapTop);
    const visibleInStage = overlap / Math.min(Math.max(rect.height, 1), stageHeight);

    const viewportOverlapTop = Math.max(rect.top, 0);
    const viewportOverlapBottom = Math.min(rect.bottom, vh);
    const viewportVisible = Math.max(0, viewportOverlapBottom - viewportOverlapTop);
    const viewportRatio = viewportVisible / Math.min(Math.max(rect.height, 1), vh);

    /*
     * Early exit: leading edge is inside the upper half of the edge quarter.
     * Cap with bottom/top so tall blocks don't exit on first paint.
     */
    const inTopQuarter = rect.top < stageTop && rect.bottom < vh * 0.7;
    const inBottomQuarter = rect.bottom > stageBottom && rect.top > vh * 0.3;
    const fullyPastTop = rect.bottom <= stageTop * 0.5;
    const fullyPastBottom = rect.top >= stageBottom + (vh - stageBottom) * 0.5;

    const earlyExit =
      userScrolled &&
      ((scrollDir === "down" && inTopQuarter) || (scrollDir === "up" && inBottomQuarter));

    const shouldExit =
      fullyPastTop || fullyPastBottom || visibleInStage < EXIT_RATIO || earlyExit;

    const shouldEnter =
      !shouldExit &&
      (visibleInStage >= ENTER_RATIO ||
        (viewportRatio >= ENTER_VIEWPORT && rect.top < stageBottom && rect.bottom > stageTop));

    return { rect, vh, visibleInStage, viewportRatio, shouldExit, shouldEnter, inTopQuarter, inBottomQuarter };
  }

  function clearFxClasses(el) {
    el.classList.remove(
      "fx-in",
      "fx-out",
      "fx-out-up",
      "fx-out-down",
      "fx-prep",
      "fx-from-top",
      "fx-from-bottom"
    );
  }

  function prepEnter(el, from) {
    clearFxClasses(el);
    el.classList.add("fx-prep", from === "top" ? "fx-from-top" : "fx-from-bottom");
    void el.offsetWidth;
  }

  function playEnter(el) {
    requestAnimationFrame(() => {
      el.classList.remove("fx-prep", "fx-from-top", "fx-from-bottom");
      el.classList.add("fx-in");
    });
  }

  function playExit(el, outDir) {
    el.classList.remove("fx-prep", "fx-from-top", "fx-from-bottom");
    if (!el.classList.contains("fx-in") && !el.classList.contains("fx-out")) {
      el.classList.add("fx-in");
      void el.offsetWidth;
    }
    el.classList.remove("fx-in");
    el.classList.add("fx-out", outDir === "up" ? "fx-out-up" : "fx-out-down");
  }

  const state = new Map();
  const now = () => performance.now();

  function syncElement(el) {
    const prev = state.get(el) || { visible: false, lockUntil: 0 };
    if (now() < (prev.lockUntil || 0)) return;

    if (slideMode()) {
      const slide = el.closest(".slide-section");
      if (
        slide &&
        !slide.classList.contains("is-active") &&
        !slide.classList.contains("is-entering")
      ) {
        if (prev.visible) {
          state.set(el, { visible: false, lockUntil: now() + EXIT_LOCK_MS });
          playExit(el, scrollDir === "down" ? "up" : "down");
        }
        return;
      }
    }

    const m = measure(el);

    if (!prev.visible) {
      if (m.shouldEnter) {
        state.set(el, { visible: true, lockUntil: now() + ENTER_LOCK_MS });
        const from = m.rect.top > m.vh * 0.45 ? "bottom" : scrollDir === "up" ? "top" : "bottom";
        prepEnter(el, from);
        playEnter(el);
      }
      return;
    }

    if (m.shouldExit) {
      state.set(el, { visible: false, lockUntil: now() + EXIT_LOCK_MS });
      const outDir =
        m.inTopQuarter || m.rect.bottom < m.vh * 0.5 || scrollDir === "down" ? "up" : "down";
      playExit(el, outDir);
    }
  }

  function syncAll() {
    targets.forEach(syncElement);
  }

  function scheduleSync(dir) {
    if (dir === "up" || dir === "down") scrollDir = dir;
    userScrolled = true;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      syncAll();
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      if (slideMode()) return;
      const y = window.scrollY || 0;
      if (Math.abs(y - scrollY) > 1) {
        scrollDir = y > scrollY ? "down" : "up";
        scrollY = y;
        userScrolled = true;
      }
      scheduleSync();
    },
    { passive: true }
  );

  window.addEventListener(
    "talbyte:slidescroll",
    () => {
      scheduleSync();
    },
    { passive: true }
  );

  window.addEventListener("talbyte:slidechange", (event) => {
    const dir = event?.detail?.direction;
    scheduleSync(dir === -1 ? "up" : "down");
    /* Re-arm elements inside the newly active slide */
    window.setTimeout(() => syncAll(), 40);
  });

  window.addEventListener(
    "resize",
    () => {
      requestAnimationFrame(syncAll);
    },
    { passive: true }
  );

  /* Internal slide scrollers drive fx when deck mode is on */
  const boundScrollers = new WeakSet();
  function bindSlideScrollers() {
    document.querySelectorAll("[data-slide-scroll]").forEach((scroller) => {
      if (boundScrollers.has(scroller)) return;
      boundScrollers.add(scroller);
      scroller.addEventListener(
        "scroll",
        () => {
          const y = scroller.scrollTop || 0;
          if (Math.abs(y - scrollY) > 1) {
            scrollDir = y > scrollY ? "down" : "up";
            scrollY = y;
          }
          scheduleSync();
        },
        { passive: true }
      );
    });
  }
  bindSlideScrollers();

  /* Arm: mark above-the-fold as in, then enable CSS hiding for the rest */
  targets.forEach((el) => {
    const m = measure(el);
    if (m.shouldEnter || (m.rect.top < m.vh * 0.92 && m.rect.bottom > 40 && !m.shouldExit)) {
      state.set(el, { visible: true, lockUntil: 0 });
      el.classList.add("fx-in");
    } else {
      state.set(el, { visible: false, lockUntil: 0 });
    }
  });
  root.classList.add("fx-active");

  const introDone = () => {
    syncAll();
  };

  if (root.dataset.intro === "done") {
    window.setTimeout(introDone, 60);
  } else {
    const mo = new MutationObserver(() => {
      if (root.dataset.intro === "done") {
        mo.disconnect();
        window.setTimeout(introDone, 80);
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-intro"] });
    window.setTimeout(() => {
      mo.disconnect();
      introDone();
    }, 4000);
  }
})();
