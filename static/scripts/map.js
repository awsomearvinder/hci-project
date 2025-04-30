const map = initializeMap();

function initializeMap() {
    // Create the map instance if it doesn't exist
    let map = L.map('map').setView([44.047962, -91.644795], 17);
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    return map;
}

let markers = [];
async function updateMapFromAPI(themeId) {
    try {
        // Fetch data from the proxy server
        const response = await fetch(`/locations/api/themes/${themeId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text(); // Read the response body as text

        // Parse the coordinates from the text
        const entity = deserializeEntities(text);

        // Update the map with the new coordinates
        markers = updateMap(entity, "trees-svgrepo-com.svg", markers);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById("api-text").textContent = "Failed to load data.";
    }
}

function deserializeEntities(text) {
    let parser = new DOMParser();
    let xmlParser = parser.parseFromString(text, "text/xml");
    let entities = Array.from(xmlParser.getElementsByTagName("ThemeEntityAbridgedData"));
    entities = entities.map((entity) => {
        let imagePath = entity.getElementsByTagName("DefaultImagePath")[0].textContent;
        let name = entity.getElementsByTagName("DisplayName")[0].textContent;
        let id = entity.getElementsByTagName("EntityId")[0].textContent;
        let location = entity.getElementsByTagName("GeoLocation")[0].textContent;
        return {
            imagePath: imagePath,
            name: name,
            id: id,
            location: location,
        };
    });

    return entities;
}

//we cant do this without making A LOT if api calls to the arboretum (1 call per icon, some tours have 100+)
//I don't want to make the WSU IT team/arbortum mad, so this is what we would do if able
function determineIcon(entity) {
    console.log(entity)
    for (let i = 0; i < entity.length; i++) {

        const attributeName = entity[i].getElementsByTagName('AttributeName')[i].textContent;
        //check for unique attributes in each entity, if match, return icon path
        if (attributeName === 'Bark') {
            return "trees-svgrepo-com"
        }
        else if (attributeName === 'Attracts Birds') {
            return "grass-svgrepo-com"
        }
        else if (attributeName === 'Sun Exposure') {
            return "flower-svgrepo-com"
        }
    }
    return "trees-svgrepo-com"
}

function updateMap(entities, iconType, markers) {
    // Initialize the map and set its view to the first coordinate

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Define a custom tree icon
    var treeIcon = L.icon({
        iconUrl: `images/${iconType}`,
        iconSize: [32, 32], // Size of the icon
        iconAnchor: [16, 32] // Anchor point of the icon
    });

    markers.forEach(entity => {
        map.removeLayer(entity);
    });


    let new_markers = [];
    // Add markers for each coordinate
    entities.forEach(entity => {
        if (entity.location.trim() == "") return;
        let locs = JSON.parse(entity.location);
        for (const loc of locs) {
            let marker = L.marker([loc.Lat, loc.Lng], { icon: treeIcon });
            marker.on('click', (_) => setTreeInfo(entity));
            new_markers.push(marker);
            map.addLayer(marker);
            marker.icon = "images/" + iconType
        }
    });
    return new_markers;
}

async function setTreeInfo(entity) {
    const view = document.getElementById("mobile-view");
    view.style.display = "block";
    const treeNameElement = document.getElementById("tree-name");
    const treeImageElement = document.getElementById("tree-image");
    const treeImageContainer = document.getElementById('tree-image-container');
    const treeImageLink = treeImageElement.parentElement;

    const treeDataResp = await fetch('/locations/api/entities/' + entity.id);
    const treeData = await treeDataResp.text();
    const parser = new DOMParser();
    const treeXML = parser.parseFromString(treeData, "text/xml");

    treeImageElement.src = entity.imagePath;
    treeNameElement.textContent = entity.name;
    treeImageElement.style.display = 'block';
    treeImageContainer.style.display = 'block';
    treeImageLink.href = "https://www2.winona.edu/m/arboretum/about.asp?e=" + entity.id;

}

// Toggle the visibility of the dropdown menu
document.getElementById('dropdown-button').addEventListener('click', () => {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'flex' : 'none';
});

// Add event listeners to dropdown items
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        const themeId = event.target.getAttribute('data-theme-id'); // Get the themeId from the data attribute
        updateMapFromAPI(themeId); // Call the function with the selected themeId
    });
});

// Add event listeners to dropdown items
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        const themeId = event.target.getAttribute('data-theme-id'); // Get the themeId from the data attribute
        updateMapFromAPI(themeId); // Call the function with the selected themeId
    });
});

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

