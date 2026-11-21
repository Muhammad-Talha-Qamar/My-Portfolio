(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = document.documentElement.classList.contains("is-lite");
  if (reduceMotion) return;

  const SECTION_SEL = "#home, #about, #skills, #projects, #services, #contact";
  const sections = [...document.querySelectorAll(SECTION_SEL)].filter(Boolean);
  if (sections.length < 2) return;

  const brandRaw =
    document.querySelector(".navbar__name")?.textContent?.trim() ||
    document.querySelector(".footer__brand")?.textContent?.trim() ||
    "TALHA Q.";
  const brand = brandRaw.replace(/[<>&"]/g, "").trim() || "TALHA Q.";
  const dialScriptSrc =
    document.querySelector('script[src*="scroll-dial"]')?.src ||
    document.querySelector('script[src*="talbyte-portfolio/assets/"]')?.src ||
    "";
  const themeAssetBase = dialScriptSrc
    ? dialScriptSrc.replace(/\/(?:dist\/)?[^/?#]+\.js(?:\?[^#]*)?(?:#.*)?$/, "/images/")
    : document.querySelector(".navbar__logo img")?.src?.replace(/\/images\/[^/?#]+.*$/, "/images/") || "";
  const markSrc = themeAssetBase ? `${themeAssetBase}tq-mark.png` : "";
  const rimLabel = `• ${brand} `.repeat(6).trim();

  const wrap = document.createElement("aside");
  wrap.className = "scroll-dial-wrapper";
  wrap.setAttribute("aria-label", "Scroll dial");

  const dial = document.createElement("div");
  dial.className = "scroll-dial";
  dial.tabIndex = 0;
  dial.setAttribute("role", "button");
  dial.title = "Click to advance • Drag up/down to scrub scroll";
  dial.setAttribute(
    "aria-label",
    "Scroll dial. Click to go to next section. Drag to scrub the page."
  );

  const ring = document.createElement("div");
  ring.className = "scroll-dial__ring";
  ring.setAttribute("aria-hidden", "true");
  ring.innerHTML = `
    <svg class="scroll-dial__svg" viewBox="0 0 100 100">
      <defs>
        <path id="scroll-dial-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
      </defs>
      <text class="scroll-dial__text">
        <textPath href="#scroll-dial-path" xlink:href="#scroll-dial-path" startOffset="0%"></textPath>
      </text>
    </svg>
  `;
  const textPath = ring.querySelector("textPath");
  if (textPath) textPath.textContent = rimLabel;

  const core = document.createElement("div");
  core.className = "scroll-dial__core";
  if (markSrc) {
    const img = document.createElement("img");
    img.className = "scroll-dial__photo";
    img.src = markSrc;
    img.alt = "";
    img.width = 56;
    img.height = 56;
    img.decoding = "async";
    img.onerror = () => {
      img.remove();
      const fallback = document.createElement("span");
      fallback.className = "scroll-dial__fallback";
      fallback.setAttribute("aria-hidden", "true");
      fallback.textContent = "TQ";
      core.prepend(fallback);
    };
    core.appendChild(img);
  } else {
    const fallback = document.createElement("span");
    fallback.className = "scroll-dial__fallback";
    fallback.setAttribute("aria-hidden", "true");
    fallback.textContent = "TQ";
    core.appendChild(fallback);
  }
  const indexEl = document.createElement("span");
  indexEl.className = "scroll-dial__index";
  indexEl.setAttribute("aria-live", "polite");
  indexEl.textContent = "01";
  core.appendChild(indexEl);

  const knob = document.createElement("div");
  knob.className = "scroll-dial__knob";
  knob.setAttribute("aria-hidden", "true");

  dial.append(ring, core, knob);
  wrap.appendChild(dial);

  document.body.appendChild(wrap);

  let active = 0;
  let dragging = false;
  let dragStartY = 0;
  let dragStartScroll = 0;
  let moved = false;
  let raf = 0;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function sectionIndexFromScroll() {
    const y = window.scrollY + window.innerHeight * 0.35;
    let idx = 0;
    sections.forEach((sec, i) => {
      if (sec.offsetTop <= y) idx = i;
    });
    return idx;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function syncFromScroll() {
    const max = maxScroll();
    const progress = max > 0 ? window.scrollY / max : 0;
    const rot = progress * 360;
    ring.style.transform = `rotate(${rot.toFixed(2)}deg)`;

    active = sectionIndexFromScroll();
    indexEl.textContent = pad(active + 1);
    dial.dataset.section = sections[active]?.id || "";
    wrap.classList.toggle("is-near-end", progress > 0.92);
  }

  function scheduleSync() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      syncFromScroll();
    });
  }

  function goToIndex(i, { smooth = true } = {}) {
    const n = sections.length;
    const next = ((i % n) + n) % n;
    const target = sections[next];
    if (!target) return;
    active = next;
    indexEl.textContent = pad(active + 1);
    target.scrollIntoView({ behavior: smooth && !lite ? "smooth" : "auto", block: "start" });
  }

  function advance() {
    const atEnd = active >= sections.length - 1;
    goToIndex(atEnd ? 0 : active + 1);
  }

  dial.addEventListener("click", (e) => {
    if (moved) {
      moved = false;
      return;
    }
    e.preventDefault();
    advance();
  });

  dial.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      advance();
    } else if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      goToIndex(active + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      goToIndex(active - 1);
    }
  });

  dial.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    moved = false;
    dragStartY = e.clientY;
    dragStartScroll = window.scrollY;
    dial.classList.add("is-dragging");
    dial.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });

  dial.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dy) > 4) moved = true;
    const scrub = dy * 2.4;
    const nextY = Math.max(0, Math.min(maxScroll(), dragStartScroll + scrub));
    window.scrollTo({ top: nextY, behavior: "auto" });
    scheduleSync();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    dial.classList.remove("is-dragging");
    try {
      if (e?.pointerId != null) dial.releasePointerCapture?.(e.pointerId);
    } catch (_) {
      /* ignore */
    }
  }

  dial.addEventListener("pointerup", endDrag);
  dial.addEventListener("pointercancel", endDrag);

  window.addEventListener("scroll", scheduleSync, { passive: true });
  window.addEventListener("resize", scheduleSync, { passive: true });

  requestAnimationFrame(() => {
    syncFromScroll();
    wrap.classList.add("scroll-dial-wrapper--ready");
  });
})();
