/* Weburate motion layer (2026-11-18)
   Requires (deferred, loaded before this file): gsap, ScrollTrigger, SplitText, Lenis.
   Only runs when motion-boot.js has set html.motion-ok (JS on, no reduced-motion).
   Animates transform/opacity only (plus one-shot clip-path reveals). Each feature is
   isolated in safe() so one failure can never leave the rest of the page hidden. */
(function () {
  "use strict";
  var d = document.documentElement;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var SplitText = window.SplitText;

  if (!d.classList.contains("motion-ok") || !gsap || !ScrollTrigger) {
    d.classList.remove("motion-ok", "motion-desktop", "show-loader");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  d.classList.add("motion-ready");

  var desktop = d.classList.contains("motion-desktop");
  var body = document.body;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var el = function (tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; n.setAttribute("aria-hidden", "true"); return n; };
  var safe = function (fn) { try { fn(); } catch (e) { if (window.console) console.warn("[motion]", e); } };
  var EASE = "expo.out";
  var PIN_PROCESS = "(min-width: 981px) and (min-height: 720px) and (hover: hover) and (pointer: fine)";
  var mm = gsap.matchMedia();
  var lenis = null;

  /* ---------- Smooth scroll (desktop only; touch keeps native scrolling) ---------- */
  safe(function () {
    if (!desktop || !window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    var focusTarget = function (target) {
      if (!target.matches("a,button,input,select,textarea,[tabindex]")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href*='#']");
      if (!a || a.target === "_blank") return;
      var url = new URL(a.getAttribute("href"), location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      history.pushState(null, "", url.hash);
      lenis.scrollTo(target, { offset: -96, duration: 1.3, onComplete: function () { focusTarget(target); } });
    });

    // Back-to-top: route through Lenis instead of native smooth scroll.
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("#backToTop")) {
        e.stopPropagation();
        lenis.scrollTo(0, { duration: 1.4 });
      }
    }, true);

    // Pause smooth scroll while the menu or the welcome-offer dialog is open.
    var offer = $("#welcome-offer");
    if (offer) offer.setAttribute("data-lenis-prevent", "");
    var syncLock = function () {
      var locked = body.classList.contains("menu-open") || (offer && !offer.hidden);
      if (locked) lenis.stop(); else lenis.start();
    };
    new MutationObserver(syncLock).observe(body, { attributes: true, attributeFilter: ["class"] });
    if (offer) new MutationObserver(syncLock).observe(offer, { attributes: true, attributeFilter: ["hidden"] });
    syncLock();
  });

  /* ---------- Global: scroll progress, orbs, grain ---------- */
  var progressST = null;
  safe(function () {
    var bar = el("div", "fx-progress");
    body.append(bar);
    var setBar = gsap.quickSetter(bar, "scaleX");
    progressST = ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (self) { setBar(self.progress); } });
  });
  safe(function () {
    if (!desktop) return;
    var orbs = el("div", "fx-orbs");
    orbs.innerHTML = "<i></i><i></i><i></i>";
    body.prepend(orbs);
    body.append(el("div", "fx-grain"));
    $$("i", orbs).forEach(function (orb, i) {
      gsap.to(orb, { yPercent: [-30, 25, -20][i], xPercent: [10, -12, 8][i], ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1.5 } });
    });
  });

  /* ---------- Custom cursor + magnetic buttons (desktop) ---------- */
  safe(function () {
    if (!desktop) return;
    var ring = el("div", "cursor-ring");
    ring.innerHTML = "<span>View</span>";
    var dot = el("div", "cursor-dot");
    body.append(ring, dot);
    d.classList.add("has-cursor");
    gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });
    var dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    var dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    var rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    var ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      d.classList.add("cursor-on");
    }, { passive: true });
    document.addEventListener("mouseleave", function () { d.classList.remove("cursor-on"); });
    document.addEventListener("pointerover", function (e) {
      var t = e.target;
      if (!t.closest) return;
      var view = t.closest(".industry-card, .concept-card, .case-study-visual");
      var text = t.closest("input, textarea, select");
      var link = t.closest("a, button, [role='button'], label, summary");
      ring.classList.toggle("is-view", !!view);
      ring.classList.toggle("is-link", !view && !!link);
      d.classList.toggle("cursor-text", !!text);
    });

    $$(".button.primary, .nav-cta").forEach(function (btn) {
      // Created lazily on first hover so they never fight the intro/reveal tweens.
      var bx = null, by = null;
      btn.addEventListener("pointerenter", function () {
        if (bx) return;
        gsap.killTweensOf(btn, "x,y");
        gsap.set(btn, { x: 0, y: 0 });
        bx = gsap.quickTo(btn, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
        by = gsap.quickTo(btn, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
      });
      btn.addEventListener("pointermove", function (e) {
        if (!bx) return;
        var r = btn.getBoundingClientRect();
        bx((e.clientX - r.left - r.width / 2) * 0.28);
        by((e.clientY - r.top - r.height / 2) * 0.4);
      });
      btn.addEventListener("pointerleave", function () { if (bx) { bx(0); by(0); } });
    });
  });

  /* ---------- Helpers ---------- */
  // Opacity-only reveals keep elements focusable; focusing one reveals it immediately.
  function reveal(targets, from, opts) {
    targets = (Array.isArray(targets) ? targets : $$(targets)).filter(Boolean);
    if (!targets.length) return;
    opts = opts || {};
    var vars = Object.assign({ opacity: 0, y: 48 }, from);
    targets.forEach(function (t) { t.classList.add("m-pending"); });
    gsap.set(targets, vars);
    ScrollTrigger.batch(targets, {
      start: opts.start || "top 88%",
      once: true,
      onEnter: function (batch) { show(batch, opts.stagger); }
    });
  }
  function show(batch, stagger) {
    batch.forEach(function (t) { t.classList.remove("m-pending"); });
    gsap.to(batch, {
      opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 1.1, ease: EASE,
      stagger: stagger == null ? 0.08 : stagger, overwrite: true,
      clearProps: "opacity,transform"
    });
  }
  document.addEventListener("focusin", function (e) {
    var pending = e.target.closest && e.target.closest(".m-pending");
    if (pending) show([pending], 0);
  });

  function splitReveal(title, trigger, opts) {
    if (!title || !SplitText) return reveal([title], { y: 30 });
    opts = opts || {};
    title.classList.add("is-splitting");
    SplitText.create(title, {
      type: "lines,words", mask: "lines", linesClass: "sl", wordsClass: "sw", autoSplit: true,
      onSplit: function (self) {
        return gsap.from(self.words, {
          yPercent: 115, rotation: 3, duration: 1.15, ease: EASE, stagger: opts.stagger || 0.035,
          scrollTrigger: { trigger: trigger || title, start: opts.start || "top 84%", once: true }
        });
      }
    });
  }

  // Counts the numbers in each pill up from 0 ("99+", "100%", "3–7"), then restores the
  // exact original text. Screen readers get the final text via aria-label meanwhile.
  function countUp(items) {
    items.forEach(function (item) {
      var node = Array.prototype.find.call(item.childNodes, function (n) { return n.nodeType === 3 && /\d/.test(n.nodeValue); });
      if (!node) return;
      var original = node.nodeValue;
      item.setAttribute("aria-label", item.textContent.replace(/\s+/g, " ").trim());
      var state = { p: 0 };
      gsap.to(state, {
        p: 1, duration: 1.4, ease: "power2.out",
        onUpdate: function () {
          node.nodeValue = original.replace(/\d+/g, function (n) { return String(Math.round(Number(n) * state.p)); });
        },
        onComplete: function () { node.nodeValue = original; item.removeAttribute("aria-label"); }
      });
    });
  }

  /* ---------- Hero intro ---------- */
  safe(function () {
    var hero = $(".hero");
    if (!hero) { d.classList.add("hero-ready"); return; }
    var copy = hero.firstElementChild;
    var h1 = $("h1", hero);
    var em = h1 && $("em", h1);
    var art = $(".browser-art", hero);
    var tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });

    if (desktop) {
      d.classList.add("hero-ready");
      var eyebrow = $(".eyebrow", copy), lede = $(".lede", copy), actions = $(".actions", copy);
      var badge = $(".hero-badge", copy);
      var pills = $$(".trust-line li, .trust-metric-pill", copy);
      var split = null;
      if (h1 && SplitText) {
        h1.classList.add("is-splitting");
        split = SplitText.create(h1, { type: "lines,words", mask: "lines", linesClass: "sl", wordsClass: "sw" });
        tl.from(split.words, { yPercent: 118, rotation: 4, duration: 1.25, stagger: 0.045 }, 0.05);
        tl.call(function () { split.revert(); h1.classList.remove("is-splitting"); if (em) em.classList.add("is-shimmer"); }, null, ">-0.05");
      } else if (h1) {
        tl.from(h1, { y: 40, opacity: 0, duration: 1.1 }, 0);
      }
      var done = { clearProps: "transform,opacity" };
      if (eyebrow) tl.from(eyebrow, Object.assign({ y: 18, opacity: 0, duration: 0.8 }, done), 0);
      if (lede) tl.from(lede, Object.assign({ y: 28, opacity: 0, duration: 1 }, done), 0.4);
      if (actions) tl.from(actions.children, Object.assign({ y: 26, opacity: 0, duration: 0.9, stagger: 0.09 }, done), 0.55);
      if (badge) tl.from(badge, Object.assign({ y: -14, scale: 0.9, opacity: 0, duration: 0.8 }, done), 0);
      if (pills.length) {
        tl.from(pills, Object.assign({ y: 14, scale: 0.6, opacity: 0, duration: 0.75, stagger: 0.07, ease: "back.out(2.2)" }, done), 0.7);
        tl.add(function () { countUp(pills); }, 0.75);
      }
      if (art) {
        tl.from(art, { opacity: 0, y: 80, rotationY: -22, rotationX: 14, scale: 0.9, transformPerspective: 1300, transformOrigin: "60% 50%", duration: 1.6 }, 0.2);
      }
      var delay = d.classList.contains("show-loader") ? Math.max(0.1, 1.15 - performance.now() / 1000) : 0.05;
      var start = gsap.delayedCall(delay, function () { tl.play(); });
      window.addEventListener("wb:loader-done", function () { if (!tl.isActive() && tl.progress() === 0) { start.kill(); tl.play(); } }, { once: true });
    } else if (em) {
      em.classList.add("is-shimmer");
    }

    if (!art) return;
    // Mockup "types" its headline, then the journey bar fills.
    var strong = $(".art-copy strong", art);
    var bar = $(".art-card span", art);
    var type = gsap.timeline({ paused: true });
    if (strong && SplitText) {
      var chars = SplitText.create(strong, { type: "chars", charsClass: "tc" });
      gsap.set(chars.chars, { opacity: 0 });
      type.add(function () { strong.classList.add("is-typing"); })
        .to(chars.chars, { opacity: 1, duration: 0.01, stagger: 0.032, ease: "none" })
        .add(function () { strong.classList.remove("is-typing"); chars.revert(); });
    }
    if (bar) type.to(bar, { scaleX: 1, duration: 1.4, ease: "power3.inOut" }, ">-0.2");

    if (desktop) {
      tl.add(type.paused(false), 1.1);
      tl.add(function () {
        gsap.to(art, { y: -10, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
      // 3D tilt on mouse move across the hero.
      var tx = gsap.quickTo(art, "rotationY", { duration: 0.9, ease: "power3" });
      var ty = gsap.quickTo(art, "rotationX", { duration: 0.9, ease: "power3" });
      gsap.set(art, { transformPerspective: 1300 });
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        tx(((e.clientX - r.left) / r.width - 0.5) * 14);
        ty(-((e.clientY - r.top) / r.height - 0.5) * 10);
      });
      hero.addEventListener("pointerleave", function () { tx(0); ty(0); });
    } else {
      gsap.from(art, { opacity: 0, y: 50, duration: 1.2, ease: EASE, scrollTrigger: { trigger: art, start: "top 92%", once: true } });
      ScrollTrigger.create({ trigger: art, start: "top 75%", once: true, onEnter: function () { type.play(); } });
    }
  });

  /* ---------- Hero WebGL background (desktop, lazy, after load) ---------- */
  safe(function () {
    if (!desktop || !$(".hero, .page-hero")) return;
    var conn = navigator.connection;
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ""))) return;
    var load = function () {
      var s = document.createElement("script");
      s.src = "/assets/js/hero-gl.20261118.js";
      s.async = true;
      body.append(s);
    };
    var idle = function () { ("requestIdleCallback" in window) ? window.requestIdleCallback(load, { timeout: 2500 }) : setTimeout(load, 1200); };
    if (document.readyState === "complete") idle(); else window.addEventListener("load", idle, { once: true });
  });

  /* ---------- Proof strip marquee (speed and direction follow scroll velocity) ---------- */
  safe(function () {
    var strip = $(".proof-strip");
    var p = strip && $("p", strip);
    if (!p) return;
    var wrap = p.parentElement;
    var track = document.createElement("div");
    track.className = "marquee-track";
    wrap.classList.add("marquee");
    wrap.insertBefore(track, p);
    track.append(p);
    for (var i = 0; i < 3; i++) {
      var clone = p.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.append(clone);
    }
    var x = 0, dir = 1, boost = 0, active = true;
    var setX = gsap.quickSetter(track, "xPercent");
    ScrollTrigger.create({ trigger: strip, start: "top bottom", end: "bottom top", onToggle: function (self) { active = self.isActive; } });
    gsap.ticker.add(function (time, dt) {
      if (!active) return;
      var v = progressST ? progressST.getVelocity() : 0;
      if (Math.abs(v) > 30) dir = v > 0 ? 1 : -1;
      boost += (Math.min(Math.abs(v) / 300, 7) - boost) * 0.08;
      x -= dir * (dt / 1000) * 1.6 * (1 + boost);
      if (x <= -25) x += 25;
      if (x > 0) x -= 25;
      setX(x);
    });
  });

  /* ---------- Section headings, about text ---------- */
  safe(function () {
    $$(".section-heading, .concept-heading, .intro > div:first-child").forEach(function (h) {
      var eyebrow = $(".eyebrow", h);
      var title = $("h2, h3", h);
      if (eyebrow) reveal([eyebrow], { y: 0, x: -24 }, { start: "top 88%" });
      splitReveal(title, h);
      reveal($$(":scope > p", h), { y: 24 }, { start: "top 85%" });
    });
    // About: body copy reveals line by line.
    var aboutText = $$(".intro > div:last-child p");
    aboutText.forEach(function (para) {
      if (!SplitText) return reveal([para], { y: 24 });
      SplitText.create(para, {
        type: "lines", mask: "lines", linesClass: "sl", autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, { yPercent: 105, opacity: 0, duration: 1, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: para, start: "top 86%", once: true } });
        }
      });
    });
  });

  /* ---------- Benefits (alternate slide-in) ---------- */
  safe(function () {
    $$(".benefit-grid article").forEach(function (a, i) { reveal([a], { x: i % 2 ? 50 : -50, y: 20 }); });
  });

  /* ---------- Services: tilt + spotlight, pinned horizontal gallery on wide screens ---------- */
  safe(function () {
    var cards = $$(".card");
    if (desktop) {
      cards.forEach(function (card) {
        var crx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
        var cry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
        var cy = gsap.quickTo(card, "y", { duration: 0.6, ease: "power3" });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          cry((px - 0.5) * 12); crx(-(py - 0.5) * 12); cy(-6);
        });
        card.addEventListener("pointerleave", function () { crx(0); cry(0); cy(0); });
      });
    }

    // Normal card grid (no horizontal scrolling): cards rise in, row by row, as they enter.
    reveal(cards, { y: 50, scale: 0.96 }, { stagger: 0.06 });
  });

  /* ---------- Comparison table: rows slide in, Weburate column glows ---------- */
  safe(function () {
    var wrap = $(".comparison-table-wrap");
    var table = wrap && $(".comparison-table", wrap);
    if (!table) return;
    reveal([wrap], { y: 50, scale: 0.98 });
    reveal($$("tbody tr", table), { x: -40, y: 0 }, { stagger: 0.07, start: "top 92%" });
    var head = $("thead .col-highlight", table);
    if (!head) return;
    var glow = el("div", "compare-glow");
    wrap.classList.add("has-glow");
    wrap.append(glow);
    var place = function () {
      glow.style.left = head.offsetLeft + "px";
      glow.style.width = head.offsetWidth + "px";
      glow.style.height = table.offsetHeight + "px";
    };
    place();
    if ("ResizeObserver" in window) new ResizeObserver(place).observe(table);
  });

  /* ---------- Planner ---------- */
  safe(function () {
    reveal($$(".planner-choices fieldset"), { y: 40 }, { stagger: 0.1 });
    reveal($$(".planner-result"), { y: 60, scale: 0.96 });
  });

  /* ---------- Dark band entrance + process path ---------- */
  safe(function () {
    var band = $(".dark-band");
    if (band && desktop) {
      gsap.fromTo(band, { clipPath: "inset(0% 3% 0% 3% round 40px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
        scrollTrigger: { trigger: band, start: "top bottom", end: "top 25%", scrub: true }
      });
    }
    var steps = $(".process-steps");
    if (!steps) return;
    var items = $$("article", steps);
    var note = $(".process-note");

    mm.add({ pin: PIN_PROCESS, simple: "not all and " + PIN_PROCESS }, function (ctx) {
      if (ctx.conditions.simple || items.length < 2) {
        reveal(items, { y: 50 }, { stagger: 0.07 });
        if (note) reveal([note], { y: 30 });
        return;
      }
      steps.classList.add("is-pathed");
      var NS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "process-path");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.innerHTML = '<defs><linearGradient id="wb-path-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0"><stop offset="0" stop-color="#18c8f4"/><stop offset=".52" stop-color="#2563eb"/><stop offset="1" stop-color="#7047f5"/></linearGradient></defs>';
      steps.prepend(svg);

      // Group cards into rows by their top offset.
      var rows = [];
      var rowPaths = [];
      var nodes = [];
      var build = function () {
        var sr = steps.getBoundingClientRect();
        svg.setAttribute("viewBox", "0 0 " + sr.width + " " + sr.height);
        $("linearGradient", svg).setAttribute("x2", String(sr.width));
        var byTop = {};
        items.forEach(function (a) {
          var r = a.getBoundingClientRect();
          var key = Math.round(r.top - sr.top);
          (byTop[key] = byTop[key] || []).push(a);
        });
        rows = Object.keys(byTop).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return byTop[k]; });
        rows.forEach(function (row, ri) {
          var rp = rowPaths[ri];
          if (!rp) {
            rp = { track: document.createElementNS(NS, "path"), draw: document.createElementNS(NS, "path") };
            rp.track.setAttribute("class", "track");
            rp.draw.setAttribute("class", "draw");
            rp.draw.setAttribute("stroke", "url(#wb-path-grad)");
            rp.track.setAttribute("pathLength", "1");
            rp.draw.setAttribute("pathLength", "1");
            svg.append(rp.track, rp.draw);
            rowPaths[ri] = rp;
          }
          var pts = row.map(function (a) {
            var b = $("b", a).getBoundingClientRect();
            var r = a.getBoundingClientRect();
            return [b.left - sr.left + b.width / 2, r.top - sr.top];
          });
          var y = pts[0][1];
          var dStr = "M 0 " + y;
          var prev = [0, y];
          pts.concat([[sr.width, y]]).forEach(function (pt) {
            var dx = pt[0] - prev[0];
            dStr += " C " + (prev[0] + dx * 0.35) + " " + (y - 24) + " " + (pt[0] - dx * 0.35) + " " + (y - 24) + " " + pt[0] + " " + y;
            prev = pt;
          });
          rp.track.setAttribute("d", dStr);
          rp.draw.setAttribute("d", dStr);
          pts.forEach(function (pt, i) {
            var item = row[i];
            var idx = items.indexOf(item);
            var c = nodes[idx];
            if (!c) {
              c = document.createElementNS(NS, "circle");
              c.setAttribute("r", "6");
              svg.append(c);
              nodes[idx] = c;
            }
            c.setAttribute("cx", String(pt[0]));
            c.setAttribute("cy", String(pt[1]));
          });
        });
      };
      build();
      ScrollTrigger.addEventListener("refreshInit", build);

      var tl = gsap.timeline({ defaults: { ease: "none" } });
      gsap.set(items, { opacity: 0.22 });
      gsap.set(nodes, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set($$("b", steps), { scale: 0.4, opacity: 0 });
      var t = 0;
      rows.forEach(function (row, ri) {
        var seg = 4;
        tl.to(rowPaths[ri].draw, { strokeDashoffset: 0, duration: seg }, t);
        row.forEach(function (item, i) {
          var at = t + (i + 0.35) / (row.length + 1) * seg;
          var idx = items.indexOf(item);
          tl.to(nodes[idx], { scale: 1, duration: 0.3, ease: "back.out(3)" }, at)
            .to(item, { opacity: 1, duration: 0.5 }, at)
            .to($("b", item), { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.5)" }, at);
        });
        t += seg;
      });
      ScrollTrigger.create({
        trigger: steps, start: "center center", end: "+=" + (rows.length * 700),
        pin: true, scrub: 0.6, animation: tl, anticipatePin: 1
      });
      if (note) reveal([note], { y: 30 });
      return function () {
        ScrollTrigger.removeEventListener("refreshInit", build);
        svg.remove();
        steps.classList.remove("is-pathed");
      };
    });
  });

  /* ---------- Industries, concepts, live case study ---------- */
  safe(function () {
    var wipe = function (els, from) {
      els.forEach(function (card, i) {
        gsap.fromTo(card, { clipPath: from }, {
          clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 1.3, ease: "expo.inOut", delay: (i % 3) * 0.12,
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
          onComplete: function () { gsap.set(card, { clearProps: "clipPath" }); }
        });
      });
    };
    var industry = $$(".industry-card");
    var concepts = $$(".concept-card");
    wipe(industry, "inset(100% 0% 0% 0% round 16px)");
    wipe(concepts, "inset(0% 100% 0% 0% round 16px)");
    if (desktop) {
      industry.concat(concepts).forEach(function (card) {
        var inner = card.children;
        gsap.fromTo(inner, { y: 14 }, { y: -14, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
    }
    var cs = $(".live-case-study");
    if (cs) {
      var main = $(".case-study-visual > img", cs);
      var gallery = $$(".case-study-gallery img", cs);
      reveal([cs], { y: 70, scale: 0.97 });
      if (main) {
        gsap.fromTo(main, { clipPath: "inset(0% 100% 0% 0%)", scale: 1.15 }, {
          clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.5, ease: "expo.inOut",
          scrollTrigger: { trigger: main, start: "top 85%", once: true },
          onComplete: function () { gsap.set(main, { clearProps: "clipPath,transform" }); }
        });
      }
      reveal(gallery, { y: 40, scale: 0.92 }, { stagger: 0.15 });
      reveal($$(".case-study-copy > *", cs), { y: 26 }, { stagger: 0.06 });
    }
    var disclaimer = $(".concept-disclaimer");
    if (disclaimer) reveal([disclaimer], { y: 24 });
  });

  /* ---------- Pricing, FAQ, contact, footer ---------- */
  safe(function () {
    reveal($$(".pricing-grid article"), { y: 80, rotation: 1.5 }, { stagger: 0.1 });
    reveal($$(".pricing-terms"), { y: 40 });
    reveal($$(".accordion-item"), { y: 26 }, { stagger: 0.04 });
    reveal($$(".contact > div:first-child > *"), { y: 30 }, { stagger: 0.07 });
    reveal($$(".contact-form"), { y: 60, scale: 0.97 });
    reveal($$(".footer > div"), { y: 30 }, { stagger: 0.07, start: "top 96%" });
  });

  // Contact success micro-animation (observes the existing form logic, does not replace it).
  safe(function () {
    var form = $("#contact-form");
    var submit = form && $("button[type='submit']", form);
    if (!submit) return;
    new MutationObserver(function () {
      var label = submit.textContent.trim();
      if ((label === "Request received" || label === "Test passed") && !form.classList.contains("is-success")) {
        form.classList.add("is-success");
        var r = submit.getBoundingClientRect();
        for (var i = 0; i < 14; i++) {
          var dotEl = el("span", "fx-burst");
          dotEl.style.left = (r.left + r.width / 2) + "px";
          dotEl.style.top = (r.top + r.height / 2) + "px";
          body.append(dotEl);
          var ang = (i / 14) * Math.PI * 2;
          gsap.fromTo(dotEl, { scale: 1, opacity: 1 }, {
            x: Math.cos(ang) * gsap.utils.random(60, 130), y: Math.sin(ang) * gsap.utils.random(40, 100),
            scale: 0, opacity: 0, duration: gsap.utils.random(0.7, 1.1), ease: "power3.out",
            onComplete: dotEl.remove.bind(dotEl)
          });
        }
        gsap.fromTo(submit, { scale: 0.94 }, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      }
    }).observe(submit, { childList: true, characterData: true, subtree: true });
  });

  /* ---------- Inner pages: generic blocks ---------- */
  safe(function () {
    var pageHero = $(".page-hero, .legal, .not-found");
    if (!pageHero || $(".hero")) return;
    var intro = $$(":scope > :is(.breadcrumbs, .eyebrow, .draft-label, .updated, h1, .lede, .actions)", pageHero);
    var h1 = $(":scope > h1", pageHero);
    var em = h1 && $("em", h1);
    if (desktop) {
      // Same intro language as the homepage hero (CSS hides these until now; see motion.css).
      var tl = gsap.timeline({ defaults: { ease: EASE }, delay: d.classList.contains("show-loader") ? Math.max(0.1, 1.15 - performance.now() / 1000) : 0.05 });
      var rest = intro.filter(function (n) { return n !== h1; });
      if (h1 && SplitText) {
        h1.classList.add("is-splitting");
        var s = SplitText.create(h1, { type: "lines,words", mask: "lines", linesClass: "sl", wordsClass: "sw" });
        tl.from(s.words, { yPercent: 118, rotation: 3, duration: 1.2, stagger: 0.04 }, 0.1)
          .call(function () { s.revert(); h1.classList.remove("is-splitting"); if (em) em.classList.add("is-shimmer"); }, null, ">-0.05");
      }
      tl.from(rest, { y: 26, opacity: 0, duration: 0.9, stagger: 0.08 }, 0);
    } else if (em) {
      em.classList.add("is-shimmer");
    }
    // Section titles and blocks further down the page.
    $$(".content-grid h2, .service-columns h2, .decision-grid h2, .cta-band h2, .legal h2, .article-cta h2").forEach(function (h) { splitReveal(h, h); });
    reveal($$(".content-grid > div:last-child > p, .feature-list li"), { y: 30 }, { stagger: 0.05 });
    $$(".decision-grid article").forEach(function (a, i) { reveal([a], { x: i % 2 ? 50 : -50, y: 24 }); });
    reveal($$(".cta-band, .article-cta, .concept-disclaimer"), { y: 50, scale: 0.97 });
    reveal($$(".legal > :is(p, ul, ol, table):not(.lede):not(.updated):not(.draft-label)"), { y: 18 }, { stagger: 0.03, start: "top 92%" });
  });

  // Put triggers in page order (pins first affect everything below), then measure.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  window.addEventListener("load", function () { ScrollTrigger.refresh(); }, { once: true });
})();
