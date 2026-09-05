/* ════════════════════════════════════════════════
   SEJAL PATIL — Portfolio Script
   Loader · Canvas particles · Text scramble ·
   Magnetic buttons · Spotlight · Cursor ·
   Scroll reveal · Counters · 3D tilt
   ════════════════════════════════════════════════ */

'use strict';

/* ── Page Loader ──────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  // Hide after fill animation completes (~1.4s)
  setTimeout(() => loader.classList.add('hidden'), 1500);
})();

/* ── Canvas Particle Network (Hero) ────────────── */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const TEAL   = [0, 212, 170];
  const PURPLE = [129, 140, 248];
  const MAX_DIST = 150;
  let W, H, particles, mouseX = -9999, mouseY = -9999, rafId;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpColor(c1, c2, t) { return c1.map((v, i) => Math.round(lerp(v, c2[i], t))); }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 1.6 + 0.5,
    };
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    const count = Math.min(80, Math.floor(W / 16));
    particles = Array.from({ length: count }, makeParticle);
  }

  // Mouse tracking (relative to canvas)
  canvas.closest('.hero').addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  }, { passive: true });
  canvas.closest('.hero').addEventListener('mouseleave', () => {
    mouseX = -9999; mouseY = -9999;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d > MAX_DIST) continue;
        const t     = d / MAX_DIST;
        const alpha = (1 - t) * 0.2;
        const [r, g, b] = lerpColor(TEAL, PURPLE, t);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Dots
    particles.forEach(p => {
      const dx   = p.x - mouseX;
      const dy   = p.y - mouseY;
      const md   = Math.sqrt(dx * dx + dy * dy);
      const glow = Math.max(0, 1 - md / 130);

      // Halo
      if (glow > 0.1) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,170,${glow * 0.08})`;
        ctx.fill();
      }

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + glow * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,170,${0.35 + glow * 0.65})`;
      ctx.fill();
    });

    rafId = requestAnimationFrame(draw);
  }

  new ResizeObserver(resize).observe(canvas);
  resize();
  draw();
})();

/* ── Text Scramble ───────────────────────────── */
(function initScramble() {
  const CHARS = '!<>-_\\/[]{}=+*^?#@$%';

  function scramble(el) {
    const final = el.dataset.scramble || el.textContent;
    const len   = final.length;
    let frame   = 0;

    const queue = final.split('').map((char, i) => ({
      char,
      start: Math.floor((i / len) * 18),
      end:   Math.floor((i / len) * 18) + Math.floor(Math.random() * 10) + 6,
    }));

    function tick() {
      let out = '', done = 0;
      queue.forEach(item => {
        if (frame >= item.end) {
          out += item.char; done++;
        } else if (frame >= item.start) {
          const rand = CHARS[Math.floor(Math.random() * CHARS.length)];
          out += `<span class="scramble-char">${rand}</span>`;
        } else {
          out += `<span style="opacity:.15">_</span>`;
        }
      });
      el.innerHTML = out;
      if (done < queue.length) { frame++; requestAnimationFrame(tick); }
    }
    tick();
  }

  // Fire on first intersection (after boot delay)
  const targets = document.querySelectorAll('[data-scramble]');
  if (!targets.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => scramble(entry.target), 2500);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  targets.forEach(el => io.observe(el));
})();

/* ── Magnetic Buttons ────────────────────────── */
(function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.28;
      const y = (e.clientY - r.top  - r.height / 2) * 0.28;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

/* ── Spotlight Cards ─────────────────────────── */
(function initSpotlight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--sx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
      card.style.setProperty('--sy', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  });
})();

/* ── Custom Cursor ───────────────────────────── */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function loop() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .tilt-card, .glass-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '52px';
      ring.style.height = '52px';
      ring.style.borderColor = 'rgba(0,212,170,0.9)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(0,212,170,0.5)';
    });
  });
})();

/* ── Header Scroll ───────────────────────────── */
(function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const fn = () => header.classList.toggle('scrolled', scrollY > 60);
  window.addEventListener('scroll', fn, { passive: true });
  fn();
})();

/* ── Mobile Nav ──────────────────────────────── */
(function initNav() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav    = document.querySelector('[data-nav]');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.addEventListener('click', e => {
    if (e.target instanceof HTMLAnchorElement) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-label', 'Open navigation');
    }
  });
})();

/* ── Scroll Reveal ───────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.revealDelay) || 0;
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  // Stagger siblings with the same immediate parent
  const seen = new Map();
  els.forEach(el => {
    const p = el.parentElement;
    const i = seen.get(p) ?? 0;
    if (i > 0) el.dataset.revealDelay = i * 120;
    seen.set(p, i + 1);
    io.observe(el);
  });
})();

/* ── Counter Animation ───────────────────────── */
(function initCounters() {
  const els = document.querySelectorAll('[data-target]');
  if (!els.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function run(el) {
    const target = parseInt(el.dataset.target, 10);
    const t0 = performance.now();
    const dur = 1800;
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    })(t0);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  els.forEach(el => io.observe(el));
})();

/* ── 3D Card Tilt ────────────────────────────── */
(function initTilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.tilt-card').forEach(card => {
    let raf;
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -5;
        const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  5;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      });
    }, { passive: true });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  });
})();

/* ── Scroll Progress Bar ─────────────────────── */
(function initScrollBar() {
  const bar = document.getElementById('scroll-bar');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (!max) return;
    bar.style.width = (scrollY / max * 100).toFixed(2) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Mouse Trail ─────────────────────────────── */
(function initTrail() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let lx = -999, ly = -999, pending = false;

  document.addEventListener('mousemove', e => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      if (dx * dx + dy * dy < 64) return; // < 8px movement — skip
      lx = e.clientX; ly = e.clientY;
      const d = document.createElement('div');
      d.className = 'trail-dot';
      d.style.left = lx + 'px';
      d.style.top  = ly + 'px';
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 800);
    });
  }, { passive: true });
})();

/* ── Click Ripple ────────────────────────────── */
(function initRipple() {
  document.addEventListener('click', e => {
    const el = document.createElement('div');
    el.className = 'click-ripple';
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
    el.style.transform = 'translate(-50%,-50%) scale(0)';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  });
})();

/* ── Periodic Glitch on Hero Title ──────────── */
(function initGlitch() {
  const el = document.getElementById('hero-title');
  if (!el) return;
  function glitch() {
    el.classList.add('glitch');
    setTimeout(() => el.classList.remove('glitch'), 520);
    setTimeout(glitch, 4500 + Math.random() * 7000);
  }
  setTimeout(glitch, 6000); // start after boot sequence
})();

/* ── Nav Section Spy ─────────────────────────── */
(function initNavSpy() {
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  const secs  = [...links]
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (!secs.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle(
        'is-active', a.getAttribute('href') === '#' + e.target.id
      ));
    });
  }, { threshold: 0.35 });

  secs.forEach(s => io.observe(s));
})();

/* ── Typed / Cycling Hero Kicker ────────────── */
(function initTyped() {
  const el = document.querySelector('.hero-kicker');
  if (!el) return;

  const phrases = [
    'Software Development Engineer II · Fintech & Edtech',
    'Payment Gateway Architect · React & TypeScript',
    'Founding Team Member · Bluswap / FastFlowPe',
    'Shipping Interfaces Trusted by Thousands Daily',
    'Full-Stack Engineer · Fintech Payments & EdTech Scale',
  ];

  // Append a blinking cursor span
  const cursor = document.createElement('span');
  cursor.className = 'typed-cursor';
  cursor.textContent = '|';
  el.after(cursor);

  let pi = 0, ci = 0, deleting = false;

  const tick = () => {
    const cur = phrases[pi];
    if (!deleting) {
      el.textContent = cur.slice(0, ++ci);
      if (ci === cur.length) {
        setTimeout(() => { deleting = true; tick(); }, 2800);
        return;
      }
    } else {
      el.textContent = cur.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 28 : 58);
  };

  // Start after boot/intro animations settle
  setTimeout(tick, 3500);
})();
