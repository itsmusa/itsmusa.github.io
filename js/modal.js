const projectContentModal = document.getElementById("modal");

const closeModal = () => {
    projectContentModal.classList.remove('active');
    if (projectContentModal.classList.contains('projects')) {
        document.getElementById('modalContent').innerHTML = "";
        console.log("removed content");
    }
}
