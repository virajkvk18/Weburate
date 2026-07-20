"use strict";
document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector(".nav-links");

function closeMenu({ returnFocus = false } = {}) {
  if (!menuButton || !menu) return;
  menu.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  if (returnFocus) menuButton.focus();
}

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
   document.addEventListener("click", (event) => {

    const tracked = event.target.closest("[data-event]");

    if (tracked){
        track(tracked.dataset.event);
    }

    const navLink = event.target.closest(".nav-links a");

    if(navLink){

        document
            .querySelectorAll(".nav-links a")
            .forEach(link=>link.classList.remove("active"));

        navLink.classList.add("active");

    }

});
  document.addEventListener("click", (event) => {
    if (menu.classList.contains("open") && !event.target.closest(".nav")) closeMenu();
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  const items = document.querySelectorAll("main section > *:not(.contact-form), .card, .concept-card");
  items.forEach((item) => item.setAttribute("data-reveal", ""));
  const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const siblings = [...entry.target.parentElement.children]
      .filter(el => el.hasAttribute("data-reveal"));

    const delay = siblings.indexOf(entry.target) * 120;

    entry.target.style.transitionDelay = `${delay}ms`;
    entry.target.classList.add("is-visible");

    observer.unobserve(entry.target);
  });
}, {
  rootMargin: "0px 0px -40px",
  threshold: 0.05
});
  items.forEach((item) => observer.observe(item));
}

function analyticsConfig() {
  return window.WEBURATE_ANALYTICS || { ga4Id: "", clarityId: "" };
}

function validId(value, pattern) {
  return typeof value === "string" && pattern.test(value.trim());
}

function loadAnalytics() {
  const config = analyticsConfig();
  if (validId(config.ga4Id, /^G-[A-Z0-9]+$/)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4Id)}`;
    document.head.append(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", config.ga4Id, { anonymize_ip: true });
  }
  if (validId(config.clarityId, /^[a-z0-9]+$/i)) {
    window.clarity = window.clarity || function clarity(){ (window.clarity.q = window.clarity.q || []).push(arguments); };
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(config.clarityId)}`;
    document.head.append(script);
  }
}

function track(name) {
  if (!name) return;
  if (typeof window.gtag === "function") window.gtag("event", name);
  if (typeof window.clarity === "function") window.clarity("event", name);
}

loadAnalytics();
document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-event]");
  if (link) track(link.dataset.event);
});

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const form = document.querySelector("#contact-form");
if (form) {
  const status = document.querySelector("#form-status");
  const submit = form.querySelector('button[type="submit"]');
  const startedAt = form.querySelector("#started-at");
  let started = false;
  let sending = false;
  if (startedAt) startedAt.value = String(Date.now());

  function setStatus(message, error = false) {
    status.textContent = message;
    status.classList.toggle("error", error);
  }

  function validateField(field) {
    const error = document.querySelector(`#${field.id}-error`);
    let message = "";
    if (field.validity.valueMissing) message = field.name === "message" ? "Please describe the project." : `Please enter your ${field.name}.`;
    else if (field.validity.typeMismatch) message = "Enter a valid email address.";
    else if (field.validity.tooShort) message = `Please enter at least ${field.minLength} characters.`;
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  }

  form.addEventListener("input", (event) => {
    if (!started) { track("contact_form_start"); started = true; }
    if (event.target.matches("[required]")) validateField(event.target);
  }, { once: false });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    const required = [...form.querySelectorAll("[required]")];
    const valid = required.map(validateField).every(Boolean);
    if (!valid) {
      setStatus("Please correct the highlighted fields.", true);
      required.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }
    sending = true;
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    setStatus("Sending your project brief…");
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Your message could not be sent.");
      form.reset();
      setStatus(result.development ? "Development test passed. No email was sent." : "Thanks — your project brief was sent. Weburate will reply using the contact details you provided.");
      track("contact_form_success");
      submit.textContent = result.development ? "Test passed" : "Request received";
    } catch (error) {
      setStatus(`${error.message} You can also email weburateinfotech@gmail.com or use WhatsApp.`, true);
      track("contact_form_error");
      sending = false;
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
      submit.textContent = "Request a Free Consultation";
    }
  });
}

document.querySelectorAll(".accordion-button").forEach((button) => {
  button.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    button.click();
  });
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.querySelector("span").textContent = expanded ? "+" : "−";
    panel.hidden = expanded;
  });
});

const backToTop = document.getElementById("backToTop");

if (backToTop) {

  window.addEventListener("scroll", () => {

    if (window.scrollY > 400) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }

  });

  const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 30);
});


/* ===== Improvements ===== */

  backToTop.addEventListener("click", () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  });

}

const progressBar = document.querySelector(".art-card span");

if (progressBar) {

    progressBar.style.transform = "scaleX(0)";
    progressBar.style.transformOrigin = "left";

    const progressObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            progressBar.style.transition = "transform 2s ease";
            progressBar.style.transform = "scaleX(1)";

            progressObserver.disconnect();

        });

    });

    progressObserver.observe(progressBar);

}

const browserArt = document.querySelector(".browser-art");

if(browserArt){

let direction = 1;

setInterval(()=>{

browserArt.style.transform =
`translateY(${direction*8}px)`;

direction *= -1;

},2500);

}