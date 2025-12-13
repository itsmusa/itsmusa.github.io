export default function home() {
    return `
        <main class="view-home">
            <section class="intro wrap">
                <h1>Hi, my name is Msawenkosi</h1>
                <h3>A hybrid Electronics and Computer Engineering graduate based in Durban.</h3>
                <p>I build practical electronic and software solutions that solve real problems. I recently completed my BEngTech in Electronics and Computer Engineering, where I worked on projects that mixed hardware, coding, and creative design. I have competed in major hackathons and technical challenges, earning awards along the way.</p>
                <a href="#info" class="btn-pill">More Information <span class="arrow">&rarr;</span></a>
            </section>

            <section class="projects wrap">
                <h2 class="">Personal Projects</h2>
                <div class="projects__list">
                    <button onclick="window.loadProjectDetail('https://raw.githubusercontent.com/itsmusa/IoT-Ventilation-Control-System/main/README.md')" class="project__card">
                        <img src="../images/interface.png" class="project__image">
                        <p class="project__title">IoT Ventilation System</p>
                        <p class="project__description">A smart system to control air pressure and quality.</p>
                    </button>
                    <button onclick="window.loadProjectDetail('https://raw.githubusercontent.com/itsmusa/IoT-Ventilation-Control-System/main/README.md')" class="project__card">
                        <img src="../images/interface.png" class="project__image">
                        <p class="project__title">IoT Ventilation System</p>
                        <p class="project__description">A smart system to control air pressure and quality.</p>
                    </button>
                </div>
                <a href="#projects" class="btn-pill">More projects <span class="arrow">&rarr;</span></a>
            </section>

            <section class="achievements wrap">
                <h2>Recent Achievements</h2>
                <ul class="achievements__list">
                    <li>
                        <p class="achievement__title">Winner - 2025 SATNAC Huawei Topic</p>
                        <p class="achievement__date">Novermber, 2025</p>
                    </li>
                    <li>
                        <p class="achievement__title">Winner - 2025 SATNAC Huawei Topic</p>
                        <p class="achievement__date">Novermber, 2025</p>
                    </li>
                    <li>
                        <p class="achievement__title">Winner - 2025 SATNAC Huawei Topic</p>
                        <p class="achievement__date">Novermber, 2025</p>
                    </li>
                </ul>
            </section>
        </main>
    `;
}

// Global helper to handle the click (since module functions aren't global)
window.loadProjectDetail = (url) => {
    // Save the specific URL to Session Storage so the Detail view can read it
    sessionStorage.setItem('currentProjectUrl', url);
    // Navigate to the detail view
    window.location.hash = '#project-detail';
};
