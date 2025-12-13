export default function contact() {
    return `
        <div class="view-contact wrap">
            <h1>Contact</h1>

            <div class="line"></div>
            
            <p class="contact-intro">If you'd like to get in touch, you can reach me using the following methods.</p>

            <ul class="contact-list">
                <li class="contact-item">
                    <p class="contact-title">Github</p>
                    <p class="contact-desc">Github/itsmusa</p>
                </li>
                <li class="contact-item">
                    <p class="contact-title">LinkedIn</p>
                    <p class="contact-desc">in/musamagwaza23</p>
                </li>
            </ul>
<!--
            <form class="contact-form" id="contact-form">
                <div class="field">
                    <input type="email" name="email" placeholder="Email" required />
                </div>

                <div class="field">
                    <textarea name="message" rows="7" placeholder="Message" required></textarea>
                </div>

                <div class="field recaptcha">
                    <div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>
                </div>

                <button type="submit" class="btn-pill">Send message</button>
            </form>
-->
        </div>
    `;
}
