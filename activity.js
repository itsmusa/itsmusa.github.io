// const fetch = require("node-fetch");
const fs = require("fs");

// Replace 'octocat' with the desired GitHub username
const username = "itsmusa";
const apiUrl = `https://api.github.com/users/${username}/events`;

async function getEvents() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const events = await response.json();

        const formattedEvents = events.map(event => {
            const createdAt = new Date(event.created_at);
            const dateTime = `${String(createdAt.getDate()).padStart(2, '0')}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${createdAt.getFullYear()} | ${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}:${String(createdAt.getSeconds()).padStart(2, '0')}`;

            return {
                type: event.type,
                repo: event.repo.name,
                created: dateTime
            };
        });

        fs.writeFileSync("events.json", JSON.stringify(formattedEvents, null, 2), "utf-8");
    } catch (error) {
        console.error("Failed to fetch events:", error.message);
    }
}

// Fetch and log GitHub events
getEvents();
