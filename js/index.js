const about = document.querySelector('[data-link]');

about.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
});

const openModal = () => {
    projectContentModal.classList.add('active');
}
