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

export default async function projectDetail({ slug }) {
  try {
    const [projects, marked] = await Promise.all([
      getProjects(),
      loadMarked(),
    ]);

    const project = projects.find(p => p.slug === slug);

    if (!project) {
      return `<main class="view-project-detail wrap" data-reveal><h1>Project not found.</h1><p><a href="#projects">Back to Projects</a></p></main>`;
    }

    const response = await fetch(project.readmeUrl);
    if (!response.ok) throw new Error('Failed to fetch README');

    const textData = await response.text();
    let htmlContent = marked ? marked.parse(textData) : textData;
    htmlContent = fixRelativeUrls(htmlContent, project.readmeUrl);

    return `
      <main class="view-project-detail wrap">
        <div class="readme-content">${htmlContent}</div>
        <div style="margin-top: 2rem;">
          <a href="#projects" class="btn-pill ltn">Back to Projects <span class="arrow">&larr;</span></a>
        </div>
      </main>
    `;
  } catch (error) {
    return `<main class="view-project-detail wrap" data-reveal><h1>Error loading details</h1><p>${error.message}</p></main>`;
  }
}
