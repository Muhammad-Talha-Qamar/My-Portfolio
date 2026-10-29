document.addEventListener("DOMContentLoaded", function () {
  if (typeof AOS === "undefined") return;
  var lite = window.matchMedia(
    "(max-width: 1100px), (prefers-reduced-motion: reduce), (update: slow)"
  ).matches || !!(navigator.connection && navigator.connection.saveData);
  AOS.init({
    once: true,
    offset: 48,
    duration: lite ? 0 : 350,
    easing: "ease-out-cubic",
    mirror: false,
    disable: lite
  });
});
