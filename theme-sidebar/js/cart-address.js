/*
 * Cart Address Management - Load and select delivery address for cart
 * Version: 1.0
 */

console.log("=== CART-ADDRESS.JS LOADED ===");

// Store selected address
let selectedAddress = null;

// Helper function to get user ID from API
function getUserIdFromAPI(callback) {
    const cachedId = localStorage.getItem('userId');
    if (cachedId) {
        const parsedId = parseInt(cachedId);
        if (!isNaN(parsedId) && parsedId > 0 && !cachedId.includes('@')) {
            callback(parsedId);
            return;
        }
    }
    
    if (typeof ApiService === 'undefined' || typeof ApiService.getMyInfo !== 'function') {
        console.error("❌ ApiService.getMyInfo is not available!");
        callback(null);
        return;
    }
    
    ApiService.getMyInfo()
        .done(function(response) {
            let userData = null;
            if (response && response.result) {
                userData = response.result;
            } else if (response && response.data) {
                userData = response.data;
            } else if (response && response.id) {
                userData = response;
            }
            
            if (userData && userData.id) {
                const userId = parseInt(userData.id);
                if (!isNaN(userId) && userId > 0) {
                    localStorage.setItem('userId', userId.toString());
                    callback(userId);
                } else {
                    callback(null);
                }
            } else {
                callback(null);
            }
        })
        .fail(function() {
            callback(null);
        });
}

/**
 * Load and display delivery address in cart
 */
function loadDeliveryAddress() {
    console.log("=== loadDeliveryAddress() called ===");
    
    getUserIdFromAPI(function(userId) {
        if (!userId) {
            console.warn("⚠️ No user ID found, cannot load address");
            updateDeliveryAddressDisplay("Chưa đăng nhập");
            return;
        }
        
        // Try to get default address first
        if (typeof ApiService !== 'undefined' && typeof ApiService.getDefaultAddress === 'function') {
            ApiService.getDefaultAddress()
                .done(function(response) {
                    console.log("=== Default Address API Response ===");
                    console.log("Full response:", response);
                    
                    let addressData = null;
                    if (response && response.data) {
                        addressData = response.data;
                    } else if (response && response.result) {
                        addressData = response.result;
                    } else if (response && response.id) {
                        addressData = response;
                    }
                    
                    if (addressData && addressData.address) {
                        selectedAddress = addressData;
                        updateDeliveryAddressDisplay(addressData.address);
                        // Store in localStorage
                        localStorage.setItem('selectedDeliveryAddress', JSON.stringify({
                            id: addressData.id,
                            address: addressData.address,
                            title: addressData.title,
                            type: addressData.type
                        }));
                    } else {
                        // No default address, try to get first address
                        loadFirstAddress(userId);
                    }
                })
                .fail(function() {
                    // Fallback: try to get all addresses and use first one
                    loadFirstAddress(userId);
                });
        } else {
            loadFirstAddress(userId);
        }
    });
}

/**
 * Load first address if no default
 */
function loadFirstAddress(userId) {
    if (typeof ApiService !== 'undefined' && typeof ApiService.getMyAddresses === 'function') {
        ApiService.getMyAddresses()
            .done(function(response) {
                console.log("=== My Addresses API Response ===");
                console.log("Full response:", response);
                
                let addresses = [];
                if (response && response.data && Array.isArray(response.data)) {
                    addresses = response.data;
                } else if (response && response.result && Array.isArray(response.result)) {
                    addresses = response.result;
                } else if (Array.isArray(response)) {
                    addresses = response;
                }
                
                if (addresses && addresses.length > 0) {
                    selectedAddress = addresses[0];
                    updateDeliveryAddressDisplay(addresses[0].address);
                    // Store in localStorage
                    localStorage.setItem('selectedDeliveryAddress', JSON.stringify({
                        id: addresses[0].id,
                        address: addresses[0].address,
                        title: addresses[0].title,
                        type: addresses[0].type
                    }));
                } else {
                    // No addresses saved
                    updateDeliveryAddressDisplay("Chưa có địa chỉ");
                }
            })
            .fail(function() {
                updateDeliveryAddressDisplay("Chưa có địa chỉ");
            });
    } else {
        updateDeliveryAddressDisplay("Chưa có địa chỉ");
    }
}

/**
 * Update delivery address display in cart
 */
function updateDeliveryAddressDisplay(address) {
    console.log("=== updateDeliveryAddressDisplay() called ===");
    console.log("Address:", address);
    
    // Update in cart modal
    const addressLink = $('a[data-target="#myaddressModal"]');
    if (addressLink.length) {
        const addressText = addressLink.find('p.small');
        if (addressText.length) {
            addressText.text(address || 'Chưa có địa chỉ');
        } else {
            // If structure is different, try to find and update
            addressLink.find('p:last-child').text(address || 'Chưa có địa chỉ');
        }
    }
}

/**
 * Open address selection modal for cart
 */
function openAddressSelectionModal() {
    console.log("=== openAddressSelectionModal() called ===");
    
    getUserIdFromAPI(function(userId) {
        if (!userId) {
            alert('Vui lòng đăng nhập để quản lý địa chỉ!');
            window.location.href = 'signin.html';
            return;
        }
        
        // Load addresses
        if (typeof ApiService !== 'undefined' && typeof ApiService.getMyAddresses === 'function') {
            ApiService.getMyAddresses()
                .done(function(response) {
                    console.log("=== My Addresses API Response ===");
                    console.log("Full response:", response);
                    
                    let addresses = [];
                    if (response && response.data && Array.isArray(response.data)) {
                        addresses = response.data;
                    } else if (response && response.result && Array.isArray(response.result)) {
                        addresses = response.result;
                    } else if (Array.isArray(response)) {
                        addresses = response;
                    }
                    
                    renderAddressSelectionForCart(addresses);
                })
                .fail(function() {
                    console.error("Failed to load addresses");
                    renderAddressSelectionForCart([]);
                });
        } else {
            renderAddressSelectionForCart([]);
        }
    });
}

/**
 * Render address selection for cart
 */
function renderAddressSelectionForCart(addresses) {
    console.log("=== renderAddressSelectionForCart() called ===");
    console.log("Addresses:", addresses);
    
    const modalBody = $('#myaddressModal .modal-body');
    if (!modalBody.length) {
        console.error("Address modal body not found");
        return;
    }
    
    // Get current selected address
    const currentAddressStr = localStorage.getItem('selectedDeliveryAddress');
    let currentAddress = null;
    if (currentAddressStr) {
        try {
            currentAddress = JSON.parse(currentAddressStr);
        } catch (e) {
            console.warn("Failed to parse current address from localStorage");
        }
    }
    
    if (!addresses || addresses.length === 0) {
        modalBody.html(`
            <div class="text-center py-4">
                <i class="mdi mdi-map-marker-off text-muted" style="font-size: 48px;"></i>
                <p class="text-muted mt-3">Bạn chưa có địa chỉ nào đã lưu.</p>
                <button class="btn btn-primary" onclick="openAddAddressForm()">
                    <i class="mdi mdi-plus mr-1"></i>Thêm địa chỉ mới
                </button>
            </div>
        `);
        return;
    }
    
    // Group addresses by type
    const homeAddresses = addresses.filter(addr => addr.type === 'HOME' || addr.type === 'home' || !addr.type);
    const officeAddresses = addresses.filter(addr => addr.type === 'OFFICE' || addr.type === 'office');
    const otherAddresses = addresses.filter(addr => addr.type === 'OTHER' || addr.type === 'other');
    
    let html = `
        <div class="mb-3">
            <p class="text-dark font-weight-bold mb-2">Chọn địa chỉ giao hàng</p>
        </div>
    `;
    
    // Home addresses
    if (homeAddresses.length > 0) {
        html += `
            <div class="mb-3">
                <h6 class="text-dark mb-2"><i class="mdi mdi-home-variant-outline mr-2"></i>Nhà (${homeAddresses.length})</h6>
        `;
        homeAddresses.forEach(function(addr) {
            const isSelected = currentAddress && currentAddress.id === addr.id;
            html += `
                <div class="d-flex align-items-center mb-2 border rounded p-2 address-item ${isSelected ? 'border-primary bg-light' : ''}" 
                     style="cursor: pointer;" 
                     onclick="selectAddressForCart(${addr.id}, '${(addr.address || '').replace(/'/g, "\\'")}', '${(addr.title || 'Nhà').replace(/'/g, "\\'")}', '${addr.type || 'HOME'}');">
                    <div class="mr-3 bg-light rounded p-2">
                        <i class="mdi mdi-home-variant-outline"></i>
                    </div>
                    <div class="flex-grow-1">
                        <p class="mb-0 font-weight-bold text-dark">${addr.title || 'Nhà'}</p>
                        <p class="mb-0 small text-muted">${addr.address || 'N/A'}</p>
                    </div>
                    ${isSelected ? '<i class="mdi mdi-check-circle text-primary"></i>' : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    
    // Office addresses
    if (officeAddresses.length > 0) {
        html += `
            <div class="mb-3">
                <h6 class="text-dark mb-2"><i class="mdi mdi-office-building-marker-outline mr-2"></i>Cơ quan (${officeAddresses.length})</h6>
        `;
        officeAddresses.forEach(function(addr) {
            const isSelected = currentAddress && currentAddress.id === addr.id;
            html += `
                <div class="d-flex align-items-center mb-2 border rounded p-2 address-item ${isSelected ? 'border-primary bg-light' : ''}" 
                     style="cursor: pointer;" 
                     onclick="selectAddressForCart(${addr.id}, '${(addr.address || '').replace(/'/g, "\\'")}', '${(addr.title || 'Cơ quan').replace(/'/g, "\\'")}', '${addr.type || 'OFFICE'}');">
                    <div class="mr-3 bg-light rounded p-2">
                        <i class="mdi mdi-office-building-marker-outline"></i>
                    </div>
                    <div class="flex-grow-1">
                        <p class="mb-0 font-weight-bold text-dark">${addr.title || 'Cơ quan'}</p>
                        <p class="mb-0 small text-muted">${addr.address || 'N/A'}</p>
                    </div>
                    ${isSelected ? '<i class="mdi mdi-check-circle text-primary"></i>' : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    
    // Other addresses
    if (otherAddresses.length > 0) {
        html += `
            <div class="mb-3">
                <h6 class="text-dark mb-2"><i class="mdi mdi-map-marker-outline mr-2"></i>Khác (${otherAddresses.length})</h6>
        `;
        otherAddresses.forEach(function(addr) {
            const isSelected = currentAddress && currentAddress.id === addr.id;
            html += `
                <div class="d-flex align-items-center mb-2 border rounded p-2 address-item ${isSelected ? 'border-primary bg-light' : ''}" 
                     style="cursor: pointer;" 
                     onclick="selectAddressForCart(${addr.id}, '${(addr.address || '').replace(/'/g, "\\'")}', '${(addr.title || 'Khác').replace(/'/g, "\\'")}', '${addr.type || 'OTHER'}');">
                    <div class="mr-3 bg-light rounded p-2">
                        <i class="mdi mdi-map-marker-outline"></i>
                    </div>
                    <div class="flex-grow-1">
                        <p class="mb-0 font-weight-bold text-dark">${addr.title || 'Khác'}</p>
                        <p class="mb-0 small text-muted">${addr.address || 'N/A'}</p>
                    </div>
                    ${isSelected ? '<i class="mdi mdi-check-circle text-primary"></i>' : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    
    html += `
        <div class="text-center mt-3 border-top pt-3">
            <button class="btn btn-outline-primary btn-sm" onclick="openAddAddressForm()">
                <i class="mdi mdi-plus mr-1"></i>Thêm địa chỉ mới
            </button>
        </div>
    `;
    
    modalBody.html(html);
}

/**
 * Select address for cart
 */
function selectAddressForCart(addressId, address, title, type) {
    console.log("=== selectAddressForCart() called ===");
    console.log("Address ID:", addressId);
    console.log("Address:", address);
    console.log("Title:", title);
    console.log("Type:", type);
    
    selectedAddress = {
        id: addressId,
        address: address,
        title: title,
        type: type
    };
    
    // Store in localStorage
    const oldValue = localStorage.getItem('selectedDeliveryAddress');
    localStorage.setItem('selectedDeliveryAddress', JSON.stringify(selectedAddress));
    
    // Trigger storage event for other tabs (force by removing and re-adding)
    if (oldValue !== JSON.stringify(selectedAddress)) {
        localStorage.removeItem('selectedDeliveryAddress');
        localStorage.setItem('selectedDeliveryAddress', JSON.stringify(selectedAddress));
    }
    
    // Update display
    updateDeliveryAddressDisplay(address);
    
    // Close modal
    $('#myaddressModal').modal('hide');
    
    // Show success message
    if (typeof showToast !== 'undefined') {
        showToast('Đã chọn địa chỉ giao hàng!', 'success');
    } else {
        console.log("✅ Address selected:", address);
    }
    
    // Trigger custom event for same page
    $(document).trigger('deliveryAddressChanged', [selectedAddress]);
}

/**
 * Open add address form
 */
function openAddAddressForm() {
    console.log("=== openAddAddressForm() called ===");
    // Close current modal and redirect to settings page
    $('#myaddressModal').modal('hide');
    setTimeout(function() {
        window.location.href = 'settings.html#addresses';
    }, 300);
}

// Initialize when cart modal is opened
$(document).on('shown.bs.modal', '#cartModal', function() {
    console.log("Cart modal opened, loading delivery address...");
    loadDeliveryAddress();
});

// Handle click on address edit link
$(document).on('click', 'a[data-target="#myaddressModal"]', function(e) {
    e.preventDefault();
    openAddressSelectionModal();
});

// Load address when page loads (if cart is already open)
$(document).ready(function() {
    if ($('#cartModal').hasClass('show')) {
        loadDeliveryAddress();
    }
    
    // Also try to load from localStorage
    const savedAddress = localStorage.getItem('selectedDeliveryAddress');
    if (savedAddress) {
        try {
            const address = JSON.parse(savedAddress);
            if (address && address.address) {
                selectedAddress = address;
                updateDeliveryAddressDisplay(address.address);
            }
        } catch (e) {
            console.warn("Failed to parse saved address");
        }
    }
    
    // Listen for storage events (cross-tab sync for selected address)
    $(window).on('storage', function(e) {
        if (e.originalEvent.key === 'selectedDeliveryAddress') {
            console.log("=== Selected delivery address changed (storage event) ===");
            const newAddressStr = e.originalEvent.newValue;
            if (newAddressStr) {
                try {
                    const address = JSON.parse(newAddressStr);
                    if (address && address.address) {
                        selectedAddress = address;
                        updateDeliveryAddressDisplay(address.address);
                        console.log("✅ Delivery address updated from storage event");
                    }
                } catch (e) {
                    console.warn("Failed to parse address from storage event");
                }
            }
        }
    });
    
    // Listen for custom event (same page)
    $(document).on('deliveryAddressChanged', function(e, address) {
        console.log("=== Delivery address changed (custom event) ===");
        if (address && address.address) {
            selectedAddress = address;
            updateDeliveryAddressDisplay(address.address);
            console.log("✅ Delivery address updated from custom event");
        }
    });
});

