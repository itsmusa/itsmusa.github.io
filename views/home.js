import { getProjects } from '../js/data.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function projectCard(p) {
  const image = p.image
    ? `<img src="${p.image}" class="project__image" alt="" width="${p.imageWidth}" height="${p.imageHeight}" loading="lazy" decoding="async">`
    : '';
  return `
    <a href="#project/${p.slug}" class="project__card" aria-label="View ${p.title}">
      ${image}
      <p class="project__title">${p.title}</p>
      <p class="project__description">${p.description}</p>
    </a>
  `;
}

export default async function home() {
  try {
    const projects = await getProjects();

    const cards = shuffle(projects).slice(0, 2).map(projectCard).join('');

    return `
      <div class="view-home">
        <section class="intro wrap" data-reveal>
          <h1>Hi, my name is Msawenkosi</h1>
          <h3>Electronics, embedded software, and a habit of finishing what I start.</h3>
          <p>I am drawn to the moment an idea stops being abstract and starts working. My BEngTech in Electronics and Computer Engineering was built around that moment, and every competition since has pushed me toward a harder version of it.</p>
          <a href="#info" class="btn-pill">More Information <span class="arrow">&rarr;</span></a>
        </section>

        <section class="projects wrap" data-reveal data-reveal-delay="80">
          <h2>Personal Projects</h2>
          <div class="projects__list">
            ${cards}
          </div>
          <a href="#projects" class="btn-pill">More projects <span class="arrow">&rarr;</span></a>
        </section>

        <section class="achievements wrap" data-reveal data-reveal-delay="160">
          <h2>Recent Achievements</h2>
          <ul class="achievements__list">
            <li class="achievement__item">
              <p class="achievement__title">Winner - 2026 TCS Sustainathon South Africa</p>
              <p class="achievement__date">September, 2026</p>
            </li>
            <li class="achievement__item">
              <p class="achievement__title">Winner - 2025 SATNAC Huawei Topic</p>
              <p class="achievement__date">November, 2025</p>
            </li>
            <li class="achievement__item">
              <p class="achievement__title">Bronze Medal - 2025 BRICS Competition of Skills Development and Technology Innovation</p>
              <p class="achievement__date">August, 2025</p>
            </li>
            <li class="achievement__item">
              <p class="achievement__title">2nd Place - 2025 JCI Durban Hackathon</p>
              <p class="achievement__date">May, 2025</p>
            </li>
          </ul>
        </section>
      </div>
    `;
  } catch {
    return `<div class="view-home wrap"><p>Failed to load projects. Please refresh.</p></div>`;
  }
}
