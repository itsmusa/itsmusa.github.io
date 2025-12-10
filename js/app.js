import { router } from './router.js';

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