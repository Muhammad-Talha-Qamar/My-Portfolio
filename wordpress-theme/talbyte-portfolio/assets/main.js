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

  window.addEventListener(
    "scroll",
    () => {
      navbar?.classList.toggle("navbar--scrolled", window.scrollY > 24);
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
    const updateHeroParallax = () => {
      heroRaf = 0;
      const y = window.scrollY;
      if (y < window.innerHeight * 1.6) {
        hero.style.setProperty("--parallax-hero-photo", `${(y * 0.14).toFixed(1)}px`);
        hero.style.setProperty("--parallax-hero-backlayer", `${(y * 0.06).toFixed(1)}px`);
        hero.style.setProperty("--parallax-hero-text", `${(y * 0.04).toFixed(1)}px`);
      }
    };
    window.addEventListener(
      "scroll",
      () => {
        if (heroRaf) return;
        heroRaf = requestAnimationFrame(updateHeroParallax);
      },
      { passive: true }
    );
  }

  const sections = [...document.querySelectorAll("section[id]")];
  if (sections.length && "IntersectionObserver" in window) {
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

  const track = root.querySelector("[data-projects-track]");
  const viewport = root.querySelector("[data-projects-viewport]");
  const prevBtn = root.querySelector("[data-projects-prev]");
  const nextBtn = root.querySelector("[data-projects-next]");
  const dotsWrap = root.querySelector("[data-projects-dots]");
  const progressBar = root.querySelector("[data-projects-progress]");
  const cards = [...(track?.querySelectorAll(":scope > .project-card") || [])];
  if (!track || !viewport || cards.length === 0) return;

  const AUTOPLAY_MS = 6500;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let page = 0;
  let perView = 1;
  let pageCount = 1;
  let autoTimer = 0;
  let pointerId = null;
  let pointerStartX = 0;
  let pointerDelta = 0;
  let dragging = false;
  let suppressClick = false;
  let cardStep = 0;

  function readPerView() {
    if (window.innerWidth >= 1024) return 2;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  function measureCardStep() {
    const card = cards[0];
    if (!card) return 0;
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function maxPixelOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function pageOffset(pageIndex) {
    const start = pageIndex * perView;
    const maxStart = Math.max(0, cards.length - perView);
    return Math.min(start, maxStart);
  }

  function pixelOffsetForPage(pageIndex) {
    const raw = pageOffset(pageIndex) * (cardStep || measureCardStep());
    return Math.min(raw, maxPixelOffset());
  }

  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    for (let i = 0; i < pageCount; i += 1) {
      const start = pageOffset(i) + 1;
      const end = Math.min(pageOffset(i) + perView, cards.length);
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "projects-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.setAttribute("aria-selected", i === page ? "true" : "false");
      dot.title = `Projects ${start} to ${end}`;
      dot.addEventListener("click", () => goTo(i, { user: true }));
      dotsWrap.appendChild(dot);
    }
  }

  function markActiveCards() {
    const start = pageOffset(page);
    cards.forEach((card, i) => {
      const active = i >= start && i < start + perView;
      card.classList.toggle("is-active", active);
      card.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }

  function syncUi({ animate = true } = {}) {
    cardStep = measureCardStep();
    const offset = -pixelOffsetForPage(page);
    if (!animate) track.style.transition = "none";
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
    if (!animate) {
      void track.offsetWidth;
      track.style.transition = "";
    }
    dotsWrap?.querySelectorAll(".projects-dot").forEach((dot, i) => {
      dot.setAttribute("aria-selected", i === page ? "true" : "false");
    });
    markActiveCards();
  }

  function restartProgress() {
    if (!progressBar) return;
    progressBar.style.animation = "none";
    void progressBar.offsetWidth;
    if (prefersReducedMotion || pageCount <= 1) {
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
    if (prefersReducedMotion || pageCount <= 1) return;
    stopAutoplay();
    root.classList.remove("is-paused");
    restartProgress();
    autoTimer = window.setInterval(() => {
      goTo(page + 1);
    }, AUTOPLAY_MS);
  }

  function goTo(nextPage, { user = false } = {}) {
    page = ((nextPage % pageCount) + pageCount) % pageCount;
    syncUi();
    if (user) startAutoplay();
    else restartProgress();
  }

  function next(user = true) {
    goTo(page + 1, { user });
  }

  function prev(user = true) {
    goTo(page - 1, { user });
  }

  function syncSlideWidth() {
    perView = readPerView();
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 24;
    const viewW = viewport.clientWidth;
    if (!(viewW > 0)) return;
    const slideW = Math.max(220, (viewW - Math.max(0, perView - 1) * gap) / perView);
    cards.forEach((card) => {
      card.style.flex = `0 0 ${slideW.toFixed(2)}px`;
      card.style.maxWidth = `${slideW.toFixed(2)}px`;
    });
    track.style.gap = `${gap}px`;
  }

  function layout() {
    syncSlideWidth();
    perView = readPerView();
    pageCount = Math.max(1, Math.ceil(cards.length / perView));
    page = Math.min(page, pageCount - 1);
    renderDots();
    syncUi({ animate: false });
  }

  prevBtn?.addEventListener("click", () => prev(true));
  nextBtn?.addEventListener("click", () => next(true));

  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev(true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next(true);
    }
  });

  viewport.addEventListener(
    "click",
    (e) => {
      if (!suppressClick) return;
      if (e.target.closest(".project-card__cta, .projects__nav-btn, button")) {
        suppressClick = false;
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    },
    true
  );

  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (
      e.target.closest(
        ".project-card__cta, .projects__nav-btn, button, input, textarea, select, label"
      )
    ) {
      return;
    }
    dragging = true;
    suppressClick = false;
    pointerId = e.pointerId;
    pointerStartX = e.clientX;
    pointerDelta = 0;
    root.classList.add("is-dragging");
    stopAutoplay();
    cardStep = measureCardStep();
    track.style.transition = "none";
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    pointerDelta = e.clientX - pointerStartX;
    if (Math.abs(pointerDelta) > 8) suppressClick = true;
    const base = -pixelOffsetForPage(page);
    track.style.transform = `translate3d(${base + pointerDelta}px, 0, 0)`;
  });

  function endDrag(e) {
    if (!dragging || (e && pointerId != null && e.pointerId !== pointerId)) return;
    dragging = false;
    root.classList.remove("is-dragging");
    track.style.transition = "";
    const threshold = Math.max(36, Math.min(120, viewport.clientWidth * 0.12));
    if (pointerDelta > threshold) prev(true);
    else if (pointerDelta < -threshold) next(true);
    else {
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
          if (entry?.isIntersecting) startAutoplay();
          else stopAutoplay();
        },
        { threshold: 0.2 }
      );
      io.observe(root);
    } else {
      startAutoplay();
    }
  });
})();
