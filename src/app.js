// Friends data with move dates, coordinates, and avatar images
const friendsData = {
    ravi: {
        name: 'Ravi',
        location: 'Toronto',
        moveDate: new Date('2025-09-01T00:00:00'),
        coordinates: [43.651070, -79.347015],
        avatar: './assets/ravi_avatar.jpeg'
    },
    arjun: {
        name: 'Arjun',
        location: 'Sunnyvale',
        moveDate: new Date('2025-12-01T00:00:00'),
        coordinates: [37.368832, -122.036346],
        avatar: './assets/arjun_avatar.jpeg'
    },
    nick: {
        name: 'Nick',
        location: 'Seattle',
        moveDate: new Date('2026-06-01T00:00:00'),
        coordinates: [47.608013, -122.335167],
        avatar: './assets/nick_avatar.jpeg'
    }
};

const nycCoordinates = [40.730610, -73.935242];
const amarAvatar = './assets/amar_avatar.jpeg';

// Initialize map
let map;
let planeElement = null;

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

            updateTimeValue(`${friend}-days`, days);
            updateTimeValue(`${friend}-hours`, hours);
            updateTimeValue(`${friend}-minutes`, minutes);
            updateTimeValue(`${friend}-seconds`, seconds);
        } else {
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

// Create custom avatar icon
function createAvatarIcon(avatarUrl, size = 50) {
    return L.divIcon({
        className: 'custom-avatar-marker',
        html: `<img src="${avatarUrl}" alt="Avatar">`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
}

// Initialize map with custom avatar markers
function initializeMap() {
    // Create map centered to show all locations
    map = L.map('map').setView([42.0, -95.0], 4);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Add marker for NYC destination with Amar's avatar
    const amarIcon = createAvatarIcon(amarAvatar, 60);
    const nycMarker = L.marker(nycCoordinates, { icon: amarIcon }).addTo(map);
    const nycPopupContent = `
                <div style="text-align: center; padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <img src="${amarAvatar}" alt="Amar" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 8px; border: 2px solid #DB4545;">
                    <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">🗽 Amar in NYC</h4>
                    <p style="margin: 0; color: #626c71; font-size: 14px;">Already here waiting for everyone!</p>
                </div>
            `;
    nycMarker.bindPopup(nycPopupContent, {
        maxWidth: 250,
        className: 'custom-popup'
    });

    // Add markers for each friend's current location with custom avatars
    Object.keys(friendsData).forEach(friendKey => {
        const friend = friendsData[friendKey];
        const avatarIcon = createAvatarIcon(friend.avatar, 50);
        const marker = L.marker(friend.coordinates, { icon: avatarIcon }).addTo(map);

        const popupContent = `
                    <div style="text-align: center; padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <img src="${friend.avatar}" alt="${friend.name}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 8px; border: 2px solid #1FB8CD;">
                        <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">${friend.name}</h4>
                        <p style="margin: 0 0 6px 0; color: #626c71; font-size: 14px;">Currently in ${friend.location}</p>
                        <p style="margin: 0; color: #21808d; font-size: 13px; font-weight: 500;">Moving: ${friend.moveDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                `;

        marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
        });
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

// Animate plane from origin to NYC
function animatePlane(friend) {
    const friendData = friendsData[friend];
    if (!friendData || !map) return;

    // Remove existing plane if any
    if (planeElement) {
        planeElement.remove();
    }

    // Get map container for absolute positioning
    const mapContainer = map.getContainer();

    // Convert coordinates to pixel positions
    const startPoint = map.latLngToContainerPoint(friendData.coordinates);
    const endPoint = map.latLngToContainerPoint(nycCoordinates);

    // Create plane element
    planeElement = document.createElement('div');
    planeElement.className = 'plane-animation';
    planeElement.style.left = startPoint.x + 'px';
    planeElement.style.top = startPoint.y + 'px';

    // Calculate rotation angle for plane direction
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * (180 / Math.PI);

    // Add plane to map container
    mapContainer.appendChild(planeElement);

    // Start animation after a brief delay
    setTimeout(() => {
        planeElement.classList.add('flying');
        planeElement.style.left = endPoint.x + 'px';
        planeElement.style.top = endPoint.y + 'px';
        planeElement.style.transform = `rotate(${angle}deg)`;

        // Remove plane after animation completes
        setTimeout(() => {
            if (planeElement) {
                planeElement.remove();
                planeElement = null;
            }
        }, 4500);
    }, 100);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Start countdown timers
    updateCountdowns();
    setInterval(updateCountdowns, 1000);

    // Initialize map
    initializeMap();

    // Add click handlers to timer cards for plane animation
    document.querySelectorAll('.timer-card').forEach(card => {
        card.addEventListener('click', function () {
            const friend = this.dataset.friend;

            // Add visual feedback
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);

            // Animate plane
            animatePlane(friend);
        });
    });

    // Handle window resize for map
    window.addEventListener('resize', function () {
        if (map) {
            setTimeout(function () {
                map.invalidateSize();
            }, 100);
        }
    });
});

// Utility function to check if a friend has already moved
function hasMoved(friendKey) {
    const now = new Date();
    return friendsData[friendKey].moveDate <= now;
}