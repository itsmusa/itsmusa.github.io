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
   MOBILE MENU — Keyboard + Focus Trap
   ======================================================================== */
const openBtn = document.getElementById('openMenu');
const closeBtn = document.getElementById('closeMenu');
const navMenu = document.getElementById('navMenu');

function openMenu() {
  navMenu.classList.add('open');
  openBtn.setAttribute('aria-expanded', 'true');
  closeBtn.focus();
}

function closeMenu() {
  navMenu.classList.remove('open');
  openBtn.setAttribute('aria-expanded', 'false');
  openBtn.focus();
}

openBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);

navMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') closeMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    closeMenu();
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
