// Shared by every page of the showcase: logo, theme toggle, cards rising into view, ambient background.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// ---- Logo (same geometry as the app's LogoMark)
(() => {
  const svg = document.getElementById('logo'), ns = 'http://www.w3.org/2000/svg';
  const arc = (r, s) => { const dx = +(r * 0.766).toFixed(2), dy = +(r * 0.643).toFixed(2);
    return s > 0 ? `M${20 + dx} ${20 - dy}A${r} ${r} 0 0 1 ${20 + dx} ${20 + dy}` : `M${20 - dx} ${20 - dy}A${r} ${r} 0 0 0 ${20 - dx} ${20 + dy}` };
  let html = '<defs><linearGradient id="lt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>'
    + '<rect width="40" height="40" rx="10" fill="url(#lt)"/><circle cx="20" cy="20" r="17" fill="none" stroke="#fff" stroke-opacity=".14" stroke-dasharray="1.5 3"/>'
    + '<g class="logo-orbit"><circle cx="37" cy="20" r="1.6" fill="#fff"/></g>';
  [6, 10, 14].forEach((r, i) => [1, -1].forEach((s) => { html += `<path d="${arc(r, s)}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" class="logo-arc" style="--d:${i * 0.3}s"/>` }));
  html += '<path d="M20 22.5L16.5 32M20 22.5L23.5 32M17.6 29h4.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="20" r="2.6" fill="#fff" class="logo-core"/>';
  svg.innerHTML = html;
})();

// ---- Theme: light / system / dark, kept in localStorage (same key and behaviour as the app)
(() => {
  const media = matchMedia('(prefers-color-scheme: dark)'); let theme; try { theme = localStorage.getItem('theme') || 'system' } catch { theme = 'system' }
  const apply = () => { const d = theme === 'dark' || (theme === 'system' && media.matches); document.documentElement.classList.toggle('dark', d); document.documentElement.style.colorScheme = d ? 'dark' : 'light' };
  const buttons = document.querySelectorAll('.toggle button');
  const set = (t) => { theme = t; try { t === 'system' ? localStorage.removeItem('theme') : localStorage.setItem('theme', t) } catch {} apply();
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === t))) };
  buttons.forEach((b) => b.addEventListener('click', () => set(b.dataset.theme)));
  media.addEventListener('change', () => theme === 'system' && apply()); set(theme);
})();

// ---- Cards rise in once as they scroll into view
(() => {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
})();

// ---- Ambient background: drifting signal network with pulses, and broadcast rings (the app's background, in plain JS).
//      Colour follows the section in view. 30 fps cap, paused when hidden, one still frame under reduced motion.
(() => {
  const TONES = { indigo: [[79, 70, 229], [129, 140, 248]], emerald: [[5, 150, 105], [52, 211, 153]], amber: [[217, 119, 6], [251, 191, 36]], rose: [[225, 29, 72], [251, 113, 133]] };
  const canvas = document.getElementById('ambient'), ctx = canvas.getContext('2d'); let tone = 'indigo';
  const rand = (a, b) => a + Math.random() * (b - a), dark = () => document.documentElement.classList.contains('dark');
  let w, h, nodes = [], waves = [], pulses = [], ripples = [], t = 0, nextWave = 0, nextPulse = 1, raf = 0, last = 0;
  const rgb = [...TONES[tone][dark() ? 1 : 0]];
  const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = Array.from({ length: Math.min(70, Math.round(w * h / 26000)) }, () => { const a = rand(0, 6.283), v = rand(4.5, 9); return { x: rand(0, w), y: rand(0, h), vx: Math.cos(a) * v, vy: Math.sin(a) * v } });
    if (reduce.matches) draw(0) };
  function draw(dt) {
    t += dt; const d = dark(), target = TONES[tone][d ? 1 : 0], A = d ? 1 : 0.75;
    for (let k = 0; k < 3; k++) rgb[k] += (target[k] - rgb[k]) * (dt ? Math.min(1, dt * 2.5) : 1);
    const c = `${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0}`; ctx.clearRect(0, 0, w, h);
    const tx = w * 0.86, ty = h * 0.14, maxR = Math.hypot(w, h) * 0.75;
    if (t >= nextWave) { waves.push(t); nextWave = t + 5 } waves = waves.filter((s) => t - s < 14);
    for (const s of waves) { const p = (t - s) / 14; ctx.strokeStyle = `rgba(${c},${0.22 * (1 - p) * A})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(tx, ty, 20 + p * maxR, 0, 6.283); ctx.stroke() }
    for (const n of nodes) { n.x += n.vx * dt; n.y += n.vy * dt; if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20; if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20 }
    const links = []; ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const a = nodes[i], b = nodes[j], dd = Math.hypot(a.x - b.x, a.y - b.y); if (dd > 150) continue;
      links.push([i, j]); ctx.strokeStyle = `rgba(${c},${0.16 * (1 - dd / 150) * A})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke() }
    ctx.fillStyle = `rgba(${c},${0.4 * A})`; for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, 6.283); ctx.fill() }
    if (t >= nextPulse && links.length) { const [i, j] = links[(Math.random() * links.length) | 0]; pulses.push({ a: i, b: j, s: t }); nextPulse = t + 1.6 }
    pulses = pulses.filter((p) => { const f = (t - p.s) / 2.2, a = nodes[p.a], b = nodes[p.b]; if (f >= 1) { ripples.push({ n: p.b, s: t }); return false }
      ctx.fillStyle = `rgba(${c},${0.85 * A})`; ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 2.6, 0, 6.283); ctx.fill(); return true });
    ripples = ripples.filter((r) => { const p = (t - r.s) / 1.6; if (p >= 1) return false; const n = nodes[r.n]; ctx.strokeStyle = `rgba(${c},${0.5 * (1 - p) * A})`; ctx.beginPath(); ctx.arc(n.x, n.y, 3 + p * 22, 0, 6.283); ctx.stroke(); return true });
  }
  const frame = (now) => { raf = requestAnimationFrame(frame); if (now - last < 33) return; const dt = last ? Math.min((now - last) / 1000, 0.1) : 0; last = now; draw(dt) };
  const start = () => { cancelAnimationFrame(raf); last = 0; if (reduce.matches) draw(0); else raf = requestAnimationFrame(frame) };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { tone = e.target.dataset.tone; if (reduce.matches) draw(0) } }), { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('section[data-tone]').forEach((s) => io.observe(s));
  new MutationObserver(() => reduce.matches && draw(0)).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', resize); document.addEventListener('visibilitychange', () => (document.hidden ? cancelAnimationFrame(raf) : start())); reduce.addEventListener('change', start);
  resize(); start();
})();
