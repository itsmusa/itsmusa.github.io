import home from '../views/home.js';
import projects from '../views/projects.js';
import projectDetail from '../views/project-detail.js';
import contact from '../views/contact.js';
import info from '../views/info.js';
import notFound from '../views/404.js';

const routes = [
  { pattern: /^#?$/, view: home },
  { pattern: /^#home$/, view: home },
  { pattern: /^#projects$/, view: projects },
  { pattern: /^#project\/(.+)$/, view: projectDetail, paramNames: ['slug'] },
  { pattern: /^#contact$/, view: contact },
  { pattern: /^#info$/, view: info },
];

const skeletons = {
  '#projects': `
    <main class="view-projects wrap">
      <div class="skeleton skeleton--heading"></div>
      <div class="skeleton skeleton--text" style="width:30%"></div>
      <div style="margin-top:2rem">
        <div class="skeleton skeleton--block" style="margin-bottom:1rem"></div>
        <div class="skeleton skeleton--block" style="margin-bottom:1rem"></div>
      </div>
    </main>
  `,
  '#project': `
    <main class="view-project-detail wrap">
      <div class="skeleton skeleton--heading"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text" style="width:80%"></div>
      <div class="skeleton skeleton--text" style="width:90%"></div>
      <div class="skeleton skeleton--text" style="width:60%"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text" style="width:70%"></div>
    </main>
  `,
};

function getSkeletonHTML(hash) {
  if (skeletons[hash]) return skeletons[hash];
  if (hash.startsWith('#project/')) return skeletons['#project'];
  return `
    <main class="wrap" style="padding-top:3rem">
      <div class="skeleton skeleton--heading"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text" style="width:80%"></div>
      <div class="skeleton skeleton--text" style="width:65%"></div>
      <div style="margin-top:1.5rem">
        <div class="skeleton skeleton--card"></div>
      </div>
    </main>
  `;
}

export async function router() {
  const appContainer = document.getElementById('app');
  const hash = window.location.hash || '';

  let viewFn = notFound;
  let params = {};

  for (const route of routes) {
    const match = hash.match(route.pattern);
    if (match) {
      viewFn = route.view;
      if (route.paramNames) {
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
      }
      break;
    }
  }

  appContainer.classList.add('is-entering');
  appContainer.classList.remove('is-visible');

  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  appContainer.innerHTML = getSkeletonHTML(hash);

  const content = await viewFn(params);

  appContainer.innerHTML = content;

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
