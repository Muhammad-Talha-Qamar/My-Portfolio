(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const navbar = document.getElementById("site-navbar");
  const burger = document.getElementById("menu-icon");
  const navPanel = document.getElementById("nav-links-panel");
  const burgerIcon = burger?.querySelector(".navbar__burger");
  const links = document.querySelectorAll(".navbar__link");

  function setNavOpen(open) {
    if (!navbar || !burger) return;
    navbar.classList.toggle("navbar--open", open);
    navPanel?.classList.toggle("is-open", open);
    burgerIcon?.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open);
  }

  burger?.addEventListener("click", () => {
    setNavOpen(!navbar?.classList.contains("navbar--open"));
  });

  links.forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNavOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (!navbar?.classList.contains("navbar--open")) return;
    if (navbar.contains(e.target)) return;
    setNavOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) setNavOpen(false);
  });

  function syncNavbarScrolled(y) {
    navbar?.classList.toggle("navbar--scrolled", (y ?? window.scrollY) > 24);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (document.documentElement.classList.contains("slide-deck-mode")) return;
      syncNavbarScrolled(window.scrollY);
    },
    { passive: true }
  );

  window.addEventListener("talbyte:slidechange", (e) => {
    const idx = e?.detail?.activeIndex ?? 0;
    syncNavbarScrolled(idx > 0 ? 48 : 0);
    const id = e?.detail?.id;
    if (id) {
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    }
  });

  window.addEventListener(
    "talbyte:slidescroll",
    (e) => {
      syncNavbarScrolled(e?.detail?.scrollTop ?? 0);
    },
    { passive: true }
  );

  // Subtle hero parallax (desktop feel; skipped in lite / reduced motion)
  const hero = document.getElementById("home");
  if (
    hero &&
    !document.documentElement.classList.contains("is-lite") &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    let heroRaf = 0;
    const updateHeroParallax = (y) => {
      heroRaf = 0;
      const scrollY = typeof y === "number" ? y : window.scrollY;
      if (scrollY < window.innerHeight * 1.6) {
        hero.style.setProperty("--parallax-hero-photo", `${(scrollY * 0.14).toFixed(1)}px`);
        hero.style.setProperty("--parallax-hero-backlayer", `${(scrollY * 0.06).toFixed(1)}px`);
        hero.style.setProperty("--parallax-hero-text", `${(scrollY * 0.04).toFixed(1)}px`);
      }
    };
    window.addEventListener(
      "scroll",
      () => {
        if (document.documentElement.classList.contains("slide-deck-mode")) return;
        if (heroRaf) return;
        heroRaf = requestAnimationFrame(() => updateHeroParallax());
      },
      { passive: true }
    );
    window.addEventListener(
      "talbyte:slidescroll",
      (e) => {
        if (e?.detail?.activeIndex !== 0) return;
        if (heroRaf) return;
        heroRaf = requestAnimationFrame(() => updateHeroParallax(e.detail.scrollTop || 0));
      },
      { passive: true }
    );
  }

  const sections = [...document.querySelectorAll("section[id]")];
  if (
    sections.length &&
    "IntersectionObserver" in window &&
    !document.documentElement.classList.contains("slide-deck-mode")
  ) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === `#${id}`
            );
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
    );
    sections.forEach((section) => io.observe(section));
  }

  // Subtle grid parallax (rAF-throttled; skipped in lite mode)
  const root = document.documentElement;
  let gridRaf = 0;
  let pendingX = 0;
  let pendingY = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (root.classList.contains("is-lite")) return;
      pendingX = ((e.clientX / window.innerWidth) - 0.5) * 24;
      pendingY = ((e.clientY / window.innerHeight) - 0.5) * 24;
      if (gridRaf) return;
      gridRaf = requestAnimationFrame(() => {
        gridRaf = 0;
        root.style.setProperty("--grid-x", `${pendingX.toFixed(1)}px`);
        root.style.setProperty("--grid-y", `${pendingY.toFixed(1)}px`);
      });
    },
    { passive: true }
  );
})();

(() => {
  const slot = document.querySelector("[data-about-slot]");
  if (!slot) return;
  const words = String(slot.getAttribute("data-words") || "")
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let i = 0;
  window.setInterval(() => {
    i = (i + 1) % words.length;
    slot.style.opacity = "0";
    slot.style.transform = "translateY(8px)";
    window.setTimeout(() => {
      slot.textContent = words[i];
      slot.style.opacity = "1";
      slot.style.transform = "translateY(0)";
    }, 180);
  }, 2200);

  slot.style.transition = "opacity 0.25s ease, transform 0.25s ease";
})();

(() => {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  const CONTACT_EMAIL =
    (window.talbytePortfolio && window.talbytePortfolio.contactEmail) ||
    "qamitalha42@gmail.com";
  const contactStatus = document.getElementById("contact-status");
  const contactSubmit = document.getElementById("contact-submit");

  function setContactStatus(message, type) {
    if (!contactStatus) return;
    contactStatus.hidden = !message;
    contactStatus.textContent = message || "";
    contactStatus.classList.remove("is-success", "is-error", "is-pending");
    if (type) contactStatus.classList.add(`is-${type}`);
  }

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
      setContactStatus(
        `Thanks, ${name}! Your message was sent. I'll get back to you soon.`,
        "success"
      );
    } catch (err) {
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setContactStatus(
        "Couldn't send from the page — your email app should open with the message ready.",
        "error"
      );
    } finally {
      if (contactSubmit) contactSubmit.disabled = false;
    }
  });
})();

(() => {
  const root = document.querySelector("[data-projects-carousel]");
  if (!root) return;

  const section =
    root.closest("#projects, .projects, .my-project, section") || document;
  const track = root.querySelector("[data-projects-track]");
  const viewport = root.querySelector("[data-projects-viewport]");
  const prevBtn = section.querySelector("[data-projects-prev]");
  const nextBtn = section.querySelector("[data-projects-next]");
  const dotsWrap = root.querySelector("[data-projects-dots]");
  const progressBar = root.querySelector("[data-projects-progress]");
  const cards = [...(track?.querySelectorAll(":scope > .project-card") || [])];
  if (!track || !viewport || cards.length === 0) return;

  const AUTOPLAY_MS = 6500;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let active = 0;
  let autoTimer = 0;
  let stepTimer = 0;
  let promoteIndex = -1;
  let pointerId = null;
  let pointerStartX = 0;
  let pointerDelta = 0;
  let dragging = false;
  let suppressClick = false;
  let stepping = false;
  let skipClickUntil = 0;
  let carouselInView = false;
  let wheelAcc = 0;
  let wheelLockUntil = 0;

  const STEP_MS = prefersReducedMotion ? 0 : 420;
  const WHEEL_THRESHOLD = 48;
  const WHEEL_LOCK_MS = 520;

  root.classList.add("is-coverflow");

  function wrapOffset(i) {
    const n = cards.length;
    let o = i - active;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o;
  }

  function shortestDelta(from, to) {
    const n = cards.length;
    let d = ((to - from) % n + n) % n;
    if (d > n / 2) d -= n;
    return d;
  }

  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    cards.forEach((card, i) => {
      const title =
        card.querySelector(".project-card__title, .project-title")?.textContent?.trim() ||
        `Project ${i + 1}`;
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "projects-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to ${title}`);
      dot.setAttribute("aria-selected", i === active ? "true" : "false");
      dot.addEventListener("click", () => selectCard(i));
      dotsWrap.appendChild(dot);
    });
  }

  function applyCoverflow({ dragging: isDrag = false } = {}) {
    const viewW = viewport.clientWidth || 1;
    const sideX = Math.min(210, viewW * 0.34);
    const dragShift = isDrag ? pointerDelta * 0.55 : 0;

    cards.forEach((card, i) => {
      const o = wrapOffset(i);
      const abs = Math.abs(o);
      let x = o * sideX + dragShift;
      let y = 0;
      let scale = 0.72;
      let rot = o < 0 ? 28 : o > 0 ? -28 : 0;
      let z = -140;
      let opacity = 0;
      let blur = 0;
      let zIndex = 1;

      if (abs === 0) {
        scale = 1.1;
        rot = isDrag ? (pointerDelta / viewW) * -18 : 0;
        z = 120;
        y = -6;
        opacity = 1;
        zIndex = 5;
      } else if (abs === 1) {
        scale = 0.76;
        rot = o < 0 ? 34 : -34;
        y = 28;
        if (isDrag) {
          // Pull nearest side card toward center while dragging
          const pull = Math.max(-1, Math.min(1, -pointerDelta / (viewW * 0.45)));
          if ((o < 0 && pull > 0) || (o > 0 && pull < 0)) {
            const t = Math.abs(pull);
            scale = 0.76 + (1.1 - 0.76) * t * 0.7;
            z = -160 + 280 * t;
            y = 28 - 34 * t;
            opacity = 0.5 + 0.45 * t;
          } else {
            opacity = 0.5;
          }
        } else {
          opacity = 0.5;
        }
        zIndex = 3;
        blur = 0.4;
      } else if (abs === 2) {
        x = o * sideX * 1.15 + dragShift * 0.35;
        scale = 0.62;
        rot = o < 0 ? 42 : -42;
        z = -240;
        y = 42;
        opacity = 0.34;
        zIndex = 2;
        blur = 0.8;
      } else {
        x = o * sideX * 1.25;
        scale = 0.55;
        rot = o < 0 ? 48 : -48;
        z = -300;
        y = 50;
        opacity = 0;
        zIndex = 1;
      }

      const promoting = i === promoteIndex && abs > 0;
      if (promoting) {
        zIndex = 8;
        opacity = Math.max(opacity, 0.92);
        blur = Math.min(blur, 0.2);
      }

      card.classList.toggle("is-center", abs === 0);
      card.classList.toggle("is-side", abs === 1);
      card.classList.toggle("is-far", abs > 1);
      card.classList.toggle("is-promoting", promoting);
      card.setAttribute("aria-hidden", abs === 0 ? "false" : "true");
      card.tabIndex = abs === 0 ? 0 : -1;
      card.style.zIndex = String(zIndex);
      card.style.opacity = String(opacity);
      card.style.filter = blur ? `blur(${blur}px)` : "none";
      card.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z}px) rotateY(${rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      /* Far cards stay clickable so the back stack can be brought forward */
      /*
       * Center card AABB covers the side/back cards — let clicks pass through
       * the shell so visible side/far cards can be selected. Links stay clickable.
       */
      card.style.pointerEvents = abs === 0 ? "none" : abs <= 2 ? "auto" : "none";
      card.style.cursor = abs === 0 ? "default" : abs <= 2 ? "pointer" : "default";
      card.querySelectorAll("a, button").forEach((el) => {
        el.style.pointerEvents = "auto";
      });
    });

    dotsWrap?.querySelectorAll(".projects-dot").forEach((dot, i) => {
      dot.setAttribute("aria-selected", i === active ? "true" : "false");
    });
  }

  function syncUi({ animate = true } = {}) {
    if (!animate) {
      track.classList.add("is-instant");
      cards.forEach((c) => c.classList.add("is-instant"));
    }
    applyCoverflow();
    if (!animate) {
      void track.offsetWidth;
      track.classList.remove("is-instant");
      cards.forEach((c) => c.classList.remove("is-instant"));
    }
  }

  function restartProgress() {
    if (!progressBar) return;
    progressBar.style.animation = "none";
    void progressBar.offsetWidth;
    if (prefersReducedMotion || cards.length <= 1) {
      progressBar.style.width = "0%";
      return;
    }
    progressBar.style.animation = `projects-progress ${AUTOPLAY_MS}ms linear forwards`;
  }

  function stopAutoplay() {
    window.clearInterval(autoTimer);
    autoTimer = 0;
    root.classList.add("is-paused");
  }

  function startAutoplay() {
    if (prefersReducedMotion || cards.length <= 1) return;
    stopAutoplay();
    root.classList.remove("is-paused");
    restartProgress();
    autoTimer = window.setInterval(() => {
      goTo(active + 1);
    }, AUTOPLAY_MS);
  }

  function goTo(nextIndex, { user = false, keepStepping = false } = {}) {
    const n = cards.length;
    active = ((nextIndex % n) + n) % n;
    if (!keepStepping) {
      promoteIndex = -1;
      stepping = false;
      window.clearTimeout(stepTimer);
    }
    syncUi();
    if (keepStepping) return;
    if (user) startAutoplay();
    else restartProgress();
  }

  /**
   * Bring any visible card to center by stepping through coverflow slots,
   * so a back card slides across the side card into the front.
   */
  function selectCard(targetIndex) {
    const n = cards.length;
    const target = ((targetIndex % n) + n) % n;
    if (target === active || stepping) return;

    window.clearTimeout(stepTimer);
    stopAutoplay();
    stepping = true;
    promoteIndex = target;

    const stepOnce = () => {
      const delta = shortestDelta(active, target);
      if (delta === 0) {
        promoteIndex = -1;
        stepping = false;
        syncUi();
        startAutoplay();
        return;
      }
      goTo(active + (delta > 0 ? 1 : -1), { keepStepping: true });
      if (shortestDelta(active, target) === 0) {
        promoteIndex = -1;
        stepping = false;
        syncUi();
        startAutoplay();
        return;
      }
      stepTimer = window.setTimeout(stepOnce, STEP_MS);
    };

    stepOnce();
  }

  function next(user = true) {
    if (stepping) return;
    goTo(active + 1, { user });
  }

  function prev(user = true) {
    if (stepping) return;
    goTo(active - 1, { user });
  }

  function layout() {
    renderDots();
    syncUi({ animate: false });
  }

  prevBtn?.addEventListener("click", () => prev(true));
  nextBtn?.addEventListener("click", () => next(true));

  function isTypingTarget(el) {
    return !!el?.closest?.(
      'input, textarea, select, [contenteditable="true"], [contenteditable=""]'
    );
  }

  /* Keyboard arrows while the projects carousel is on screen */
  document.addEventListener("keydown", (e) => {
    if (!carouselInView || stepping || cards.length <= 1) return;
    if (isTypingTarget(e.target)) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev(true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next(true);
    }
  });

  /*
   * MacBook trackpad: two-finger swipe left/right arrives as wheel deltaX.
   * Shift+vertical wheel is treated as horizontal for desktop mice.
   */
  root.addEventListener(
    "wheel",
    (e) => {
      if (!carouselInView || stepping || cards.length <= 1) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      const horizontal = absX > absY && absX > 1.5;
      const shiftVertical = e.shiftKey && absY > 1.5;
      if (!horizontal && !shiftVertical) return;

      e.preventDefault();
      if (performance.now() < wheelLockUntil) return;

      wheelAcc += horizontal ? e.deltaX : e.deltaY;

      if (wheelAcc > WHEEL_THRESHOLD) {
        wheelAcc = 0;
        wheelLockUntil = performance.now() + WHEEL_LOCK_MS;
        next(true);
      } else if (wheelAcc < -WHEEL_THRESHOLD) {
        wheelAcc = 0;
        wheelLockUntil = performance.now() + WHEEL_LOCK_MS;
        prev(true);
      }
    },
    { passive: false }
  );

  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev(true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next(true);
    }
  });

  function indexWithOffset(offset) {
    return cards.findIndex((_, i) => wrapOffset(i) === offset);
  }

  /**
   * 3D coverflow hit-testing is unreliable (transformed AABBs fall outside the
   * clipped viewport). Map the click's X position inside the viewport to the
   * visible side / back card instead.
   */
  function cardIndexFromPoint(clientX, clientY) {
    const viewRect = viewport.getBoundingClientRect();
    if (
      clientX < viewRect.left ||
      clientX > viewRect.right ||
      clientY < viewRect.top ||
      clientY > viewRect.bottom
    ) {
      return -1;
    }

    const rel = (clientX - viewRect.left) / Math.max(viewRect.width, 1);

    /* Left stack */
    if (rel < 0.34) {
      const far = indexWithOffset(-2);
      const side = indexWithOffset(-1);
      if (rel < 0.16 && far >= 0) return far;
      return side;
    }

    /* Right stack */
    if (rel > 0.66) {
      const far = indexWithOffset(2);
      const side = indexWithOffset(1);
      if (rel > 0.84 && far >= 0) return far;
      return side;
    }

    /* Center band — ignore so VIEW CTA keeps working */
    return -1;
  }

  function activateCardAtPoint(clientX, clientY, event) {
    if (suppressClick || stepping) return false;
    if (performance.now() < skipClickUntil) return false;
    if (event?.target?.closest?.(".project-card__cta, .projects__nav-btn, .projects-dot, button")) {
      return false;
    }
    const idx = cardIndexFromPoint(clientX, clientY);
    if (idx < 0) return false;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    skipClickUntil = performance.now() + 450;
    selectCard(idx);
    return true;
  }

  viewport.addEventListener(
    "click",
    (e) => {
      if (performance.now() < skipClickUntil) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.target.closest(".project-card__cta") && e.target.closest(".project-card.is-center")) {
        suppressClick = false;
        return;
      }
      if (e.target.closest(".projects__nav-btn, .projects-dot, button")) {
        suppressClick = false;
        return;
      }
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
        return;
      }
      activateCardAtPoint(e.clientX, e.clientY, e);
    },
    true
  );

  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (
      e.target.closest(
        ".project-card__cta, .project-btn, .projects__nav-btn, button, input, textarea, select, label"
      )
    ) {
      return;
    }
    dragging = false;
    suppressClick = false;
    pointerId = e.pointerId;
    pointerStartX = e.clientX;
    pointerDelta = 0;
    stopAutoplay();
  });

  viewport.addEventListener("pointermove", (e) => {
    if (pointerId == null || e.pointerId !== pointerId) return;
    pointerDelta = e.clientX - pointerStartX;
    if (!dragging && Math.abs(pointerDelta) > 8) {
      dragging = true;
      suppressClick = true;
      root.classList.add("is-dragging");
      track.classList.add("is-instant");
      cards.forEach((c) => c.classList.add("is-instant"));
      viewport.setPointerCapture?.(e.pointerId);
    }
    if (!dragging) return;
    applyCoverflow({ dragging: true });
  });

  function endDrag(e) {
    if (pointerId == null || (e && e.pointerId != null && e.pointerId !== pointerId)) return;
    const wasDragging = dragging;
    const dx = pointerDelta;
    const x = e?.clientX ?? pointerStartX + dx;
    const y = e?.clientY ?? viewport.getBoundingClientRect().top + viewport.clientHeight / 2;

    dragging = false;
    root.classList.remove("is-dragging");
    track.classList.remove("is-instant");
    cards.forEach((c) => c.classList.remove("is-instant"));

    const threshold = Math.max(40, Math.min(120, viewport.clientWidth * 0.12));
    if (wasDragging && dx > threshold) prev(true);
    else if (wasDragging && dx < -threshold) next(true);
    else if (!wasDragging && !suppressClick) {
      /* Click without drag — promote the card under the pointer */
      if (!activateCardAtPoint(x, y, e)) {
        syncUi();
        startAutoplay();
      }
    } else {
      syncUi();
      startAutoplay();
    }

    pointerId = null;
    pointerDelta = 0;
    try {
      if (e?.pointerId != null) viewport.releasePointerCapture?.(e.pointerId);
    } catch (_) {
      /* ignore */
    }
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  root.addEventListener("pointerenter", () => stopAutoplay());
  root.addEventListener("pointerleave", () => {
    if (!dragging) startAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => layout());
    ro.observe(viewport);
  } else {
    window.addEventListener("resize", layout);
  }

  requestAnimationFrame(() => {
    layout();
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([entry]) => {
          carouselInView = !!entry?.isIntersecting;
          if (carouselInView) startAutoplay();
          else {
            stopAutoplay();
            wheelAcc = 0;
          }
        },
        { threshold: 0.22 }
      );
      io.observe(root);
    } else {
      carouselInView = true;
      startAutoplay();
    }
  });
})();
