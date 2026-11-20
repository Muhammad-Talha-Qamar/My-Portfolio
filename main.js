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

  let active = 0;
  let autoTimer = 0;
  let pointerId = null;
  let pointerStartX = 0;
  let pointerDelta = 0;
  let dragging = false;
  let suppressClick = false;

  root.classList.add("is-coverflow");

  function wrapOffset(i) {
    const n = cards.length;
    let o = i - active;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o;
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
      dot.addEventListener("click", () => goTo(i, { user: true }));
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
        opacity = 0.18;
        zIndex = 2;
        blur = 1.1;
      } else {
        x = o * sideX * 1.25;
        scale = 0.55;
        rot = o < 0 ? 48 : -48;
        z = -300;
        y = 50;
        opacity = 0;
        zIndex = 1;
      }

      card.classList.toggle("is-center", abs === 0);
      card.classList.toggle("is-side", abs === 1);
      card.classList.toggle("is-far", abs > 1);
      card.setAttribute("aria-hidden", abs === 0 ? "false" : "true");
      card.tabIndex = abs === 0 ? 0 : -1;
      card.style.zIndex = String(zIndex);
      card.style.opacity = String(opacity);
      card.style.filter = blur ? `blur(${blur}px)` : "none";
      card.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z}px) rotateY(${rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      card.style.pointerEvents = abs <= 1 ? "auto" : "none";
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

  function goTo(nextIndex, { user = false } = {}) {
    const n = cards.length;
    active = ((nextIndex % n) + n) % n;
    syncUi();
    if (user) startAutoplay();
    else restartProgress();
  }

  function next(user = true) {
    goTo(active + 1, { user });
  }

  function prev(user = true) {
    goTo(active - 1, { user });
  }

  function layout() {
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

  // Click a side card to bring it center
  cards.forEach((card, i) => {
    card.addEventListener("click", (e) => {
      if (suppressClick) return;
      if (e.target.closest(".project-card__cta, .project-btn, a.project-card__media, a.project-vidbox")) {
        if (wrapOffset(i) !== 0) {
          e.preventDefault();
          goTo(i, { user: true });
        }
        return;
      }
      if (wrapOffset(i) !== 0) {
        e.preventDefault();
        goTo(i, { user: true });
      }
    });
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
        ".project-card__cta, .project-btn, .projects__nav-btn, button, input, textarea, select, label"
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
    track.classList.add("is-instant");
    cards.forEach((c) => c.classList.add("is-instant"));
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    pointerDelta = e.clientX - pointerStartX;
    if (Math.abs(pointerDelta) > 8) suppressClick = true;
    applyCoverflow({ dragging: true });
  });

  function endDrag(e) {
    if (!dragging || (e && pointerId != null && e.pointerId !== pointerId)) return;
    dragging = false;
    root.classList.remove("is-dragging");
    track.classList.remove("is-instant");
    cards.forEach((c) => c.classList.remove("is-instant"));
    const threshold = Math.max(40, Math.min(120, viewport.clientWidth * 0.12));
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
        { threshold: 0.22 }
      );
      io.observe(root);
    } else {
      startAutoplay();
    }
  });
})();
