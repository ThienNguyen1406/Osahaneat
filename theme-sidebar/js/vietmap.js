/*
 * Vietmap API Integration for Order Tracking
 * Version: 1.0
 */

console.log("=== VIETMAP.JS LOADED ===");

// Vietmap API Key (same as Flutter app)
const VIETMAP_API_KEY = 'aa2f6b8b5aa074db4aeedae1c422d41bd6a6dd9af87dc54c';
const VIETMAP_TILE_URL = `https://maps.vietmap.vn/api/tm/{z}/{x}/{y}@2x.png?apikey=${VIETMAP_API_KEY}`;

// Global map instance
let vietmapInstance = null;

/**
 * Initialize Vietmap for order tracking
 * @param {Object} options - Map options
 * @param {number} options.userLat - User latitude
 * @param {number} options.userLng - User longitude
 * @param {number} options.shipperLat - Shipper latitude (optional)
 * @param {number} options.shipperLng - Shipper longitude (optional)
 * @param {string} options.userAddress - User address (optional)
 * @param {string} options.shipperAddress - Shipper address (optional)
 * @param {string} options.orderId - Order ID (optional)
 * @param {string} options.containerId - Container ID for map (default: 'vietmap-container')
 */
function initVietmap(options) {
    console.log("=== initVietmap() called ===");
    console.log("Options:", options);
    
    const {
        userLat = 10.8231,  // Default: Ho Chi Minh City
        userLng = 106.6297,
        shipperLat = null,
        shipperLng = null,
        userAddress = null,
        shipperAddress = null,
        orderId = null,
        containerId = 'vietmap-container'
    } = options || {};
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error("❌ Leaflet.js is not loaded!");
        console.log("Loading Leaflet.js...");
        loadLeaflet(function() {
            initVietmap(options);
        });
        return;
    }
    
    // Destroy existing map if any
    if (vietmapInstance) {
        vietmapInstance.remove();
        vietmapInstance = null;
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
        container.style.height = '415px';
    }
    
    // Clear container (including loading message)
    container.innerHTML = '';
    
    // Calculate center point
    let centerLat = userLat;
    let centerLng = userLng;
    
    if (shipperLat && shipperLng) {
        centerLat = (userLat + shipperLat) / 2;
        centerLng = (userLng + shipperLng) / 2;
    }
    
    // Initialize map
    vietmapInstance = L.map(container, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true
    });
    
    // Add Vietmap tile layer
    L.tileLayer(VIETMAP_TILE_URL, {
        attribution: '© VietMap',
        maxZoom: 18,
        minZoom: 3
    }).addTo(vietmapInstance);
    
    // Create custom icons
    const userIcon = L.divIcon({
        className: 'vietmap-marker-user',
        html: '<div style="background-color: #4CAF50; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    const shipperIcon = L.divIcon({
        className: 'vietmap-marker-shipper',
        html: '<div style="background-color: #FF5722; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    // Add user marker
    const userMarker = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(vietmapInstance)
        .bindPopup(`<b>📍 Vị trí khách hàng</b><br>${userAddress || `${userLat}, ${userLng}`}`);
    
    const markers = [userMarker];
    
    // Add shipper marker if coordinates provided
    if (shipperLat && shipperLng) {
        const shipperMarker = L.marker([shipperLat, shipperLng], { icon: shipperIcon })
            .addTo(vietmapInstance)
            .bindPopup(`<b>🚚 Vị trí shipper</b><br>${shipperAddress || `${shipperLat}, ${shipperLng}`}`);
        
        markers.push(shipperMarker);
        
        // Draw line between user and shipper
        const polyline = L.polyline([
            [userLat, userLng],
            [shipperLat, shipperLng]
        ], {
            color: '#2196F3',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(vietmapInstance);
    }
    
    // Fit bounds to show all markers
    if (markers.length > 1) {
        const group = new L.featureGroup(markers);
        vietmapInstance.fitBounds(group.getBounds().pad(0.1));
    } else {
        vietmapInstance.setView([userLat, userLng], 13);
    }
    
    console.log("✅ Vietmap initialized successfully");
    return vietmapInstance;
}

/**
 * Load Leaflet.js library dynamically
 */
function loadLeaflet(callback) {
    console.log("=== loadLeaflet() called ===");
    
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
 * Initialize map for order tracking modal
 * This function is called when trackModal is shown
 */
function initOrderTrackingMap(orderData) {
    console.log("=== initOrderTrackingMap() called ===");
    console.log("Order data:", orderData);
    
    // Parse orderData if it's a string
    let order = orderData;
    if (typeof orderData === 'string') {
        try {
            order = JSON.parse(orderData);
        } catch (e) {
            console.error("Error parsing order data:", e);
            order = {};
        }
    }
    
    // Get coordinates from order data
    // Try different possible field names
    const userLat = order.userLat || order.userLatitude || order.lat || 
                     (order.users && order.users.lat) || 10.8231;
    const userLng = order.userLng || order.userLongitude || order.lng || 
                     (order.users && order.users.lng) || 106.6297;
    const shipperLat = order.shipperLat || order.shipperLatitude || 
                       (order.shipper && order.shipper.lat) || null;
    const shipperLng = order.shipperLng || order.shipperLongitude || 
                       (order.shipper && order.shipper.lng) || null;
    
    const userAddress = order.userAddress || order.deliveryAddress || 
                        (order.users && order.users.address) || null;
    const shipperAddress = order.shipperAddress || 
                           (order.shipper && order.shipper.address) || null;
    const orderId = order.id || order.orderId || null;
    
    // Initialize map with order data
    initVietmap({
        userLat: parseFloat(userLat),
        userLng: parseFloat(userLng),
        shipperLat: shipperLat ? parseFloat(shipperLat) : null,
        shipperLng: shipperLng ? parseFloat(shipperLng) : null,
        userAddress: userAddress,
        shipperAddress: shipperAddress,
        orderId: orderId,
        containerId: 'vietmap-container'
    });
}

/**
 * Destroy map instance
 */
function destroyVietmap() {
    if (vietmapInstance) {
        vietmapInstance.remove();
        vietmapInstance = null;
        console.log("✅ Vietmap destroyed");
    }
}

// Auto-initialize when DOM is ready
$(document).ready(function() {
    console.log("=== Vietmap.js: Document ready ===");
    
    // Load Leaflet if not already loaded
    if (typeof L === 'undefined') {
        loadLeaflet();
    }
    
    // Handle track modal show event
    $('#trackModal').on('shown.bs.modal', function() {
        console.log("=== Track modal shown ===");
        
        // Small delay to ensure container is visible and Leaflet is loaded
        setTimeout(function() {
            // Check if Leaflet is loaded
            if (typeof L === 'undefined') {
                console.warn("Leaflet not loaded yet, loading...");
                loadLeaflet(function() {
                    initializeTrackMap();
                });
            } else {
                initializeTrackMap();
            }
        }, 200);
        
        function initializeTrackMap() {
            // Try to get order data from current order context
            // This will be set by orders.js when opening the modal
            const orderData = window.currentOrderForTracking || null;
            
            console.log("Order data for map:", orderData);
            
            if (orderData) {
                initOrderTrackingMap(orderData);
            } else {
                // Use default location (Ho Chi Minh City)
                console.log("No order data, using default location");
                initVietmap({
                    userLat: 10.8231,
                    userLng: 106.6297,
                    containerId: 'vietmap-container'
                });
            }
        }
    });
    
    // Destroy map when modal is hidden
    $('#trackModal').on('hidden.bs.modal', function() {
        console.log("=== Track modal hidden ===");
        destroyVietmap();
    });
});

