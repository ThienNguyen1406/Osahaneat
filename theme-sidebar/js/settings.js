/*
 * Settings Page - Quản lý cài đặt người dùng
 */

console.log("=== SETTINGS.JS LOADED ===");

$(document).ready(function() {
    console.log("=== $(document).ready() fired in settings.js ===");
    
    // Check dependencies
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        setTimeout(function() {
            if (typeof ApiService === 'undefined') {
                console.error("❌ ApiService still not loaded after 500ms!");
                return;
            }
            initializeSettings();
        }, 500);
        return;
    }
    
    initializeSettings();
});

function initializeSettings() {
    console.log("=== initializeSettings() called ===");
    
    // Load user info
    loadUserInfo();
    
    // Setup event handlers
    setupEventHandlers();
}

function loadUserInfo() {
    console.log("=== loadUserInfo() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getMyInfo !== 'function') {
        console.error("❌ ApiService.getMyInfo is not available!");
        return;
    }
    
    console.log("Calling ApiService.getMyInfo()...");
    
    ApiService.getMyInfo()
        .done(function(response) {
            console.log("=== User Info API Response ===");
            console.log("Full response:", response);
            
            // Check response format (ApiResponse or ResponseData)
            let userData = null;
            
            if (response && response.result) {
                // ApiResponse format: { code, result, message }
                userData = response.result;
            } else if (response && response.data) {
                // ResponseData format: { status, isSuccess, data, desc }
                userData = response.data;
            } else if (response && response.id) {
                // Direct user object
                userData = response;
            }
            
            if (userData) {
                console.log("✅ User data loaded:", userData);
                renderUserInfo(userData);
            } else {
                console.warn("⚠️ No user data found in response");
            }
        })
        .fail(function(xhr) {
            console.error("=== User Info API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", xhr.status);
            
            // If 401, user might not be logged in
            if (xhr.status === 401 || xhr.status === 403) {
                console.warn("⚠️ User not authenticated, redirecting to login...");
                // Optionally redirect to login
                // window.location.href = './signin.html';
            }
        });
}

function renderUserInfo(user) {
    console.log("=== renderUserInfo() called ===");
    console.log("User:", user);
    
    // Update sidebar user info
    if (user.fullname || user.fullName) {
        $('.user p.mb-0.text-white').first().text(user.fullname || user.fullName || 'User');
    }
    
    if (user.userName || user.username || user.email) {
        $('.user p.mb-0.text-white-50').first().text(user.userName || user.username || user.email || '');
    }
    
    // Populate personal info modal
    if (user.fullname || user.fullName) {
        $('#profileFullName').val(user.fullname || user.fullName || '');
    }
    
    if (user.email) {
        $('#profileEmail').val(user.email || '');
    }
    
    if (user.phoneNumber || user.phone) {
        $('#profilePhone').val(user.phoneNumber || user.phone || '');
    }
    
    if (user.address) {
        $('#profileAddress').val(user.address || '');
    }
    
    // Update avatar
    if (user.avatar && user.avatar.trim() !== '') {
        // Get API_BASE_URL from api.js or use default
        const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:82';
        const avatarUrl = user.avatar.startsWith('http') 
            ? user.avatar 
            : `${baseUrl}/uploads/${user.avatar}`;
        $('#profileAvatar').attr('src', avatarUrl).on('error', function() {
            $(this).attr('src', 'img/user1.png');
        });
    } else {
        $('#profileAvatar').attr('src', 'img/user1.png');
    }
}

function setupEventHandlers() {
    console.log("=== setupEventHandlers() called ===");
    
    // Avatar upload button
    $('#uploadAvatarBtn').on('click', function() {
        $('#avatarInput').click();
    });
    
    // Avatar file input change
    $('#avatarInput').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh!');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB!');
                return;
            }
            
            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#profileAvatar').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
            
            // Store file for upload
            $('#avatarInput').data('file', file);
            $('#avatarUploadStatus').text('Ảnh đã được chọn. Nhấn "CẬP NHẬT HỒ SƠ" để tải lên.').show();
        }
    });
    
    // Delete avatar button
    $('#deleteAvatarBtn').on('click', function() {
        if (confirm('Bạn có chắc chắn muốn xóa ảnh đại diện?')) {
            deleteAvatar();
        }
    });
    
    // Personal info modal - Update profile button
    $('#updateProfileBtn').on('click', function(e) {
        e.preventDefault();
        const fullname = $('#profileFullName').val().trim();
        const email = $('#profileEmail').val().trim();
        const phone = $('#profilePhone').val().trim();
        const address = $('#profileAddress').val().trim();
        const avatarFile = $('#avatarInput').data('file');
        
        // Validation
        if (!fullname) {
            alert('Vui lòng nhập họ và tên!');
            return;
        }
        
        if (!email) {
            alert('Vui lòng nhập email!');
            return;
        }
        
        if (email && !email.includes('@')) {
            alert('Email không hợp lệ!');
            return;
        }
        
        if (!phone) {
            alert('Vui lòng nhập số điện thoại!');
            return;
        }
        
        // Prepare user data
        const userData = {
            fullname: fullname,
            email: email,
            phoneNumber: phone,
            address: address || null
        };
        
        // Update profile with or without avatar
        updateUserProfile(userData, avatarFile);
    });
    
    // Marketing preferences modal - Update button
    $('#marketingModal .modal-footer button').on('click', function(e) {
        e.preventDefault();
        const emailPromo = $('#customCheck1').is(':checked');
        const monthlyNewsletter = $('#customCheck2').is(':checked');
        const feedback = $('#customCheck3').is(':checked');
        const discounts = $('#customCheck4').is(':checked');
        
        updateMarketingPreferences({
            emailPromo: emailPromo,
            monthlyNewsletter: monthlyNewsletter,
            feedback: feedback,
            discounts: discounts
        });
    });
    
    // Address modal - Load addresses when modal is shown
    $('#addressModal').on('show.bs.modal', function() {
        loadAddresses();
    });

    // Address modal - Add address button
    $('#addAddressBtn').on('click', function() {
        resetAddressForm();
        $('#addressFormModalLabel').text('Thêm địa chỉ');
        $('#addressFormModal').modal('show');
    });

    // Address form - Save button
    $('#saveAddressBtn').on('click', function() {
        saveAddress();
    });
    
    // Address form - Open map button
    $('#openMapBtn').on('click', function() {
        toggleMap();
    });
    
    // My cards modal - Load payment methods when modal is shown
    $('#mycardsModal').on('show.bs.modal', function() {
        loadPaymentMethods();
    });

    // Payment method modal - Add new card button
    $('#addCardBtn').on('click', function() {
        resetPaymentMethodForm();
        $('#paymentsModalLabel').text('Thêm thẻ mới');
        $('#paymentsModal').modal('show');
    });

    // Payment method form - Save button
    $('#savePaymentMethodBtn').on('click', function() {
        savePaymentMethod();
    });

    // Card number formatting
    $('#cardNumber').on('input', function() {
        let value = $(this).val().replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        $(this).val(formattedValue);
    });

    // Card expiry formatting (MM/YY)
    $('#cardExpiry').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        $(this).val(value);
    });

    // CVV - numbers only
    $('#cardCVV').on('input', function() {
        $(this).val($(this).val().replace(/\D/g, ''));
    });
}

// ============================================
// ADDRESS MANAGEMENT FUNCTIONS
// ============================================

function loadAddresses() {
    console.log("=== loadAddresses() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getMyAddresses !== 'function') {
        console.error("❌ ApiService.getMyAddresses is not available!");
        return;
    }
    
    ApiService.getMyAddresses()
        .done(function(response) {
            console.log("=== Addresses API Response (settings.js) ===");
            console.log("Full response:", response);
            console.log("Response type:", typeof response);
            console.log("Response.data:", response?.data);
            console.log("Response.isSuccess:", response?.isSuccess);
            console.log("Response.success:", response?.success);
            console.log("Response.status:", response?.status);
            
            let addresses = [];
            
            // Handle different response formats
            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    addresses = response.data;
                    console.log("✅ Extracted addresses from response.data (array)");
                } else {
                    console.warn("⚠️ response.data is not an array:", response.data);
                    addresses = [];
                }
            } else if (response && Array.isArray(response)) {
                addresses = response;
                console.log("✅ Extracted addresses from response (direct array)");
            } else {
                console.warn("⚠️ Unexpected response format:", response);
                addresses = [];
            }
            
            console.log("✅ Loaded addresses:", addresses);
            console.log("✅ Addresses count:", addresses.length);
            
            if (addresses.length > 0) {
                console.log("✅ First address sample:", addresses[0]);
            }
            
            renderAddresses(addresses);
        })
        .fail(function(xhr) {
            console.error("=== Addresses API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", xhr.status);
            
            if (xhr.status === 401 || xhr.status === 403) {
                alert('Vui lòng đăng nhập để xem địa chỉ!');
            } else {
                alert('Không thể tải danh sách địa chỉ!');
            }
        });
}

function renderAddresses(addresses) {
    console.log("=== renderAddresses() called ===");
    console.log("Addresses:", addresses);
    console.log("Addresses count:", addresses ? addresses.length : 0);
    
    if (!addresses || !Array.isArray(addresses)) {
        console.error("❌ Invalid addresses data in renderAddresses");
        return;
    }
    
    // Separate addresses by type - normalize type to uppercase for comparison
    const homeAddresses = addresses.filter(addr => {
        const type = (addr.type || '').toUpperCase();
        return type === 'HOME';
    });
    const officeAddresses = addresses.filter(addr => {
        const type = (addr.type || '').toUpperCase();
        return type === 'OFFICE' || type === 'WORK';
    });
    
    console.log("=== Address Filtering Results (renderAddresses) ===");
    console.log("Total addresses:", addresses.length);
    console.log("Home addresses:", homeAddresses.length);
    console.log("Office addresses:", officeAddresses.length);
    
    // Log all address types for debugging
    if (addresses.length > 0) {
        console.log("All address types:", addresses.map(addr => ({ id: addr.id, type: addr.type, title: addr.title })));
    }
    const otherAddresses = addresses.filter(addr => {
        const type = (addr.type || '').toUpperCase();
        return type === 'OTHER' || !addr.type || type === '';
    });
    
    // Update counts
    $('#homeCount').text(homeAddresses.length);
    $('#officeCount').text(officeAddresses.length);
    
    // Render home addresses
    const homeHtml = homeAddresses.length > 0 
        ? homeAddresses.map(addr => buildAddressCard(addr)).join('')
        : '<p class="text-muted text-center py-3">Chưa có địa chỉ nhà</p>';
    $('#homeAddressList').html(homeHtml);
    
    // Render office addresses
    const officeHtml = officeAddresses.length > 0
        ? officeAddresses.map(addr => buildAddressCard(addr)).join('')
        : '<p class="text-muted text-center py-3">Chưa có địa chỉ cơ quan</p>';
    $('#officeAddressList').html(officeHtml);
    
    // Setup edit/delete handlers
    setupAddressCardHandlers();
}

function buildAddressCard(address) {
    const iconClass = address.type === 'HOME' 
        ? 'mdi-home-variant-outline' 
        : address.type === 'OFFICE'
        ? 'mdi-office-building-marker-outline'
        : 'mdi-map-marker-outline';
    
    const defaultBadge = address.isDefault 
        ? '<span class="badge badge-success ml-2">Mặc định</span>' 
        : '';
    
    return `
        <div class="d-flex align-items-center mb-2 border rounded p-2 address-card" data-address-id="${address.id}">
            <div class="mr-3 bg-light rounded p-2 osahan-icon">
                <i class="mdi ${iconClass}"></i>
            </div>
            <div class="w-100">
                <p class="mb-0 font-weight-bold text-dark">
                    ${address.title || 'Địa chỉ'}${defaultBadge}
                </p>
                <p class="mb-0 small text-muted">${address.address || ''}</p>
            </div>
            <div class="ml-2">
                <button class="btn btn-sm btn-outline-primary edit-address-btn" data-address-id="${address.id}" title="Sửa">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-address-btn" data-address-id="${address.id}" title="Xóa">
                    <i class="mdi mdi-delete"></i>
                </button>
            </div>
        </div>
    `;
}

function setupAddressCardHandlers() {
    // Edit button
    $('.edit-address-btn').off('click').on('click', function() {
        const addressId = $(this).data('address-id');
        editAddress(addressId);
    });
    
    // Delete button
    $('.delete-address-btn').off('click').on('click', function() {
        const addressId = $(this).data('address-id');
        if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            deleteAddress(addressId);
        }
    });
}

function editAddress(addressId) {
    console.log("=== editAddress() called ===");
    console.log("Address ID:", addressId);
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getAddressById !== 'function') {
        console.error("❌ ApiService.getAddressById is not available!");
        return;
    }
    
    ApiService.getAddressById(addressId)
        .done(function(response) {
            console.log("=== Address Detail API Response ===");
            console.log("Full response:", response);
            
            let address = null;
            if (response && response.data) {
                address = response.data;
            } else if (response && response.id) {
                address = response;
            }
            
            if (address) {
                $('#addressId').val(address.id);
                $('#addressTitle').val(address.title || '');
                $('#addressType').val(address.type || 'OTHER');
                $('#addressText').val(address.address || '');
                $('#addressIsDefault').prop('checked', address.isDefault || false);
                $('#addressLat').val(address.lat || '');
                $('#addressLng').val(address.lng || '');
                
                $('#addressFormModalLabel').text('Sửa địa chỉ');
                $('#addressFormModal').modal('show');
            } else {
                alert('Không tìm thấy địa chỉ!');
            }
        })
        .fail(function(xhr) {
            console.error("=== Address Detail API Error ===");
            console.error("XHR:", xhr);
            alert('Không thể tải thông tin địa chỉ!');
        });
}

function saveAddress() {
    console.log("=== saveAddress() called ===");
    
    const addressId = $('#addressId').val();
    const title = $('#addressTitle').val().trim();
    const type = $('#addressType').val();
    const address = $('#addressText').val().trim();
    const isDefault = $('#addressIsDefault').is(':checked');
    
    // Validation
    if (!title) {
        alert('Vui lòng nhập tiêu đề địa chỉ!');
        return;
    }
    
    if (!address) {
        alert('Vui lòng nhập địa chỉ!');
        return;
    }
    
    const addressData = {
        title: title,
        type: type,
        address: address,
        isDefault: isDefault,
        lat: $('#addressLat').val() || null,
        lng: $('#addressLng').val() || null
    };
    
    console.log("Address data:", addressData);
    
    // Disable button and show loading
    const $btn = $('#saveAddressBtn');
    const originalText = $btn.html();
    $btn.prop('disabled', true).html('<i class="mdi mdi-loading mdi-spin"></i> Đang lưu...');
    
    let apiCall;
    if (addressId) {
        // Update existing address
        if (typeof ApiService.updateAddress !== 'function') {
            alert('Chức năng cập nhật địa chỉ chưa được triển khai!');
            $btn.prop('disabled', false).html(originalText);
            return;
        }
        apiCall = ApiService.updateAddress(addressId, addressData);
    } else {
        // Create new address
        if (typeof ApiService.createAddress !== 'function') {
            alert('Chức năng tạo địa chỉ chưa được triển khai!');
            $btn.prop('disabled', false).html(originalText);
            return;
        }
        apiCall = ApiService.createAddress(addressData);
    }
    
    apiCall
        .done(function(response) {
            console.log("=== Save Address API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = (response && response.status === 200) || 
                            (response && (response.isSuccess === true || response.success === true)) ||
                            (response && response.code === 200);
            
            if (isSuccess) {
                console.log("✅ Address saved successfully");
                alert('Lưu địa chỉ thành công!');
                
                // Close form modal
                $('#addressFormModal').modal('hide');
                
                // Reload addresses
                loadAddresses();
                
                // Trigger sync event for other pages/modals
                syncAddressesAcrossPages();
                
                // Update last sync timestamp
                localStorage.setItem('addressLastSync', Date.now().toString());
            } else {
                console.warn("⚠️ Save address failed:", response);
                const errorMsg = response?.desc || response?.message || 'Lưu địa chỉ thất bại!';
                alert(errorMsg);
            }
        })
        .fail(function(xhr) {
            console.error("=== Save Address API Error ===");
            console.error("XHR:", xhr);
            
            let errorMsg = 'Lưu địa chỉ thất bại!';
            if (xhr.responseJSON) {
                const errorResponse = xhr.responseJSON;
                errorMsg = errorResponse.desc || errorResponse.message || errorMsg;
            }
            alert(errorMsg);
        })
        .always(function() {
            // Re-enable button
            $btn.prop('disabled', false).html(originalText);
        });
}

function deleteAddress(addressId) {
    console.log("=== deleteAddress() called ===");
    console.log("Address ID:", addressId);
    
    if (typeof ApiService === 'undefined' || typeof ApiService.deleteAddress !== 'function') {
        console.error("❌ ApiService.deleteAddress is not available!");
        alert('Chức năng xóa địa chỉ chưa được triển khai!');
        return;
    }
    
    ApiService.deleteAddress(addressId)
        .done(function(response) {
            console.log("=== Delete Address API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = (response && response.status === 200) || 
                            (response && (response.isSuccess === true || response.success === true)) ||
                            (response && response.code === 200);
            
            if (isSuccess) {
                console.log("✅ Address deleted successfully");
                alert('Xóa địa chỉ thành công!');
                
                // Reload addresses
                loadAddresses();
                
                // Trigger sync event for other pages/modals
                syncAddressesAcrossPages();
                
                // Update last sync timestamp
                localStorage.setItem('addressLastSync', Date.now().toString());
            } else {
                console.warn("⚠️ Delete address failed:", response);
                const errorMsg = response?.desc || response?.message || 'Xóa địa chỉ thất bại!';
                alert(errorMsg);
            }
        })
        .fail(function(xhr) {
            console.error("=== Delete Address API Error ===");
            console.error("XHR:", xhr);
            
            let errorMsg = 'Xóa địa chỉ thất bại!';
            if (xhr.responseJSON) {
                const errorResponse = xhr.responseJSON;
                errorMsg = errorResponse.desc || errorResponse.message || errorMsg;
            }
            alert(errorMsg);
        });
}

function resetAddressForm() {
    $('#addressId').val('');
    $('#addressTitle').val('');
    $('#addressType').val('HOME');
    $('#addressText').val('');
    $('#addressIsDefault').prop('checked', false);
    $('#addressLat').val('');
    $('#addressLng').val('');
    $('#mapContainer').hide();
    if (window.addressMapInstance) {
        window.addressMapInstance.remove();
        window.addressMapInstance = null;
    }
}

// Vietmap integration for address selection
const VIETMAP_API_KEY = 'aa2f6b8b5aa074db4aeedae1c422d41bd6a6dd9af87dc54c';
const VIETMAP_TILE_URL = `https://maps.vietmap.vn/api/tm/{z}/{x}/{y}@2x.png?apikey=${VIETMAP_API_KEY}`;

function toggleMap() {
    const $mapContainer = $('#mapContainer');
    const isVisible = $mapContainer.is(':visible');
    
    console.log("=== toggleMap() called ===");
    console.log("Map container visible:", isVisible);
    
    if (isVisible) {
        $mapContainer.slideUp();
        // Destroy map when hiding
        if (window.addressMapInstance) {
            window.addressMapInstance.remove();
            window.addressMapInstance = null;
            window.addressMarker = null;
        }
    } else {
        $mapContainer.slideDown();
        // Wait a bit for slide animation, then init map
        setTimeout(function() {
            initAddressMap();
        }, 300);
    }
}

function initAddressMap() {
    console.log("=== initAddressMap() called ===");
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('❌ Leaflet.js is not loaded!');
        alert('Đang tải bản đồ... Vui lòng thử lại sau vài giây.');
        // Try to load Leaflet dynamically
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = function() {
            console.log('✅ Leaflet.js loaded, retrying map initialization...');
            setTimeout(initAddressMap, 100);
        };
        document.head.appendChild(script);
        return;
    }
    
    const container = document.getElementById('mapContainer');
    if (!container) {
        console.error('❌ Map container not found');
        return;
    }
    
    // Ensure container is visible and has dimensions
    const $container = $(container);
    if (!$container.is(':visible')) {
        console.warn('⚠️ Map container is not visible, showing it...');
        $container.show();
    }
    
    // Wait for container to have dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('⚠️ Map container has no dimensions, waiting...');
        setTimeout(function() {
            initAddressMap();
        }, 100);
        return;
    }
    
    console.log("✅ Map container ready, dimensions:", container.offsetWidth, "x", container.offsetHeight);
    
    // Destroy existing map if any
    if (window.addressMapInstance) {
        console.log("🗑️ Destroying existing map instance...");
        window.addressMapInstance.remove();
        window.addressMapInstance = null;
        window.addressMarker = null;
    }
    
    // Get current location or use default (Ho Chi Minh City)
    let centerLat = 10.8231;
    let centerLng = 106.6297;
    
    // Try to get current location
    if (navigator.geolocation) {
        console.log("📍 Requesting current location...");
        navigator.geolocation.getCurrentPosition(
            function(position) {
                centerLat = position.coords.latitude;
                centerLng = position.coords.longitude;
                console.log("✅ Got current location:", centerLat, centerLng);
                initMapWithCenter(centerLat, centerLng);
            },
            function(error) {
                console.warn('⚠️ Error getting location:', error);
                console.log("Using default location (Ho Chi Minh City)");
                initMapWithCenter(centerLat, centerLng);
            },
            {
                timeout: 5000,
                enableHighAccuracy: false
            }
        );
    } else {
        console.log("📍 Geolocation not available, using default location");
        initMapWithCenter(centerLat, centerLng);
    }
}

function initMapWithCenter(lat, lng) {
    const container = document.getElementById('mapContainer');
    if (!container) {
        console.error('Map container not found');
        return;
    }
    
    // Clear container first
    container.innerHTML = '';
    
    // Initialize map
    window.addressMapInstance = L.map('mapContainer', {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true
    });
    
    // Add Vietmap tile layer
    L.tileLayer(VIETMAP_TILE_URL, {
        attribution: '© VietMap',
        maxZoom: 18,
        minZoom: 3
    }).addTo(window.addressMapInstance);
    
    // Create marker icon
    const markerIcon = L.divIcon({
        className: 'address-marker',
        html: '<div style="background-color: #FF5722; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="mdi mdi-map-marker" style="color: white; font-size: 20px;"></i></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
    
    // Add initial marker and save to window
    window.addressMarker = L.marker([lat, lng], { 
        icon: markerIcon,
        draggable: true
    }).addTo(window.addressMapInstance);
    
    console.log("✅ Map initialized with marker at:", lat, lng);
    
    // Update address when marker is moved
    window.addressMarker.on('dragend', function(e) {
        const position = window.addressMarker.getLatLng();
        console.log("📍 Marker dragged to:", position.lat, position.lng);
        updateAddressFromCoordinates(position.lat, position.lng);
    });
    
    // Update address when map is clicked - THIS IS THE KEY FEATURE
    window.addressMapInstance.on('click', function(e) {
        const clickedLat = e.latlng.lat;
        const clickedLng = e.latlng.lng;
        
        console.log("🗺️ Map clicked at:", clickedLat, clickedLng);
        console.log("Event object:", e);
        
        // Move marker to clicked position
        if (window.addressMarker) {
            window.addressMarker.setLatLng([clickedLat, clickedLng]);
            console.log("✅ Marker moved to clicked position");
        } else {
            // Create marker if it doesn't exist
            window.addressMarker = L.marker([clickedLat, clickedLng], { 
                icon: markerIcon,
                draggable: true
            }).addTo(window.addressMapInstance);
            
            // Add dragend event to new marker
            window.addressMarker.on('dragend', function(e) {
                const position = window.addressMarker.getLatLng();
                console.log("📍 Marker dragged to:", position.lat, position.lng);
                updateAddressFromCoordinates(position.lat, position.lng);
            });
            
            console.log("✅ Marker created at clicked position");
        }
        
        // Update address from coordinates
        updateAddressFromCoordinates(clickedLat, clickedLng);
    });
    
    // Ensure map is properly sized after initialization
    setTimeout(function() {
        if (window.addressMapInstance) {
            window.addressMapInstance.invalidateSize();
            console.log("✅ Map size invalidated");
        }
    }, 200);
    
    // Try to reverse geocode initial position
    updateAddressFromCoordinates(lat, lng);
}

function updateAddressFromCoordinates(lat, lng) {
    console.log("=== updateAddressFromCoordinates() called ===");
    console.log("Lat:", lat, "Lng:", lng);
    
    // Save coordinates
    $('#addressLat').val(lat);
    $('#addressLng').val(lng);
    
    // Show loading in address field
    const $addressText = $('#addressText');
    const originalValue = $addressText.val();
    $addressText.val('Đang tải địa chỉ...');
    
    // Try to get address from coordinates using Vietmap Geocoding API
    // Using Vietmap Reverse Geocoding API
    const geocodeUrl = `https://maps.vietmap.vn/api/reverse?apikey=${VIETMAP_API_KEY}&lat=${lat}&lon=${lng}`;
    console.log("Calling reverse geocoding API:", geocodeUrl);
    
    fetch(geocodeUrl)
        .then(response => {
            console.log("Geocoding response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Geocoding response data:", data);
            
            let addressString = '';
            
            // Try different response formats
            if (data && data.display_name) {
                addressString = data.display_name;
            } else if (data && data.address) {
                const addr = data.address;
                // Build address string from components
                const parts = [];
                if (addr.house_number) parts.push(addr.house_number);
                if (addr.road) parts.push(addr.road);
                if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
                if (addr.city || addr.town) parts.push(addr.city || addr.town);
                if (addr.state) parts.push(addr.state);
                addressString = parts.join(', ');
            } else if (data && data.name) {
                addressString = data.name;
            } else if (data && Array.isArray(data) && data.length > 0) {
                // Some APIs return array
                const firstResult = data[0];
                addressString = firstResult.display_name || firstResult.name || '';
            }
            
            if (addressString && addressString.trim()) {
                $addressText.val(addressString.trim());
                console.log("✅ Address updated:", addressString);
            } else {
                // Fallback: use coordinates if geocoding fails
                $addressText.val(`${lat}, ${lng}`);
                console.warn("⚠️ Could not get address name, using coordinates");
            }
        })
        .catch(error => {
            console.error('❌ Reverse geocoding failed:', error);
            // Fallback: use coordinates
            $addressText.val(`${lat}, ${lng}`);
            console.log("Using coordinates as fallback address");
        });
}

function updateUserProfile(userData, avatarFile) {
    console.log("=== updateUserProfile() called ===");
    console.log("User data:", userData);
    console.log("Avatar file:", avatarFile);
    
    if (typeof ApiService === 'undefined') {
        console.error("❌ ApiService is not defined!");
        alert('Chức năng cập nhật thông tin chưa được triển khai!');
        return;
    }
    
    // Disable button and show loading
    const $btn = $('#updateProfileBtn');
    const originalText = $btn.html();
    $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...');
    
    // Use updateMyProfile if available (for regular users)
    if (typeof ApiService.updateMyProfile === 'function') {
        console.log("Calling ApiService.updateMyProfile()...");
        console.log("Avatar file check:", avatarFile ? "File exists" : "No file");
        console.log("Avatar file type:", avatarFile ? typeof avatarFile : "N/A");
        console.log("Avatar file instanceof File:", avatarFile instanceof File);
        
        // Ensure avatarFile is a File object if it exists
        if (avatarFile && !(avatarFile instanceof File)) {
            console.warn("⚠️ avatarFile is not a File object, trying to get from input...");
            const fileInput = document.getElementById('avatarInput');
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                avatarFile = fileInput.files[0];
                console.log("✅ Got file from input element");
            } else {
                console.warn("⚠️ No file in input element either");
            }
        }
        
        ApiService.updateMyProfile(userData, avatarFile)
            .done(function(response) {
                console.log("=== Update User Profile API Response ===");
                console.log("Full response:", response);
                
                // Check response format
                const isSuccess = (response && response.code === 200) || 
                                (response && (response.isSuccess === true || response.success === true)) ||
                                (response && response.status === 200);
                
                if (isSuccess) {
                    console.log("✅ User profile updated successfully");
                    alert('Cập nhật thông tin thành công!');
                    
                    // Clear avatar input
                    $('#avatarInput').val('').removeData('file');
                    $('#avatarUploadStatus').hide();
                    
                    // Reload user info
                    loadUserInfo();
                    
                    // Sync user info across pages
                    if (typeof UserSync !== 'undefined' && UserSync.loadUserInfo) {
                        UserSync.loadUserInfo();
                    }
                    
                    // Close modal
                    $('#personalModal').modal('hide');
                } else {
                    console.warn("⚠️ Update user profile failed:", response);
                    const errorMsg = response?.message || response?.desc || 'Cập nhật thông tin thất bại!';
                    alert(errorMsg);
                }
            })
            .fail(function(xhr) {
                console.error("=== Update User Profile API Error ===");
                console.error("XHR:", xhr);
                console.error("Status:", xhr.status);
                
                let errorMsg = 'Cập nhật thông tin thất bại!';
                
                if (xhr.responseJSON) {
                    const errorResponse = xhr.responseJSON;
                    errorMsg = errorResponse.message || errorResponse.desc || errorResponse.description || errorMsg;
                } else if (xhr.status === 401 || xhr.status === 403) {
                    errorMsg = 'Không có quyền cập nhật thông tin hoặc phiên đăng nhập đã hết hạn!';
                } else if (xhr.status === 404) {
                    errorMsg = 'Không tìm thấy người dùng!';
                } else if (xhr.status === 400) {
                    errorMsg = 'Thông tin không hợp lệ!';
                }
                
                alert(errorMsg);
            })
            .always(function() {
                // Re-enable button
                $btn.prop('disabled', false).html(originalText);
            });
    } else {
        alert('Chức năng cập nhật thông tin chưa được triển khai!');
        $btn.prop('disabled', false).html(originalText);
    }
}

function deleteAvatar() {
    console.log("=== deleteAvatar() called ===");
    
    if (typeof ApiService === 'undefined' || typeof ApiService.deleteMyAvatar !== 'function') {
        console.error("❌ ApiService.deleteMyAvatar is not defined!");
        alert('Chức năng xóa ảnh đại diện chưa được triển khai!');
        return;
    }
    
    // Disable button and show loading
    const $btn = $('#deleteAvatarBtn');
    const originalText = $btn.html();
    $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang xóa...');
    
    ApiService.deleteMyAvatar()
        .done(function(response) {
            console.log("=== Delete Avatar API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = (response && response.code === 200) || 
                            (response && (response.isSuccess === true || response.success === true)) ||
                            (response && response.status === 200);
            
            if (isSuccess) {
                console.log("✅ Avatar deleted successfully");
                alert('Xóa ảnh đại diện thành công!');
                
                // Reset avatar to default
                $('#profileAvatar').attr('src', 'img/user1.png');
                $('#avatarInput').val('').removeData('file');
                $('#avatarUploadStatus').hide();
                
                // Reload user info
                loadUserInfo();
            } else {
                console.warn("⚠️ Delete avatar failed:", response);
                const errorMsg = response?.message || response?.desc || 'Xóa ảnh đại diện thất bại!';
                alert(errorMsg);
            }
        })
        .fail(function(xhr) {
            console.error("=== Delete Avatar API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", xhr.status);
            
            let errorMsg = 'Xóa ảnh đại diện thất bại!';
            
            if (xhr.responseJSON) {
                const errorResponse = xhr.responseJSON;
                errorMsg = errorResponse.message || errorResponse.desc || errorResponse.description || errorMsg;
            } else if (xhr.status === 401 || xhr.status === 403) {
                errorMsg = 'Không có quyền xóa ảnh đại diện hoặc phiên đăng nhập đã hết hạn!';
            } else if (xhr.status === 404) {
                errorMsg = 'Không tìm thấy người dùng!';
            }
            
            alert(errorMsg);
        })
        .always(function() {
            // Re-enable button
            $btn.prop('disabled', false).html(originalText);
        });
}

function updateMarketingPreferences(preferences) {
    console.log("=== updateMarketingPreferences() called ===");
    console.log("Preferences:", preferences);
    
    // Note: This would need a specific API endpoint for marketing preferences
    // For now, we can store it in localStorage or update user profile
    console.log("Marketing preferences update - feature not yet fully implemented");
    
    // Store in localStorage as temporary solution
    localStorage.setItem('marketingPreferences', JSON.stringify(preferences));
    
    alert('Cập nhật tùy chọn tiếp thị thành công!');
    $('#marketingModal').modal('hide');
}

function getUserIdFromToken() {
    try {
        const token = getToken();
        if (!token) {
            console.warn("No token found");
            return null;
        }
        
        const decoded = decodeToken(token);
        if (decoded && decoded.sub) {
            // Try to get userId from token or localStorage
            const userId = decoded.userId || decoded.id || decoded.sub || localStorage.getItem('userId');
            if (userId) {
                return parseInt(userId);
            }
        }
        
        // Fallback: try to get from localStorage
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            return parseInt(storedUserId);
        }
        
        return null;
    } catch (e) {
        console.error("Error getting userId from token:", e);
        return null;
    }
}

// Load marketing preferences from localStorage on page load
function loadMarketingPreferences() {
    const stored = localStorage.getItem('marketingPreferences');
    if (stored) {
        try {
            const preferences = JSON.parse(stored);
            $('#customCheck1').prop('checked', preferences.emailPromo || false);
            $('#customCheck2').prop('checked', preferences.monthlyNewsletter || false);
            $('#customCheck3').prop('checked', preferences.feedback || false);
            $('#customCheck4').prop('checked', preferences.discounts || false);
        } catch (e) {
            console.error("Error loading marketing preferences:", e);
        }
    }
}

// Load marketing preferences when modal is shown
$(document).on('shown.bs.modal', '#marketingModal', function() {
    loadMarketingPreferences();
});

// Load user info when personal modal is shown
$(document).on('shown.bs.modal', '#personalModal', function() {
    console.log("Personal modal shown, reloading user info...");
    loadUserInfo();
});

// ============================================
// ADDRESS SYNC SYSTEM - Đồng bộ địa chỉ giữa các page
// ============================================

/**
 * Trigger sync event để các page/modals khác reload địa chỉ
 */
function syncAddressesAcrossPages() {
    console.log("=== syncAddressesAcrossPages() called ===");
    
    // Trigger address sync using the global function from address-sync.js
    if (typeof triggerAddressSync === 'function') {
        triggerAddressSync();
    } else {
        // Fallback: manually trigger events
        // Trigger custom event for same page
        const event = new CustomEvent('addressesChanged');
        window.dispatchEvent(event);
        
        // Trigger storage event for other tabs
        const oldValue = localStorage.getItem('addressSync');
        const newValue = Date.now().toString();
        localStorage.setItem('addressSync', newValue);
        
        // Force storage event by removing and re-adding
        if (oldValue !== newValue) {
            localStorage.removeItem('addressSync');
            localStorage.setItem('addressSync', newValue);
        }
    }
    
    console.log("✅ Address sync triggered");
    
    // Method 1: Custom Event (works within same page)
    const event = new CustomEvent('addressesChanged', {
        detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    // Method 2: LocalStorage Event (works across tabs/pages)
    const syncData = {
        timestamp: Date.now(),
        action: 'addressesChanged'
    };
    localStorage.setItem('addressSync', JSON.stringify(syncData));
    // Remove immediately to trigger storage event
    setTimeout(function() {
        localStorage.removeItem('addressSync');
    }, 100);
    
    console.log("✅ Address sync event triggered");
}

/**
 * Listen for address changes from other pages/modals
 */
function setupAddressSyncListener() {
    console.log("=== setupAddressSyncListener() called ===");
    
    // Listen for custom event (same page)
    window.addEventListener('addressesChanged', function(event) {
        console.log("📢 Addresses changed event received (custom event)");
        // Reload addresses if modal is open
        if ($('#addressModal').hasClass('show') || $('#addressModal').is(':visible')) {
            console.log("🔄 Reloading addresses in open modal...");
            loadAddresses();
        }
    });
    
    // Listen for storage event (other tabs/pages)
    window.addEventListener('storage', function(event) {
        if (event.key === 'addressSync') {
            console.log("📢 Addresses changed event received (storage event)");
            // Reload addresses if modal is open
            if ($('#addressModal').hasClass('show') || $('#addressModal').is(':visible')) {
                console.log("🔄 Reloading addresses in open modal...");
                loadAddresses();
            }
        }
    });
    
    // Also listen when address modal is shown to check for updates
    $('#addressModal').on('shown.bs.modal', function() {
        // Check if there was a recent sync
        const lastSync = localStorage.getItem('addressLastSync');
        if (lastSync) {
            const syncTime = parseInt(lastSync);
            const now = Date.now();
            // If sync happened within last 2 seconds, reload
            if (now - syncTime < 2000) {
                console.log("🔄 Recent address change detected, reloading...");
                loadAddresses();
            }
        }
    });
    
    console.log("✅ Address sync listeners setup complete");
}

// Initialize sync listener when page loads
$(document).ready(function() {
    setupAddressSyncListener();
});

// ============================================
// PAYMENT METHOD MANAGEMENT FUNCTIONS
// ============================================

function loadPaymentMethods() {
    console.log("=== loadPaymentMethods() called ===");
    
    // Show loading state
    $('#paymentMethodsList').html(`
        <div class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="sr-only">Đang tải...</span>
            </div>
            <p class="mt-2 text-muted small">Đang tải...</p>
        </div>
    `);
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getMyPaymentMethods !== 'function') {
        console.error("❌ ApiService.getMyPaymentMethods is not available!");
        $('#paymentMethodsList').html('<div class="text-center py-4 text-danger">Chức năng chưa được triển khai. Vui lòng kiểm tra lại API service.</div>');
        return;
    }
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
        $('#paymentMethodsList').html('<div class="text-center py-4 text-danger">Vui lòng đăng nhập để xem thẻ của bạn!</div>');
        return;
    }
    
    ApiService.getMyPaymentMethods()
        .done(function(response) {
            console.log("=== Payment Methods API Response ===");
            console.log("Full response:", response);
            
            let methods = [];
            if (response && response.data) {
                methods = Array.isArray(response.data) ? response.data : [];
            } else if (response && Array.isArray(response)) {
                methods = response;
            }
            
            console.log("✅ Loaded payment methods:", methods);
            renderPaymentMethods(methods);
        })
        .fail(function(xhr) {
            console.error("=== Payment Methods API Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", xhr.status);
            console.error("Status Code:", xhr.status);
            console.error("ReadyState:", xhr.readyState);
            console.error("Response:", xhr.responseJSON);
            console.error("Response Text:", xhr.responseText);
            
            let errorMessage = 'Không thể tải danh sách thẻ!';
            let showRetryButton = true;
            
            if (xhr.status === 401 || xhr.status === 403) {
                errorMessage = 'Vui lòng đăng nhập để xem thẻ của bạn!';
                showRetryButton = false;
            } else if (xhr.status === 404) {
                errorMessage = 'API endpoint không tồn tại. Vui lòng kiểm tra backend.';
            } else if (xhr.status === 0 || xhr.readyState === 0) {
                // Network error - server not reachable
                const apiBaseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:82';
                errorMessage = `
                    <strong>❌ KHÔNG THỂ KẾT NỐI ĐẾN SERVER!</strong><br><br>
                    <small>
                    URL đã thử: <code>${apiBaseUrl}/user/payment-method</code><br><br>
                    <strong>📋 HƯỚNG DẪN KHẮC PHỤC:</strong><br>
                    1. Kiểm tra server có đang chạy:<br>
                       &nbsp;&nbsp;- Mở browser và truy cập: <code>http://localhost:82/restaurant</code><br>
                       &nbsp;&nbsp;- Nếu không truy cập được → Server chưa chạy<br><br>
                    2. Khởi động Spring Boot server:<br>
                       &nbsp;&nbsp;- Mở terminal và chạy: <code>cd food_delivery && mvn spring-boot:run</code><br><br>
                    3. Kiểm tra MySQL database có đang chạy không<br><br>
                    4. Sau khi server chạy, nhấn nút "Thử lại" bên dưới
                    </small>
                `;
            } else if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMessage = xhr.responseJSON.desc;
            }
            
            let retryButtonHtml = '';
            if (showRetryButton) {
                retryButtonHtml = `
                    <button class="btn btn-sm btn-primary mt-3" onclick="loadPaymentMethods()">
                        <i class="mdi mdi-refresh"></i> Thử lại
                    </button>
                `;
            }
            
            $('#paymentMethodsList').html(`
                <div class="text-center py-4">
                    <i class="mdi mdi-alert-circle text-danger" style="font-size: 48px;"></i>
                    <div class="text-danger mt-3" style="text-align: left; max-width: 500px; margin: 0 auto;">
                        ${errorMessage}
                    </div>
                    ${retryButtonHtml}
                </div>
            `);
        });
}

function renderPaymentMethods(methods) {
    const $container = $('#paymentMethodsList');
    const $count = $('#cardsCount');
    
    $count.text(methods.length);
    
    if (methods.length === 0) {
        $container.html(`
            <div class="text-center py-5">
                <i class="mdi mdi-credit-card-outline" style="font-size: 48px; color: #ccc;"></i>
                <p class="text-muted mt-3">Bạn chưa có thẻ nào được lưu</p>
                <p class="text-muted small">Nhấn "Thêm thẻ mới" để thêm thẻ đầu tiên</p>
            </div>
        `);
        return;
    }
    
    let html = '<div class="row">';
    methods.forEach(function(method) {
        const cardBrand = method.cardBrand || 'VISA';
        const cardIcon = getCardBrandIcon(cardBrand);
        const cardNumber = method.cardNumber || '****';
        const expiryMonth = method.expiryMonth ? String(method.expiryMonth).padStart(2, '0') : '**';
        const expiryYear = method.expiryYear ? String(method.expiryYear).slice(-2) : '**';
        const isDefault = method.isDefault ? '<span class="badge badge-primary ml-2">Mặc định</span>' : '';
        
        html += `
            <div class="col-md-6 mb-3">
                <div class="card ${method.isDefault ? 'border-primary' : ''}" data-method-id="${method.id}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 class="mb-1">${method.cardHolderName || 'N/A'}</h6>
                                <p class="text-muted small mb-0">${cardBrand}</p>
                            </div>
                            <div class="text-right">
                                ${cardIcon}
                                ${isDefault}
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-3">
                            <span class="mr-2"><i class="mdi mdi-circle" style="font-size: 8px;"></i></span>
                            <span class="mr-2"><i class="mdi mdi-circle" style="font-size: 8px;"></i></span>
                            <span class="mr-2"><i class="mdi mdi-circle" style="font-size: 8px;"></i></span>
                            <span class="mr-2"><i class="mdi mdi-circle" style="font-size: 8px;"></i></span>
                            <span class="font-weight-bold">${cardNumber}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Hết hạn: ${expiryMonth}/${expiryYear}</small>
                            <div>
                                ${!method.isDefault ? `<button class="btn btn-sm btn-outline-primary mr-1 set-default-btn" data-id="${method.id}">Đặt mặc định</button>` : ''}
                                <button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${method.id}">
                                    <i class="mdi mdi-delete"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    $container.html(html);
    
    // Setup event handlers
    $('.set-default-btn').on('click', function() {
        const methodId = $(this).data('id');
        setDefaultPaymentMethod(methodId);
    });
    
    $('.delete-card-btn').on('click', function() {
        const methodId = $(this).data('id');
        if (confirm('Bạn có chắc chắn muốn xóa thẻ này?')) {
            deletePaymentMethod(methodId);
        }
    });
}

function getCardBrandIcon(brand) {
    const brandUpper = (brand || '').toUpperCase();
    if (brandUpper.includes('VISA')) {
        return '<i class="fab fa-cc-visa text-primary" style="font-size: 32px;"></i>';
    } else if (brandUpper.includes('MASTER')) {
        return '<i class="fab fa-cc-mastercard text-warning" style="font-size: 32px;"></i>';
    } else if (brandUpper.includes('AMEX') || brandUpper.includes('AMERICAN')) {
        return '<i class="fab fa-cc-amex text-info" style="font-size: 32px;"></i>';
    } else {
        return '<i class="mdi mdi-credit-card text-secondary" style="font-size: 32px;"></i>';
    }
}

function resetPaymentMethodForm() {
    $('#paymentMethodId').val('');
    $('#cardNumber').val('');
    $('#cardExpiry').val('');
    $('#cardCVV').val('');
    $('#cardHolderName').val('');
    $('#setAsDefault').prop('checked', false);
}

function savePaymentMethod() {
    console.log("=== savePaymentMethod() called ===");
    
    const methodId = $('#paymentMethodId').val();
    const cardNumber = $('#cardNumber').val().replace(/\s/g, '');
    const cardExpiry = $('#cardExpiry').val();
    const cardCVV = $('#cardCVV').val();
    const cardHolderName = $('#cardHolderName').val().trim();
    const isDefault = $('#setAsDefault').is(':checked');
    
    // Validation
    if (!cardNumber || cardNumber.length < 13) {
        alert('Số thẻ không hợp lệ!');
        return;
    }
    
    if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        alert('Hạn sử dụng không hợp lệ! Vui lòng nhập định dạng MM/YY');
        return;
    }
    
    if (!cardCVV || cardCVV.length < 3) {
        alert('CVV không hợp lệ!');
        return;
    }
    
    if (!cardHolderName) {
        alert('Tên chủ thẻ không được để trống!');
        return;
    }
    
    // Parse expiry
    const [expiryMonth, expiryYear] = cardExpiry.split('/');
    const fullYear = '20' + expiryYear;
    
    // Detect card brand from first digit
    let cardBrand = 'VISA';
    if (cardNumber.startsWith('4')) {
        cardBrand = 'VISA';
    } else if (cardNumber.startsWith('5')) {
        cardBrand = 'MASTERCARD';
    } else if (cardNumber.startsWith('3')) {
        cardBrand = 'AMEX';
    }
    
    const paymentData = {
        type: 'CREDIT_CARD',
        cardNumber: cardNumber,
        cardHolderName: cardHolderName,
        expiryMonth: parseInt(expiryMonth),
        expiryYear: parseInt(fullYear),
        cardBrand: cardBrand,
        isDefault: isDefault
    };
    
    console.log("Payment data:", paymentData);
    
    // Disable button and show loading
    const $btn = $('#savePaymentMethodBtn');
    const originalText = $btn.html();
    $btn.prop('disabled', true).html('<i class="mdi mdi-loading mdi-spin"></i> Đang lưu...');
    
    let apiCall;
    if (methodId) {
        // Update existing payment method
        if (typeof ApiService.updatePaymentMethod !== 'function') {
            alert('Chức năng cập nhật thẻ chưa được triển khai!');
            $btn.prop('disabled', false).html(originalText);
            return;
        }
        apiCall = ApiService.updatePaymentMethod(methodId, paymentData);
    } else {
        // Create new payment method
        if (typeof ApiService.createPaymentMethod !== 'function') {
            alert('Chức năng tạo thẻ chưa được triển khai!');
            $btn.prop('disabled', false).html(originalText);
            return;
        }
        apiCall = ApiService.createPaymentMethod(paymentData);
    }
    
    apiCall
        .done(function(response) {
            console.log("=== Save Payment Method API Response ===");
            console.log("Full response:", response);
            
            const isSuccess = (response && response.status === 200) || 
                            (response && (response.isSuccess === true || response.success === true)) ||
                            (response && response.code === 200);
            
            if (isSuccess) {
                console.log("✅ Payment method saved successfully");
                alert('Lưu thẻ thành công!');
                
                // Close form modal
                $('#paymentsModal').modal('hide');
                
                // Reload payment methods
                loadPaymentMethods();
            } else {
                console.warn("⚠️ Save payment method failed:", response);
                const errorMsg = response?.desc || response?.message || 'Lưu thẻ thất bại!';
                alert(errorMsg);
            }
        })
        .fail(function(xhr) {
            console.error("=== Save Payment Method API Error ===");
            console.error("XHR:", xhr);
            
            let errorMsg = 'Lưu thẻ thất bại!';
            if (xhr.responseJSON) {
                const errorResponse = xhr.responseJSON;
                errorMsg = errorResponse.desc || errorResponse.message || errorMsg;
            }
            alert(errorMsg);
        })
        .always(function() {
            // Re-enable button
            $btn.prop('disabled', false).html(originalText);
        });
}

function setDefaultPaymentMethod(methodId) {
    console.log("=== setDefaultPaymentMethod() called ===");
    
    if (typeof ApiService.setDefaultPaymentMethod !== 'function') {
        alert('Chức năng đặt thẻ mặc định chưa được triển khai!');
        return;
    }
    
    ApiService.setDefaultPaymentMethod(methodId)
        .done(function(response) {
            const isSuccess = (response && response.status === 200) || 
                            (response && (response.isSuccess === true || response.success === true));
            
            if (isSuccess) {
                alert('Đặt thẻ mặc định thành công!');
                loadPaymentMethods();
            } else {
                alert('Đặt thẻ mặc định thất bại!');
            }
        })
        .fail(function(xhr) {
            alert('Lỗi khi đặt thẻ mặc định!');
        });
}

function deletePaymentMethod(methodId) {
    console.log("=== deletePaymentMethod() called ===");
    
    if (typeof ApiService.deletePaymentMethod !== 'function') {
        alert('Chức năng xóa thẻ chưa được triển khai!');
        return;
    }
    
    ApiService.deletePaymentMethod(methodId)
        .done(function(response) {
            const isSuccess = (response && response.status === 200) || 
                            (response && (response.isSuccess === true || response.success === true));
            
            if (isSuccess) {
                alert('Xóa thẻ thành công!');
                loadPaymentMethods();
            } else {
                alert('Xóa thẻ thất bại!');
            }
        })
        .fail(function(xhr) {
            alert('Lỗi khi xóa thẻ!');
        });
}

