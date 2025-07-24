// Friends data with move dates and coordinates
const friendsData = {
    ravi: {
        name: 'Ravi',
        location: 'Toronto',
        moveDate: new Date('2025-09-01T00:00:00'),
        coordinates: [43.651070, -79.347015]
    },
    arjun: {
        name: 'Arjun',
        location: 'Sunnyvale',
        moveDate: new Date('2025-12-01T00:00:00'),
        coordinates: [37.368832, -122.036346]
    },
    nick: {
        name: 'Nick',
        location: 'Seattle',
        moveDate: new Date('2026-06-01T00:00:00'),
        coordinates: [47.608013, -122.335167]
    }
};

const nycCoordinates = [40.730610, -73.935242];

// Initialize map
let map;

// Timer update function
function updateCountdowns() {
    const now = new Date();
    
    Object.keys(friendsData).forEach(friend => {
        const friendData = friendsData[friend];
        const timeDiff = friendData.moveDate - now;
        
        if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            // Update DOM elements with animation
            updateTimeValue(`${friend}-days`, days);
            updateTimeValue(`${friend}-hours`, hours);
            updateTimeValue(`${friend}-minutes`, minutes);
            updateTimeValue(`${friend}-seconds`, seconds);
        } else {
            // If the date has passed, show "Moved!"
            updateTimeValue(`${friend}-days`, 'M');
            updateTimeValue(`${friend}-hours`, 'O');
            updateTimeValue(`${friend}-minutes`, 'V');
            updateTimeValue(`${friend}-seconds`, 'E');
        }
    });
}

// Helper function to update time values with animation
function updateTimeValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element && element.textContent !== value.toString()) {
        element.classList.add('updated');
        element.textContent = value;
        
        setTimeout(() => {
            element.classList.remove('updated');
        }, 150);
    }
}

// Initialize map with markers
function initializeMap() {
    // Create map centered to show all locations
    map = L.map('map').setView([42.0, -95.0], 4);
    
    // Add tile layer (using OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Custom icons for different marker types
    const currentLocationIcon = L.divIcon({
        className: 'custom-marker current-location',
        html: '<div style="background-color: #1FB8CD; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });
    
    const destinationIcon = L.divIcon({
        className: 'custom-marker destination',
        html: '<div style="background-color: #DB4545; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    // Add markers for each friend's current location
    Object.keys(friendsData).forEach(friendKey => {
        const friend = friendsData[friendKey];
        const marker = L.marker(friend.coordinates, { icon: currentLocationIcon }).addTo(map);
        
        const popupContent = `
            <div style="text-align: center; padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #1f2121; font-size: 16px; font-weight: 600;">${friend.name}</h4>
                <p style="margin: 0 0 6px 0; color: #626c71; font-size: 14px;">Currently in ${friend.location}</p>
                <p style="margin: 0; color: #21808d; font-size: 13px; font-weight: 500;">Moving: ${friend.moveDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
        });
    });
    
    // Add marker for NYC destination
    const nycMarker = L.marker(nycCoordinates, { icon: destinationIcon }).addTo(map);
    const nycPopupContent = `
        <div style="text-align: center; padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #1f2121; font-size: 16px; font-weight: 600;">🗽 New York City</h4>
            <p style="margin: 0; color: #626c71; font-size: 14px;">The Ultimate Destination</p>
        </div>
    `;
    nycMarker.bindPopup(nycPopupContent, {
        maxWidth: 250,
        className: 'custom-popup'
    });
    
    // Fit map to show all markers
    const allCoordinates = [
        ...Object.values(friendsData).map(friend => friend.coordinates),
        nycCoordinates
    ];
    
    const group = new L.featureGroup(
        allCoordinates.map(coord => L.marker(coord))
    );
    
    map.fitBounds(group.getBounds().pad(0.1));
    
    // Add connecting lines from each location to NYC
    Object.values(friendsData).forEach(friend => {
        const polyline = L.polyline([friend.coordinates, nycCoordinates], {
            color: '#1FB8CD',
            weight: 2,
            opacity: 0.6,
            dashArray: '5, 10'
        }).addTo(map);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start countdown timers
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
    
    // Initialize map
    initializeMap();
    
    // Handle window resize for map
    window.addEventListener('resize', function() {
        if (map) {
            setTimeout(function() {
                map.invalidateSize();
            }, 100);
        }
    });
});

// Add some interactivity to timer cards
document.querySelectorAll('.timer-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const friend = this.dataset.friend;
        if (map && friendsData[friend]) {
            // Briefly highlight the corresponding marker on the map
            const coordinates = friendsData[friend].coordinates;
            const tempMarker = L.circleMarker(coordinates, {
                radius: 30,
                fillColor: '#1FB8CD',
                color: '#ffffff',
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.2
            }).addTo(map);
            
            setTimeout(() => {
                map.removeLayer(tempMarker);
            }, 1500);
        }
    });
});

// Utility function to check if a friend has already moved
function hasMoved(friendKey) {
    const now = new Date();
    return friendsData[friendKey].moveDate <= now;
}

// Add celebration effect for friends who have moved
function addCelebrationEffect(friendKey) {
    const card = document.querySelector(`[data-friend="${friendKey}"]`);
    if (card && hasMoved(friendKey)) {
        card.classList.add('celebration');
        card.style.background = 'linear-gradient(45deg, var(--color-bg-3), var(--color-bg-1))';
    }
}