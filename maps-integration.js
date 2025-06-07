// Google Maps integration for Nursery Visit Planner
class NurseryMapsIntegration {
    constructor() {
        this.directionsService = null;
        this.distanceMatrixService = null;
        this.map = null;
        this.directionsRenderer = null;
        this.markers = [];
        this.distances = new Map();
    }

    // Initialize Google Maps services
    async initializeMaps() {
        if (!CONFIG.GOOGLE_MAPS_API_KEY || CONFIG.GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
            console.error('Please set your Google Maps API key in config.js');
            this.showError('Google Maps API key not configured. Please update config.js');
            return false;
        }

        try {
            this.directionsService = new google.maps.DirectionsService();
            this.distanceMatrixService = new google.maps.DistanceMatrixService();
            
            // Initialize map centered on Paris
            this.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 13,
                center: { lat: 48.8566, lng: 2.3522 }, // Paris center
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            this.directionsRenderer = new google.maps.DirectionsRenderer({
                draggable: false,
                map: this.map
            });

            return true;
        } catch (error) {
            console.error('Error initializing Google Maps:', error);
            this.showError('Failed to initialize Google Maps');
            return false;
        }
    }

    // Calculate distances between all nurseries and home
    async calculateAllDistances() {
        this.showStatus('Calculating distances with Google Maps...');
        
        const homeAddress = CONFIG.HOME_ADDRESS;
        const nurseries = CONFIG.NURSERIES;
        
        try {
            // Calculate distances from home to each nursery
            for (let i = 0; i < nurseries.length; i++) {
                const nursery = nurseries[i];
                const distance = await this.calculateDistance(homeAddress, nursery.address);
                if (distance) {
                    nursery.realDistance = distance;
                    console.log(`${nursery.name}: ${distance.distance} (${distance.duration})`);
                }
                
                // Also calculate distances between consecutive nurseries on the same day
                if (i < nurseries.length - 1) {
                    const nextNursery = nurseries[i + 1];
                    if (nursery.day === nextNursery.day) {
                        const betweenDistance = await this.calculateDistance(nursery.address, nextNursery.address);
                        if (betweenDistance) {
                            nextNursery.distanceFromPrevious = betweenDistance;
                        }
                    }
                }
                
                // Small delay to avoid hitting API rate limits
                await this.delay(100);
            }
            
            this.updateDistanceDisplay();
            this.showStatus('Distance calculation completed!');
            
        } catch (error) {
            console.error('Error calculating distances:', error);
            this.showError('Failed to calculate distances');
        }
    }

    // Calculate distance between two addresses
    async calculateDistance(origin, destination) {
        return new Promise((resolve, reject) => {
            this.distanceMatrixService.getDistanceMatrix({
                origins: [origin],
                destinations: [destination],
                travelMode: google.maps.TravelMode.WALKING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, (response, status) => {
                if (status === google.maps.DistanceMatrixStatus.OK) {
                    const result = response.rows[0].elements[0];
                    if (result.status === 'OK') {
                        resolve({
                            distance: result.distance.text,
                            distanceValue: result.distance.value, // in meters
                            duration: result.duration.text,
                            durationValue: result.duration.value // in seconds
                        });
                    } else {
                        console.warn(`Could not calculate route from ${origin} to ${destination}`);
                        resolve(null);
                    }
                } else {
                    console.error('Distance Matrix request failed:', status);
                    reject(new Error(`Distance Matrix API error: ${status}`));
                }
            });
        });
    }

    // Update the HTML with real distance data
    updateDistanceDisplay() {
        CONFIG.NURSERIES.forEach(nursery => {
            const nurseryElement = this.findNurseryElement(nursery.name);
            if (nurseryElement && nursery.realDistance) {
                const routeInfo = nurseryElement.querySelector('.route-info');
                if (routeInfo) {
                    const distanceBadge = routeInfo.querySelector('.distance-badge');
                    if (distanceBadge) {
                        // Update with real data and add comparison
                        const walkingMinutes = Math.round(nursery.realDistance.durationValue / 60);
                        distanceBadge.innerHTML = `🚶‍♂️ ${walkingMinutes} min (${nursery.realDistance.distance})`;
                        distanceBadge.style.backgroundColor = '#27ae60'; // Green for real data
                        distanceBadge.title = `Real Google Maps data: ${nursery.realDistance.duration}`;
                    }
                }
            }
        });
    }

    // Find nursery element in the DOM by name
    findNurseryElement(nurseryName) {
        const nurseryItems = document.querySelectorAll('.nursery-item');
        for (let item of nurseryItems) {
            const nameElement = item.querySelector('.nursery-name');
            if (nameElement && nameElement.textContent.includes(nurseryName)) {
                return item;
            }
        }
        return null;
    }

    // Show status message
    showStatus(message) {
        const statusDiv = document.getElementById('status-message') || this.createStatusDiv();
        statusDiv.textContent = message;
        statusDiv.style.backgroundColor = '#3498db';
        statusDiv.style.color = 'white';
        statusDiv.style.display = 'block';
    }

    // Show error message
    showError(message) {
        const statusDiv = document.getElementById('status-message') || this.createStatusDiv();
        statusDiv.textContent = message;
        statusDiv.style.backgroundColor = '#e74c3c';
        statusDiv.style.color = 'white';
        statusDiv.style.display = 'block';
    }

    // Create status div if it doesn't exist
    createStatusDiv() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'status-message';
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            display: none;
        `;
        document.body.appendChild(statusDiv);
        return statusDiv;
    }

    // Add markers for all nurseries on the map
    addNurseryMarkers() {
        // Clear existing markers
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];

        // Add home marker
        this.geocodeAndAddMarker(CONFIG.HOME_ADDRESS, 'Home', '#2c3e50', 'H');

        // Add nursery markers
        CONFIG.NURSERIES.forEach((nursery, index) => {
            this.geocodeAndAddMarker(
                nursery.address, 
                `${nursery.name} (${nursery.time})`, 
                this.getDayColor(nursery.day),
                (index + 1).toString()
            );
        });
    }

    // Geocode address and add marker
    async geocodeAndAddMarker(address, title, color, label) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK') {
                const marker = new google.maps.Marker({
                    map: this.map,
                    position: results[0].geometry.location,
                    title: title,
                    label: {
                        text: label,
                        color: 'white',
                        fontWeight: 'bold'
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 20,
                        fillColor: color,
                        fillOpacity: 1,
                        strokeColor: 'white',
                        strokeWeight: 2
                    }
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `<div><strong>${title}</strong><br>${address}</div>`
                });

                marker.addListener('click', () => {
                    infoWindow.open(this.map, marker);
                });

                this.markers.push(marker);
            }
        });
    }

    // Get color for each day
    getDayColor(day) {
        const colors = {
            tuesday: '#e74c3c',
            wednesday: '#f39c12',
            thursday: '#9b59b6',
            friday: '#1abc9c'
        };
        return colors[day] || '#34495e';
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate optimized route for a specific day
    async showDayRoute(day) {
        const dayNurseries = CONFIG.NURSERIES.filter(n => n.day === day);
        if (dayNurseries.length === 0) return;

        const waypoints = dayNurseries.map(nursery => ({
            location: nursery.address,
            stopover: true
        }));

        const request = {
            origin: CONFIG.HOME_ADDRESS,
            destination: CONFIG.HOME_ADDRESS,
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.WALKING
        };

        this.directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                this.directionsRenderer.setDirections(result);
                this.showStatus(`Route for ${day} displayed on map`);
            } else {
                this.showError(`Could not calculate route for ${day}`);
            }
        });
    }
}

// Initialize when page loads
let nurseryMaps;

// Wait for Google Maps to load
function initMap() {
    nurseryMaps = new NurseryMapsIntegration();
    nurseryMaps.initializeMaps().then(success => {
        if (success) {
            nurseryMaps.addNurseryMarkers();
        }
    });
}

// Add button event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add calculate distances button
    const calculateBtn = document.getElementById('calculate-distances');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            if (nurseryMaps) {
                nurseryMaps.calculateAllDistances();
            }
        });
    }

    // Add route buttons for each day
    ['tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        const btn = document.getElementById(`show-${day}-route`);
        if (btn) {
            btn.addEventListener('click', () => {
                if (nurseryMaps) {
                    nurseryMaps.showDayRoute(day);
                }
            });
        }
    });
}); 