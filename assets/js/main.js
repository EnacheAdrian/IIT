/* =========================================================
   CLIPLAB — interacțiuni și animații
   Fără dependențe externe.
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const esc = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const has = (obj, key) => !!obj && Object.prototype.hasOwnProperty.call(obj, key);

  /* =========================================================
     LIMBĂ (RO / EN)
     Textele în română stau în index.html; cele în engleză și textele
     generate din JavaScript stau în assets/js/i18n.js (window.I18N).
     ========================================================= */
  const LANGS = ['ro', 'en'];
  const STORAGE_KEY = 'cliplab-lang';
  const WIPE_IN = 450, WIPE_OUT = 500; // durata tranziției (ms), ca în .lang-wipe din CSS (limită de siguranță dacă „transitionend” nu vine)

  // Texte de rezervă (RO) — folosite DOAR dacă assets/js/i18n.js lipsește sau nu definește o cheie.
  // Textele se editează în i18n.js, nu aici.
  const UI_FALLBACK = {
    'locale': 'ro-RO',
    'words.hero': ['clipuri virale', 'shorts care rup', 'compilații', 'highlights', 'vizualizări'],
    'captions.editor': ['ASTA A FOST *INSANE*', 'NU-MI VINE SĂ *CRED*', 'CHATUL A *EXPLODAT*', '1 VS 4 *CLUTCH*'],
    'captions.phone': ['CÂND CHATUL ÎȚI *DONEAZĂ* 1000€', 'CEL MAI *RAPID* CLUTCH', 'AȘTEAPTĂ *FINALUL*'],
    'cat.shorts': 'Shorts & TikTok',
    'cat.highlights': 'Highlights',
    'cat.compilatii': 'Compilații',
    'cat.youtube': 'Montaj YouTube',
    'portfolio.views': 'vizualizări',
    'portfolio.open': 'Deschide clipul: {title}',
    'modal.demo': 'Clip demonstrativ',
    'menu.open': 'Deschide meniul',
    'menu.close': 'Închide meniul',
    'form.sent': 'Mesajul a fost trimis.',
    'form.error': 'Ceva n-a mers. Încearcă din nou sau scrie-ne direct pe email.',
    'form.planMessage': 'Bună! Sunt interesat de pachetul {plan}.',
    'mail.subject': 'Cerere ofertă — {service}',
    'mail.name': 'Nume',
    'mail.email': 'Email',
    'mail.channel': 'Canal',
    'mail.service': 'Serviciu',
    'mail.budget': 'Buget',
    'lang.switchedTo': 'Site-ul este acum în română'
  };

  let I18N = null;   // window.I18N, citit la pornire
  let lang = 'ro';   // limba curentă
  let switching = false;
  let warnedMissing = false;
  let live = null;   // regiune aria-live (anunță schimbarea limbii pentru cititoarele de ecran)

  // Textele originale (RO), salvate la pornire înainte de orice altă modificare a paginii
  const htmlByKey = new Map();   // cheie -> innerHTML original
  const attrByKey = new Map();   // cheie -> valoarea originală a atributului
  const htmlByEl = new WeakMap(); // element -> innerHTML original
  const attrByEl = new WeakMap(); // element -> { atribut: valoare originală }

  /** Text din interfață generat de JS: I18N.ui[limbă][cheie] -> I18N.ui.ro[cheie] -> rezervă. */
  function tRaw(key) {
    const ui = (I18N && I18N.ui) || {};
    if (has(ui[lang], key)) return ui[lang][key];
    if (has(ui.ro, key)) return ui.ro[key];
    return has(UI_FALLBACK, key) ? UI_FALLBACK[key] : undefined;
  }

  /** Ca tRaw, dar întoarce cheia dacă lipsește și înlocuiește {nume} cu valorile din vars. */
  function t(key, vars) {
    const v = tRaw(key);
    if (v === undefined || v === null) return key;
    if (typeof v !== 'string') return v; // liste (cuvinte, subtitrări)
    return vars ? v.replace(/\{(\w+)\}/g, (m, name) => (vars[name] != null ? String(vars[name]) : m)) : v;
  }

  /** Listă de texte: data-words="hero" -> t('words.hero'). Acceptă și vechiul format JSON. */
  function listFor(name, prefix) {
    const raw = String(name || '').trim();
    if (!raw) return [];
    if (raw.charAt(0) === '[') {
      try { const arr = JSON.parse(raw); return Array.isArray(arr) ? arr.map(String) : []; } catch (e) { return []; }
    }
    const v = tRaw(`${prefix}.${raw}`);
    return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
  }

  /** Număr formatat după limba curentă (1.200 în română, 1,200 în engleză). */
  function fmtNumber(n) {
    const v = Math.round(n);
    try { return v.toLocaleString(t('locale')); } catch (e) { return v.toLocaleString('ro-RO'); }
  }

  const htmlToText = (html) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    return tpl.content.textContent.replace(/\s+/g, ' ').trim();
  };

  /** Rulează fn(limbă) după fiecare schimbare de limbă. */
  const onLangChange = (fn) => document.addEventListener('langchange', (e) => fn(e.detail && e.detail.lang));

  /** "aria-label:cheie; title:cheie2" -> [{ attr, key }, ...] */
  function parseAttrSpec(spec) {
    return String(spec || '').split(';').map((part) => {
      const i = part.indexOf(':');
      if (i < 0) return null;
      const attr = part.slice(0, i).trim().toLowerCase();
      const key = part.slice(i + 1).trim();
      return attr && key ? { attr, key } : null;
    }).filter(Boolean);
  }

  function captureOriginals() {
    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n.trim();
      htmlByEl.set(el, el.innerHTML);
      if (!htmlByKey.has(key)) htmlByKey.set(key, el.innerHTML);
    });
    $$('[data-i18n-attr]').forEach((el) => {
      const saved = {};
      parseAttrSpec(el.dataset.i18nAttr).forEach(({ attr, key }) => {
        const val = el.getAttribute(attr);
        saved[attr] = val;
        if (val !== null && !attrByKey.has(key)) attrByKey.set(key, val);
      });
      attrByEl.set(el, saved);
    });
  }

  /** HTML-ul unui element [data-i18n] în limba dată (engleza cade pe originalul RO dacă lipsește). */
  function sourceHTML(el, l = lang, missing = null) {
    const key = (el.dataset.i18n || '').trim();
    const ro = htmlByEl.has(el) ? htmlByEl.get(el) : htmlByKey.get(key);
    if (l === 'ro') return ro;
    const en = I18N && I18N.en;
    if (has(en, key) && typeof en[key] === 'string') return en[key];
    if (missing && key) missing.add(key);
    return ro;
  }

  function fillYear() {
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  function updateSwitcher(l) {
    const sw = $('.lang');
    if (!sw) return;
    sw.setAttribute('data-active', l);
    $$('.lang__btn', sw).forEach((btn) => {
      const on = btn.dataset.lang === l;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  function announce(text) {
    if (!live) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 80);
  }

  /** Aplică limba pe toată pagina, apoi anunță componentele prin evenimentul „langchange”. */
  function applyLang(next, initial = false) {
    lang = next;
    root.setAttribute('lang', next);
    const missing = new Set();
    const en = (I18N && I18N.en) || {};

    $$('[data-i18n]').forEach((el) => {
      const html = sourceHTML(el, next, missing);
      if (html != null && el.innerHTML !== html) el.innerHTML = html;
    });

    $$('[data-i18n-attr]').forEach((el) => {
      const saved = attrByEl.get(el) || {};
      parseAttrSpec(el.dataset.i18nAttr).forEach(({ attr, key }) => {
        let val = has(saved, attr) ? saved[attr] : attrByKey.get(key);
        if (next !== 'ro') {
          if (has(en, key) && typeof en[key] === 'string') val = en[key];
          else missing.add(key);
        }
        if (val != null && el.getAttribute(attr) !== val) el.setAttribute(attr, val);
      });
    });

    fillYear();
    const ogLocale = $('meta[property="og:locale"]');
    if (ogLocale && !ogLocale.hasAttribute('data-i18n-attr')) ogLocale.setAttribute('content', next === 'en' ? 'en_US' : 'ro_RO');
    updateSwitcher(next);

    if (missing.size && !warnedMissing) {
      warnedMissing = true;
      console.warn(`[i18n] Lipsesc traducerile în engleză pentru ${missing.size} chei (se afișează textul în română): ${Array.from(missing).join(', ')}`);
    }
    if (!initial) announce(t('lang.switchedTo'));
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: next } }));
  }

  /** Limba de pornire: ?lang=  >  alegerea salvată  >  limba browserului  >  I18N.defaultLang  >  'ro'. */
  function resolveLang() {
    if (!I18N) return 'ro';
    const ok = (l) => (typeof l === 'string' && LANGS.includes(l.trim().toLowerCase()) ? l.trim().toLowerCase() : null);
    let pick = null;
    try { pick = ok(new URLSearchParams(location.search).get('lang')); } catch (e) { /* URL invalid */ }
    if (pick) return pick;
    try { pick = ok(localStorage.getItem(STORAGE_KEY)); } catch (e) { /* stocare indisponibilă */ }
    if (pick) return pick;
    if (I18N.autoDetect) {
      const list = (navigator.languages && navigator.languages.length ? Array.from(navigator.languages) : [navigator.language]).filter(Boolean);
      if (list.length) return list.some((l) => String(l).toLowerCase().startsWith('ro')) ? 'ro' : 'en';
    }
    return ok(I18N.defaultLang) || 'ro';
  }

  function saveLang(l) {
    try { localStorage.setItem(STORAGE_KEY, l); } catch (e) { /* stocare indisponibilă */ }
    // Dacă pagina a fost deschisă cu ?lang=..., actualizăm și adresa
    try {
      const url = new URL(location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.set('lang', l);
        history.replaceState(history.state, '', url.href);
      }
    } catch (e) { /* ignorăm */ }
  }

  /** Rulează done() la sfârșitul tranziției clip-path a cortinei (sau după ms, dacă evenimentul nu vine). */
  function afterWipe(wipe, ms, done) {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      wipe.removeEventListener('transitionend', onEnd);
      done();
    };
    const onEnd = (e) => { if (e.target === wipe && e.propertyName === 'clip-path') finish(); };
    const timer = setTimeout(finish, ms);
    wipe.addEventListener('transitionend', onEnd);
  }

  /** Reperul pentru poziția de citire: primul element de sub header care rămâne în pagină (+ secțiunea lui, ca rezervă). */
  function scrollAnchors() {
    if (scrollY < 1) return [];
    const header = $('.header');
    const line = Math.max(0, header ? header.getBoundingClientRect().bottom : 0);
    let best = null, bestTop = Infinity;
    // Elementele [data-i18n] își păstrează nodul (se schimbă doar conținutul); copiile din benzi sunt refăcute
    $$('[data-i18n], section, footer, .work').forEach((el) => {
      if (el.closest('[data-clone], .header, .mobile-menu, .modal')) return;
      const r = el.getBoundingClientRect();
      if (!r.height || r.top < line || r.top >= innerHeight || r.top >= bestTop) return;
      best = el; bestTop = r.top;
    });
    if (!best) return [];
    return [best, best.closest('section, footer')].filter(Boolean).map((el) => ({ el, top: el.getBoundingClientRect().top }));
  }

  /** Aplică limba fără ca pagina să „sară”: textele de deasupra ecranului își pot schimba înălțimea. */
  function applyLangKeepingScroll(next) {
    const anchors = scrollAnchors();
    applyLang(next); // ascultătorii „langchange” (remăsurări, benzi) rulează sincron aici
    const anchor = anchors.find((a) => a.el.isConnected);
    if (!anchor) return;
    const diff = anchor.el.getBoundingClientRect().top - anchor.top;
    if (Math.abs(diff) < 1) return;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto'; // corecția trebuie să fie instantanee (html are scroll-behavior: smooth)
    window.scrollBy(0, diff);
    root.style.scrollBehavior = prev;
  }

  /** Schimbarea limbii din butoane: cortină animată, textele se schimbă doar când ecranul e acoperit complet. */
  function setLang(next) {
    if (!I18N || !LANGS.includes(next) || next === lang || switching) return;
    saveLang(next);
    const wipe = $('.lang-wipe');
    if (reduceMotion || !wipe) { applyLangKeepingScroll(next); return; }

    switching = true;
    updateSwitcher(next); // indicatorul alunecă imediat, ca feedback
    const label = $('.lang-wipe__text', wipe);
    if (label) label.textContent = next.toUpperCase();
    wipe.classList.remove('is-in', 'is-out');
    void wipe.offsetWidth;
    wipe.classList.add('is-in');

    // Așteptăm sfârșitul tranziției, nu un timp fix: pe un dispozitiv lent ea poate porni cu întârziere
    afterWipe(wipe, WIPE_IN + 300, () => {
      try {
        applyLangKeepingScroll(next);
      } finally {
        // Un cadru cu textele noi (încă sub cortină), apoi cortina iese
        requestAnimationFrame(() => {
          wipe.classList.remove('is-in');
          wipe.classList.add('is-out');
          afterWipe(wipe, WIPE_OUT + 300, () => { wipe.classList.remove('is-out'); switching = false; });
        });
      }
    });
  }

  function initLang() {
    I18N = window.I18N && typeof window.I18N === 'object' ? window.I18N : null;
    // ÎNTÂI salvăm textele originale (înainte de split, marquee, portofoliu etc.)
    captureOriginals();
    lang = resolveLang();
    if (lang !== 'ro') applyLang(lang, true);
    else { root.setAttribute('lang', 'ro'); updateSwitcher('ro'); }

    const sw = $('.lang');
    if (!sw) return;
    if (!I18N) { sw.hidden = true; return; } // fără i18n.js site-ul rămâne doar în română
    $$('.lang__btn', sw).forEach((btn) => btn.addEventListener('click', () => setLang(btn.dataset.lang)));

    live = document.createElement('div');
    live.className = 'sr-only';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
  }

  /** Rulează callback-ul o singură dată când elementul intră în viewport. */
  function onVisible(el, cb, options = {}) {
    if (!('IntersectionObserver' in window)) { cb(el); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { cb(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px', ...options });
    io.observe(el);
  }

  /** Pornește/oprește o animație în funcție de vizibilitatea elementului. */
  function whileVisible(el, start, stop) {
    if (!('IntersectionObserver' in window)) { start(); return; }
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(el);
  }

  /* ---------- Preloader ---------- */
  function initPreloader() {
    const pre = $('.preloader');
    const ready = () => {
      document.body.classList.remove('is-loading');
      root.classList.add('is-ready');
    };
    if (!pre) { ready(); return; }
    if (reduceMotion) { pre.remove(); ready(); return; }

    const bar = $('.preloader__bar span', pre);
    const pct = $('.preloader__pct', pre);
    let loaded = document.readyState === 'complete';
    window.addEventListener('load', () => { loaded = true; });
    const MIN = 1300, MAX = 4500;
    const start = performance.now();
    let shown = 0;

    const tick = (now) => {
      const t = now - start;
      const cap = loaded || t > MAX ? 100 : 90;
      const target = Math.min(t / MIN, 1) * cap;
      shown = Math.min(100, shown + Math.max(0.4, (target - shown) * 0.12));
      if (shown > target) shown = target;
      bar.style.setProperty('--p', (shown / 100).toFixed(3));
      pct.textContent = `${Math.round(shown)}%`;
      if (shown >= 99.9) {
        pre.classList.add('is-done');
        ready();
        setTimeout(() => pre.remove(), 1200);
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Cursor personalizat ---------- */
  function initCursor() {
    const cursor = $('.cursor');
    if (!cursor || !finePointer || reduceMotion) return;
    root.classList.add('has-cursor');
    const dot = $('.cursor__dot', cursor);
    const ring = $('.cursor__ring', cursor);
    const label = $('.cursor__label', cursor);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      cursor.classList.remove('is-out');
    }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-out'));
    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

    document.addEventListener('pointerover', (e) => {
      const target = e.target.closest('[data-cursor], a, button, label, .faq__q, input, textarea, select');
      const text = target && target.dataset.cursor;
      const isField = !!target && target.matches('input, textarea, select');
      cursor.classList.toggle('is-label', !!text);
      cursor.classList.toggle('is-hover', !!target && !text && !isField);
      cursor.classList.toggle('is-text', isField);
      label.textContent = text || '';
    });

    const loop = () => {
      rx = lerp(rx, mx, 0.2); ry = lerp(ry, my, 0.2);
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Header, progres scroll, meniu mobil ---------- */
  function initHeader() {
    const header = $('.header');
    const progress = $('.progress');
    const burger = $('.burger');
    const menu = $('#mobile-menu');
    let lastY = scrollY, ticking = false, menuOpen = false;

    const update = () => {
      const y = scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.setProperty('--scroll', max > 0 ? (y / max).toFixed(4) : 0);
      header.classList.toggle('is-scrolled', y > 20);
      if (!menuOpen) header.classList.toggle('is-hidden', y > lastY && y > 500);
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    const burgerLabel = () => burger.setAttribute('aria-label', t(menuOpen ? 'menu.close' : 'menu.open'));
    burgerLabel();
    onLangChange(burgerLabel);

    const setMenu = (open) => {
      menuOpen = open;
      burger.setAttribute('aria-expanded', String(open));
      burgerLabel();
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) header.classList.remove('is-hidden');
    };
    burger.addEventListener('click', () => setMenu(!menuOpen));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });
    window.addEventListener('resize', () => { if (menuOpen && innerWidth > 900) setMenu(false); });

    // Link activ în navigare
    const links = $$('.nav a');
    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach((s) => io.observe(s));
    }
  }

  /* ---------- Text: split pe cuvinte + scramble ---------- */
  function splitWords(el) {
    let index = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'word';
            const inner = document.createElement('span');
            inner.className = 'word__in';
            inner.style.setProperty('--wi', index++);
            inner.textContent = part;
            word.appendChild(inner);
            frag.appendChild(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
  }

  const GLYPHS = '!#$%&*+-=?@^_/\\|01ABCDEFXYZ';
  const scrambleRuns = new WeakMap(); // element -> id-ul ultimei animații (una nouă o oprește pe cea veche)
  function scramble(el, finalText, frames = 28) {
    const run = (scrambleRuns.get(el) || 0) + 1;
    scrambleRuns.set(el, run);
    if (reduceMotion) { el.textContent = finalText; return Promise.resolve(); }
    const from = el.textContent;
    const length = Math.max(from.length, finalText.length);
    const queue = [];
    for (let i = 0; i < length; i++) {
      const start = Math.floor(Math.random() * (frames * 0.5));
      const end = start + Math.floor(Math.random() * (frames * 0.6)) + 8;
      queue.push({ from: from[i] || '', to: finalText[i] || '', start, end, ch: '' });
    }
    let frame = 0;
    return new Promise((resolve) => {
      const update = () => {
        if (scrambleRuns.get(el) !== run) { resolve(); return; } // a pornit alt scramble pe același element
        let out = '', done = 0;
        for (const q of queue) {
          if (frame >= q.end) { done++; out += esc(q.to); }
          else if (frame >= q.start) {
            if (!q.ch || Math.random() < 0.3) q.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            out += `<span class="glyph">${esc(q.ch)}</span>`;
          } else { out += esc(q.from); }
        }
        el.innerHTML = out;
        if (done === queue.length) resolve();
        else { frame++; requestAnimationFrame(update); }
      };
      update();
    });
  }

  function initText() {
    const splits = $$('[data-split]');
    splits.forEach((el) => {
      splitWords(el);
      onVisible(el, () => el.classList.add('is-in'));
    });

    // Eyebrow-uri: textul final se calculează la momentul afișării, în limba curentă
    const scrambles = $$('[data-scramble]');
    const fixedText = new WeakMap();
    const revealed = new WeakSet();
    const targetText = (el) => {
      const html = el.hasAttribute('data-i18n') ? sourceHTML(el) : null;
      return html != null ? htmlToText(html) : fixedText.get(el);
    };
    scrambles.forEach((el) => {
      fixedText.set(el, el.textContent);
      onVisible(el, () => { revealed.add(el); scramble(el, targetText(el), 34); });
    });

    // Cuvântul rotativ din hero (lista vine din I18N.ui[limbă]['words.hero'])
    const rotator = $('.rotator');
    let restartRotator = null;
    if (rotator) {
      const words = () => listFor(rotator.dataset.words, 'words');
      const first = words()[0];
      if (first) rotator.textContent = first;
      let i = 0, timer = null;
      restartRotator = () => {
        clearInterval(timer);
        timer = null;
        i = 0;
        if (reduceMotion || words().length < 2) return;
        timer = setInterval(() => {
          if (document.hidden) return;
          const list = words();
          if (!list.length) return;
          i = (i + 1) % list.length;
          scramble(rotator, list[i], 30);
        }, 2800);
      };
      restartRotator();
    }

    onLangChange(() => {
      // Titlurile: conținutul nou primit de la applyLang se reîmparte în cuvinte și se reanimă.
      // Cele încă nevăzute rămân ascunse până ajung în viewport (onVisible de mai sus).
      const replay = [];
      splits.forEach((el) => {
        if (el.querySelector('.word')) return; // conținutul nu s-a schimbat
        splitWords(el);
        if (el.classList.contains('is-in')) { el.classList.remove('is-in'); replay.push(el); }
      });
      if (replay.length) {
        void document.body.offsetWidth; // un singur reflow: cuvintele noi pornesc din poziția ascunsă
        requestAnimationFrame(() => replay.forEach((el) => el.classList.add('is-in')));
      }
      // Eyebrow-urile deja afișate trec prin scramble spre noul text; restul așteaptă scroll-ul
      scrambles.forEach((el) => { if (revealed.has(el)) scramble(el, targetText(el), 34); });
      if (rotator) {
        const list = listFor(rotator.dataset.words, 'words');
        if (list.length) scramble(rotator, list[0], 30);
        restartRotator();
      }
    });
  }

  /* ---------- Reveal la scroll + contoare ---------- */
  function initReveal() {
    $$('[data-stagger]').forEach((group) => {
      const step = Number(group.dataset.stagger) || 90;
      Array.from(group.children).forEach((child, i) => child.style.setProperty('--d', i * step));
    });
    $$('.reveal').forEach((el) => onVisible(el, () => el.classList.add('is-in')));

    // Contoare: formatul numerelor urmează limba curentă (1.200 / 1,200)
    const counters = $$('.counter').map((el) => ({ el, target: Number(el.dataset.target) || 0, done: false }));
    counters.forEach((c) => {
      onVisible(c.el, () => {
        if (reduceMotion) { c.el.textContent = fmtNumber(c.target); c.done = true; return; }
        const start = performance.now(), duration = 2200;
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          c.el.textContent = fmtNumber(c.target * eased);
          if (p < 1) requestAnimationFrame(step);
          else c.done = true;
        };
        requestAnimationFrame(step);
      });
    });
    onLangChange(() => counters.forEach((c) => { if (c.done) c.el.textContent = fmtNumber(c.target); }));

    const big = $('[data-letters]');
    if (big) {
      big.innerHTML = Array.from(big.textContent.trim()).map((ch, i) => `<span style="--i:${i}" data-ch="${esc(ch)}">${esc(ch)}</span>`).join('');
      onVisible(big, () => big.classList.add('is-in'), { rootMargin: '0px 0px -5% 0px' });
    }
  }

  /* ---------- Tilt 3D, spotlight, butoane magnetice ---------- */
  function initPointerFx() {
    if (!finePointer) return;
    $$('.card').forEach((card) => {
      const tilt = card.hasAttribute('data-tilt') && !reduceMotion;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--x', `${x * 100}%`);
        card.style.setProperty('--y', `${y * 100}%`);
        if (tilt) card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    if (reduceMotion) return;
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Hero: parallax + editor animat ---------- */
  function initHero() {
    const visual = $('.hero__visual');
    if (!visual) return;
    $$('[data-depth]', visual).forEach((el) => el.style.setProperty('--depth', el.dataset.depth));

    // Parallax la mișcarea mouse-ului
    if (finePointer && !reduceMotion) {
      const hero = $('.hero');
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      const loop = () => {
        cx = lerp(cx, tx, 0.08); cy = lerp(cy, ty, 0.08);
        visual.style.setProperty('--mx', cx.toFixed(4));
        visual.style.setProperty('--my', cy.toFixed(4));
        raf = Math.abs(cx - tx) > 0.0005 || Math.abs(cy - ty) > 0.0005 ? requestAnimationFrame(loop) : null;
      };
      hero.addEventListener('pointermove', (e) => {
        tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
    }

    // Undă audio
    const wave = $('.wave', visual);
    if (wave) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 90; i++) {
        const bar = document.createElement('i');
        const base = 0.25 + Math.abs(Math.sin(i * 0.35)) * 0.45 + Math.random() * 0.3;
        bar.style.setProperty('--s', Math.min(1, base).toFixed(2));
        bar.style.animationDelay = `${(-Math.random() * 1.1).toFixed(2)}s`;
        frag.appendChild(bar);
      }
      wave.appendChild(frag);
    }

    // Subtitrări animate (cuvânt cu cuvânt); la schimbarea limbii bucla repornește cu noile fraze
    const captionLoops = $$('[data-captions]').map((el) => captionLoop(el));
    onLangChange(() => captionLoops.forEach((loop) => loop.restart()));

    // Timeline: playhead, timecode, clipuri active, tăieturi
    const editor = $('.editor', visual);
    const head = $('.playhead-wrap', editor);
    const tc = $('[data-timecode]', editor);
    const screen = $('.screen', editor);
    const pad = (n) => String(n).padStart(2, '0');
    const clips = $$('.clip', editor).map((el) => ({
      el,
      l: parseFloat(el.style.getPropertyValue('--l')),
      w: parseFloat(el.style.getPropertyValue('--w')),
      hue: el.style.getPropertyValue('--ch').trim(),
      main: el.classList.contains('clip--v'),
      active: false
    }));
    const DURATION = 12000;
    let raf = null, offset = 0, startedAt = 0, current = null;

    const frame = (now) => {
      const p = ((now - startedAt + offset) % DURATION) / DURATION;
      const pct = p * 100;
      head.style.transform = `translateX(${pct}%)`;
      const secs = p * 60;
      tc.textContent = `00:00:${pad(Math.floor(secs))}:${pad(Math.floor((secs % 1) * 30))}`;
      for (const c of clips) {
        const on = pct >= c.l && pct < c.l + c.w;
        if (on !== c.active) {
          c.active = on;
          c.el.classList.toggle('is-active', on);
          if (on && c.main && c !== current) {
            current = c;
            screen.style.setProperty('--h', c.hue);
            screen.classList.remove('is-cut');
            void screen.offsetWidth;
            screen.classList.add('is-cut');
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || reduceMotion) return;
      startedAt = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf); raf = null;
      offset += performance.now() - startedAt;
    };
    whileVisible(editor, start, stop);
    if (reduceMotion) head.style.transform = 'translateX(38%)';

    // Comutatoare efecte
    const fx = $$('.fx', editor);
    if (fx.length && !reduceMotion) {
      setInterval(() => {
        if (document.hidden) return;
        fx[Math.floor(Math.random() * fx.length)].classList.toggle('is-on');
      }, 1300);
    }

    // Contoare „live” (formatul numărului urmează limba curentă)
    const views = $('[data-live-views]', visual);
    const likes = $('[data-live-likes]', visual);
    let v = 2481093, l = 248.1;
    const renderViews = () => { if (views) views.textContent = fmtNumber(v); };
    renderViews();
    onLangChange(renderViews);
    if (!reduceMotion) {
      setInterval(() => {
        if (document.hidden) return;
        v += Math.floor(Math.random() * 90) + 12;
        l += Math.random() * 0.25;
        renderViews();
        if (likes) likes.textContent = `${l.toFixed(1)}K`;
      }, 160);
    }
  }

  /**
   * Subtitrări animate cuvânt cu cuvânt. data-captions="editor" -> I18N.ui[limbă]['captions.editor'].
   * Fiecare tură citește lista limbii curente; restart() oprește toate temporizările înainte de a reporni,
   * ca să nu existe niciodată două bucle pe același element.
   */
  function captionLoop(el) {
    let timers = [], i = 0;
    const phrases = () => listFor(el.dataset.captions, 'captions');
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const render = (text) => {
      el.innerHTML = String(text).split(' ').map((w) => {
        const hl = w.startsWith('*');
        return `<span class="w${hl ? ' is-hl' : ''}">${esc(w.replace(/\*/g, ''))}</span>`;
      }).join(' ');
      return $$('.w', el);
    };
    const show = () => {
      clear();
      const list = phrases();
      if (!list.length) { el.innerHTML = ''; return; }
      const words = render(list[i % list.length]);
      if (reduceMotion) { words.forEach((w) => w.classList.add('is-on')); return; }
      words.forEach((w, k) => later(() => w.classList.add('is-on'), 120 + k * 230));
      later(() => {
        el.classList.add('is-out');
        later(() => { el.classList.remove('is-out'); i++; show(); }, 300);
      }, words.length * 230 + 1500);
    };
    show();
    return {
      restart() { clear(); i = 0; el.classList.remove('is-out'); show(); }
    };
  }

  /* ---------- Marquee infinit ---------- */
  function initMarquees() {
    const builders = [];
    $$('[data-marquee]').forEach((track) => {
      const originals = Array.from(track.children);
      const speed = Number(track.dataset.speed) || 50; // px / secundă
      const build = () => {
        Array.from(track.children).forEach((c) => { if (c.dataset.clone) c.remove(); });
        // Setul de bază trebuie să fie mai lat decât ecranul
        let guard = 0;
        while (track.scrollWidth < innerWidth * 1.1 && guard++ < 10) {
          originals.forEach((n) => {
            const c = n.cloneNode(true); c.dataset.clone = '1'; c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
          });
        }
        Array.from(track.children).forEach((n) => {
          const c = n.cloneNode(true); c.dataset.clone = '1'; c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
        });
        track.style.setProperty('--dur', `${(track.scrollWidth / 2 / speed).toFixed(1)}s`);
      };
      build();
      builders.push(build);
      let w = innerWidth;
      window.addEventListener('resize', () => { if (Math.abs(innerWidth - w) > 100) { w = innerWidth; build(); } });
    });
    // Originalele sunt deja traduse de applyLang: refacem copiile și recalculăm durata
    onLangChange(() => builders.forEach((build) => build()));
  }

  /* ---------- Portofoliu ---------- */
  // Texte în limba curentă (titleEn / hookEn din portfolio-data.js, cu revenire la title / hook)
  const catLabel = (cat) => { const v = tRaw(`cat.${cat}`); return typeof v === 'string' ? v : String(cat || ''); };
  const itemTitle = (item) => String((lang === 'en' && item.titleEn) || item.title || '');
  const itemHook = (item) => String((lang === 'en' && item.hookEn) || item.hook || itemTitle(item));
  const itemMetaHTML = (item) => `${esc(item.creator)} <i></i> ${esc(item.views)} ${esc(t('portfolio.views'))}`;

  function artHTML(item) {
    const fmt = item.format === 'vertical' ? 'v' : 'h';
    return `<div class="art art--${fmt}" style="--h:${Number(item.hue) || 265}" aria-hidden="true">
      <div class="art__scene"><span class="art__sun"></span><span class="art__hills"></span></div>
      <div class="art__cam"><span class="avatar"></span></div>
      <div class="art__hook"><span>${esc(itemHook(item))}</span></div>
    </div>`;
  }

  function initPortfolio() {
    const grid = $('#portfolio-grid');
    const data = Array.isArray(window.PORTFOLIO) ? window.PORTFOLIO : [];
    if (!grid) return;

    grid.innerHTML = data.map((item, i) => {
      const vertical = item.format === 'vertical';
      const media = item.thumb ? `<img src="${esc(item.thumb)}" alt="" loading="lazy">` : artHTML(item);
      const preview = item.video ? `<video src="${esc(item.video)}" muted loop playsinline preload="none"></video>` : '';
      return `<article class="work ${vertical ? 'work--v' : 'work--h'} reveal" data-cat="${esc(item.category)}" data-index="${i}" tabindex="0" role="button" aria-label="${esc(t('portfolio.open', { title: itemTitle(item) }))}" data-cursor="PLAY">
        <div class="work__media">
          ${media}${preview}
          <span class="work__shade"></span>
          <span class="work__scan"></span>
          <span class="work__badge">${esc(item.platform)}</span>
          <span class="work__dur">${esc(item.duration)}</span>
          <span class="work__play"><svg class="icon icon--fill"><use href="#i-play"/></svg></span>
        </div>
        <div class="work__info">
          <span class="work__cat">${esc(catLabel(item.category))}</span>
          <h3>${esc(itemTitle(item))}</h3>
          <p>${itemMetaHTML(item)}</p>
        </div>
      </article>`;
    }).join('');

    const cards = $$('.work', grid);

    // La schimbarea limbii actualizăm cardurile existente pe loc (filtrul activ și animațiile rămân)
    const updateCards = () => {
      cards.forEach((card, i) => {
        const item = data[i];
        if (!item) return;
        card.setAttribute('aria-label', t('portfolio.open', { title: itemTitle(item) }));
        const cat = $('.work__cat', card);
        const title = $('.work__info h3', card);
        const meta = $('.work__info p', card);
        const hook = $('.art__hook span', card);
        if (cat) cat.textContent = catLabel(item.category);
        if (title) title.textContent = itemTitle(item);
        if (meta) meta.innerHTML = itemMetaHTML(item);
        if (hook) hook.textContent = itemHook(item);
      });
    };
    cards.forEach((card, i) => {
      card.style.setProperty('--d', (i % 4) * 90);
      onVisible(card, () => card.classList.add('is-in'));
      const open = () => openModal(data[i], card);
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      const video = $('video', card);
      if (video && finePointer) {
        card.addEventListener('pointerenter', () => { video.play().then(() => card.classList.add('is-playing')).catch(() => {}); });
        card.addEventListener('pointerleave', () => { video.pause(); video.currentTime = 0; card.classList.remove('is-playing'); });
      }
    });

    // Filtre
    const filters = $$('.filter');
    const pill = $('.filters__pill');
    const movePill = (btn) => {
      if (!pill || !btn) return;
      pill.style.width = `${btn.offsetWidth}px`;
      pill.style.height = `${btn.offsetHeight}px`;
      pill.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
    };
    const activeBtn = () => filters.find((b) => b.classList.contains('is-active'));
    requestAnimationFrame(() => movePill(activeBtn()));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => movePill(activeBtn()));
    window.addEventListener('resize', () => movePill(activeBtn()));

    onLangChange(() => {
      updateCards();
      // Etichetele filtrelor și-au schimbat lățimea: remăsurăm indicatorul
      movePill(activeBtn());
      requestAnimationFrame(() => movePill(activeBtn()));
    });

    filters.forEach((btn) => btn.addEventListener('click', () => {
      if (btn.classList.contains('is-active')) return;
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      movePill(btn);
      btn.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      const filter = btn.dataset.filter;
      grid.classList.add('is-switching');
      setTimeout(() => {
        let k = 0;
        cards.forEach((card) => {
          const show = filter === 'all' || card.dataset.cat === filter;
          card.hidden = !show;
          card.classList.remove('is-pop');
          if (show) {
            card.classList.add('is-in');
            card.style.setProperty('--d', k++ * 70);
            void card.offsetWidth;
            card.classList.add('is-pop');
          }
        });
        grid.classList.remove('is-switching');
      }, reduceMotion ? 0 : 300);
    }));
  }

  /* ---------- Modal video ---------- */
  const modal = $('#video-modal');
  let lastFocus = null;
  let modalItem = null;

  /** Textele modalului în limba curentă (apelat la deschidere și la schimbarea limbii). */
  function fillModalTexts(item) {
    if (!modal || !item) return;
    const cat = $('.modal__cat', modal);
    const title = $('#modal-title');
    const meta = $('.modal__meta', modal);
    if (cat) cat.textContent = item.category ? catLabel(item.category) : '';
    if (title) title.textContent = itemTitle(item);
    if (meta) meta.textContent = [item.creator, item.views && `${item.views} ${t('portfolio.views')}`, item.duration].filter(Boolean).join(' · ');
    const iframe = $('.modal__media iframe', modal);
    if (iframe) iframe.setAttribute('title', itemTitle(item));
    const hook = $('.modal__media .art__hook span', modal);
    if (hook) hook.textContent = itemHook(item);
    const note = $('.modal__note span', modal);
    if (note) note.textContent = t('modal.demo');
  }

  function openModal(item, trigger) {
    if (!modal || !item) return;
    lastFocus = trigger;
    modalItem = item;
    const dialog = $('.modal__dialog', modal);
    const media = $('.modal__media', modal);
    dialog.classList.toggle('modal__dialog--v', item.format === 'vertical');

    if (item.youtube) {
      const id = encodeURIComponent(item.youtube);
      media.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${esc(itemTitle(item))}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    } else if (item.video) {
      media.innerHTML = `<video src="${esc(item.video)}" controls autoplay playsinline></video>`;
    } else {
      media.innerHTML = `<div class="modal__placeholder">${artHTML(item)}<div class="modal__note"><i></i><span>${esc(t('modal.demo'))}</span></div></div>`;
    }

    fillModalTexts(item);

    const scrollbar = innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('.modal__close', modal).focus(), 50);
  }

  function closeModal() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    setTimeout(() => { $('.modal__media', modal).innerHTML = ''; }, 450);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function initModal() {
    if (!modal) return;
    $$('[data-close]', modal).forEach((el) => el.addEventListener('click', closeModal));
    onLangChange(() => { if (modal.classList.contains('is-open')) fillModalTexts(modalItem); });
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab') {
        const focusables = $$('button, iframe, video, [tabindex]:not([tabindex="-1"])', $('.modal__dialog', modal));
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Înainte / după ---------- */
  function initCompare() {
    const cmp = $('[data-compare]');
    if (!cmp) return;
    const range = $('.compare__range', cmp);
    let intro = null, dragging = false;
    const set = (v) => {
      v = clamp(v, 0, 100);
      cmp.style.setProperty('--pos', `${v}%`);
      range.value = Math.round(v);
    };
    const fromEvent = (e) => {
      const r = cmp.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };
    const stopIntro = () => { if (intro) { cancelAnimationFrame(intro); intro = null; } };

    cmp.addEventListener('pointerdown', (e) => {
      stopIntro();
      dragging = true;
      cmp.classList.add('is-dragging');
      cmp.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    cmp.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
    const end = () => { dragging = false; cmp.classList.remove('is-dragging'); };
    cmp.addEventListener('pointerup', end);
    cmp.addEventListener('pointercancel', end);
    range.addEventListener('input', () => { stopIntro(); set(Number(range.value)); });

    // Demonstrație automată la prima afișare
    if (!reduceMotion) {
      onVisible(cmp, () => {
        const keys = [50, 82, 18, 50];
        const seg = 900;
        const t0 = performance.now() + 500;
        const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const step = (now) => {
          const t = Math.max(0, now - t0);
          const i = Math.min(Math.floor(t / seg), keys.length - 2);
          const local = Math.min(1, (t - i * seg) / seg);
          set(lerp(keys[i], keys[i + 1], ease(local)));
          if (t < seg * (keys.length - 1)) intro = requestAnimationFrame(step);
          else intro = null;
        };
        intro = requestAnimationFrame(step);
      }, { rootMargin: '0px 0px -30% 0px' });
    }
  }

  /* ---------- Proces: scroll orizontal fixat ---------- */
  function initProcess() {
    const section = $('[data-hscroll]');
    if (!section) return;
    const viewport = $('.process__viewport', section);
    const track = $('.process__track', section);
    const bar = $('.process__progress', section);
    const cards = $$('.pcard', section);
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 620px)');
    let enabled = false, distance = 0, ticking = false;

    const measure = () => {
      enabled = mq.matches && !reduceMotion;
      section.classList.toggle('is-pinned', enabled);
      if (!enabled) {
        section.style.height = '';
        track.style.transform = '';
        return;
      }
      distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      section.style.height = `${distance + innerHeight}px`;
      update();
    };

    const update = () => {
      ticking = false;
      if (!enabled) {
        // Pe mobil: cardul din centrul ecranului devine activ
        const mid = innerHeight / 2;
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          c.classList.toggle('is-active', r.top < mid && r.bottom > mid);
        });
        return;
      }
      const rect = section.getBoundingClientRect();
      const p = distance > 0 ? clamp(-rect.top / distance, 0, 1) : 0;
      track.style.transform = `translate3d(${(-p * distance).toFixed(1)}px, 0, 0)`;
      bar.style.setProperty('--p', p.toFixed(4));
      const center = innerWidth / 2;
      let best = null, bestDist = Infinity;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - center);
        if (d < bestDist) { bestDist = d; best = c; }
      });
      cards.forEach((c) => c.classList.toggle('is-active', c === best));
    };

    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    onLangChange(measure); // textele noi pot schimba lățimea pistei
    measure();
  }

  /* ---------- FAQ ---------- */
  function initFaq() {
    const items = $$('.faq__item');
    items.forEach((item) => {
      const btn = $('.faq__q', item);
      btn.addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        items.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            $('.faq__q', other).setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* ---------- Formular de contact ---------- */
  function initForm() {
    const form = $('#contact-form');
    if (!form) return;
    const status = $('.form__status', form);
    const submit = $('.form__submit', form);
    const service = $('#f-service', form);
    const msg = $('#f-msg', form);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let statusKey = '';  // 'form.sent' / 'form.error' — ca mesajul de stare să poată fi tradus
    let prefill = null;  // mesajul completat automat de butoanele de preț: { plan, text }

    const setStatus = (key) => {
      statusKey = key;
      status.textContent = key ? t(key) : '';
      status.classList.toggle('is-error', key === 'form.error');
    };
    // Textul vizibil al serviciului ales (nu valoarea tehnică din value)
    const serviceText = () => {
      const opt = service && service.options[service.selectedIndex];
      return opt ? opt.text.trim() : '';
    };

    // Butoanele din pachetele de preț preselectează „Pachet lunar” și un mesaj
    $$('[data-plan]').forEach((btn) => btn.addEventListener('click', () => {
      if (service) {
        if ($('option[value="monthly"]', service)) service.value = 'monthly';
        else if (service.options.length) service.selectedIndex = service.options.length - 1;
      }
      if (msg && !msg.value) {
        const text = t('form.planMessage', { plan: btn.dataset.plan });
        msg.value = text;
        prefill = { plan: btn.dataset.plan, text };
      }
    }));

    // La schimbarea limbii: ce a scris vizitatorul rămâne; traducem doar mesajele generate de noi
    onLangChange(() => {
      if (statusKey) status.textContent = t(statusKey);
      if (msg && prefill && msg.value === prefill.text) {
        prefill.text = t('form.planMessage', { plan: prefill.plan });
        msg.value = prefill.text;
      }
    });

    const validate = () => {
      let ok = true;
      $$('[required]', form).forEach((input) => {
        const field = input.closest('.field');
        const valid = input.type === 'email' ? emailRe.test(input.value.trim()) : input.value.trim().length > 1;
        field.classList.remove('is-error');
        if (!valid) {
          void field.offsetWidth;
          field.classList.add('is-error');
          ok = false;
        }
      });
      return ok;
    };
    $$('[required]', form).forEach((input) => input.addEventListener('input', () => input.closest('.field').classList.remove('is-error')));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('');
      if (!validate()) {
        const firstError = $('.is-error input, .is-error textarea', form);
        if (firstError) firstError.focus();
        return;
      }
      if ($('.hp', form).value) return; // spam bot

      const data = new FormData(form);
      const endpoint = form.dataset.endpoint;
      const chosen = serviceText() || String(data.get('serviciu') || '');
      // Trimitem eticheta serviciului (ex. „Shorts / TikTok / Reels”), nu valoarea tehnică („shorts”)
      if (chosen) data.set('serviciu', chosen);
      submit.classList.add('is-loading');
      submit.disabled = true;

      try {
        if (endpoint) {
          const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } else {
          // Fără endpoint: deschide clientul de email cu mesajul precompletat (în limba curentă)
          const body = [
            `${t('mail.name')}: ${data.get('nume')}`,
            `${t('mail.email')}: ${data.get('email')}`,
            `${t('mail.channel')}: ${data.get('canal') || '-'}`,
            `${t('mail.service')}: ${chosen}`,
            `${t('mail.budget')}: ${data.get('buget') || '-'}`,
            '',
            data.get('mesaj')
          ].join('\n');
          const subject = t('mail.subject', { service: chosen });
          window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          await new Promise((r) => setTimeout(r, 700));
        }
        form.classList.add('is-sent');
        $('.form__success', form).setAttribute('aria-hidden', 'false');
        setStatus('form.sent');
      } catch (err) {
        setStatus('form.error');
      } finally {
        submit.classList.remove('is-loading');
        submit.disabled = false;
      }
    });

    $('[data-form-reset]', form).addEventListener('click', () => {
      form.reset();
      prefill = null;
      form.classList.remove('is-sent');
      $('.form__success', form).setAttribute('aria-hidden', 'true');
      setStatus('');
    });
  }

  /* ---------- Pornire ---------- */
  function init() {
    initLang(); // primul pas: salvează textele RO și aplică limba de pornire
    fillYear();
    initPreloader();
    initCursor();
    initHeader();
    initText();
    initReveal();
    initPointerFx();
    initHero();
    initMarquees();
    initPortfolio();
    initModal();
    initCompare();
    initProcess();
    initFaq();
    initForm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
