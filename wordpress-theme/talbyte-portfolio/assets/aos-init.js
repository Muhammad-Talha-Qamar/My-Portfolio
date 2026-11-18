document.addEventListener("DOMContentLoaded", function () {
  if (typeof AOS === "undefined") return;

  var lite =
    document.documentElement.classList.contains("is-lite") ||
    window.matchMedia(
      "(max-width: 1100px), (prefers-reduced-motion: reduce), (update: slow), (pointer: coarse)"
    ).matches ||
    !window.matchMedia("(pointer: fine)").matches ||
    !!(navigator.connection && (navigator.connection.saveData || /2g|slow-2g/i.test(navigator.connection.effectiveType || ""))) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
    (navigator.deviceMemory && navigator.deviceMemory < 4);

  var EXIT_VARIANTS = [
    "fade-up",
    "fade-down",
    "fade-left",
    "fade-right",
    "zoom-out",
    "zoom-in",
    "rotate",
    "skew-left",
    "skew-right",
    "blur",
    "flip",
    "sink",
    "drift-tl",
    "drift-br",
  ];

  function forceVisible(scope) {
    (scope || document).querySelectorAll("[data-aos]").forEach(function (el) {
      el.classList.add("aos-animate");
      el.classList.remove("aos-animate-out", "aos-snap");
    });
  }

  function assignExitVariants() {
    document.querySelectorAll("[data-aos]").forEach(function (el, i) {
      if (!el.hasAttribute("data-aos-out")) {
        el.setAttribute("data-aos-out", EXIT_VARIANTS[i % EXIT_VARIANTS.length]);
      }
    });
  }

  function snapToEnterFrom(el) {
    el.classList.add("aos-snap");
    el.classList.remove("aos-animate-out");
    void el.offsetWidth;
    el.classList.remove("aos-snap");
  }

  function bindExitLifecycle() {
    document.addEventListener("aos:in", function (event) {
      var el = event.detail;
      if (!el || !el.classList) return;
      el.classList.remove("aos-animate-out", "aos-snap");
    });

    document.addEventListener("aos:out", function (event) {
      var el = event.detail;
      if (!el || !el.classList) return;
      el.classList.add("aos-animate-out");

      var finished = false;
      var fallback = window.setTimeout(function () {
        if (finished) return;
        finished = true;
        snapToEnterFrom(el);
      }, 700);

      function onEnd(e) {
        if (e.target !== el) return;
        if (e.propertyName && e.propertyName !== "transform" && e.propertyName !== "opacity") {
          return;
        }
        finished = true;
        window.clearTimeout(fallback);
        el.removeEventListener("transitionend", onEnd);
        snapToEnterFrom(el);
      }

      el.addEventListener("transitionend", onEnd);
    });
  }

  /* Above-the-fold + lite: never wait on AOS CDN / scroll observer */
  forceVisible(document.querySelector(".hero"));
  if (lite) {
    forceVisible(document);
    document.documentElement.classList.add("is-lite");
  }

  assignExitVariants();
  if (!lite) bindExitLifecycle();

  AOS.init({
    once: false,
    mirror: true,
    offset: 48,
    duration: lite ? 0 : 420,
    delay: 0,
    easing: "ease-out-cubic",
    disable: lite,
    throttleDelay: 48,
    debounceDelay: 32,
  });

  /* Reveal anything already in view quickly so cards never stay blank */
  window.setTimeout(function () {
    document.querySelectorAll("[data-aos]:not(.aos-animate)").forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add("aos-animate");
        el.classList.remove("aos-animate-out");
      }
    });
  }, lite ? 0 : 120);
});
