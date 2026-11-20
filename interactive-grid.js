(() => {
  const canvas = document.getElementById("interactive-grid");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isLite = document.documentElement.classList.contains("is-lite");
  const CELL = 44;
  const CROSS = 5;

  let raf = null;
  let running = false;
  let width = 0;
  let height = 0;
  let targetX = -1000;
  let targetY = -1000;
  let x = -1000;
  let y = -1000;
  let pointerActive = false;
  let idleFrames = 0;
  const ripples = [];

  let gridCanvas = null;
  let gridCtx = null;

  function buildGrid(w, h, dpr) {
    if (!gridCanvas) gridCanvas = document.createElement("canvas");
    gridCanvas.width = w * dpr;
    gridCanvas.height = h * dpr;
    gridCtx = gridCanvas.getContext("2d");
    if (!gridCtx) return;
    gridCtx.setTransform(1, 0, 0, 1, 0, 0);
    gridCtx.scale(dpr, dpr);
    gridCtx.clearRect(0, 0, w, h);
    gridCtx.beginPath();
    gridCtx.lineWidth = 1;
    gridCtx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    for (let i = 0; i <= w; i += CELL) {
      gridCtx.moveTo(i, 0);
      gridCtx.lineTo(i, h);
    }
    for (let i = 0; i <= h; i += CELL) {
      gridCtx.moveTo(0, i);
      gridCtx.lineTo(w, i);
    }
    gridCtx.stroke();
  }

  function paintStatic() {
    ctx.clearRect(0, 0, width, height);
    if (gridCanvas) ctx.drawImage(gridCanvas, 0, 0, width, height);
  }

  function frame() {
    if (!ctx) return;

    if (pointerActive) {
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      idleFrames = 0;
    } else {
      x += (-1000 - x) * 0.08;
      y += (-1000 - y) * 0.08;
      idleFrames += 1;
    }

    ctx.clearRect(0, 0, width, height);
    if (gridCanvas) ctx.drawImage(gridCanvas, 0, 0, width, height);

    const footer = document.querySelector(".footer");
    const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
    const nearPointer =
      !(y >= footerTop - 30) &&
      x > -250 &&
      x < width + 250 &&
      y > -250 &&
      y < height + 250;

    if (nearPointer) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 240);
      glow.addColorStop(0, "rgba(255, 255, 255, 0.16)");
      glow.addColorStop(0.45, "rgba(255, 255, 255, 0.05)");
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(Math.max(0, x - 240), Math.max(0, y - 240), 480, 480);

      const x0 = Math.max(0, Math.floor((x - 240) / CELL) * CELL);
      const x1 = Math.min(width, Math.ceil((x + 240) / CELL) * CELL);
      const y0 = Math.max(0, Math.floor((y - 240) / CELL) * CELL);
      const y1 = Math.min(height, Math.ceil((y + 240) / CELL) * CELL);

      for (let gx = x0; gx <= x1; gx += CELL) {
        for (let gy = y0; gy <= y1; gy += CELL) {
          const dx = gx - x;
          const dy = gy - y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 >= 57600) continue;
          const strength = Math.pow(1 - Math.sqrt(dist2) / 240, 1.8);
          ctx.strokeStyle = `rgba(255, 255, 255, ${strength * 0.95})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(gx - CROSS, gy);
          ctx.lineTo(gx + CROSS, gy);
          ctx.moveTo(gx, gy - CROSS);
          ctx.lineTo(gx, gy + CROSS);
          ctx.stroke();
          if (strength > 0.4) {
            ctx.fillStyle = `rgba(255, 255, 255, ${strength})`;
            ctx.fillRect(gx - 1, gy - 1, 2, 2);
          }
        }
      }
    }

    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      const ripple = ripples[i];
      ripple.radius += 5.5;
      ripple.opacity -= 0.015;
      if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * 0.45})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (!pointerActive && !nearPointer && ripples.length === 0 && idleFrames > 30) {
      stop();
      return;
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || document.hidden || reduceMotion || isLite) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    buildGrid(width, height, dpr);
    paintStatic();
    if (!reduceMotion && !isLite && !running) start();
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  if (reduceMotion || isLite) return;

  window.addEventListener(
    "mousemove",
    (e) => {
      if (e.target && e.target.closest && e.target.closest(".footer")) {
        pointerActive = false;
        return;
      }
      targetX = e.clientX;
      targetY = e.clientY;
      pointerActive = true;
      idleFrames = 0;
      start();
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", () => {
    pointerActive = false;
  });

  window.addEventListener(
    "click",
    (e) => {
      if (e.target && e.target.closest && e.target.closest(".footer")) return;
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.45,
        opacity: 0.8,
      });
      start();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
})();
