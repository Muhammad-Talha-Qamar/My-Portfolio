(() => {
  const SECTION_SEL = "#home, #about, #skills, #projects, #services, #contact";
  const LOCK_MS = 720;
  const WHEEL_THRESHOLD = 48;
  const SWIPE_THRESHOLD = 56;
  const EASE_ENTER = "cubic-bezier(0.22, 1.15, 0.36, 1)";
  const EASE_EXIT = "cubic-bezier(0.55, 0.06, 0.68, 0.19)";
  const EASE_CROSS = "cubic-bezier(0.4, 0, 0.2, 1)";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sections = [...document.querySelectorAll(SECTION_SEL)].filter(Boolean);
  if (sections.length < 2) return;

  const shell = document.querySelector(".site-shell") || sections[0].parentElement;
  if (!shell) return;

  /** @type {number} */
  let activeIndex = 0;
  /** @type {number} */
  let previousIndex = 0;
  /** @type {1 | -1} */
  let direction = 1;
  let locked = false;
  let lockTimer = 0;
  let wheelAcc = 0;
  let wheelResetTimer = 0;
  let touchStartY = 0;
  let touchStartX = 0;
  let armed = false;

  const root = document.documentElement;
  root.classList.add("slide-deck-mode");

  const deck = document.createElement("div");
  deck.className = "slide-deck";
  deck.id = "slide-deck";
  deck.setAttribute("data-slide-deck", "");
  deck.setAttribute("aria-roledescription", "carousel");
  deck.setAttribute("aria-label", "Portfolio sections");

  /** @type {{ el: HTMLElement, scroll: HTMLElement, section: HTMLElement, id: string }[]} */
  const slides = [];

  const footer = shell.querySelector("footer.footer, footer.site-section, .footer");

  sections.forEach((section, index) => {
    const wrap = document.createElement("div");
    wrap.className = "slide-section";
    wrap.setAttribute("data-slide-index", String(index));
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-roledescription", "slide");
    wrap.setAttribute(
      "aria-label",
      section.getAttribute("aria-label") || section.id || `Slide ${index + 1}`
    );
    if (index !== 0) wrap.setAttribute("aria-hidden", "true");

    const scroll = document.createElement("div");
    scroll.className = "slide-section__scroll";
    scroll.setAttribute("data-slide-scroll", "");

    wrap.appendChild(scroll);
    deck.appendChild(wrap);

    scroll.appendChild(section);

    if (index === sections.length - 1 && footer && footer.parentElement === shell) {
      scroll.appendChild(footer);
    }

    slides.push({
      el: wrap,
      scroll,
      section,
      id: section.id || `slide-${index}`,
    });
  });

  shell.insertBefore(deck, shell.firstChild);

  /* Move any leftover non-slide nodes after deck (none expected) */
  slides[0].el.classList.add("is-active", "is-shown");

  const dots = document.createElement("nav");
  dots.className = "slide-dots";
  dots.setAttribute("aria-label", "Slide navigation");
  const dotButtons = slides.map((slide, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slide-dots__btn";
    btn.setAttribute("aria-label", `Go to ${slide.id}`);
    btn.setAttribute("data-slide-to", String(index));
    if (index === 0) btn.setAttribute("aria-current", "true");
    const mark = document.createElement("span");
    mark.className = "slide-dots__mark";
    mark.setAttribute("aria-hidden", "true");
    btn.appendChild(mark);
    dots.appendChild(btn);
    btn.addEventListener("click", () => {
      if (index === activeIndex) return;
      goTo(index, { dir: index > activeIndex ? 1 : -1 });
    });
    return btn;
  });
  document.body.appendChild(dots);

  function emitChange() {
    const detail = {
      activeIndex,
      previousIndex,
      direction,
      id: slides[activeIndex]?.id || "",
      total: slides.length,
    };
    window.dispatchEvent(new CustomEvent("talbyte:slidechange", { detail }));
    root.dataset.slideIndex = String(activeIndex);
    root.dataset.slideId = detail.id;
  }

  function updateDots() {
    dotButtons.forEach((btn, i) => {
      if (i === activeIndex) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
  }

  function updateNavLinks() {
    const id = slides[activeIndex]?.id;
    document.querySelectorAll(".navbar__link").forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  }

  function updateNavbarScrolled() {
    const navbar = document.getElementById("site-navbar");
    const scroller = slides[activeIndex]?.scroll;
    const scrolled = activeIndex > 0 || (scroller && scroller.scrollTop > 24);
    navbar?.classList.toggle("navbar--scrolled", !!scrolled);
  }

  /**
   * @param {HTMLElement} scroller
   * @param {1 | -1} dir
   */
  function atScrollEdge(scroller, dir) {
    const top = scroller.scrollTop;
    const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    if (max <= 2) return true;
    if (dir > 0) return top >= max - 2;
    return top <= 1;
  }

  function lockTransitions() {
    locked = true;
    window.clearTimeout(lockTimer);
    lockTimer = window.setTimeout(() => {
      locked = false;
      wheelAcc = 0;
    }, reduceMotion ? 220 : LOCK_MS);
  }

  /**
   * @param {HTMLElement} slideEl
   * @param {1 | -1} dir
   * @param {"in" | "out"} kind
   */
  function keyframesFor(slideEl, dir, kind) {
    if (reduceMotion) {
      if (kind === "out") {
        return [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "none" },
        ];
      }
      return [
        { opacity: 0, transform: "none" },
        { opacity: 1, transform: "none" },
      ];
    }

    if (kind === "out") {
      if (dir > 0) {
        return [
          {
            opacity: 1,
            transform: "translate3d(0,0,0) scale(1) rotateX(0deg) skewY(0deg)",
            clipPath: "inset(0 0 0 0)",
          },
          {
            opacity: 0,
            transform: "translate3d(0,-10%,-40px) scale(0.9) rotateX(7deg) skewY(-1.2deg)",
            clipPath: "inset(0 0 18% 0)",
          },
        ];
      }
      return [
        {
          opacity: 1,
          transform: "translate3d(0,0,0) scale(1) rotateX(0deg) skewY(0deg)",
          clipPath: "inset(0 0 0 0)",
        },
        {
          opacity: 0,
          transform: "translate3d(0,12%,-40px) scale(0.9) rotateX(-7deg) skewY(1.2deg)",
          clipPath: "inset(18% 0 0 0)",
        },
      ];
    }

    if (dir > 0) {
      return [
        {
          opacity: 0,
          transform: "translate3d(0,18%,80px) scale(1.06) rotateX(-9deg) skewY(2deg)",
          clipPath: "inset(22% 0 0 0)",
        },
        {
          opacity: 1,
          transform: "translate3d(0,-1.5%,0) scale(1.01) rotateX(1deg) skewY(-0.4deg)",
          clipPath: "inset(0 0 0 0)",
          offset: 0.72,
        },
        {
          opacity: 1,
          transform: "translate3d(0,0,0) scale(1) rotateX(0deg) skewY(0deg)",
          clipPath: "inset(0 0 0 0)",
        },
      ];
    }

    return [
      {
        opacity: 0,
        transform: "translate3d(0,-18%,80px) scale(1.06) rotateX(9deg) skewY(-2deg)",
        clipPath: "inset(0 0 22% 0)",
      },
      {
        opacity: 1,
        transform: "translate3d(0,1.5%,0) scale(1.01) rotateX(-1deg) skewY(0.4deg)",
        clipPath: "inset(0 0 0 0)",
        offset: 0.72,
      },
      {
        opacity: 1,
        transform: "translate3d(0,0,0) scale(1) rotateX(0deg) skewY(0deg)",
        clipPath: "inset(0 0 0 0)",
      },
    ];
  }

  /**
   * Stagger direct content blocks inside the section (and footer if present).
   * @param {HTMLElement} slideWrap
   * @param {1 | -1} dir
   */
  function staggerChildren(slideWrap, dir) {
    if (reduceMotion || typeof slideWrap.animate !== "function") return;

    const scroll = slideWrap.querySelector(".slide-section__scroll");
    if (!scroll) return;

    const blocks = [...scroll.children].flatMap((node) => {
      if (!(node instanceof HTMLElement)) return [];
      const kids = [...node.children].filter((c) => c instanceof HTMLElement);
      return kids.length ? kids.slice(0, 10) : [node];
    });

    blocks.forEach((el, i) => {
      const fromY = dir > 0 ? 28 : -28;
      try {
        el.animate(
          [
            {
              opacity: 0,
              transform: `translate3d(0, ${fromY}px, 0) scale(0.98)`,
            },
            {
              opacity: 1,
              transform: "translate3d(0, 0, 0) scale(1)",
            },
          ],
          {
            duration: 520,
            delay: 90 + i * 55,
            easing: EASE_ENTER,
            fill: "both",
          }
        );
      } catch (_) {
        /* ignore */
      }
    });
  }

  /**
   * @param {number} nextIndex
   * @param {{ dir?: 1 | -1, instant?: boolean }} [opts]
   */
  function goTo(nextIndex, opts = {}) {
    const n = slides.length;
    const clamped = Math.max(0, Math.min(n - 1, nextIndex));
    if (clamped === activeIndex && !opts.instant) return false;
    if (locked && !opts.instant) return false;

    const dir = opts.dir ?? (clamped > activeIndex ? 1 : -1);
    direction = dir === -1 ? -1 : 1;
    previousIndex = activeIndex;
    const from = slides[previousIndex];
    const to = slides[clamped];
    if (!from || !to) return false;

    activeIndex = clamped;
    lockTransitions();
    updateDots();
    updateNavLinks();
    updateNavbarScrolled();

    slides.forEach((s, i) => {
      s.el.classList.toggle("is-active", i === activeIndex);
      s.el.setAttribute("aria-hidden", i === activeIndex ? "false" : "true");
    });

    to.el.classList.add("is-shown");
    from.el.classList.add("is-leaving");
    to.el.classList.add("is-entering");

    const duration = reduceMotion || opts.instant ? 180 : LOCK_MS;
    const easing = reduceMotion || opts.instant ? EASE_CROSS : undefined;

    const runAnim = (el, kind) => {
      if (typeof el.animate !== "function") {
        el.style.opacity = kind === "out" ? "0" : "1";
        return Promise.resolve();
      }
      const anim = el.animate(keyframesFor(el, direction, kind), {
        duration,
        easing: easing || (kind === "out" ? EASE_EXIT : EASE_ENTER),
        fill: "forwards",
      });
      return anim.finished.catch(() => {});
    };

    Promise.all([runAnim(from.el, "out"), runAnim(to.el, "in")]).then(() => {
      from.el.classList.remove("is-shown", "is-leaving", "is-entering");
      to.el.classList.remove("is-entering");
      to.el.classList.add("is-shown");
      from.el.style.removeProperty("opacity");
      from.el.style.removeProperty("transform");
      from.el.style.removeProperty("clip-path");
      to.el.style.removeProperty("opacity");
      to.el.style.removeProperty("transform");
      to.el.style.removeProperty("clip-path");

      /* Reset scroll of inactive slides to top for predictable re-entry */
      if (from.scroll && from !== to) from.scroll.scrollTop = 0;

      emitChange();
    });

    if (!opts.instant) staggerChildren(to.el, direction);

    if (to.id && history.replaceState) {
      try {
        history.replaceState(null, "", `#${to.id}`);
      } catch (_) {
        /* ignore */
      }
    }

    emitChange();
    return true;
  }

  function step(dir) {
    const next = activeIndex + dir;
    if (next < 0 || next >= slides.length) return false;
    return goTo(next, { dir });
  }

  /**
   * @param {1 | -1} dir
   * @param {Event} [event]
   */
  function tryStep(dir, event) {
    if (!armed || locked) {
      if (locked) event?.preventDefault?.();
      return;
    }
    const scroller = slides[activeIndex]?.scroll;
    if (scroller && !atScrollEdge(scroller, dir)) return;
    event?.preventDefault?.();
    step(dir);
  }

  /**
   * @param {Element | null} start
   * @param {HTMLElement | null} slideScroller
   * @param {1 | -1} dir
   */
  function nestedAllowsScroll(start, slideScroller, dir) {
    let node = start instanceof Element ? start : null;
    while (node && node !== slideScroller && node !== document.body) {
      if (node instanceof HTMLElement) {
        const style = window.getComputedStyle(node);
        const oy = style.overflowY;
        if (
          (oy === "auto" || oy === "scroll" || oy === "overlay") &&
          node.scrollHeight > node.clientHeight + 2
        ) {
          if (!atScrollEdge(node, dir)) return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }

  function onWheel(e) {
    if (!armed) return;
    if (e.ctrlKey) return;

    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest(".navbar, .slide-dots, .scroll-dial-wrapper, .site-intro")) return;

    const dy = e.deltaY;
    if (Math.abs(dy) < 1) return;

    const dir = /** @type {1 | -1} */ (dy > 0 ? 1 : -1);
    const scroller = slides[activeIndex]?.scroll;

    if (nestedAllowsScroll(target, scroller || null, dir)) {
      wheelAcc = 0;
      return;
    }

    if (scroller && !atScrollEdge(scroller, dir)) {
      wheelAcc = 0;
      return;
    }

    e.preventDefault();
    if (locked) return;

    wheelAcc += dy;
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => {
      wheelAcc = 0;
    }, 280);

    if (Math.abs(wheelAcc) < WHEEL_THRESHOLD) return;
    const stepDir = /** @type {1 | -1} */ (wheelAcc > 0 ? 1 : -1);
    wheelAcc = 0;
    step(stepDir);
  }

  function onKey(e) {
    if (!armed) return;
    const tag = (e.target && e.target.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag) || e.target?.isContentEditable) return;

    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      tryStep(1, e);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      tryStep(-1, e);
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      tryStep(e.shiftKey ? -1 : 1, e);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0, { dir: -1 });
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(slides.length - 1, { dir: 1 });
    }
  }

  function onTouchStart(e) {
    if (!armed || e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    if (!armed || !e.changedTouches?.length) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) < Math.abs(dx) * 1.15) return;
    tryStep(dy > 0 ? 1 : -1, e);
  }

  function indexFromHash() {
    const hash = (location.hash || "").replace(/^#/, "");
    if (!hash) return 0;
    const idx = slides.findIndex((s) => s.id === hash);
    return idx >= 0 ? idx : 0;
  }

  function bindNavAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href") || "";
        const id = href.slice(1);
        const idx = slides.findIndex((s) => s.id === id);
        if (idx < 0) return;
        e.preventDefault();
        goTo(idx, { dir: idx >= activeIndex ? 1 : -1 });
      });
    });
  }

  slides.forEach(({ scroll }) => {
    scroll.addEventListener(
      "scroll",
      () => {
        updateNavbarScrolled();
        window.dispatchEvent(
          new CustomEvent("talbyte:slidescroll", {
            detail: { activeIndex, scrollTop: scroll.scrollTop },
          })
        );
      },
      { passive: true }
    );
  });

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("hashchange", () => {
    const idx = indexFromHash();
    if (idx !== activeIndex) goTo(idx, { dir: idx > activeIndex ? 1 : -1 });
  });

  bindNavAnchors();

  function arm() {
    if (armed) return;
    armed = true;
    const start = indexFromHash();
    if (start !== 0) {
      goTo(start, { instant: true, dir: 1 });
    } else {
      emitChange();
      updateDots();
      updateNavLinks();
      updateNavbarScrolled();
    }
    root.classList.add("slide-deck-ready");
  }

  function waitForIntro() {
    if (root.dataset.intro === "done" || !root.dataset.intro) {
      arm();
      return;
    }
    const mo = new MutationObserver(() => {
      if (root.dataset.intro === "done") {
        mo.disconnect();
        arm();
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-intro"] });
    window.setTimeout(() => {
      mo.disconnect();
      arm();
    }, 5000);
  }

  waitForIntro();

  window.talbyteSlideDeck = {
    get activeIndex() {
      return activeIndex;
    },
    get previousIndex() {
      return previousIndex;
    },
    get direction() {
      return direction;
    },
    get length() {
      return slides.length;
    },
    goTo(index) {
      return goTo(index, { dir: index >= activeIndex ? 1 : -1 });
    },
    next() {
      return step(1);
    },
    prev() {
      return step(-1);
    },
    getSlideIds() {
      return slides.map((s) => s.id);
    },
  };
})();
