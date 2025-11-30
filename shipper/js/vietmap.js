/*
 * Vietmap API Integration for Shipper App
 * API Key from Android app: aa2f6b8b5aa074db4aeedae1c422d41bd6a6dd9af87dc54c
 */

console.log("=== SHIPPER VIETMAP.JS LOADED ===");

// Vietmap API Key (from Android app)
const VIETMAP_API_KEY = 'aa2f6b8b5aa074db4aeedae1c422d41bd6a6dd9af87dc54c';
const VIETMAP_TILE_URL = `https://maps.vietmap.vn/api/tm/{z}/{x}/{y}@2x.png?apikey=${VIETMAP_API_KEY}`;

// Global map instance
let shipperMapInstance = null;

/**
 * Initialize Vietmap for order tracking in Shipper app
 * @param {Object} options - Map options
 * @param {number} options.userLat - User latitude
 * @param {number} options.userLng - User longitude
 * @param {number} options.shipperLat - Shipper latitude (optional, will use geolocation if not provided)
 * @param {number} options.shipperLng - Shipper longitude (optional)
 * @param {string} options.userAddress - User address (optional)
 * @param {string} options.orderId - Order ID (optional)
 * @param {string} options.containerId - Container ID for map (default: 'vietmap-container')
 */
function initShipperVietmap(options) {
    console.log("=== initShipperVietmap() called ===");
    console.log("Options:", options);
    
    const {
        userLat = 10.8231,  // Default: Ho Chi Minh City
        userLng = 106.6297,
        shipperLat = null,
        shipperLng = null,
        userAddress = null,
        orderId = null,
        containerId = 'vietmap-container'
    } = options || {};
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error("❌ Leaflet.js is not loaded!");
        console.log("Loading Leaflet.js...");
        loadLeafletForShipper(function() {
            initShipperVietmap(options);
        });
        return;
    }
    
    // Destroy existing map if any
    if (shipperMapInstance) {
        shipperMapInstance.remove();
        shipperMapInstance = null;
    }
    
    // Get container
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Container #${containerId} not found!`);
        return;
    }
    
    // Ensure container is visible and has dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn("⚠️ Container has no dimensions, setting default size");
        container.style.width = '100%';
        container.style.height = '500px';
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Initialize map
    shipperMapInstance = L.map(container, {
        center: [userLat, userLng],
        zoom: 15,
        zoomControl: true
    });
    
    // Add Vietmap tile layer
    L.tileLayer(VIETMAP_TILE_URL, {
        attribution: '© VietMap',
        maxZoom: 18,
        minZoom: 3
    }).addTo(shipperMapInstance);
    
    // Create custom icons
    const userIcon = L.divIcon({
        className: 'vietmap-marker-user',
        html: '<div style="background-color: #4CAF50; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-map-marker-alt" style="color: white; font-size: 16px;"></i></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
    
    const shipperIcon = L.divIcon({
        className: 'vietmap-marker-shipper',
        html: '<div style="background-color: #FF5722; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-motorcycle" style="color: white; font-size: 16px;"></i></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
    
    // Add user marker
    const userMarker = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(shipperMapInstance)
        .bindPopup(`<b>📍 Vị trí khách hàng</b><br>${userAddress || `${userLat}, ${userLng}`}`);
    
    const markers = [userMarker];
    
    // Get shipper location
    if (shipperLat && shipperLng) {
        // Use provided coordinates
        addShipperMarker(shipperLat, shipperLng, userLat, userLng, userMarker, markers);
    } else if (navigator.geolocation) {
        // Update UI to show loading
        const shipperAddressElement = document.getElementById('map-shipper-address');
        if (shipperAddressElement) {
            shipperAddressElement.textContent = 'Đang lấy vị trí...';
        }
        
        // Try to get current location with options for better accuracy
        const geolocationOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const currentLat = position.coords.latitude;
                const currentLng = position.coords.longitude;
                console.log('✅ Shipper location obtained:', currentLat, currentLng);
                addShipperMarker(currentLat, currentLng, userLat, userLng, userMarker, markers);
            },
            function(error) {
                console.error('❌ Error getting shipper location:', error);
                const shipperAddressElement = document.getElementById('map-shipper-address');
                if (shipperAddressElement) {
                    let errorMsg = 'Không thể lấy vị trí';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = 'Không có quyền truy cập vị trí. Vui lòng cho phép trong cài đặt trình duyệt.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = 'Vị trí không khả dụng.';
                            break;
                        case error.TIMEOUT:
                            errorMsg = 'Hết thời gian chờ lấy vị trí.';
                            break;
                        default:
                            errorMsg = 'Lỗi khi lấy vị trí.';
                            break;
                    }
                    shipperAddressElement.textContent = errorMsg;
                }
                shipperMapInstance.setView([userLat, userLng], 15);
            },
            geolocationOptions
        );
    } else {
        const shipperAddressElement = document.getElementById('map-shipper-address');
        if (shipperAddressElement) {
            shipperAddressElement.textContent = 'Trình duyệt không hỗ trợ Geolocation';
        }
        shipperMapInstance.setView([userLat, userLng], 15);
    }
    
    console.log("✅ Vietmap initialized successfully");
    return shipperMapInstance;
}

function addShipperMarker(shipperLat, shipperLng, userLat, userLng, userMarker, markers) {
    const shipperIcon = L.divIcon({
        className: 'vietmap-marker-shipper',
        html: '<div style="background-color: #FF5722; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-motorcycle" style="color: white; font-size: 16px;"></i></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
    
    const shipperMarker = L.marker([shipperLat, shipperLng], { icon: shipperIcon })
        .addTo(shipperMapInstance)
        .bindPopup(`<b>🚚 Vị trí của bạn</b><br>${shipperLat.toFixed(6)}, ${shipperLng.toFixed(6)}`);
    
    markers.push(shipperMarker);
    
    // Draw line between user and shipper
    const polyline = L.polyline([
        [userLat, userLng],
        [shipperLat, shipperLng]
    ], {
        color: '#2196F3',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(shipperMapInstance);
    
    // Fit bounds to show all markers
    const group = new L.featureGroup(markers);
    shipperMapInstance.fitBounds(group.getBounds().pad(0.1));
    
    // Update shipper address in UI
    const shipperAddressElement = document.getElementById('map-shipper-address');
    if (shipperAddressElement) {
        // Try to get address from coordinates using reverse geocoding
        getAddressFromCoordinates(shipperLat, shipperLng, function(address) {
            if (address) {
                shipperAddressElement.textContent = address;
            } else {
                shipperAddressElement.textContent = `${shipperLat.toFixed(6)}, ${shipperLng.toFixed(6)}`;
            }
        });
    }
}

/**
 * Load Leaflet.js library dynamically
 */
function loadLeafletForShipper(callback) {
    console.log("=== loadLeafletForShipper() called ===");
    
    // Check if already loaded
    if (typeof L !== 'undefined') {
        console.log("✅ Leaflet already loaded");
        if (callback) callback();
        return;
    }
    
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        leafletCSS.crossOrigin = '';
        document.head.appendChild(leafletCSS);
    }
    
    // Load Leaflet JS
    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletJS.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    leafletJS.crossOrigin = '';
    leafletJS.onload = function() {
        console.log("✅ Leaflet.js loaded successfully");
        if (callback) callback();
    };
    leafletJS.onerror = function() {
        console.error("❌ Failed to load Leaflet.js");
    };
    document.head.appendChild(leafletJS);
}

/**
 * Get address from coordinates using reverse geocoding
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {function} callback - Callback function with address string
 */
function getAddressFromCoordinates(lat, lng, callback) {
    if (!callback || typeof callback !== 'function') {
        return;
    }
    
    // Try Vietmap Geocoding API first
    const geocodeUrl = `https://maps.vietmap.vn/api/reverse/v3?apikey=${VIETMAP_API_KEY}&point.lat=${lat}&point.lng=${lng}`;
    
    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Reverse geocoding response:', data);
            if (data && data.data && data.data.length > 0) {
                const address = data.data[0].address || data.data[0].name || null;
                if (address) {
                    callback(address);
                    return;
                }
            }
            // Fallback: try OpenStreetMap Nominatim (free, no API key needed)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.display_name) {
                        callback(data.display_name);
                    } else {
                        callback(null);
                    }
                })
                .catch(error => {
                    console.warn('OpenStreetMap geocoding error:', error);
                    callback(null);
                });
        })
        .catch(error => {
            console.warn('Vietmap geocoding error:', error);
            // Fallback: try OpenStreetMap Nominatim
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.display_name) {
                        callback(data.display_name);
                    } else {
                        callback(null);
                    }
                })
                .catch(err => {
                    console.warn('OpenStreetMap geocoding error:', err);
                    callback(null);
                });
        });
}

/**
 * Destroy map instance
 */
function destroyShipperVietmap() {
    if (shipperMapInstance) {
        shipperMapInstance.remove();
        shipperMapInstance = null;
        console.log("✅ Vietmap destroyed");
    }
}

