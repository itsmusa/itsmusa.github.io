import home from '../views/home.js';
import projects from '../views/projects.js';
import projectDetail from '../views/project-detail.js';
import contact from '../views/contact.js';
import info from '../views/info.js';
import notFound from '../views/404.js';
import { getMeasuredSkeleton } from './skeleton.js';

const SITE_NAME = 'Msawenkosi Magwaza';

const routes = [
  { pattern: /^#?$/, view: home, title: 'Home' },
  { pattern: /^#home$/, view: home, title: 'Home' },
  { pattern: /^#projects$/, view: projects, title: 'Projects' },
  { pattern: /^#project\/(.+)$/, view: projectDetail, paramNames: ['slug'], title: 'Project' },
  { pattern: /^#contact$/, view: contact, title: 'Contact' },
  { pattern: /^#info$/, view: info, title: 'Information' },
];

const skeletons = {
  '#projects': `
    <div class="view-projects wrap">
      <div class="skeleton skeleton--heading"></div>
      <div class="skeleton skeleton--text" style="width:30%"></div>
      <div style="margin-top:2rem">
        <div class="skeleton skeleton--block" style="margin-bottom:1rem"></div>
        <div class="skeleton skeleton--block" style="margin-bottom:1rem"></div>
      </div>
    </div>
  `,
  '#project': `
    <div class="view-project-detail wrap">
      <div class="skeleton skeleton--heading"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text" style="width:80%"></div>
      <div class="skeleton skeleton--text" style="width:90%"></div>
      <div class="skeleton skeleton--text" style="width:60%"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text" style="width:70%"></div>
    </div>
  `,
};

function getSkeletonHTML(hash) {
  const measured = getMeasuredSkeleton(hash);
  if (measured) return measured;
  if (skeletons[hash]) return skeletons[hash];
  if (hash.startsWith('#project/')) return skeletons['#project'];
  return `
    <div class="wrap" style="padding-top:3rem">
      <div class="skeleton skeleton--heading"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text" style="width:80%"></div>
      <div class="skeleton skeleton--text" style="width:65%"></div>
      <div style="margin-top:1.5rem">
        <div class="skeleton skeleton--card"></div>
      </div>
    </div>
  `;
}

/* Marks the nav link matching the current route, if it appears in the menu. */
function updateActiveNav(hash) {
  let current = hash === '' || hash === '#' ? '#home' : hash;
  if (current.startsWith('#project/')) current = '#projects';

  document.querySelectorAll('.nav__menu li a').forEach((link) => {
    if (link.getAttribute('href') === current) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

/* Announces route changes to assistive tech via the live region. */
function announce(message) {
  const region = document.getElementById('routeAnnouncer');
  if (region) region.textContent = message;
}

export async function router() {
  const appContainer = document.getElementById('app');
  const hash = window.location.hash || '';

  let viewFn = notFound;
  let params = {};
  let title = 'Page not found';

  for (const route of routes) {
    const match = hash.match(route.pattern);
    if (match) {
      viewFn = route.view;
      title = route.title || SITE_NAME;
      if (route.paramNames) {
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
      }
      break;
    }
  }

  updateActiveNav(hash);

  appContainer.setAttribute('aria-busy', 'true');
  appContainer.classList.add('is-entering');
  appContainer.classList.remove('is-visible');

  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  appContainer.innerHTML = getSkeletonHTML(hash);

  const content = await viewFn(params);

  appContainer.innerHTML = content;
  appContainer.setAttribute('aria-busy', 'false');

  const headingMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const heading = headingMatch
    ? headingMatch[1].replace(/<[^>]+>/g, '').trim()
    : '';

  if (title === 'Home') {
    document.title = `${SITE_NAME} — Electronics & Computer Engineer`;
    announce('Home page loaded');
  } else if (heading) {
    document.title = `${heading} — ${SITE_NAME}`;
    announce(`${heading} page loaded`);
  } else {
    document.title = `${title} — ${SITE_NAME}`;
    announce(`${title} page loaded`);
  }

  requestAnimationFrame(() => {
    appContainer.classList.remove('is-entering');
    requestAnimationFrame(() => {
      appContainer.classList.add('is-visible');
      if (typeof window.onRouteReady === 'function') {
        window.onRouteReady();
      }
    });
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
}
