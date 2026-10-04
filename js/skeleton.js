import { getCachedProjects } from './data.js';
import { isMeasurementEnabled, measureLines } from './measure.js';

const VIEWPORT_TOLERANCE = 48;
const cache = new Map();

function routeKey(hash) {
  if (!hash || hash === '#' || hash === '#home') return '#home';
  if (hash === '#projects') return '#projects';
  return null;
}

function lineHeightOf(el) {
  const cs = getComputedStyle(el);
  const parsed = parseFloat(cs.lineHeight);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return (parseFloat(cs.fontSize) || 16) * 1.2;
}

/* Turns a list of laid-out elements into skeleton bar specs, keeping the real
   box heights and the gaps between them so the placeholder matches the final
   layout instead of guessing at it. */
function captureBars(elements) {
  let previousBottom = null;

  return elements
    .filter(Boolean)
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const marginTop = previousBottom === null ? 0 : Math.max(0, rect.top - previousBottom);
      previousBottom = rect.bottom;

      return {
        height: rect.height,
        width: rect.width,
        marginTop,
        radius: getComputedStyle(el).borderRadius,
      };
    });
}

function renderBars(bars) {
  return bars
    .map((bar) => {
      const style = [`height:${Math.round(bar.height)}px`, `width:${Math.round(bar.width)}px`];
      if (bar.marginTop > 0.5) style.push(`margin-top:${Math.round(bar.marginTop)}px`);
      if (bar.radius) style.push(`border-radius:${bar.radius}`);
      return `<div class="skeleton" style="${style.join(';')}"></div>`;
    })
    .join('');
}

async function predictHeights(projects, titleProbe, descProbe, width, clamp) {
  const titleLineHeight = lineHeightOf(titleProbe);
  const descLineHeight = lineHeightOf(descProbe);

  return Promise.all(
    projects.map(async (project) => {
      const titleLines = await measureLines(project.title, titleProbe, width);
      const descLines = Math.min(
        clamp,
        await measureLines(project.description, descProbe, width)
      );

      return {
        title: titleLines * titleLineHeight,
        desc: descLines * descLineHeight,
      };
    })
  );
}

function cardTemplate(entry, heights) {
  const list = heights
    .slice(0, 2)
    .map((height) => {
      const bars = [
        { height: entry.imageHeight, width: entry.contentWidth, marginTop: 0, radius: '1rem' },
        { height: height.title, width: entry.titleWidth, marginTop: entry.gapImageToTitle, radius: '' },
        { height: height.desc, width: entry.contentWidth, marginTop: entry.gapTitleToDesc, radius: '' },
      ];
      return `<div class="project__card" data-skeleton aria-hidden="true">${renderBars(bars)}</div>`;
    })
    .join('');

  return `<div class="projects__list">${list}</div>`;
}

function itemTemplate(entry, heights) {
  return heights
    .map((height) => {
      const bars = [
        { height: height.title, width: entry.titleWidth, marginTop: 0, radius: '' },
        { height: height.desc, width: entry.contentWidth, marginTop: entry.gapTitleToDesc, radius: '' },
        { height: entry.pillHeight, width: entry.pillWidth, marginTop: entry.gapDescToPill, radius: '999px' },
      ];
      return `<div class="project-item" data-skeleton aria-hidden="true">${renderBars(bars)}</div>`;
    })
    .join('');
}

function widest(heights, key) {
  return Math.max(...heights.map((height) => height[key]));
}

async function learnHome(root) {
  const intro = root.querySelector('.intro');
  const projectsSection = root.querySelector('.projects');
  const achievements = root.querySelector('.achievements');
  const card = root.querySelector('.project__card');
  const titleProbe = root.querySelector('.project__card .project__title');
  const descProbe = root.querySelector('.project__card .project__description');

  if (!intro || !projectsSection || !card || !titleProbe || !descProbe) return null;

  const introBars = captureBars([
    intro.querySelector('h1'),
    intro.querySelector('h3'),
    intro.querySelector('p'),
    intro.querySelector('.btn-pill'),
  ]);
  const headingBars = captureBars([projectsSection.querySelector('h2')]);
  const achievementsBars = achievements
    ? captureBars([
        achievements.querySelector('h2'),
        ...achievements.querySelectorAll('.achievement__item'),
      ])
    : [];

  const cardCs = getComputedStyle(card);
  const contentWidth =
    card.clientWidth - parseFloat(cardCs.paddingLeft) - parseFloat(cardCs.paddingRight);
  if (!(contentWidth > 0)) return null;

  const titleRect = titleProbe.getBoundingClientRect();
  const descRect = descProbe.getBoundingClientRect();
  const image = card.querySelector('img.project__image');
  const imageRect = image ? image.getBoundingClientRect() : null;

  const projects = getCachedProjects();
  if (!projects || !projects.length) return null;

  const predicted = await predictHeights(projects, titleProbe, descProbe, contentWidth, 2);
  const imageHeight = Math.max(
    ...projects.map((project) =>
      project.imageWidth && project.imageHeight
        ? (contentWidth * project.imageHeight) / project.imageWidth
        : 0
    ),
    imageRect ? imageRect.height : 0
  );

  const titleWidth = Math.min(titleRect.width || contentWidth, contentWidth);
  const heights = [0, 1].map(() => ({
    title: widest(predicted, 'title'),
    desc: widest(predicted, 'desc'),
  }));

  return {
    viewport: window.innerWidth,
    html: `
      <div class="view-home">
        <section class="intro wrap">${renderBars(introBars)}</section>
        <section class="projects wrap">
          ${renderBars(headingBars)}
          ${cardTemplate(
            {
              imageHeight,
              contentWidth,
              titleWidth,
              gapImageToTitle: imageRect ? Math.max(0, titleRect.top - imageRect.bottom) : 0,
              gapTitleToDesc: Math.max(0, descRect.top - titleRect.bottom),
            },
            heights
          )}
        </section>
        ${
          achievements
            ? `<section class="achievements wrap">${renderBars(achievementsBars)}</section>`
            : ''
        }
      </div>
    `,
  };
}

async function learnProjects(root) {
  const view = root.querySelector('.view-projects');
  const container = view && view.querySelector('.projects-container');
  const titleProbe = root.querySelector('.project-item .project__title');
  const descProbe = root.querySelector('.project-item .project__description');
  const pill = root.querySelector('.project-item .btn-pill');

  if (!view || !container || !titleProbe || !descProbe) return null;

  const headingBars = captureBars([view.querySelector('h1')]);
  const contentWidth = container.clientWidth;
  if (!(contentWidth > 0)) return null;

  const titleRect = titleProbe.getBoundingClientRect();
  const descRect = descProbe.getBoundingClientRect();
  const pillRect = pill ? pill.getBoundingClientRect() : null;

  const projects = getCachedProjects();
  if (!projects || !projects.length) return null;

  const heights = await predictHeights(projects, titleProbe, descProbe, contentWidth, 2);
  const titleWidth = Math.min(titleRect.width || contentWidth, contentWidth);

  return {
    viewport: window.innerWidth,
    html: `
      <div class="view-projects wrap">
        ${renderBars(headingBars)}
        <div class="projects-container">
          ${itemTemplate(
            {
              contentWidth,
              titleWidth,
              pillHeight: pillRect ? pillRect.height : 44,
              pillWidth: pillRect ? pillRect.width : 120,
              gapTitleToDesc: Math.max(0, descRect.top - titleRect.bottom),
              gapDescToPill: pillRect ? Math.max(0, pillRect.top - descRect.bottom) : 0,
            },
            heights
          )}
        </div>
      </div>
    `,
  };
}

export async function learnRouteSkeleton(hash) {
  if (!isMeasurementEnabled()) return;

  const key = routeKey(hash);
  if (!key) return;

  const root = document.getElementById('app');
  if (!root) return;

  try {
    const entry = key === '#home' ? await learnHome(root) : await learnProjects(root);
    if (entry && entry.html) cache.set(key, entry);
  } catch {
    /* fall back to the static skeleton */
  }
}

export function getMeasuredSkeleton(hash) {
  const key = routeKey(hash);
  if (!key) return null;

  const entry = cache.get(key);
  if (!entry) return null;
  if (Math.abs(window.innerWidth - entry.viewport) > VIEWPORT_TOLERANCE) return null;

  return entry.html;
}

export function clearSkeletonCache() {
  cache.clear();
}
