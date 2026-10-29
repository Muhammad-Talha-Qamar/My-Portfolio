document.addEventListener("DOMContentLoaded", function () {
  if (typeof AOS === "undefined") return;

  var lite =
    window.matchMedia(
      "(max-width: 1100px), (prefers-reduced-motion: reduce), (update: slow)"
    ).matches || !!(navigator.connection && navigator.connection.saveData);

  /* Above-the-fold: never wait on AOS CDN / scroll observer */
  document.querySelectorAll(".hero [data-aos]").forEach(function (el) {
    el.classList.add("aos-animate");
  });

  AOS.init({
    once: true,
    offset: 24,
    duration: lite ? 0 : 380,
    delay: 0,
    easing: "ease-out-cubic",
    mirror: false,
    disable: lite,
    throttleDelay: 32,
    debounceDelay: 24,
  });

  /* If user scrolls past before AOS paints, force-visible quickly */
  if (!lite) {
    window.setTimeout(function () {
      document.querySelectorAll("[data-aos]:not(.aos-animate)").forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
          el.classList.add("aos-animate");
        }
      });
    }, 900);
  }
});
