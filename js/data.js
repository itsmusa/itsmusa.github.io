let projectsPromise = null;

export function getProjects() {
  if (!projectsPromise) {
    projectsPromise = fetch('projects.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load projects');
        return res.json();
      })
      .catch((error) => {
        projectsPromise = null;
        throw error;
      });
  }
  return projectsPromise;
}
