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

  /**
   * Stage band: middle of the viewport where content should be "alive".
   * Leaving this band triggers EXIT while the element is still partly on-screen,
   * so the exit motion is actually visible (unlike waiting for full leave).
   */
  function measure(el) {
    const vh = window.innerHeight || 1;
    const rect = el.getBoundingClientRect();
    const stageTop = vh * 0.14;
    const stageBottom = vh * 0.76;

    const overlapTop = Math.max(rect.top, stageTop);
    const overlapBottom = Math.min(rect.bottom, stageBottom);
    const overlap = Math.max(0, overlapBottom - overlapTop);
    const stageHeight = stageBottom - stageTop;
    const visibleInStage = overlap / Math.min(Math.max(rect.height, 1), stageHeight);

    const viewportOverlapTop = Math.max(rect.top, 0);
    const viewportOverlapBottom = Math.min(rect.bottom, vh);
    const viewportVisible = Math.max(0, viewportOverlapBottom - viewportOverlapTop);
    const viewportRatio = viewportVisible / Math.min(Math.max(rect.height, 1), vh);

    /* Early exit for tall blocks once their head has scrolled away */
    const headGoneUp = scrollDir === "down" && rect.top < vh * 0.06 && rect.bottom < vh * 0.58;
    const headGoneDown = scrollDir === "up" && rect.bottom > vh * 0.94 && rect.top > vh * 0.42;

    const inStage = visibleInStage > 0.12 && !headGoneUp && !headGoneDown;
    const stronglyIn = visibleInStage > 0.22 || (viewportRatio > 0.35 && rect.top < stageBottom && rect.bottom > stageTop);

    return { rect, vh, inStage, stronglyIn, viewportRatio, headGoneUp, headGoneDown };
  }

  function prepEnter(el, from) {
    el.classList.remove("fx-in", "fx-out", "fx-out-up", "fx-out-down");
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
    /* Keep current painted pose, then swap to exit so the transition is visible */
    el.classList.remove("fx-prep", "fx-from-top", "fx-from-bottom");
    if (!el.classList.contains("fx-in") && !el.classList.contains("fx-out")) {
      el.classList.add("fx-in");
      void el.offsetWidth;
    }
    el.classList.remove("fx-in");
    el.classList.add("fx-out", outDir === "up" ? "fx-out-up" : "fx-out-down");
  }

  const state = new Map();

  function syncElement(el) {
    const prev = state.get(el) || { visible: false };
    const m = measure(el);

    if (!prev.visible) {
      if (m.stronglyIn || m.inStage) {
        state.set(el, { visible: true });
        const from = m.rect.top > m.vh * 0.45 ? "bottom" : scrollDir === "up" ? "top" : "bottom";
        prepEnter(el, from);
        playEnter(el);
      }
      return;
    }

    /* Was visible — exit early when it leaves the stage band */
    if (!m.inStage) {
      state.set(el, { visible: false });
      const outDir =
        m.headGoneUp || m.rect.top < m.vh * 0.35 || scrollDir === "down" ? "up" : "down";
      playExit(el, outDir);
    }
  }

  function syncAll() {
    targets.forEach(syncElement);
  }

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY || 0;
      if (Math.abs(y - scrollY) > 1) {
        scrollDir = y > scrollY ? "down" : "up";
        scrollY = y;
      }
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        syncAll();
      });
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      requestAnimationFrame(syncAll);
    },
    { passive: true }
  );

  /* Arm: mark above-the-fold as in, then enable CSS hiding for the rest */
  targets.forEach((el) => {
    const m = measure(el);
    if (m.stronglyIn || m.inStage || (m.rect.top < m.vh * 0.92 && m.rect.bottom > 40)) {
      state.set(el, { visible: true });
      el.classList.add("fx-in");
    } else {
      state.set(el, { visible: false });
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
