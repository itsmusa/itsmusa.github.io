export default async function projects() {
    try {
        // 1. Fetch the projects list from the JSON file
        const response = await fetch('projects.json');
        const data = await response.json();

        // 2. Build the HTML string for the list
        let listHtml = data.map(project => `
            <div class="project-item">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <!-- We add a button that triggers a function to save the URL and navigate -->
                <button onclick="window.loadProjectDetail('${project.readmeUrl}')">
                    View Project Details
                </button>
                <hr>
            </div>
        `).join('');

        return `
            <div class="view-projects">
                <h1>Projects List</h1>
                <div class="projects-container">
                    ${listHtml}
                </div>
                <div class="comments-section">
                    <!-- Future project list comments -->
                </div>
            </div>
        `;
    } catch (error) {
        return `<h1>Error loading projects.</h1><p>${error.message}</p>`;
    }
}

// Global helper to handle the click (since module functions aren't global)
window.loadProjectDetail = (url) => {
    // Save the specific URL to Session Storage so the Detail view can read it
    sessionStorage.setItem('currentProjectUrl', url);
    // Navigate to the detail view
    window.location.hash = '#project-detail';
};
