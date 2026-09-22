const sideBar = document.querySelector(".sidebar");
const menu = document.querySelector(".menu-icon");
const closeIcon = document.querySelector(".close-icon");
const navOverlay = document.getElementById("nav-overlay");
const modeToggle = document.getElementById("mode-toggle");
const year = document.getElementById("year");
const contactForm = document.getElementById("contact-form");

if (year) year.textContent = String(new Date().getFullYear());

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

/* ——— Extreme reactivity ——— */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;
  const header = document.querySelector("header");
  const orb = document.querySelector(".cursor-orb");
  const ring = document.querySelector(".cursor-ring");
  const navLinks = [
    ...document.querySelectorAll("header ul a, .nav-links a, .sidebar ul a"),
  ];
  const sections = ["home", "about", "skills", "projects", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  root.classList.add("is-reactive");
  if (reduceMotion) {
    root.classList.add("reduce-motion");
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

  /* 3D tilt + spotlight */
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const max = Number(el.dataset.tiltMax) || 12;

    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * max;
      const ry = (px - 0.5) * max;
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--sx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--sy", `${(py * 100).toFixed(1)}%`);
      el.classList.add("is-tilting");
    });

    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.classList.remove("is-tilting");
    });
  });

  /* Magnetic buttons */
  if (finePointer) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* Scroll: header + active nav */
  function onScroll() {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 24);
    root.style.setProperty("--scroll", String(Math.min(y / 800, 1)));

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
})();
