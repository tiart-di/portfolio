// Diana Tiart — Portfolio
// Staggered entrance per AI-RULES §7 (MOT-01). Each page's above-the-fold
// group — marked .is-page-hero (home hero, Work page intro, etc.) — fires
// on load; later sections get the same class via IntersectionObserver as
// they're built out. Shared across all pages via <script src="script.js">.

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Above-the-fold on this page — animate it in immediately.
  const pageHeroes = document.querySelectorAll('.rise-group.is-page-hero');
  if (pageHeroes.length) {
    requestAnimationFrame(() => pageHeroes.forEach((el) => el.classList.add('is-in')));
  }

  // Any other .rise-group further down the page animates in on scroll.
  // threshold is low (not e.g. 0.3) because a couple of .rise-group
  // sections (case-study feature blocks with several stacked screenshots)
  // can run taller than any real viewport — a percentage-of-target
  // threshold that high would never be satisfiable for those, leaving
  // them at opacity:0 forever. A low threshold still waits for a
  // meaningful sliver to be visible, but works regardless of height.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.rise-group:not(.is-page-hero)').forEach((el) => {
    if (reduceMotion) {
      el.classList.add('is-in');
    } else {
      observer.observe(el);
    }
  });

  // Case-study side TOC (case-page only) — scroll-spy + smooth scroll.
  const toc = document.querySelector('.case-toc');
  if (toc) {
    const links = Array.from(toc.querySelectorAll('.case-toc__link'));
    const sections = links
      .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);

    const setActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    };

    const tocObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sections.forEach((section) => tocObserver.observe(section));

    // Fallback for the last section: if it's short and sits right at the
    // end of the page, the scroll distance can run out before it ever
    // passes through the IntersectionObserver's mid-viewport band above —
    // so force it active once the page is scrolled to (near) the bottom.
    const activateLastAtBottom = () => {
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      if (atBottom && sections.length) {
        setActive(sections[sections.length - 1].id);
      }
    };
    window.addEventListener('scroll', activateLastAtBottom, { passive: true });

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (target) {
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });

    if (sections[0]) setActive(sections[0].id);
  }

  // Dark band (case-page only): while a [data-dark-section] sits across the
  // middle of the viewport, the whole page background eases to navy so the
  // light product screens inside it stop blending into a white page.
  const darkSection = document.querySelector('[data-dark-section]');
  if (darkSection) {
    const updateDark = () => {
      const r = darkSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const on = r.top < vh * 0.55 && r.bottom > vh * 0.45;
      document.body.classList.toggle('is-dark-bg', on);
    };
    window.addEventListener('scroll', updateDark, { passive: true });
    window.addEventListener('resize', updateDark);
    updateDark();
  }

  // Before/after compare slider (Feature 01 media, case-page only).
  document.querySelectorAll('.case-compare').forEach((compare) => {
    const range = compare.querySelector('.case-compare__range');
    const after = compare.querySelector('.case-compare__panel--after');
    const line = compare.querySelector('.case-compare__handle-line');
    const grip = compare.querySelector('.case-compare__handle-grip');
    if (!range || !after) return;

    const update = () => {
      const pct = range.value;
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      if (line) line.style.left = `${pct}%`;
      if (grip) grip.style.left = `${pct}%`;
    };

    range.addEventListener('input', update);
    update();
  });

  // Mini task board (About page) — drag-to-reorder cards between columns.
  // Pointer Events rather than native HTML5 drag/drop so this also works
  // on touch, not just desktop mouse. Purely a client-side UI demo: state
  // lives only in the DOM and resets on reload, nothing is saved.
  const board = document.getElementById('mini-board');
  if (board) {
    const lists = Array.from(board.querySelectorAll('.mini-board__list'));

    // A card is crossed out exactly while it sits in the Done column, so
    // dragging it in strikes it through and dragging it out restores it.
    const syncDone = () => {
      board.querySelectorAll('.mini-board__col').forEach((col) => {
        const isDone = col.classList.contains('mini-board__col--done');
        col.querySelectorAll('.mini-board__card').forEach((c) => {
          c.classList.toggle('mini-board__card--done', isDone);
        });
      });
    };

    const updateCounts = () => {
      board.querySelectorAll('.mini-board__col').forEach((col) => {
        const list = col.querySelector('.mini-board__list');
        const countEl = col.querySelector('.mini-board__count');
        if (list && countEl) countEl.textContent = list.children.length;
      });
      syncDone();
    };

    // Returns the card in `list` that the dragged card should be inserted
    // before, based on vertical position — or null to append at the end.
    const cardAfterPoint = (list, y) => {
      const cards = Array.from(list.querySelectorAll('.mini-board__card:not(.is-dragging)'));
      return cards.reduce((closest, card) => {
        const box = card.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: card };
        }
        return closest;
      }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    };

    board.querySelectorAll('.mini-board__card').forEach((card) => {
      card.addEventListener('pointerdown', (e) => {
        // Only the primary mouse button, or any touch/pen contact.
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        card.classList.add('is-dragging');
        card.style.pointerEvents = 'none'; // so elementFromPoint sees what's underneath

        // Listeners go on `document`, not the card itself: setPointerCapture
        // on the card seemed like the obvious choice, but Chromium silently
        // drops capture the moment the captured element gets reparented
        // (which insertBefore/appendChild below does on every move) —
        // leaving the drag "stuck" after the first reorder. Global
        // listeners don't care where the card lives in the tree, so this
        // works no matter how many times it moves.
        const onMove = (ev) => {
          const target = document.elementFromPoint(ev.clientX, ev.clientY);
          const targetList = target && target.closest('.mini-board__list');
          if (!targetList || !lists.includes(targetList)) return;
          const after = cardAfterPoint(targetList, ev.clientY);
          if (after) {
            targetList.insertBefore(card, after);
          } else {
            targetList.appendChild(card);
          }
          syncDone();
        };

        const onUp = () => {
          card.classList.remove('is-dragging');
          card.style.pointerEvents = '';
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
          document.removeEventListener('pointercancel', onUp);
          updateCounts();
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
      });
    });
  }
});

/* About: "Outside of work" slider, arrows scroll by roughly one screen of photos */
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.life__track');
  if (!track) return;
  const btns = document.querySelectorAll('.life__btn');
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    btns.forEach((b) => { b.disabled = b.dataset.dir === '-1' ? track.scrollLeft <= 2 : track.scrollLeft >= max; });
  };
  btns.forEach((b) => b.addEventListener('click', () => {
    track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.8 });
  }));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { track.scrollBy({ left: track.clientWidth * 0.5 }); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { track.scrollBy({ left: -track.clientWidth * 0.5 }); e.preventDefault(); }
  });
  window.addEventListener('resize', update);
  /* Photos are lazy and have no fixed width, so the track only reaches its real
     width after they load. Re-check on every image load, on page load and on any size change. */
  track.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', update, { once: true });
  });
  window.addEventListener('load', update);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(update);
    ro.observe(track);
    track.querySelectorAll('.life__item').forEach((it) => ro.observe(it));
  }
  update();
});

/* Mobile menu: on phones the four links collapse into a burger. The bar is built here so every
   page gets it without touching each file's markup. */
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.querySelector('.nav-wrap');
  const nav = wrap && wrap.querySelector('.pill-nav');
  if (!wrap || !nav) return;
  nav.id = nav.id || 'site-nav';

  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  bar.innerHTML =
    '<a class="nav-brand" href="/"><img src="assets/menu-star.png?v=3" alt="" width="24" height="24"><span>Diana Tiart</span></a>' +
    '<button type="button" class="nav-burger" aria-expanded="false" aria-controls="' + nav.id + '" aria-label="Open menu">' +
    '<span class="nav-burger__line"></span><span class="nav-burger__line"></span></button>';
  wrap.insertBefore(bar, nav);
  wrap.classList.add('has-burger'); // the desktop links are only hidden on phones once this bar exists

  const btn = bar.querySelector('.nav-burger');
  const mq = window.matchMedia('(max-width: 720px)');
  const setOpen = (open) => {
    wrap.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  btn.addEventListener('click', () => setOpen(!wrap.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  const onChange = () => { if (!mq.matches) setOpen(false); };
  if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
});

/* home Work reel: restart the iOS clip every time its slide comes back, so the whole flow plays while it's visible */
(function () {
  var slide = document.querySelector('.bento__slide--3');
  var v = slide && slide.querySelector('video');
  if (!v) return;
  var restart = function () { try { v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} };
  slide.addEventListener('animationstart', restart);
  slide.addEventListener('animationiteration', restart);
})();
