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
    /* static / legacy portfolio markup */
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
      el.classList.remove("fx-out", "fx-out-up", "fx-out-down", "fx-prep", "fx-from-top", "fx-from-bottom");
    });
  }

  function assignVariant(el, index) {
    if (!el.hasAttribute("data-fx") || el.getAttribute("data-fx") === "") {
      el.setAttribute("data-fx", VARIANTS[index % VARIANTS.length]);
    }
    if (!el.hasAttribute("data-fx-out")) {
      el.setAttribute("data-fx-out", VARIANTS[(index + 5) % VARIANTS.length]);
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
      const aos = el.getAttribute("data-aos");
      el.setAttribute("data-fx", map[aos] || "rise");
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

  let scrollY = window.scrollY || 0;
  let scrollDir = "down";
  let scrollRaf = 0;

  window.addEventListener(
    "scroll",
    () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const y = window.scrollY || 0;
        if (Math.abs(y - scrollY) > 2) {
          scrollDir = y > scrollY ? "down" : "up";
          scrollY = y;
        }
      });
    },
    { passive: true }
  );

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
    el.classList.remove("fx-in", "fx-prep", "fx-from-top", "fx-from-bottom");
    el.classList.add("fx-out", outDir === "up" ? "fx-out-up" : "fx-out-down");
  }

  const state = new WeakMap();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const prev = state.get(el) || { visible: false };

        if (entry.isIntersecting) {
          if (prev.visible) return;
          state.set(el, { visible: true });

          const from =
            entry.boundingClientRect.top > (entry.rootBounds?.height || window.innerHeight) * 0.45
              ? "bottom"
              : scrollDir === "down"
                ? "bottom"
                : "top";

          prepEnter(el, from);
          playEnter(el);
          return;
        }

        if (!prev.visible && !el.classList.contains("fx-in")) {
          state.set(el, { visible: false });
          return;
        }

        state.set(el, { visible: false });
        const outDir = scrollDir === "down" ? "up" : "down";
        playExit(el, outDir);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: [0, 0.12, 0.24],
    }
  );

  /* Mark in-view first, then arm CSS so above-the-fold never flashes hidden */
  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 40;
    if (inView) {
      state.set(el, { visible: true });
      el.classList.add("fx-in");
    } else {
      state.set(el, { visible: false });
    }
  });
  root.classList.add("fx-active");
  targets.forEach((el) => io.observe(el));

  /* After intro loader finishes, re-check above-the-fold elements */
  const introDone = () => {
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0 && !el.classList.contains("fx-in")) {
        state.set(el, { visible: true });
        prepEnter(el, "bottom");
        playEnter(el);
      }
    });
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
