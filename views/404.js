export default function notFound() {
    return `
        <div class="view-404">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>Oops! The page you are looking for does not exist.</p>
            <p>
                <a href="#home">Return to Home</a>
            </p>
            
            <!-- Comment Placeholder -->
            <div class="comments-section">
                <!-- Future 404 error logging or comments -->
            </div>
        </div>
    `;
}