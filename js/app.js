import { router } from './router.js';
import {
  initMeasurement,
  isMeasurementEnabled,
  balanceElement,
  equalizeChips,
  sizePills,
  resetMeasurements,
  releaseMeasurements,
} from './measure.js';
import { learnRouteSkeleton, clearSkeletonCache } from './skeleton.js';

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
   README IMAGE FALLBACK — raw.githubusercontent to jsDelivr
   Project READMEs are rendered to HTML, so an image that fails on the raw
   host (blocked networks, rate limits) retries once against jsDelivr.
   ======================================================================== */
function initReadmeImageFallback() {
  const images = document.querySelectorAll('.readme-content img[data-fallback]');

  images.forEach((img) => {
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';

    img.addEventListener('error', () => {
      const fallback = img.dataset.fallback;
      if (!fallback) return;
      img.removeAttribute('data-fallback');
      img.src = fallback;
    });
  });
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
   PRETEXT MEASUREMENT
   Progressive enhancement only. Every pass below is gated on a successful
   font calibration, and a failure simply leaves the CSS layout untouched.
   ========================================================================== */
function safely(fn) {
  return (...args) => Promise.resolve()
    .then(() => fn(...args))
    .catch(() => {});
}

const runBalance = safely(balanceElement);
const runChips = safely(equalizeChips);
const runPills = safely(sizePills);
const runSkeleton = safely(learnRouteSkeleton);

function enhanceRoute() {
  if (!isMeasurementEnabled()) return;

  resetMeasurements();
  document.querySelectorAll('[data-balance]').forEach((el) => runBalance(el));
  document.querySelectorAll('.skill-card__chips').forEach((list) => runChips(list));
  runPills(document);
}

/* ==========================================================================
   PUBLIC API — View hooks
   Called after every route render to wire up observers on new DOM.
   ======================================================================== */
window.onRouteReady = () => {
  initScrollReveal();
  initLazyImages();
  initReadmeImageFallback();
  enhanceRoute();
  runSkeleton(window.location.hash);
};

/* ==========================================================================
   MEASUREMENT LIFECYCLE — fonts and viewport changes invalidate every
   cached measurement, so recalibrate and re-measure the current route.
   ======================================================================== */
function invalidateMeasurements() {
  if (!isMeasurementEnabled()) return;
  resetMeasurements();
  releaseMeasurements();
  clearSkeletonCache();
  enhanceRoute();
  runSkeleton(window.location.hash);
}

let resizeTimer = null;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(invalidateMeasurements, 200);
});

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    releaseMeasurements();
    invalidateMeasurements();
  });
}

/* Calibration is asynchronous, so the first route may already be on screen
   before measurements are trustworthy. Re-run the passes once they are. */
initMeasurement()
  .then((enabled) => {
    if (!enabled) return;
    enhanceRoute();
    runSkeleton(window.location.hash);
  })
  .catch(() => {});

/* ==========================================================================
   RETRY — Re-runs the current route after a failed README load
   ======================================================================== */
document.addEventListener('click', (event) => {
  const trigger = event.target.closest?.('[data-action="retry"]');
  if (!trigger) return;

  event.preventDefault();
  router();
});

/* ==========================================================================
   ROUTING
   ======================================================================== */
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
