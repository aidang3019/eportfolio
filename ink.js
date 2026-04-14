/* ══════════════════════════════════════════════
   ink.js  —  animations, reveal, micro-interactions
══════════════════════════════════════════════ */

/* ── 0. SKIP INTRO (sessionStorage) ── */
function initSkipIntro() {
  if (sessionStorage.getItem('inkIntroPlayed')) {
    document.body.classList.add('skip-intro');
  } else {
    // Mark as played after the full sequence (~5.5s)
    setTimeout(() => sessionStorage.setItem('inkIntroPlayed', '1'), 5600);
  }
}

/* ── 1. PLUM BLOSSOM BRANCH DRAW ── */
function initBranch() {
  const svg = document.querySelector('.hero-branch');
  if (!svg) return;

  svg.querySelectorAll('.branch').forEach(path => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
  });

  setTimeout(() => svg.classList.add('animate'), 350);
}

/* ── 2. BRUSHSTROKE DIVIDERS ── */
function initBrushDividers() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.brush-svg').forEach(el => obs.observe(el));
}

/* ── 3. INK SPLOTCH GENERATOR ── */
function makeSplat(container) {
  const ns  = 'http://www.w3.org/2000/svg';
  const rnd = (a, b) => a + Math.random() * (b - a);

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 660 110');
  svg.setAttribute('class', 'ink-splat');
  svg.setAttribute('aria-hidden', 'true');

  const cx = rnd(160, 500), cy = rnd(42, 68);
  const rx = rnd(52, 100),  ry = rnd(22, 42);
  const rot = rnd(-22, 22);

  const blob = document.createElementNS(ns, 'ellipse');
  blob.setAttribute('cx', cx.toFixed(1));
  blob.setAttribute('cy', cy.toFixed(1));
  blob.setAttribute('rx', rx.toFixed(1));
  blob.setAttribute('ry', ry.toFixed(1));
  blob.setAttribute('transform', `rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`);
  blob.setAttribute('class', 'splat-main');
  blob.style.setProperty('--fo', rnd(0.80, 0.92).toFixed(2));
  svg.appendChild(blob);

  for (let i = 0; i < Math.floor(rnd(4, 8)); i++) {
    const angle = rnd(0, Math.PI * 2);
    const dist  = rnd(rx * 0.72, rx * 1.55);
    const drop  = document.createElementNS(ns, 'circle');
    drop.setAttribute('cx', Math.max(6,   Math.min(654, cx + Math.cos(angle) * dist)).toFixed(1));
    drop.setAttribute('cy', Math.max(6,   Math.min(104, cy + Math.sin(angle) * dist * 0.55)).toFixed(1));
    drop.setAttribute('r',  rnd(3, 11).toFixed(1));
    drop.setAttribute('class', 'splat-drop');
    drop.style.setProperty('--d',  `${(0.04 + i * 0.07).toFixed(2)}s`);
    drop.style.setProperty('--fo', rnd(0.44, 0.82).toFixed(2));
    svg.appendChild(drop);
  }

  for (let i = 0; i < Math.floor(rnd(5, 10)); i++) {
    const angle = rnd(0, Math.PI * 2);
    const dist  = rnd(rx * 0.9, rx * 2.4);
    const speck = document.createElementNS(ns, 'circle');
    speck.setAttribute('cx', Math.max(3,   Math.min(657, cx + Math.cos(angle) * dist)).toFixed(1));
    speck.setAttribute('cy', Math.max(3,   Math.min(107, cy + Math.sin(angle) * dist * 0.45)).toFixed(1));
    speck.setAttribute('r',  rnd(0.7, 2.8).toFixed(1));
    speck.setAttribute('class', 'splat-speck');
    speck.style.setProperty('--d',  `${(0.26 + i * 0.05).toFixed(2)}s`);
    speck.style.setProperty('--fo', rnd(0.14, 0.42).toFixed(2));
    svg.appendChild(speck);
  }

  if (Math.random() > 0.42) {
    const drip  = document.createElementNS(ns, 'ellipse');
    const dripX = cx + rnd(-rx * 0.28, rx * 0.28);
    drip.setAttribute('cx', dripX.toFixed(1));
    drip.setAttribute('cy', (cy + ry + rnd(6, 18)).toFixed(1));
    drip.setAttribute('rx', rnd(2.2, 5).toFixed(1));
    drip.setAttribute('ry', rnd(6, 16).toFixed(1));
    drip.setAttribute('class', 'splat-drip');
    drip.style.setProperty('--d',  '0.52s');
    drip.style.setProperty('--fo', rnd(0.6, 0.78).toFixed(2));
    svg.appendChild(drip);
  }

  container.appendChild(svg);
}

function initSplats() {
  const dividers = document.querySelectorAll('.ink-divider');
  dividers.forEach(d => makeSplat(d));

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  dividers.forEach(d => obs.observe(d));
}

/* ── 4. NAV SCROLL SPY + INDICATOR ── */
function initScrollSpy() {
  const nav       = document.getElementById('main-nav');
  const navLinks  = [...document.querySelectorAll('.nav-links a')];
  const indicator = document.querySelector('.nav-indicator');
  const sections  = document.querySelectorAll('section[id]');

  function moveIndicator(link) {
    if (!indicator || !link || !nav) return;
    const navRect  = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    indicator.style.left    = `${linkRect.left - navRect.left}px`;
    indicator.style.width   = `${linkRect.width}px`;
    indicator.style.opacity = '1';
  }

  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', active);
        if (active) moveIndicator(link);
      });
    });
  }, { rootMargin: '-38% 0px -55% 0px' });

  sections.forEach(s => spy.observe(s));

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── 5. MOBILE NAV TOGGLE ── */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ── 6. SCROLL REVEAL — fixes .fade-up AND .brush-svg ── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  // .fade-up: section content elements
  // .brush-svg: brushstroke dividers
  // .reveal: any legacy usage
  document.querySelectorAll('.fade-up, .brush-svg, .reveal').forEach(el => obs.observe(el));
}

/* ── 6b. SECTION INK WASH REVEAL ── */
function initSectionWash() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sections = document.querySelectorAll('.page-section');
  const viewH    = window.innerHeight;

  // Set alternating sweep direction and arm the overlay
  sections.forEach((sec, i) => {
    sec.style.setProperty('--wash-dir', i % 2 === 0 ? '1' : '-1');
    sec.classList.add('wash-armed');
  });

  // Sections already in the viewport at load time: reveal instantly (no sweep transition)
  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top < viewH) {
      sec.classList.add('wash-instant', 'wash-in');
    }
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('wash-in');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  // Only observe sections not yet revealed
  sections.forEach(s => {
    if (!s.classList.contains('wash-in')) obs.observe(s);
  });
}

/* ── 7. HERO OFFSCREEN (pause hero petals) ── */
function initHeroOffscreen() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      hero.classList.toggle('offscreen', !entry.isIntersecting);
    });
  }, { threshold: 0.01 });

  obs.observe(hero);
}

/* ── 8. AMBIENT PETALS (page-wide, fixed layer) ── */
function initAmbientPetals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const wrap = document.createElement('div');
  wrap.className = 'ambient-petals';
  wrap.setAttribute('aria-hidden', 'true');
  document.body.appendChild(wrap);

  const cfg = [
    { px: '7%',  pd: '5s',  dur: '78s', sw: '14s', ps: '0.80' },
    { px: '21%', pd: '18s', dur: '65s', sw: '11s', ps: '1.05' },
    { px: '38%', pd: '32s', dur: '84s', sw: '16s', ps: '0.70' },
    { px: '57%', pd: '10s', dur: '70s', sw: '12s', ps: '0.90' },
    { px: '75%', pd: '43s', dur: '76s', sw: '10s', ps: '1.15' },
    { px: '90%', pd: '26s', dur: '68s', sw: '13s', ps: '0.85' },
  ];

  cfg.forEach(c => {
    const p = document.createElement('span');
    p.className = 'ambient-petal';
    Object.entries(c).forEach(([k, v]) => p.style.setProperty(`--${k}`, v));
    wrap.appendChild(p);
  });

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    const state = document.hidden ? 'paused' : 'running';
    wrap.querySelectorAll('.ambient-petal').forEach(p => {
      p.style.animationPlayState = state;
    });
  });
}

/* ── 9. CURSOR INK TRAIL (desktop only) ── */
function initCursorTrail() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const particles = [];

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }, { passive: true });

  document.addEventListener('mousemove', e => {
    for (let i = 0; i < 2; i++) {
      particles.push({
        x:       e.clientX + (Math.random() - 0.5) * 4,
        y:       e.clientY + (Math.random() - 0.5) * 4,
        r:       Math.random() * 2.2 + 0.6,
        alpha:   Math.random() * 0.14 + 0.05,
        life:    0,
        maxLife: 24 + Math.floor(Math.random() * 18),
      });
    }
  }, { passive: true });

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }
      const t = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 - t * 0.3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(26,26,26,${p.alpha * (1 - t)})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── 10. SUBMIT BUTTON STAMP ANIMATION ── */
function initStampButton() {
  const btn = document.querySelector('.btn-submit');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.classList.remove('stamping');
    void btn.offsetWidth; // reflow to allow re-triggering
    btn.classList.add('stamping');
  });
}

/* ── 11. SLIDESHOWS ── */
function initSlideshows() {
  document.querySelectorAll('.slideshow').forEach(show => {
    const slides  = [...show.querySelectorAll('.slide')];
    const counter = show.querySelector('.slide-counter');
    let current   = 0;

    slides[0].classList.add('active');

    function goTo(n) {
      slides[current].classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
    }

    show.querySelector('.slide-prev')?.addEventListener('click', () => goTo(current - 1));
    show.querySelector('.slide-next')?.addEventListener('click', () => goTo(current + 1));
  });
}

/* ── 12. EXPERIENCE EXPAND / COLLAPSE ── */

function initExpand() {
  document.querySelectorAll('.exp-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const details = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      details.classList.toggle('open', !open);
    });
  });
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  initSkipIntro();
  initBranch();
  initSplats();
  initBrushDividers();
  initScrollSpy();
  initMobileNav();
  initReveal();
  initSectionWash();
  initHeroOffscreen();
  initAmbientPetals();
  initCursorTrail();
  initStampButton();
  initSlideshows();
  initExpand();
});
