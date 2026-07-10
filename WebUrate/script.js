const cursorLight = document.querySelector(".cursor-light");
const revealItems = document.querySelectorAll("[data-reveal]");
const counters = document.querySelectorAll("[data-counter]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const accordionItems = document.querySelectorAll(".accordion-item");

if (window.lucide) {
  window.lucide.createIcons();
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -70px 0px" }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 7, 5) * 45}ms`;
  revealObserver.observe(item);
});

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = Number(el.dataset.counter || 0);
      const start = performance.now();
      const duration = 1100;

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.35 }
);

counters.forEach((counter) => counterObserver.observe(counter));

if (matchMedia("(pointer: fine)").matches) {
  document.addEventListener("pointermove", (event) => {
    if (!cursorLight) return;
    cursorLight.style.opacity = "1";
    cursorLight.style.left = `${event.clientX}px`;
    cursorLight.style.top = `${event.clientY}px`;
  });

  document.addEventListener("pointerleave", () => {
    if (cursorLight) cursorLight.style.opacity = "0";
  });

  document.querySelectorAll(".magnet").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.06}px, ${y * 0.1}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

function setMenuIcon(isOpen) {
  const icon = menuToggle.querySelector("[data-lucide]");
  if (!icon) return;
  icon.setAttribute("data-lucide", isOpen ? "x" : "menu");
  if (window.lucide) window.lucide.createIcons();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    setMenuIcon(isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      setMenuIcon(false);
    });
  });
}

accordionItems.forEach((item) => {
  item.setAttribute("aria-expanded", item.classList.contains("active") ? "true" : "false");

  item.addEventListener("click", () => {
    accordionItems.forEach((other) => {
      if (other !== item) {
        other.classList.remove("active");
        other.setAttribute("aria-expanded", "false");
      }
    });
    const isActive = item.classList.toggle("active");
    item.setAttribute("aria-expanded", String(isActive));
  });
});

const leadForm = document.getElementById("lead-form");

if (leadForm) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(leadForm);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const business = (data.get("business") || "").toString().trim();
    const businessType = (data.get("businessType") || "").toString().trim();
    const budget = (data.get("budget") || "").toString().trim();
    const details = (data.get("details") || "").toString().trim();

    const note = document.getElementById("lead-form-note");

    if (!name || !email) {
      if (note) {
        note.textContent = "Please add at least your name and email so we can get back to you.";
        note.classList.add("form-note-error");
      }
      leadForm.querySelector(!name ? '[name="name"]' : '[name="email"]')?.focus();
      return;
    }

    if (note) note.classList.remove("form-note-error");

    const subject = `New project enquiry from ${name}`;
    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      business ? `Business: ${business}` : null,
      businessType ? `Business type: ${businessType}` : null,
      budget ? `Approx. budget: ${budget}` : null,
      "",
      "Project details:",
      details || "(not provided)",
    ].filter((line) => line !== null);

    const mailto = `mailto:virajvishwakarma672@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    window.location.href = mailto;
  });
}
