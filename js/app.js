import { router } from './router.js';

// Contact form
document.addEventListener('submit', async (e) => {
    console.log("hello")
    const form = e.target;
    if (form && form.id === 'contact-form') {
        e.preventDefault();

        try {
            const res = await fetch('YOUR_APPS_SCRIPT_URL', {
                method: 'POST',
                body: new FormData(form)
            });

            const text = await res.text();

            if (text === 'ok') {
                form.reset();
                if (window.grecaptcha) grecaptcha.reset();
                alert('Message sent');
            } else {
                alert('Failed to send message');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to send message');
        }
    }
});

// Menu

const openMenu = document.getElementById('openMenu')
const closeMenu = document.getElementById('closeMenu')
const navMenu = document.getElementById('navMenu')

openMenu.addEventListener('click', () => {
    console.log('open')
    navMenu.classList.add('open')
    console.log(navMenu.classList)
})
closeMenu.addEventListener('click', () => {
    console.log("close")
    navMenu.classList.remove('open')
    console.log(navMenu.classList)
})

navMenu.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        navMenu.classList.remove('open')
    }
})

// Listen for hash changes (clicking links)
window.addEventListener('hashchange', router);

// Load the correct view when the page first loads
window.addEventListener('load', router);

