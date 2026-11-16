const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCase = document.body.classList.contains('page-case');

function onceVisible(elements, className, rootMargin, showIfOnScreen = false) {
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add(className));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add(className);
      observer.unobserve(entry.target);
    });
  }, { rootMargin });
  elements.forEach((el) => {
    if (showIfOnScreen && el.getBoundingClientRect().top < window.innerHeight) el.classList.add(className);
    else observer.observe(el);
  });
}

onceVisible(document.querySelectorAll('.reveal'), 'in', '0px 0px -10% 0px', true);
onceVisible(document.querySelectorAll('.mark'), 'on', '0px 0px -15% 0px');

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
const DOCK_EXTRA = [
  { href: `${ROOT}cv-estefania-solanille.pdf`, label: 'CV', blank: true },
];

if (isCase) {
  const here = location.pathname.split('/').pop().replace(/(\.html)?$/, '.html');
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

document.querySelectorAll('.compare').forEach((box) => {
  const range = box.querySelector('input[type="range"]');
  const move = () => box.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', move);
  move();
});

if (reduceMotion) {
  document.querySelectorAll('.demo-video').forEach((v) => {
    v.removeAttribute('autoplay');
    v.pause();
    v.controls = true;
  });
}

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
  let order = cards.map((_, i) => i);
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
    label.textContent = cards[order[0]].dataset.label || '';
    [...dots.children].forEach((dot, i) => dot.classList.toggle('on', i === order[0]));
  }

  function next() {
    if (busy || cards.length < 2) return;
    busy = true;
    cards[order[0]].style.transform = 'translate(70%, 6%) rotate(14deg)';
    setTimeout(() => {
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

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(box);
  if (!reduceMotion) {
    setInterval(() => { if (visible && !paused && !document.hidden) next(); }, 3000);
  }

  layout();
});

const nameCard = document.querySelector('.name-card');
if (nameCard && !reduceMotion) {
  const lines = [nameCard.querySelector('h1'), nameCard.querySelector('.role')];
  const texts = lines.map((el) => el.textContent);
  lines.forEach((el, n) => {
    el.setAttribute('aria-label', texts[n]);
    el.style.minHeight = `${el.offsetHeight}px`;
    el.textContent = '';
  });
  lines[1].classList.add('empty');

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
  }, 700);
}

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

const fitTags = () => document.querySelectorAll('.desk .tag').forEach((tag) => {
  const box = tag.querySelector('text').getBBox();
  const bg = tag.querySelector('.tag-bg');
  const h = box.height + 16;
  bg.setAttribute('x', box.x - 16);
  bg.setAttribute('y', box.y - 8);
  bg.setAttribute('width', box.width + 32);
  bg.setAttribute('height', h);
  bg.setAttribute('rx', h / 2);
});
if (document.querySelector('.desk')) {
  document.fonts.ready.then(fitTags);
  window.addEventListener('resize', fitTags);
}
