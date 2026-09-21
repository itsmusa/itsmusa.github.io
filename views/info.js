export default function info() {
  return `
    <div class="view-info wrap">
      <section class="info" data-reveal>
        <h1>Information</h1>
        <div class="line"></div>
        <p>I work across electronics and software, with a BEngTech in Electronics and Computer Engineering from the Durban University of Technology. I have been taking things apart since I was young, and at some point I learned to put them back together better. I like problems that do not sit neatly in one field, and I am happiest building systems that mix hardware, code, and design.</p>
        <p>I spent part of my studies tutoring at DUT, first in Computer Programming and later in Electronics Circuit Design 2B. Explaining technical ideas to other people sharpened how I think about them myself, and it taught me to be patient with problems that do not click the first time.</p>
        <p>In 2026 my team, Still Lazy Tech, won the national TCS Sustainathon South Africa, placing first out of 65 submissions from more than 40 institutions. I also won the Huawei topic at SATNAC 2025 and took a bronze medal at the 2025 BRICS Skills Competition.</p>
        <p>My first hackathon was the JCI Durban event, and we placed second. It was the first time I watched something I had helped build stand up against others, and I have been chasing that feeling since.</p>
        <p>Outside engineering I do graphic design and build websites, which keeps me thinking about how things look and feel, not just whether they work.</p>
        <p>I am open to opportunities where I can build useful products, keep learning, and work with people who enjoy practical, creative problem solving. If you would like to work together or build your own portfolio website, feel free to reach out to me <strong><a href="#contact">here</a></strong>.</p>
      </section>

      <section class="skills" data-reveal data-reveal-delay="80">
        <h2>Skills</h2>
        <div class="skills__grid">
          <div class="skill-card">
            <div class="skill-card__header">
              <div class="skill-card__icon skill-card__icon--black" aria-hidden="true">E</div>
              <h3 class="skill-card__title">Engineering</h3>
            </div>
            <ul class="skill-card__chips">
              <li class="skill-chip">Python</li>
              <li class="skill-chip">IoT</li>
              <li class="skill-chip">Embedded Systems</li>
              <li class="skill-chip">C/C++</li>
            </ul>
          </div>

          <div class="skill-card">
            <div class="skill-card__header">
              <div class="skill-card__icon skill-card__icon--zinc" aria-hidden="true">D</div>
              <h3 class="skill-card__title">Design</h3>
            </div>
            <ul class="skill-card__chips">
              <li class="skill-chip">Figma</li>
              <li class="skill-chip">Inkscape</li>
              <li class="skill-chip">UI/UX</li>
              <li class="skill-chip">Typography</li>
            </ul>
          </div>

          <div class="skill-card">
            <div class="skill-card__header">
              <div class="skill-card__icon skill-card__icon--gray" aria-hidden="true">T</div>
              <h3 class="skill-card__title">Tools</h3>
            </div>
            <ul class="skill-card__chips">
              <li class="skill-chip">Git</li>
              <li class="skill-chip">VS Code</li>
              <li class="skill-chip">Oscilloscopes</li>
              <li class="skill-chip">Linux</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  `;
}
