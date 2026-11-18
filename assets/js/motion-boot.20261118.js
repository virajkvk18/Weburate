/* Weburate motion boot: runs synchronously in <head> before first paint.
   Sets html classes that gate every animated state in motion.css, decides whether to
   show the once-per-session intro loader, and removes everything again if motion.js
   has not taken over within a few seconds (so content can never stay hidden). */
(function () {
  "use strict";
  var d = document.documentElement;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    d.classList.add("motion-ok");
    var desktop = window.matchMedia("(min-width: 981px) and (hover: hover) and (pointer: fine)").matches;
    if (desktop) d.classList.add("motion-desktop");

    if (desktop) {
      var seen = true;
      try {
        seen = window.sessionStorage.getItem("wb-intro") === "1";
        window.sessionStorage.setItem("wb-intro", "1");
      } catch (e) { seen = true; }
      if (!seen) {
        d.classList.add("show-loader");
        var endLoader = function () {
          if (!d.classList.contains("show-loader")) return;
          d.classList.remove("show-loader");
          window.dispatchEvent(new Event("wb:loader-done"));
        };
        window.setTimeout(endLoader, 1450);
        window.addEventListener("pointerdown", endLoader, { once: true });
        window.addEventListener("keydown", endLoader, { once: true });
        window.addEventListener("wheel", endLoader, { once: true, passive: true });
      }
    }

    window.setTimeout(function () {
      if (!d.classList.contains("motion-ready")) {
        d.classList.remove("motion-ok", "motion-desktop", "show-loader");
      }
    }, 4000);
  } catch (e) {
    d.classList.remove("motion-ok", "motion-desktop", "show-loader");
  }
})();
