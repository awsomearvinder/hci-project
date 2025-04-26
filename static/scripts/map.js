// Toggle the visibility of the dropdown menu
document.getElementById('dropdown-button').addEventListener('click', () => {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
});

// Add event listeners to dropdown items
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        const themeId = event.target.getAttribute('data-theme-id'); // Get the themeId from the data attribute
        console.log(`Fetching data for themeId: ${themeId}`); // Log the selected themeId
        fetchTextFromAPI(themeId); // Call the function with the selected themeId
    });
});

// Initialize the map and a layer group for markers
let mapInstance;
let markersLayer;

function initializeMap() {
    // Create the map instance if it doesn't exist
    if (!mapInstance) {
        mapInstance = L.map('map').setView([44.047962, -91.644795], 17);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        // Initialize the markers layer
        markersLayer = L.layerGroup().addTo(mapInstance);
    }
}

function updateMap(coordinates) {
    // Clear existing markers
    markersLayer.clearLayers();

    // Define a custom tree icon
    const treeIcon = L.icon({
        iconUrl: '/images/tree.png',
        iconSize: [32, 32], // Size of the icon
        iconAnchor: [16, 32] // Anchor point of the icon
    });

    // Add new markers for the updated coordinates
    coordinates.forEach(coord => {
        L.marker([coord.Lat, coord.Lng], { icon: treeIcon }).addTo(markersLayer);
    });
}

// Add event listeners to dropdown items
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        const themeId = event.target.getAttribute('data-theme-id'); // Get the themeId from the data attribute
        console.log(`Fetching data for themeId: ${themeId}`); // Log the selected themeId
        fetchTextFromAPI(themeId); // Call the function with the selected themeId
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

        // Update the map with the new coordinates
        updateMap(coordinates);
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


// Initialize the map when the page loads
window.onload = initializeMap;