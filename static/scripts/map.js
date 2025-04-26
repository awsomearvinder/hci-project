// Toggle the visibility of the dropdown menu
document.getElementById('dropdown-button').addEventListener('click', () => {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
});

// Handle dropdown item clicks
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (event) => {
        const selectedOption = event.target.textContent;
        console.log(`Selected option: ${selectedOption}`);
        alert(`You selected ${selectedOption}`);
        // Add logic here to handle the selected option
    });
});

async function fetchTextFromAPI(themeId) {
    try {
        // Fetch data from the proxy server
        const response = await fetch(`/locations/api/themes/${themeId}`);
        console.log("Response object:", response); // Log the response object
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text(); // Read the response body as text
        console.log("Fetched data:", text); // Log the fetched data

        // Parse the coordinates from the text
        const coordinates = parseCoordinates(text);
        console.log("Parsed Coordinates:", coordinates);

        // Use the coordinates in the map function
        map(coordinates);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById("api-text").textContent = "Failed to load data.";
    }
}

function parseCoordinates(text) {
    console.log("Raw text passed to parseCoordinates:", text); // Log the raw text
    try {
        const geoLocationMatches = text.match(/<GeoLocation>(.*?)<\/GeoLocation>/g);

        if (!geoLocationMatches) {
            console.warn("No GeoLocation data found.");
            return [];
        }

        const coordinates = geoLocationMatches.flatMap(match => {
            const jsonString = match.replace(/<\/?GeoLocation>/g, "");
            try {
                const parsed = JSON.parse(jsonString); // Parse the JSON string
                return parsed.map(coord => ({
                    Lat: parseFloat(coord.Lat),
                    Lng: parseFloat(coord.Lng)
                }));
            } catch (error) {
                console.error("Error parsing GeoLocation JSON:", error);
                return [];
            }
        });

        return coordinates; // Return the array of coordinates
    } catch (error) {
        console.error("Error parsing coordinates:", error);
        return []; // Return an empty array if parsing fails
    }
}

async function map(coordinates) {
    // Initialize the map and set its view to the first coordinate
    var map = L.map('map').setView([44.047962, -91.644795], 17);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Define a custom tree icon
    var treeIcon = L.icon({
        iconUrl: '/images/tree.png',
        iconSize: [32, 32], // Size of the icon
        iconAnchor: [16, 32] // Anchor point of the icon
    });

    // Add markers for each coordinate
    coordinates.forEach(coord => {
        L.marker([coord.Lat, coord.Lng], { icon: treeIcon }).addTo(map);
    });
}
// Toggle the hamburger menu and navigation panel
document.getElementById("hamburger-menu").addEventListener("click", function () {
    const panel = document.getElementById("leftpanel");
    panel.classList.toggle("open");
});

// Close the navigation panel
document.getElementById("close-panel").addEventListener("click", function () {
    const panel = document.getElementById("leftpanel");
    panel.classList.remove("open");
});
// Call the fetchTextFromAPI function when the page loads
window.onload = fetchTextFromAPI(1);