const thumbs = [
  'images/thumb-1.jpg',
  'images/thumb-2.jpg',
  'images/thumb-3.jpg',
  'images/thumb-4.jpg',
];

function pickThumb() {
  return thumbs[Math.floor(Math.random() * thumbs.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function projectCard(p) {
  return `
    <a href="#project/${p.slug}" class="project__card">
      <img src="${pickThumb()}" class="project__image" alt="${p.title}" width="400" height="200" loading="lazy">
      <p class="project__title">${p.title}</p>
      <p class="project__description">${p.description}</p>
    </a>
  `;
}

export default async function home() {
  try {
    const response = await fetch('projects.json');
    const projects = await response.json();

    const cards = shuffle(projects).slice(0, 2).map(projectCard).join('');

    return `
      <main class="view-home">
        <section class="intro wrap" data-reveal>
          <h1>Hi, my name is Msawenkosi</h1>
          <h3>An Electronics and Computer Engineering graduate based in Durban.</h3>
          <p>I build practical electronic and software solutions that solve real problems. I recently completed my BEngTech in Electronics and Computer Engineering, where I worked on projects that mixed hardware, coding, and creative design. I have competed in major hackathons and technical challenges, earning awards along the way.</p>
          <a href="#info" class="btn-pill">More Information <span class="arrow">&rarr;</span></a>
        </section>

        <section class="projects wrap" data-reveal data-reveal-delay="80">
          <h2>Personal Projects</h2>
          <div class="projects__list">
            ${cards}
          </div>
          <a href="#projects" class="btn-pill">More projects <span class="arrow">&rarr;</span></a>
        </section>

        <section class="achievements wrap" data-reveal data-reveal-delay="160">
          <h2>Recent Achievements</h2>
          <ul class="achievements__list">
            <li class="achievement__item">
              <p class="achievement__title">Winner - 2025 SATNAC Huawei Topic</p>
              <p class="achievement__date">November, 2025</p>
            </li>
            <li class="achievement__item">
              <p class="achievement__title">Bronze Medal - 2025 BRICS Competition of Skills Development and Technology Innovation</p>
              <p class="achievement__date">August, 2025</p>
            </li>
            <li class="achievement__item">
              <p class="achievement__title">2nd Place - 2025 JCI Durban Hackathon</p>
              <p class="achievement__date">May, 2025</p>
            </li>
          </ul>
        </section>
      </main>
    `;
  } catch {
    return `<main class="view-home wrap"><p>Failed to load projects. Please refresh.</p></main>`;
  }
}
