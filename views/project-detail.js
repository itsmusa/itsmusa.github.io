import { getProjects } from '../js/data.js';
import { getReadme } from '../js/readme.js';
import { escapeHtml } from '../js/util.js';

function notFoundView() {
  return `
    <div class="view-project-detail wrap" data-reveal>
      <a href="#projects" class="back-link">&larr; Back to Projects</a>
      <h1>Project not found</h1>
      <p>That project does not exist or may have been removed.</p>
    </div>`;
}

function errorView(title, body) {
  return `
    <div class="view-project-detail wrap" data-reveal>
      <a href="#projects" class="back-link">&larr; Back to Projects</a>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(body)}</p>
      <button type="button" class="btn-pill" data-action="retry">Try again <span class="arrow">&rarr;</span></button>
    </div>`;
}

export default async function projectDetail({ slug }) {
  try {
    const projects = await getProjects();
    const project = projects.find((p) => p.slug === slug);

    if (!project) return notFoundView();

    const { content, toc } = await getReadme(project.readmeUrl);

    return `
      <div class="view-project-detail wrap">
        <header class="project-detail__header" data-reveal>
          <h1>${escapeHtml(project.title)}</h1>
        </header>
        <div class="line"></div>
        ${toc}
        <div class="readme-content">${content}</div>
      </div>
    `;
  } catch (error) {
    if (error && error.status === 404) {
      return errorView(
        'README not found',
        "This project's README could not be found in its repository."
      );
    }

    return errorView(
      'Could not load details',
      'The project README could not be fetched or rendered. Check your connection, then try again.'
    );
  }
}