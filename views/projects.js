import { getProjects } from '../js/data.js';

export default async function projects() {
  try {
    const data = await getProjects();

    const listHtml = data
      .map(
        (project) => `
      <div class="project-item" data-reveal>
        <h3 class="project__title">${project.title}</h3>
        <p class="project__description">${project.description}</p>
        <a href="#project/${project.slug}" class="btn-pill ltn">
          View Details <span class="arrow">&rarr;</span>
        </a>
      </div>
    `
      )
      .join('');

    return `
      <div class="view-projects wrap">
        <h1 data-reveal>Projects</h1>
        <div class="line"></div>
        <div class="projects-container">
          ${listHtml}
        </div>
      </div>
    `;
  } catch {
    return `<h1>Error loading projects.</h1>`;
  }
}
