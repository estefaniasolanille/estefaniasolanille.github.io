// Si la persona pidió "reducir movimiento" en su sistema, se apagan el zoom y la
// profundidad (los movimientos grandes). Los fundidos, el tipeo y el polvo se mantienen.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

// ---------- Aparición de elementos al hacer scroll (todas las páginas) ----------
const reveals = document.querySelectorAll('.reveal');
if (!('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('in'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  reveals.forEach((el) => {
    // Lo que ya está en pantalla al cargar se muestra de entrada
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    else revealObserver.observe(el);
  });
}

// ---------- Dock flotante (páginas de proyecto) ----------
// Se arma acá para no repetir el mismo HTML en cada página.
// Las páginas en inglés están en en/: los textos cambian y el CV queda una carpeta más arriba.
const EN = document.documentElement.lang === 'en';
const ROOT = EN ? '../' : '';
const T = EN
  ? { projects: 'Projects', back: 'Back to projects', backShort: 'Back', home: 'Go to the desk', homeShort: 'Desk', infographic: 'Infographic' }
  : { projects: 'Proyectos', back: 'Volver a proyectos', backShort: 'Volver', home: 'Ir al escritorio', homeShort: 'Escritorio', infographic: 'Infografía' };

const DOCK_PROJECTS = [
  { href: 'molecular.html', label: 'MoleculAR', color: '#278BFB' },
  { href: 'anfibia.html', label: 'Anfibia', color: '#D7F04A' },
  { href: 'nutri-recetas.html', label: 'Nutri', color: '#A3B547' },
  { href: 'infografia.html', label: T.infographic, color: '#F2C230' },
  { href: 'lyro.html', label: 'Lyro', color: '#FF7A3D' },
];
// Links extra al final de la barra. blank: true lo abre en otra pestaña.
const DOCK_EXTRA = [
  { href: `${ROOT}cv-estefania-solanille.pdf`, label: 'CV', blank: true },
];

if (document.body.classList.contains('page-case')) {
  const here = location.pathname.split('/').pop();
  const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const dock = document.createElement('nav');
  dock.className = 'dock';
  dock.setAttribute('aria-label', T.projects);
  dock.innerHTML = `
    <a class="round" href="index.html#proyectos" aria-label="${T.back}" title="${T.backShort}">${icon('<path d="M19 12H5M12 19l-7-7 7-7"/>')}</a>
    <a class="round" href="index.html" aria-label="${T.home}" title="${T.homeShort}">${icon('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>')}</a>
    <span class="sep" aria-hidden="true"></span>
    ${DOCK_PROJECTS.map((p) => `<a class="proj" href="${p.href}" style="--c:${p.color}" title="${p.label}"${p.href === here ? ' aria-current="page"' : ''}><span>${p.label}</span></a>`).join('')}
    ${DOCK_EXTRA.map((e) => `<a href="${e.href}"${e.blank ? ' target="_blank" rel="noopener"' : ''}>${e.label}</a>`).join('')}`;
  document.body.appendChild(dock);
}

// ---------- Barra de progreso de lectura (páginas de proyecto) ----------
// Una línea finita del color del proyecto, en el borde de abajo del menú, que avanza al bajar
if (document.body.classList.contains('page-case')) {
  const bar = document.createElement('span');
  bar.className = 'read-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.querySelector('.topbar').appendChild(bar);
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

// ---------- Resaltador: la marca se pinta cuando la frase aparece en pantalla ----------
const marks = document.querySelectorAll('.mark');
if (!('IntersectionObserver' in window)) {
  marks.forEach((m) => m.classList.add('on'));
} else {
  const markObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('on');
      markObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -15% 0px' });
  marks.forEach((m) => markObserver.observe(m));
}

// ---------- Antes/después: la línea sigue al control deslizante ----------
document.querySelectorAll('.compare').forEach((box) => {
  const range = box.querySelector('input[type="range"]');
  const move = () => box.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', move);
  move();
});

// ---------- Videos de demostración ----------
// Con "reducir movimiento" no arrancan solos: se muestran con controles para darles play
if (reduceMotion) {
  document.querySelectorAll('.demo-video').forEach((v) => {
    v.removeAttribute('autoplay');
    v.pause();
    v.controls = true;
  });
}

// ---------- Pila de imágenes que se baraja sola (tipo revista) ----------
// Cada .shuffle muestra sus imágenes apiladas; cada 3 s la de arriba sale volando
// y pasa al fondo. Se pausa con el mouse encima y avanza al hacer clic.
const STACK_POSITIONS = [
  'translate(0, 0) rotate(0deg)',
  'translate(5%, -4%) rotate(4deg)',
  'translate(-5%, -6%) rotate(-5deg)',
  'translate(0, -8%) rotate(2deg)',
];
const STACK_LIGHT = [1, 0.75, 0.6, 0.45];

document.querySelectorAll('.shuffle').forEach((box) => {
  const cards = [...box.querySelectorAll('.shuffle-card')];
  const label = box.querySelector('.shuffle-label');
  const dots = box.querySelector('.shuffle-dots');
  let order = cards.map((_, i) => i); // order[0] es la de arriba
  let busy = false;
  let paused = false;
  let visible = false;

  cards.forEach(() => dots.appendChild(document.createElement('span')));

  function layout() {
    order.forEach((cardIndex, depth) => {
      const card = cards[cardIndex];
      const d = Math.min(depth, STACK_POSITIONS.length - 1);
      card.style.transform = STACK_POSITIONS[d];
      card.style.filter = `brightness(${STACK_LIGHT[d]})`;
      card.style.zIndex = 40 - depth;
    });
    const top = cards[order[0]];
    label.textContent = top.dataset.label || '';
    [...dots.children].forEach((dot, i) => dot.classList.toggle('on', i === order[0]));
  }

  function next() {
    if (busy || cards.length < 2) return;
    busy = true;
    const top = cards[order[0]];
    // La de arriba sale hacia la derecha girando…
    top.style.transform = 'translate(70%, 6%) rotate(14deg)';
    setTimeout(() => {
      // …y vuelve por detrás de la pila
      order = [...order.slice(1), order[0]];
      layout();
      setTimeout(() => { busy = false; }, 450);
    }, reduceMotion ? 0 : 380);
  }

  box.addEventListener('click', next);
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
  });
  box.addEventListener('mouseenter', () => { paused = true; });
  box.addEventListener('mouseleave', () => { paused = false; });
  box.addEventListener('focusin', () => { paused = true; });
  box.addEventListener('focusout', () => { paused = false; });

  // Solo se baraja sola cuando está en pantalla (y si no pidieron reducir movimiento)
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(box);
  if (!reduceMotion) {
    setInterval(() => { if (visible && !paused && !document.hidden) next(); }, 3000);
  }

  layout();
});

// ---------- Escena del escritorio (solo en el inicio) ----------
const scene = document.getElementById('scene');
if (scene) initScene();

// ---------- Inicio en collage: el recorte se levanta antes de abrir el proyecto ----------
document.querySelectorAll('.board a.st[href$=".html"]').forEach((st) => {
  st.addEventListener('click', (e) => {
    if (reduceMotion) return;
    e.preventDefault();
    st.classList.add('picked');
    setTimeout(() => { location.href = st.getAttribute('href'); }, 280);
  });
});
window.addEventListener('pageshow', () => {
  document.querySelectorAll('.board .picked').forEach((st) => st.classList.remove('picked'));
});

// En el papel del collage se tipea el nombre y después el rol, como en una máquina de escribir
const nameCard = document.querySelector('.name-card');
if (nameCard && !reduceMotion) {
  const lines = [nameCard.querySelector('h1'), nameCard.querySelector('.role')];
  const texts = lines.map((el) => el.textContent);
  lines.forEach((el, n) => {
    el.setAttribute('aria-label', texts[n]);
    // Se reserva el alto final para que el papel no cambie de tamaño mientras se escribe
    el.style.minHeight = `${el.offsetHeight}px`;
    el.textContent = '';
  });
  nameCard.querySelector('.role').classList.add('empty');

  let line = 0, i = 0;
  setTimeout(function type() {
    const el = lines[line];
    el.classList.add('typing');
    el.classList.remove('empty');
    el.textContent = texts[line].slice(0, ++i);
    if (i < texts[line].length) {
      setTimeout(type, 55 + Math.random() * 70);
    } else if (++line < lines.length) {
      el.classList.remove('typing');
      i = 0;
      setTimeout(type, 350);
    }
    // Al terminar, el cursor queda titilando al final del rol
  }, 700);
}

function initScene() {
  const wrap = scene.closest('.scene-wrap');
  const inner = document.getElementById('scene-inner');
  const tooltip = document.getElementById('tooltip');
  const hotspots = document.querySelectorAll('.hs');

  // ?debug en la URL muestra todas las zonas clickeables
  if (location.search.includes('debug')) scene.classList.add('debug');

  hotspots.forEach((hs) => {
    // Etiqueta que sigue al mouse sobre cada objeto
    hs.addEventListener('mousemove', (e) => {
      const box = scene.getBoundingClientRect();
      tooltip.textContent = hs.dataset.label;
      tooltip.style.left = `${e.clientX - box.left}px`;
      tooltip.style.top = `${e.clientY - box.top}px`;
      tooltip.classList.add('show');
    });
    hs.addEventListener('mouseleave', () => tooltip.classList.remove('show'));

    // Los objetos que llevan a otra página hacen zoom antes de navegar
    hs.addEventListener('click', (e) => zoomTo(hs, e));

    // Etiqueta sobre el objeto (solo se ve en el celular, donde no hay mouse)
    const [px, py] = hs.dataset.pin.split(',').map(Number);
    const pin = document.createElement('a');
    pin.className = 'pin';
    pin.href = hs.getAttribute('href');
    pin.textContent = hs.dataset.short;
    pin.style.left = `${(px / 1376) * 100}%`;
    pin.style.top = `${(py / 768) * 100}%`;
    pin.tabIndex = -1;
    pin.setAttribute('aria-hidden', 'true');
    pin.addEventListener('click', (e) => zoomTo(hs, e));
    inner.appendChild(pin);
  });

  function zoomTo(hs, e) {
    const href = hs.getAttribute('href');
    if (!href.endsWith('.html') || reduceMotion) return;
    e.preventDefault();
    const b = hs.querySelector('polygon').getBBox();
    const x = ((b.x + b.width / 2) / 1376) * 100;
    const y = ((b.y + b.height / 2) / 768) * 100;
    scene.style.transformOrigin = `${x}% ${y}%`;
    scene.classList.add('zooming');
    wrap.classList.add('zooming');
    setTimeout(() => { location.href = href; }, 800);
  }

  // En el celular la escena es más ancha que la pantalla: arranca mostrando los objetos
  if (wrap.scrollWidth > wrap.clientWidth) {
    wrap.scrollLeft = wrap.scrollWidth - wrap.clientWidth;
  }

  // Al volver con el botón "atrás", sacar el zoom
  window.addEventListener('pageshow', () => {
    scene.classList.remove('zooming');
    wrap.classList.remove('zooming');
  });

  fitMonitor(inner, inner.querySelector('.monitor-screen'));

  // Al entrar, los objetos se iluminan uno por uno para mostrar que son clickeables
  window.addEventListener('load', () => {
    hotspots.forEach((hs, i) => {
      setTimeout(() => hs.classList.add('hinting'), 2200 + i * 180);
      setTimeout(() => hs.classList.remove('hinting'), 2700 + i * 180);
    });
  });

  // El nombre se tipea letra por letra en el monitor
  const nameEl = document.getElementById('typed-name');
  const screen = nameEl.closest('.monitor-screen');
  const fullName = nameEl.textContent;
  nameEl.textContent = '';
  nameEl.classList.add('typing');
  screen.classList.add('pending');
  let i = 0;
  setTimeout(function type() {
    nameEl.textContent = fullName.slice(0, ++i);
    if (i < fullName.length) {
      setTimeout(type, 55 + Math.random() * 70);
    } else {
      nameEl.classList.remove('typing');
      screen.classList.remove('pending');
    }
  }, 600);

  // Profundidad: la escena se mueve apenas siguiendo el mouse
  if (!isTouch && !reduceMotion) {
    wrap.addEventListener('mousemove', (e) => {
      const r = wrap.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      inner.style.transform = `scale(1.03) translate(${dx * -14}px, ${dy * -10}px)`;
    });
    wrap.addEventListener('mouseleave', () => { inner.style.transform = ''; });
  }

  initDust(document.getElementById('dust'));
}

// ---------- Texto del monitor en perspectiva ----------
function fitMonitor(container, el) {
  // Esquinas de la pantalla blanca del monitor, en píxeles de la imagen (1376×768).
  // Si cambiás la imagen del escritorio, hay que volver a medirlas.
  const MONITOR_CORNERS = [
    [792, 249],  // arriba izquierda
    [1015, 323], // arriba derecha
    [999, 479],  // abajo derecha
    [788, 397],  // abajo izquierda
  ];
  el.classList.add('fitted');
  const W = el.offsetWidth;
  const H = el.offsetHeight;

  function update() {
    const k = container.clientWidth / 1376;
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = MONITOR_CORNERS.map(([x, y]) => [x * k, y * k]);

    // Transformación proyectiva de un cuadrado a las 4 esquinas
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / den;
    const h = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3;
    const d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;

    el.style.transform = `matrix3d(${[
      a / W, d / W, 0, g / W,
      b / H, e / H, 0, h / H,
      0, 0, 1, 0,
      x0, y0, 0, 1,
    ].join(',')})`;
  }

  update();
  window.addEventListener('resize', update);
}

// ---------- Partículas de polvo flotando en la luz de la ventana ----------
function initDust(canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], running = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Las partículas nacen sobre el haz de luz, entre la ventana y el escritorio
  function spawn(anywhere) {
    return {
      x: w * (0.05 + Math.random() * 0.45),
      y: anywhere ? Math.random() * h * 0.8 : h * 0.8,
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.3) * 0.12,
      vy: -0.05 - Math.random() * 0.15,
      a: 0.15 + Math.random() * 0.45,
      t: Math.random() * Math.PI * 2,
    };
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p, idx) => {
      p.t += 0.01;
      p.x += p.vx + Math.sin(p.t) * 0.08;
      p.y += p.vy;
      if (p.y < 0 || p.x > w * 0.6) particles[idx] = spawn(false);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 228, 180, ${p.a * (0.6 + 0.4 * Math.sin(p.t * 2))})`;
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }

  resize();
  particles = Array.from({ length: 45 }, () => spawn(true));
  window.addEventListener('resize', resize);

  // Pausar cuando la escena no se ve, para no gastar batería
  new IntersectionObserver(([entry]) => {
    const wasRunning = running;
    running = entry.isIntersecting;
    if (running && !wasRunning) requestAnimationFrame(frame);
  }).observe(canvas);
  requestAnimationFrame(frame);
}

// ---------- Menú: marcar la sección visible (inicio) ----------
const navLinks = document.querySelectorAll('.topbar nav a[href^="#"]');
if (navLinks.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main .section').forEach((s) => navObserver.observe(s));
}
