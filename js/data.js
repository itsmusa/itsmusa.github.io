let projectsPromise = null;
let projectsSnapshot = null;

function sanitizeProject(project) {
  return {
    id: project.id ?? null,
    slug: String(project.slug ?? ''),
    title: String(project.title ?? ''),
    description: String(project.description ?? ''),
    readmeUrl: String(project.readmeUrl ?? ''),
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