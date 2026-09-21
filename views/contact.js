export default function contact() {
  return `
    <div class="view-contact wrap">
      <h1 data-reveal>Contact</h1>
      <div class="line"></div>

      <p class="contact-intro" data-reveal data-reveal-delay="40">If you'd like to get in touch, you can reach me using the following methods.</p>

      <ul class="contact-list" data-reveal data-reveal-delay="80">
        <li class="contact-item">
          <h2 class="contact-title">GitHub</h2>
          <a href="https://github.com/itsmusa" class="contact-desc" target="_blank" rel="noopener noreferrer">GitHub/itsmusa</a>
        </li>
        <li class="contact-item">
          <h2 class="contact-title">LinkedIn</h2>
          <a href="https://www.linkedin.com/in/musamagwaza23/" class="contact-desc" target="_blank" rel="noopener noreferrer">in/musamagwaza23</a>
        </li>
      </ul>
    </div>
  `;
}
