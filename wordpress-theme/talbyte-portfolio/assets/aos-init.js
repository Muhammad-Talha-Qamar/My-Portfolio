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

  function forceVisible(scope) {
    (scope || document).querySelectorAll("[data-aos]").forEach(function (el) {
      el.classList.add("aos-animate");
    });
  }

  /* Above-the-fold + lite: never wait on AOS CDN / scroll observer */
  forceVisible(document.querySelector(".hero"));
  if (lite) {
    forceVisible(document);
    document.documentElement.classList.add("is-lite");
  }

  AOS.init({
    once: true,
    offset: 16,
    duration: lite ? 0 : 280,
    delay: 0,
    easing: "ease-out-cubic",
    mirror: false,
    disable: lite,
    throttleDelay: 48,
    debounceDelay: 32,
  });

  /* Reveal anything already in view quickly so cards never stay blank */
  window.setTimeout(function () {
    document.querySelectorAll("[data-aos]:not(.aos-animate)").forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.05) {
        el.classList.add("aos-animate");
      }
    });
  }, lite ? 0 : 400);
});
