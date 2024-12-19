const cardList = document.getElementById("card-list");
cardList.innerHTML = "";
let projects = [];

fetch("../projects.json").then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}).then(data => {
    sessionStorage.setItem("projectsArray", JSON.stringify(data));
}).catch(error => {
    console.error("Error: ", error)
});

projects = JSON.parse(sessionStorage.getItem("projectsArray") || "[]");

let listProjects = () => {
    projects.forEach(project => {
        let projectLi = document.createElement("li");
        projectLi.classList.add('fs-500');
        
        projectLi.innerHTML = `
        <a href="${project["link"]}" class="link fc-100">${project["title"]}</a>
        `;

        cardList.appendChild(projectLi);
    })
}
listProjects();
