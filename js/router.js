// Import view functions
import home from '../views/home.js';
import projects from '../views/projects.js';
import projectDetail from '../views/project-detail.js';
import contact from '../views/contact.js';
import info from '../views/info.js';
import notFound from '../views/404.js';

// Define the routes map
const routes = {
    '': home,
    '#home': home,
    '#projects': projects,
    '#project-detail': projectDetail,
    '#contact': contact,
    '#info': info
};

export async function router() {
    const appContainer = document.getElementById('app');
    const hash = window.location.hash || '';

    // Attempt to find the view. If not found, use the notFound view.
    let viewFunction = routes[hash] ? routes[hash] : notFound;

    // 1. SHOW LOADING ANIMATION
    appContainer.innerHTML = '<div class="loader"></div>';

    // 2. FETCH CONTENT
    // (If it's the 404 page, it loads instantly, but still uses the same logic)
    const content = await viewFunction();

    // 3. RENDER CONTENT
    appContainer.innerHTML = content;

    // 4. TRIGGER FADE ANIMATION
    appContainer.classList.remove('fade-in');
    void appContainer.offsetWidth; 
    appContainer.classList.add('fade-in');
}