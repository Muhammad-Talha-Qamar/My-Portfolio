(() => {
  const root = document.querySelector("[data-projects-carousel]");
  const mount = root?.querySelector("[data-projects-lottie-mount]");
  if (!root || !mount) return;

  const LOTTIE_SRC =
    (window.talbytePortfolio && window.talbytePortfolio.cardsLottie) ||
    "https://assets-v2.lottiefiles.com/a/2fb32e38-117e-11ee-9070-e76a86017f1e/la6HaZWNrj.lottie";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function finish() {
    root.classList.remove("is-lottie-playing");
    root.classList.add("is-lottie-done");
    const stage = root.querySelector("[data-projects-lottie]");
    if (stage) {
      window.setTimeout(() => {
        stage.setAttribute("hidden", "");
        stage.setAttribute("aria-hidden", "true");
      }, 420);
    }
  }

  function skip() {
    root.classList.add("is-lottie-done");
    const stage = root.querySelector("[data-projects-lottie]");
    stage?.setAttribute("hidden", "");
  }

  if (prefersReducedMotion) {
    skip();
    return;
  }

  root.classList.add("is-lottie-pending");

  let started = false;
  let finished = false;

  function onDone() {
    if (finished) return;
    finished = true;
    finish();
  }

  async function play() {
    if (started) return;
    started = true;
    root.classList.remove("is-lottie-pending");
    root.classList.add("is-lottie-playing");

    try {
      if (!customElements.get("dotlottie-player")) {
        await import(
          "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
        );
      }

      const player = document.createElement("dotlottie-player");
      player.setAttribute("src", LOTTIE_SRC);
      player.setAttribute("background", "transparent");
      player.setAttribute("speed", "1");
      player.setAttribute("autoplay", "");
      player.setAttribute("aria-hidden", "true");
      player.className = "projects-lottie__player";
      mount.appendChild(player);

      const safety = window.setTimeout(onDone, 5200);

      player.addEventListener("complete", () => {
        window.clearTimeout(safety);
        onDone();
      });
      player.addEventListener("error", () => {
        window.clearTimeout(safety);
        onDone();
      });

      // Some builds expose ready/play via methods after upgrade
      player.addEventListener("ready", () => {
        try {
          player.setLooping?.(false);
          player.play?.();
        } catch (_) {
          /* ignore */
        }
      });
    } catch (_) {
      onDone();
    }
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        play();
      },
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(root);
  } else {
    play();
  }
})();
