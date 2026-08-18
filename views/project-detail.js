export default async function projectDetail() {
    // 1. Retrieve the URL we saved in the projects view
    const readmeUrl = sessionStorage.getItem('currentProjectUrl');

    if (!readmeUrl) {
        return `<h1>No project selected. Go back to <a href="#projects">Projects</a></h1>`;
    }

    try {
        // 2. Fetch the content of the README link
        const response = await fetch(readmeUrl);
        
        if(!response.ok) throw new Error("Failed to fetch README");
        
        const textData = await response.text();

        const htmlContent = marked.parse(textData);

        // 3. Render the content
        // We use <pre> to maintain the formatting of the Markdown text
        return `
            <div class="view-project-detail wrap">
                <div class="readme-content">
                    ${htmlContent}
                </div>
                <a href="#projects" class="btn-pill ltn">Back to Projects <span class="arrow">&larr;</span></a>
            </div>
        `;
    } catch (error) {
        return `<h1>Error loading details</h1><p>${error.message}</p>`;
    }
}