import { router } from './router.js';

/* ==========================================================================
   INTERSECTION OBSERVER — Scroll Reveal
   Elements with [data-reveal] animate in when they enter the viewport.
   ======================================================================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, Number(delay));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

/* ==========================================================================
   INTERSECTION OBSERVER — Lazy Images
   Swaps data-src to src on images with class="lazy-image".
   ======================================================================== */
function initLazyImages() {
  const images = document.querySelectorAll('img.lazy-image');
  if (!images.length) return;

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.remove('lazy-image');
          imageObserver.unobserve(img);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: '200px 0px',
    }
  );

  images.forEach((img) => imageObserver.observe(img));
}

/* ==========================================================================
   SKIP LINK
   Moves focus to the main region without writing to the hash (which the
   router would otherwise interpret as a route).
   ======================================================================== */
const skipLink = document.querySelector('.skip-link');

if (skipLink) {
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    const app = document.getElementById('app');
    if (!app) return;
    app.setAttribute('tabindex', '-1');
    app.focus();
    app.scrollIntoView({ block: 'start' });
  });
}

/* ==========================================================================
   FOOTER — Keep the copyright year current
   ======================================================================== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ==========================================================================
   MOBILE MENU — Keyboard + Focus Trap + Scroll Lock
   ======================================================================== */
const openBtn = document.getElementById('openMenu');
const closeBtn = document.getElementById('closeMenu');
const navMenu = document.getElementById('navMenu');

/* Below this width the menu is an overlay and must be hidden from focus and
   assistive tech while closed. Above it, the menu is always available. */
const mobileMenuQuery = window.matchMedia('(max-width: 639.98px)');

function syncMenuInert() {
  if (mobileMenuQuery.matches && !navMenu.classList.contains('open')) {
    navMenu.setAttribute('inert', '');
  } else {
    navMenu.removeAttribute('inert');
  }
}

function openMenu() {
  navMenu.classList.add('open');
  navMenu.removeAttribute('inert');
  document.body.classList.add('menu-open');
  openBtn.setAttribute('aria-expanded', 'true');
  closeBtn.focus();
}

function closeMenu() {
  navMenu.classList.remove('open');
  document.body.classList.remove('menu-open');
  openBtn.setAttribute('aria-expanded', 'false');
  syncMenuInert();
  openBtn.focus();
}

syncMenuInert();

mobileMenuQuery.addEventListener('change', () => {
  navMenu.classList.remove('open');
  document.body.classList.remove('menu-open');
  openBtn.setAttribute('aria-expanded', 'false');
  syncMenuInert();
});

openBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);

navMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') closeMenu();
});

document.addEventListener('keydown', (e) => {
  if (!navMenu.classList.contains('open')) return;

  if (e.key === 'Escape') {
    closeMenu();
    return;
  }

  if (e.key !== 'Tab') return;

  const focusable = Array.from(
    navMenu.querySelectorAll('a[href], button:not([disabled])')
  );
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* ==========================================================================
   PUBLIC API — View hooks
   Called after every route render to wire up observers on new DOM.
   ======================================================================== */
window.onRouteReady = () => {
  initScrollReveal();
  initLazyImages();
};

/* ==========================================================================
   ROUTING
   ======================================================================== */
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
