import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/playfair-display/700.css";

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Footer year ---------- */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ---------- Theme toggle (default: dark) ---------- */
const themeBtn = document.getElementById("theme-toggle");

function syncThemeLabel() {
  const isDark = root.dataset.theme !== "light";
  themeBtn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#0a0c10" : "#f6f7f9");
}

if (themeBtn) {
  syncThemeLabel();
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    syncThemeLabel();
    document.dispatchEvent(new Event("themechange"));
  });
}

/* ---------- Mobile nav ---------- */
const navBtn = document.getElementById("nav-toggle");
const nav = document.getElementById("site-nav");

function setNav(open) {
  nav.classList.toggle("open", open);
  navBtn.setAttribute("aria-expanded", String(open));
  navBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

if (navBtn && nav) {
  navBtn.addEventListener("click", () => setNav(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) { setNav(false); navBtn.focus(); }
  });
}

/* ---------- Experience filter ---------- */
const chips = document.querySelectorAll(".chip[data-filter]");
const jobs = document.querySelectorAll(".job[data-cat]");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    jobs.forEach((job) => { job.hidden = f !== "all" && job.dataset.cat !== f; });
    updateScroll();
  });
});

/* ---------- Scroll progress + timeline draw ---------- */
const progress = document.querySelector(".progress");
const timeline = document.querySelector(".timeline");
let ticking = false;

function updateScroll() {
  const max = root.scrollHeight - window.innerHeight;
  progress?.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : 0);

  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const t = (window.innerHeight * 0.6 - r.top) / r.height;
    timeline.style.setProperty("--tp", Math.min(1, Math.max(0, t)).toFixed(4));
  }
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener("resize", updateScroll);
updateScroll();

/* ---------- Active nav link, scroll reveal, stat count-up ---------- */
const links = [...document.querySelectorAll(".nav a[href^='#']")];

function countUp(el) {
  const to = parseFloat(el.dataset.count);
  const decimals = Number(el.dataset.decimals || 0);
  if (reduceMotion) { el.textContent = to.toFixed(decimals); return; }
  const start = performance.now();
  const dur = 1400;
  const tick = (now) => {
    const k = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = (to * eased).toFixed(decimals);
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  const counters = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { countUp(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (!reduceMotion) el.textContent = (0).toFixed(Number(el.dataset.decimals || 0));
    counters.observe(el);
  });

  if (!reduceMotion) {
    const targets = document.querySelectorAll(".section-head, .job, .panel, .cert, .stats, .snapshot, .prose p");
    targets.forEach((el) => {
      el.classList.add("reveal");
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal") || c === el);
      el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
    });
    const reveal = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); obs.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => reveal.observe(el));
  }
}

/* ---------- Typed eyebrow ---------- */
const typed = document.getElementById("typed");

if (typed && !reduceMotion) {
  const phrases = JSON.parse(typed.dataset.phrases || "[]");
  let p = 0, i = phrases[0]?.length ?? 0, deleting = true;

  const step = () => {
    const word = phrases[p];
    typed.textContent = word.slice(0, i);
    let delay = deleting ? 38 : 70;
    if (!deleting && i === word.length) { deleting = true; delay = 1800; }
    else if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 300; }
    else i += deleting ? -1 : 1;
    setTimeout(step, delay);
  };
  setTimeout(step, 2200);
}

/* ---------- Logo prompt: type on load, decrypt-scramble on hover ---------- */
const promptEl = document.querySelector(".prompt");

if (promptEl && !reduceMotion) {
  const segs = [...promptEl.querySelectorAll("[data-seg]")];
  const full = segs.map((s) => s.textContent);
  const total = full.join("").length;
  const glyphs = "abcdefghijklmnopqrstuvwxyz0123456789_.#$%&";
  let timer = 0;

  // Fill the segments with the first `n` real characters; the rest is optional noise.
  const render = (n, noise = false) => {
    let used = 0;
    segs.forEach((seg, i) => {
      seg.textContent = [...full[i]]
        .map((ch) => {
          const real = used++ < n;
          if (real || ch === " ") return ch;
          return noise ? glyphs[Math.floor(Math.random() * glyphs.length)] : "";
        })
        .join("");
    });
  };

  const typeIn = () => {
    let n = 0;
    render(0);
    timer = setInterval(() => {
      render(++n);
      if (n >= total) clearInterval(timer);
    }, 65);
  };

  const scramble = () => {
    clearInterval(timer);
    let frame = 0;
    timer = setInterval(() => {
      render(Math.floor(frame / 2), true);
      if (++frame > total * 2) { clearInterval(timer); render(total); }
    }, 30);
  };

  const link = promptEl.closest("a");
  setTimeout(typeIn, 250);
  link.addEventListener("pointerenter", scramble);
  link.addEventListener("focus", scramble);
}

/* ---------- Pointer effects (fine pointers only) ---------- */
const glow = document.querySelector(".cursor-glow");
const portrait = document.getElementById("portrait");
const tilt = portrait?.querySelector(".portrait-tilt");

if (finePointer && !reduceMotion) {
  let gx = 0, gy = 0, raf = 0;
  document.addEventListener("pointermove", (e) => {
    gx = e.clientX; gy = e.clientY;
    glow?.classList.add("on");
    if (!raf) raf = requestAnimationFrame(() => {
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      raf = 0;
    });

    const spot = e.target.closest?.(".panel, .cert, .job-body, .stats > div");
    if (spot) {
      const r = spot.getBoundingClientRect();
      spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
      spot.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  }, { passive: true });
  document.addEventListener("pointerleave", () => glow?.classList.remove("on"));

  if (portrait && tilt) {
    portrait.addEventListener("pointermove", (e) => {
      const r = portrait.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    portrait.addEventListener("pointerleave", () => { tilt.style.transform = ""; });
  }
}

/* ---------- Network canvas ---------- */
const canvas = document.getElementById("net");

if (canvas) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, nodes = [], color = "108, 155, 255";
  const mouse = { x: -9999, y: -9999 };
  let running = true;

  const readColor = () => {
    color = getComputedStyle(root).getPropertyValue("--node").trim() || color;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(70, Math.floor((w * h) / 22000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.8,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const maxD = 140;

    for (const n of nodes) {
      if (!reduceMotion) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.55)`;
      ctx.fill();
    }

    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
        const d = Math.hypot(dx, dy);
        if (d < maxD) {
          ctx.strokeStyle = `rgba(${color}, ${(1 - d / maxD) * 0.28})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke();
        }
      }
      const mdx = nodes[a].x - mouse.x, mdy = nodes[a].y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < 180) {
        ctx.strokeStyle = `rgba(${color}, ${(1 - md / 180) * 0.6})`;
        ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
  };

  const loop = () => {
    if (!running) return;
    draw();
    requestAnimationFrame(loop);
  };

  readColor();
  resize();
  window.addEventListener("resize", () => { resize(); if (reduceMotion) draw(); });
  document.addEventListener("themechange", () => { readColor(); if (reduceMotion) draw(); });
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden && !reduceMotion;
    if (running) loop();
  });

  if (reduceMotion) { running = false; draw(); } else { loop(); }
}

/* ---------- Contact form (Web3Forms, no redirect) ---------- */
const form = document.getElementById("contact-form");

if (form) {
  const status = document.getElementById("contact-status");
  const submit = document.getElementById("contact-submit");

  const setStatus = (msg, cls = "") => {
    status.textContent = msg;
    status.className = `contact-status ${cls}`.trim();
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submit.disabled = true;
    setStatus("Sending...");

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const result = await res.json();
      if (result.success) {
        setStatus("Thanks! Your message has been sent.", "ok");
        form.reset();
      } else {
        setStatus("Something went wrong. Please try again or email me directly.", "err");
      }
    } catch {
      setStatus("Network error. Please try again or email me directly.", "err");
    } finally {
      submit.disabled = false;
    }
  });
}
