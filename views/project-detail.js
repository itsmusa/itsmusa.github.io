let projectsCache = null;

async function getProjects() {
  if (projectsCache) return projectsCache;
  const res = await fetch('projects.json');
  if (!res.ok) throw new Error('Failed to load projects');
  projectsCache = await res.json();
  return projectsCache;
}

let markedPromise = null;

function loadMarked() {
  if (markedPromise) return markedPromise;
  markedPromise = new Promise((resolve) => {
    if (window.marked) { resolve(window.marked); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/marked@4/marked.min.js';
    s.onload = () => resolve(window.marked || null);
    s.onerror = () => {
      const alt = document.createElement('script');
      alt.src = 'https://unpkg.com/marked@4/marked.min.js';
      alt.onload = () => resolve(window.marked || null);
      alt.onerror = () => resolve(null);
      document.head.appendChild(alt);
    };
    document.head.appendChild(s);
  });
  return markedPromise;
}

function fixRelativeUrls(html, readmeUrl) {
  const base = readmeUrl.substring(0, readmeUrl.lastIndexOf('/') + 1);
  return html
    .replace(/(<img[^>]+src=")(?!https?:\/\/|\/\/|#|data:)([^"]+)"/g, (_, prefix, src) =>
      prefix + base + src.replace(/^\.\//, ''))
    .replace(/(<a[^>]+href=")(?!https?:\/\/|\/\/|#|data:)([^"]+)"/g, (_, prefix, href) =>
      prefix + base + href.replace(/^\.\//, ''));
}

/* The README usually opens with its own <h1>, which would duplicate the
   title we render in the project header. Drop that first heading. */
function stripLeadingHeading(html) {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');
}

export default async function projectDetail({ slug }) {
  try {
    const [projects, marked] = await Promise.all([
      getProjects(),
      loadMarked(),
    ]);

    const project = projects.find(p => p.slug === slug);

    if (!project) {
      return `
        <div class="view-project-detail wrap" data-reveal>
          <a href="#projects" class="back-link">&larr; Back to Projects</a>
          <h1>Project not found.</h1>
          <p>That project does not exist or may have been removed.</p>
        </div>`;
    }

    const response = await fetch(project.readmeUrl);
    if (!response.ok) throw new Error('Failed to fetch README');

    const textData = await response.text();
    let htmlContent = marked ? marked.parse(textData) : textData;
    htmlContent = stripLeadingHeading(htmlContent);
    htmlContent = fixRelativeUrls(htmlContent, project.readmeUrl);

    return `
      <div class="view-project-detail wrap">
        <a href="#projects" class="back-link">&larr; Back to Projects</a>
        <header class="project-detail__header" data-reveal>
          <h1>${project.title}</h1>
          <p class="project-detail__lead">${project.description}</p>
        </header>
        <div class="line"></div>
        <div class="readme-content">${htmlContent}</div>
        <div class="project-detail__footer">
          <a href="#projects" class="btn-pill ltn">&larr; Back to Projects</a>
        </div>
      </div>
    `;
  } catch (error) {
    return `
      <div class="view-project-detail wrap" data-reveal>
        <a href="#projects" class="back-link">&larr; Back to Projects</a>
        <h1>Error loading details</h1>
        <p>${error.message}</p>
      </div>`;
  }
}
