// Motion for the public pages. Everything here is decoration over finished
// markup: without this file the pages are complete and still.
(() => {
  'use strict';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => 1 - Math.pow(1 - t, 3);

  // ---- Reveal on scroll ---------------------------------------------------------
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  if (reveals.length && 'IntersectionObserver' in window && !calm) {
    // What is already on screen is marked before anything is hidden, so nothing visible blinks.
    for (const node of reveals) if (node.getBoundingClientRect().top < innerHeight * 0.92) node.classList.add('in');
    document.documentElement.classList.add('js');
    const seen = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in'); seen.unobserve(entry.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    for (const node of reveals) if (!node.classList.contains('in')) seen.observe(node);
  }

  // ---- The steps rail fills as the section is read ---------------------------------
  const rail = document.querySelector('[data-rail]');
  if (rail && !calm) {
    let queued = false;
    const fill = () => {
      queued = false;
      const box = rail.getBoundingClientRect();
      const progress = (innerHeight * 0.62 - box.top) / box.height;
      rail.style.setProperty('--rail', String(Math.max(0, Math.min(1, progress))));
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(fill); } }, { passive: true });
    addEventListener('resize', fill);
    fill();
  }

  // ---- The chain of title, drawn in ------------------------------------------------
  for (const figure of document.querySelectorAll('[data-flow]')) {
    if (calm || !('IntersectionObserver' in window)) break;
    const wipes = [...figure.querySelectorAll('[data-wipe]')];
    const labels = [...figure.querySelectorAll('[data-at]')].map(node => ({ node, at: Number(node.dataset.at) }));
    const counts = [...figure.querySelectorAll('[data-count]')].map(node => ({ node, to: Number(node.dataset.count), text: node.dataset.count }));
    const draw = p => {
      for (const rect of wipes) rect.setAttribute(rect.dataset.wipe, String(Number(rect.dataset.full) * p));
      for (const label of labels) label.node.classList.toggle('on', p >= label.at);
    };
    const count = p => { for (const c of counts) c.node.textContent = p >= 1 ? c.text : (c.to * p).toFixed(4); };
    figure.classList.add('flow-armed');
    draw(0); count(0);
    const play = () => {
      const start = performance.now(), DRAW = 3600, COUNT = 1100;
      const frame = now => {
        const t = now - start;
        draw(Math.min(1, ease(Math.min(1, t / DRAW)) * 1.02));
        count(ease(Math.max(0, Math.min(1, (t - DRAW * 0.62) / COUNT))));
        if (t < DRAW + COUNT) requestAnimationFrame(frame); else { draw(1); count(1); }
      };
      requestAnimationFrame(frame);
    };
    const watch = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { watch.disconnect(); setTimeout(play, 350); }
    }, { threshold: 0.25 });
    watch.observe(figure);
  }

  // ---- The run strip: a timer, and one status line that is replaced ---------------------
  for (const strip of document.querySelectorAll('[data-runstrip]')) {
    const timer = strip.querySelector('[data-rs-timer]'), line = strip.querySelector('[data-rs-line]');
    let lines = [];
    try { lines = JSON.parse(strip.dataset.lines || '[]'); } catch { /* keep the line already on the page */ }
    let seconds = Number(strip.dataset.seconds) || 0, at = 1;
    const two = n => String(n).padStart(2, '0');
    const show = () => { timer.textContent = `${two(Math.floor(seconds / 3600))}:${two(Math.floor(seconds / 60) % 60)}:${two(seconds % 60)}`; };
    show();
    if (calm) continue;
    setInterval(() => { seconds += 1; show(); }, 1000);
    if (lines.length < 2) continue;
    const write = ([who, what]) => {
      const name = document.createElement('b'), text = document.createElement('span');
      name.textContent = who; text.textContent = what;
      line.replaceChildren(name, text);
    };
    setInterval(() => {
      at = (at + 1) % lines.length;
      line.classList.add('leaving');
      setTimeout(() => {
        write(lines[at]);
        line.classList.remove('leaving');
        line.classList.add('entering');
        requestAnimationFrame(() => requestAnimationFrame(() => line.classList.remove('entering')));
      }, 340);
    }, 3400);
  }

  // ---- The survey field behind the hero: slow contour lines -------------------------------
  const canvas = document.querySelector('[data-field]');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    // Gradient noise on a fixed lattice (the same field on every visit).
    const perm = new Uint8Array(512);
    { let seed = 20261114; const next = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
      const base = Array.from({ length: 256 }, (_, i) => i);
      for (let i = 255; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
      for (let i = 0; i < 512; i++) perm[i] = base[i & 255]; }
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (hash, x, y) => { const g = hash & 7, u = g < 4 ? x : y, v = g < 4 ? y : x; return ((g & 1) ? -u : u) + ((g & 2) ? -v : v) * 0.5; };
    const noise = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = fade(xf), v = fade(yf);
      const a = perm[(xi & 255) + perm[yi & 255]], b = perm[((xi + 1) & 255) + perm[yi & 255]];
      const c = perm[(xi & 255) + perm[(yi + 1) & 255]], d = perm[((xi + 1) & 255) + perm[(yi + 1) & 255]];
      const top = grad(a, xf, yf) + u * (grad(b, xf - 1, yf) - grad(a, xf, yf));
      const bottom = grad(c, xf, yf - 1) + u * (grad(d, xf - 1, yf - 1) - grad(c, xf, yf - 1));
      return top + v * (bottom - top);
    };
    const CELL = 18, LEVELS = [-0.52, -0.4, -0.28, -0.16, -0.04, 0.08, 0.2, 0.32, 0.44, 0.56];
    let width = 0, height = 0, cols = 0, rows = 0, field = new Float32Array(0), visible = true, last = 0;
    const size = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      cols = Math.ceil(width / CELL) + 1; rows = Math.ceil(height / CELL) + 1;
      field = new Float32Array(cols * rows);
    };
    const paint = time => {
      const drift = time * 0.000014;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = i * CELL * 0.0034, y = j * CELL * 0.0034;
        field[j * cols + i] = noise(x + drift, y + drift * 0.6) * 0.78 + noise(x * 2.3 - drift * 1.4, y * 2.3 + 9.1) * 0.22;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      LEVELS.forEach((level, index) => {
        const cyan = index % 4 === 1;
        const violet = index % 4 === 3;
        ctx.strokeStyle = cyan ? 'rgba(34, 211, 238, 0.24)' : violet ? 'rgba(168, 85, 247, 0.22)' : 'rgba(148, 163, 184, 0.08)';
        ctx.beginPath();
        for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
          const a = field[j * cols + i], b = field[j * cols + i + 1], c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i];
          const kind = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
          if (kind === 0 || kind === 15) continue;
          const x = i * CELL, y = j * CELL;
          const topX = x + CELL * (level - a) / (b - a), rightY = y + CELL * (level - b) / (c - b);
          const bottomX = x + CELL * (level - d) / (c - d), leftY = y + CELL * (level - a) / (d - a);
          const seg = (x1, y1, x2, y2) => { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); };
          switch (kind) {
            case 1: case 14: seg(x, leftY, bottomX, y + CELL); break;
            case 2: case 13: seg(bottomX, y + CELL, x + CELL, rightY); break;
            case 3: case 12: seg(x, leftY, x + CELL, rightY); break;
            case 4: case 11: seg(topX, y, x + CELL, rightY); break;
            case 6: case 9: seg(topX, y, bottomX, y + CELL); break;
            case 7: case 8: seg(x, leftY, topX, y); break;
            case 5: seg(x, leftY, topX, y); seg(bottomX, y + CELL, x + CELL, rightY); break;
            case 10: seg(x, leftY, bottomX, y + CELL); seg(topX, y, x + CELL, rightY); break;
          }
        }
        ctx.stroke();
      });
      // The lines thin out behind the words and towards the foot of the hero, so type stays clean.
      ctx.globalCompositeOperation = 'destination-out';
      const wide = width >= 1040;
      const behind = ctx.createLinearGradient(0, 0, wide ? width * 0.62 : 0, wide ? 0 : height * 0.75);
      behind.addColorStop(0, 'rgba(0, 0, 0, 0.82)'); behind.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = behind; ctx.fillRect(0, 0, width, height);
      const foot = ctx.createLinearGradient(0, height * 0.72, 0, height);
      foot.addColorStop(0, 'rgba(0, 0, 0, 0)'); foot.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = foot; ctx.fillRect(0, height * 0.72, width, height * 0.28);
      ctx.globalCompositeOperation = 'source-over';
    };
    const loop = time => {
      if (visible && !document.hidden && time - last > 40) { last = time; paint(time); }
      requestAnimationFrame(loop);
    };
    size(); paint(0);
    addEventListener('resize', () => { size(); paint(last); });
    if (!calm) {
      if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(canvas);
      requestAnimationFrame(loop);
    }
  }
})();
