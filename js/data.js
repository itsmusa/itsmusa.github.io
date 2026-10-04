let projectsPromise = null;
let projectsSnapshot = null;

const SAFE_IMAGE_PATH = /^(https?:\/\/|\/|[A-Za-z0-9._-])/;

function toPositiveInt(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

function sanitizeProject(project) {
  const image = typeof project.image === 'string' && SAFE_IMAGE_PATH.test(project.image)
    ? project.image
    : '';

  return {
    id: project.id ?? null,
    slug: String(project.slug ?? ''),
    title: String(project.title ?? ''),
    description: String(project.description ?? ''),
    readmeUrl: String(project.readmeUrl ?? ''),
    image,
    imageWidth: toPositiveInt(project.imageWidth),
    imageHeight: toPositiveInt(project.imageHeight),
  };
}

export function getProjects() {
  if (!projectsPromise) {
    projectsPromise = fetch('projects.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load projects');
        return res.json();
      })
      .then((projects) => {
        projectsSnapshot = Array.isArray(projects) ? projects.map(sanitizeProject) : [];
        return projectsSnapshot;
      })
      .catch((error) => {
        projectsPromise = null;
        throw error;
      });
  }
  return projectsPromise;
}

/* Synchronous view of the last resolved fetch, for skeletons rendered before
   the real content arrives. Null until the first successful load. */
export function getCachedProjects() {
  return projectsSnapshot;
}