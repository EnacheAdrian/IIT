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

    const setMenu = (open) => {
      menuOpen = open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
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
  function scramble(el, finalText, frames = 28) {
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
    $$('[data-split]').forEach((el) => {
      splitWords(el);
      onVisible(el, () => el.classList.add('is-in'));
    });
    $$('[data-scramble]').forEach((el) => {
      const text = el.textContent;
      onVisible(el, () => scramble(el, text, 34));
    });

    // Cuvântul rotativ din hero
    const rotator = $('.rotator');
    if (rotator && !reduceMotion) {
      let words = [];
      try { words = JSON.parse(rotator.dataset.words); } catch (e) { words = []; }
      let i = 0;
      if (words.length > 1) {
        setInterval(() => {
          if (document.hidden) return;
          i = (i + 1) % words.length;
          scramble(rotator, words[i], 30);
        }, 2800);
      }
    }
  }

  /* ---------- Reveal la scroll + contoare ---------- */
  function initReveal() {
    $$('[data-stagger]').forEach((group) => {
      const step = Number(group.dataset.stagger) || 90;
      Array.from(group.children).forEach((child, i) => child.style.setProperty('--d', i * step));
    });
    $$('.reveal').forEach((el) => onVisible(el, () => el.classList.add('is-in')));

    $$('.counter').forEach((el) => {
      onVisible(el, () => {
        const target = Number(el.dataset.target) || 0;
        const fmt = (v) => Math.round(v).toLocaleString('ro-RO');
        if (reduceMotion) { el.textContent = fmt(target); return; }
        const start = performance.now(), duration = 2200;
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          el.textContent = fmt(target * eased);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    });

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

    // Subtitrări animate (cuvânt cu cuvânt)
    $$('[data-captions]').forEach((el) => captionLoop(el));

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

    // Contoare „live”
    const views = $('[data-live-views]', visual);
    const likes = $('[data-live-likes]', visual);
    if (!reduceMotion) {
      let v = 2481093, l = 248.1;
      setInterval(() => {
        if (document.hidden) return;
        v += Math.floor(Math.random() * 90) + 12;
        l += Math.random() * 0.25;
        if (views) views.textContent = v.toLocaleString('ro-RO');
        if (likes) likes.textContent = `${l.toFixed(1)}K`;
      }, 160);
    }
  }

  function captionLoop(el) {
    let phrases = [];
    try { phrases = JSON.parse(el.dataset.captions); } catch (e) { return; }
    if (!phrases.length) return;
    const render = (text) => {
      el.innerHTML = text.split(' ').map((w) => {
        const hl = w.startsWith('*');
        return `<span class="w${hl ? ' is-hl' : ''}">${esc(w.replace(/\*/g, ''))}</span>`;
      }).join(' ');
      return $$('.w', el);
    };
    if (reduceMotion) {
      render(phrases[0]).forEach((w) => w.classList.add('is-on'));
      return;
    }
    let i = 0;
    const show = () => {
      const words = render(phrases[i % phrases.length]);
      words.forEach((w, k) => setTimeout(() => w.classList.add('is-on'), 120 + k * 230));
      setTimeout(() => {
        el.classList.add('is-out');
        setTimeout(() => { el.classList.remove('is-out'); i++; show(); }, 300);
      }, words.length * 230 + 1500);
    };
    show();
  }

  /* ---------- Marquee infinit ---------- */
  function initMarquees() {
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
      let w = innerWidth;
      window.addEventListener('resize', () => { if (Math.abs(innerWidth - w) > 100) { w = innerWidth; build(); } });
    });
  }

  /* ---------- Portofoliu ---------- */
  const CATEGORIES = { shorts: 'Shorts & TikTok', highlights: 'Highlights', compilatii: 'Compilații', youtube: 'Montaj YouTube' };

  function artHTML(item) {
    const fmt = item.format === 'vertical' ? 'v' : 'h';
    return `<div class="art art--${fmt}" style="--h:${Number(item.hue) || 265}" aria-hidden="true">
      <div class="art__scene"><span class="art__sun"></span><span class="art__hills"></span></div>
      <div class="art__cam"><span class="avatar"></span></div>
      <div class="art__hook"><span>${esc(item.hook || item.title)}</span></div>
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
      return `<article class="work ${vertical ? 'work--v' : 'work--h'} reveal" data-cat="${esc(item.category)}" data-index="${i}" tabindex="0" role="button" aria-label="Deschide clipul: ${esc(item.title)}" data-cursor="PLAY">
        <div class="work__media">
          ${media}${preview}
          <span class="work__shade"></span>
          <span class="work__scan"></span>
          <span class="work__badge">${esc(item.platform)}</span>
          <span class="work__dur">${esc(item.duration)}</span>
          <span class="work__play"><svg class="icon icon--fill"><use href="#i-play"/></svg></span>
        </div>
        <div class="work__info">
          <span class="work__cat">${esc(CATEGORIES[item.category] || item.category)}</span>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.creator)} <i></i> ${esc(item.views)} vizualizări</p>
        </div>
      </article>`;
    }).join('');

    const cards = $$('.work', grid);
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
      pill.style.width = `${btn.offsetWidth}px`;
      pill.style.height = `${btn.offsetHeight}px`;
      pill.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
    };
    const activeBtn = () => filters.find((b) => b.classList.contains('is-active'));
    requestAnimationFrame(() => movePill(activeBtn()));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => movePill(activeBtn()));
    window.addEventListener('resize', () => movePill(activeBtn()));

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

  function openModal(item, trigger) {
    if (!modal || !item) return;
    lastFocus = trigger;
    const dialog = $('.modal__dialog', modal);
    const media = $('.modal__media', modal);
    dialog.classList.toggle('modal__dialog--v', item.format === 'vertical');

    if (item.youtube) {
      const id = encodeURIComponent(item.youtube);
      media.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${esc(item.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    } else if (item.video) {
      media.innerHTML = `<video src="${esc(item.video)}" controls autoplay playsinline></video>`;
    } else {
      media.innerHTML = `<div class="modal__placeholder">${artHTML(item)}<div class="modal__note"><i></i>Clip demonstrativ</div></div>`;
    }

    $('.modal__cat', modal).textContent = CATEGORIES[item.category] || item.category || '';
    $('#modal-title').textContent = item.title || '';
    $('.modal__meta', modal).textContent = [item.creator, item.views && `${item.views} vizualizări`, item.duration].filter(Boolean).join(' · ');

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
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Butoanele din pachetele de preț preselectează un mesaj
    $$('[data-plan]').forEach((btn) => btn.addEventListener('click', () => {
      service.value = 'Pachet lunar';
      const msg = $('#f-msg', form);
      if (!msg.value) msg.value = `Bună! Sunt interesat de pachetul ${btn.dataset.plan}.`;
    }));

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
      status.textContent = '';
      status.classList.remove('is-error');
      if (!validate()) {
        const firstError = $('.is-error input, .is-error textarea', form);
        if (firstError) firstError.focus();
        return;
      }
      if ($('.hp', form).value) return; // spam bot

      const data = new FormData(form);
      const endpoint = form.dataset.endpoint;
      submit.classList.add('is-loading');
      submit.disabled = true;

      try {
        if (endpoint) {
          const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } else {
          // Fără endpoint: deschide clientul de email cu mesajul precompletat
          const body = [
            `Nume: ${data.get('nume')}`,
            `Email: ${data.get('email')}`,
            `Canal: ${data.get('canal') || '-'}`,
            `Serviciu: ${data.get('serviciu')}`,
            `Buget: ${data.get('buget') || '-'}`,
            '',
            data.get('mesaj')
          ].join('\n');
          const subject = `Cerere ofertă — ${data.get('serviciu')}`;
          window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          await new Promise((r) => setTimeout(r, 700));
        }
        form.classList.add('is-sent');
        $('.form__success', form).setAttribute('aria-hidden', 'false');
        status.textContent = 'Mesajul a fost trimis.';
      } catch (err) {
        status.textContent = 'Ceva n-a mers. Încearcă din nou sau scrie-ne direct pe email.';
        status.classList.add('is-error');
      } finally {
        submit.classList.remove('is-loading');
        submit.disabled = false;
      }
    });

    $('[data-form-reset]', form).addEventListener('click', () => {
      form.reset();
      form.classList.remove('is-sent');
      $('.form__success', form).setAttribute('aria-hidden', 'true');
      status.textContent = '';
    });
  }

  /* ---------- Pornire ---------- */
  function init() {
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
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
