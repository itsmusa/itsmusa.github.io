const cardList = document.getElementById("card-list");
const projectContentModal = document.getElementById("modal");

let projectContentContainer = document.getElementById('modalContent');
let projectLinks = [];
let projects = [];

import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

fetch("../projects.json").then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}).then(data => {
    sessionStorage.setItem("projectsArray", JSON.stringify(data));
    projects = data;
    listProjects();
    preventLinkDefault();
}).catch(error => {
    console.error("Error: ", error)
});

projects = JSON.parse(sessionStorage.getItem("projectsArray") || "[]");

const listProjects = () => {
    cardList.innerHTML = "";
    projects.forEach(project => {
        let projectLi = document.createElement("li");
        projectLi.classList.add('link', 'fw-400', 'fs-400');

        projectLi.innerHTML = `
        <a href="${project["link"]}" class="fc-100" data-link>${project["title"]}</a>
        `;

        cardList.appendChild(projectLi);
    })
    projectLinks = document.querySelectorAll('[data-link]') || [];
}

const preventLinkDefault = () => {
    projectLinks.forEach(link => {
        link.addEventListener("click", a => {
            a.preventDefault();
            openModal();
            fillContent(a.target.href);
        })
    });
}

const openModal = () => {
    projectContentModal.classList.add('active');
}

async function fillContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error fetching file data');
        const markdown = await response.text();

        const htmlContent = marked.parse(markdown);

        projectContentContainer.innerHTML = htmlContent;
    } catch (error) {
        console.error(error);
    }
}
