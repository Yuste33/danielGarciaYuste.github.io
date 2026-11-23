/* ==========================================================================
   main.js · Interacciones del currículum
   ========================================================================== */
(() => {
  'use strict';

  /* ✏️ Configuración rápida */
  const CONFIG = {
    roles: [
      'Creador de pruebas de concepto con IA',
      'IA aplicada al sector seguros',
      'Ingeniero Informático en formación',
      'Resolutor de problemas técnicos',
    ],
    email: '3yuste3@gmail.com', // destino del formulario de contacto
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tema claro / oscuro ---------- */
  const root = document.documentElement;
  const themeBtn = $('#theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  const systemLight = matchMedia('(prefers-color-scheme: light)').matches;
  root.dataset.theme = savedTheme || (systemLight ? 'light' : 'dark');

  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  /* ---------- Menú móvil ---------- */
  const menu = $('#menu');
  const toggle = $('#menu-toggle');
  const closeMenu = () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', closeMenu));
  addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());

  /* ---------- Efecto de escritura ---------- */
  const typed = $('#typed');
  if (typed) {
    if (reduceMotion) {
      typed.textContent = CONFIG.roles[0];
    } else {
      let r = 0, c = 0, deleting = false;
      const tick = () => {
        const word = CONFIG.roles[r];
        typed.textContent = word.slice(0, c);
        if (!deleting && c === word.length) { deleting = true; return setTimeout(tick, 1700); }
        if (deleting && c === 0) { deleting = false; r = (r + 1) % CONFIG.roles.length; }
        c += deleting ? -1 : 1;
        setTimeout(tick, deleting ? 35 : 70);
      };
      tick();
    }
  }

  /* ---------- Aparición, barras y contadores ---------- */
  const animateCount = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = end + suffix; return; }
    const start = performance.now(), duration = 1400;
    const frame = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('show');
      $$('.bar > i', el).forEach((bar) => {
        bar.style.setProperty('--w', bar.dataset.level + '%');
        bar.style.width = bar.dataset.level + '%';
        bar.closest('[role="progressbar"]')?.setAttribute('aria-valuenow', bar.dataset.level);
      });
      $$('[data-count]', el).forEach(animateCount);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.15 });

  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    revealObserver.observe(el);
  });

  /* ---------- Scroll: progreso, cabecera, menú activo, botón subir ---------- */
  const progress = $('#progress');
  const header = $('.site-header');
  const toTop = $('#to-top');
  const navLinks = $$('.nav-menu a');
  const sections = navLinks.map((a) => $(a.getAttribute('href')));

  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
    header.classList.toggle('scrolled', doc.scrollTop > 10);
    toTop.classList.toggle('visible', doc.scrollTop > 600);

    let current = 0;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    navLinks.forEach((l, i) => {
      l.classList.toggle('active', i === current);
      i === current ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Formulario de contacto (abre el cliente de correo) ---------- */
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent(`Contacto desde tu CV · ${data.get('name')}`);
      const body = encodeURIComponent(`${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`);
      location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
    });
  }

  /* ---------- Descargar CV (imprimir / guardar como PDF) ---------- */
  $$('[data-action="print"]').forEach((b) =>
    b.addEventListener('click', (e) => { e.preventDefault(); window.print(); })
  );

  /* ---------- Año del pie ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
