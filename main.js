const sideBar = document.querySelector(".sidebar");
const menu = document.querySelector(".menu-icon");
const closeIcon = document.querySelector(".close-icon");
const modeToggle = document.getElementById("mode-toggle");
const year = document.getElementById("year");
const contactForm = document.getElementById("contact-form");

if (year) year.textContent = String(new Date().getFullYear());

function closeSidebar() {
  sideBar.classList.remove("open-sidebar");
  sideBar.classList.add("close-sidebar");
}

menu.addEventListener("click", () => {
  sideBar.classList.remove("close-sidebar");
  sideBar.classList.add("open-sidebar");
});

closeIcon.addEventListener("click", closeSidebar);

document.querySelectorAll(".sidebar a").forEach((link) => {
  link.addEventListener("click", closeSidebar);
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

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = new FormData(contactForm).get("name") || "friend";
    alert(`Thanks, ${name}! Your message was received (demo form).`);
    contactForm.reset();
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
