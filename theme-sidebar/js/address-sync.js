/**
 * Address Sync System - Đồng bộ địa chỉ giữa các page
 * File này có thể được include vào bất kỳ page nào để đồng bộ địa chỉ
 */

(function() {
    'use strict';
    
    console.log("=== Address Sync System Loaded ===");
    
    /**
     * Universal function to load addresses - works for all pages
     */
    function loadAddressesUniversal() {
        console.log("=== loadAddressesUniversal() called ===");
        
        // Check if ApiService is available
        if (typeof ApiService === 'undefined' || typeof ApiService.getMyAddresses !== 'function') {
            console.error("❌ ApiService.getMyAddresses is not available");
            showAddressError("API Service không khả dụng");
            return;
        }
        
        // Check if user is authenticated
        if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
            console.warn("⚠️ User not authenticated");
            showAddressError("Vui lòng đăng nhập để xem địa chỉ");
            return;
        }
        
        // Show loading state
        showAddressLoading();
        
        ApiService.getMyAddresses()
            .done(function(response) {
                console.log("=== Addresses API Response ===");
                console.log("Full response:", response);
                console.log("Response type:", typeof response);
                console.log("Response.data:", response?.data);
                console.log("Response.data type:", typeof response?.data);
                console.log("Response.isSuccess:", response?.isSuccess);
                console.log("Response.success:", response?.success);
                console.log("Response.status:", response?.status);
                
                let addresses = [];
                
                // Handle different response formats
                if (response && response.data) {
                    if (Array.isArray(response.data)) {
                        addresses = response.data;
                        console.log("✅ Extracted addresses from response.data (array)");
                    } else if (typeof response.data === 'object' && response.data !== null) {
                        // If data is an object, try to extract array from it
                        console.warn("⚠️ response.data is object, not array:", response.data);
                        addresses = [];
                    }
                } else if (response && Array.isArray(response)) {
                    addresses = response;
                    console.log("✅ Extracted addresses from response (direct array)");
                } else {
                    console.warn("⚠️ Unexpected response format:", response);
                    addresses = [];
                }
                
                console.log("✅ Final addresses array:", addresses);
                console.log("✅ Addresses count:", addresses.length);
                
                if (addresses.length > 0) {
                    console.log("✅ First address sample:", addresses[0]);
                    console.log("✅ First address type:", addresses[0].type);
                }
                
                // Try to render addresses if function exists
                if (typeof renderAddresses === 'function') {
                    console.log("Using page-specific renderAddresses() function");
                    renderAddresses(addresses);
                } else {
                    console.log("Using fallback updateAddressModalContent() function");
                    // Fallback: update modal content if it exists
                    updateAddressModalContent(addresses);
                }
            })
            .fail(function(xhr) {
                console.error("=== Addresses API Error ===");
                console.error("XHR:", xhr);
                console.error("Status:", xhr.status);
                console.error("Response:", xhr.responseJSON);
                
                let errorMsg = 'Không thể tải danh sách địa chỉ!';
                if (xhr.status === 401 || xhr.status === 403) {
                    errorMsg = 'Vui lòng đăng nhập để xem địa chỉ!';
                } else if (xhr.status === 0) {
                    errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra backend.';
                } else if (xhr.responseJSON && xhr.responseJSON.desc) {
                    errorMsg = xhr.responseJSON.desc;
                }
                
                showAddressError(errorMsg);
            });
    }
    
    /**
     * Show loading state in address modal
     */
    function showAddressLoading() {
        if ($('#home').length && !$('#homeAddressList').length) {
            // Structure 2
            $('#home').html('<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div><p class="mt-2 text-muted small">Đang tải...</p></div>');
            $('#profile').html('<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div><p class="mt-2 text-muted small">Đang tải...</p></div>');
        } else if ($('#homeAddressList').length) {
            // Structure 1
            $('#homeAddressList').html('<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div><p class="mt-2 text-muted small">Đang tải...</p></div>');
            $('#officeAddressList').html('<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div><p class="mt-2 text-muted small">Đang tải...</p></div>');
        }
    }
    
    /**
     * Show error message in address modal
     */
    function showAddressError(message) {
        if ($('#home').length && !$('#homeAddressList').length) {
            // Structure 2
            $('#home').html(`<div class="text-center py-3"><i class="mdi mdi-alert-circle text-danger" style="font-size: 32px;"></i><p class="mt-2 text-danger small">${message}</p></div>`);
            $('#profile').html(`<div class="text-center py-3"><i class="mdi mdi-alert-circle text-danger" style="font-size: 32px;"></i><p class="mt-2 text-danger small">${message}</p></div>`);
        } else if ($('#homeAddressList').length) {
            // Structure 1
            $('#homeAddressList').html(`<div class="text-center py-3"><i class="mdi mdi-alert-circle text-danger" style="font-size: 32px;"></i><p class="mt-2 text-danger small">${message}</p></div>`);
            $('#officeAddressList').html(`<div class="text-center py-3"><i class="mdi mdi-alert-circle text-danger" style="font-size: 32px;"></i><p class="mt-2 text-danger small">${message}</p></div>`);
        }
    }
    
    /**
     * Update address modal content (fallback for pages without renderAddresses)
     */
    function updateAddressModalContent(addresses) {
        // This is a basic fallback - pages with full implementation should use renderAddresses
        console.log("=== updateAddressModalContent() called ===");
        console.log("Addresses received:", addresses);
        console.log("Addresses count:", addresses ? addresses.length : 0);
        
        if (!addresses || !Array.isArray(addresses)) {
            console.error("❌ Invalid addresses data:", addresses);
            showAddressError("Dữ liệu địa chỉ không hợp lệ");
            return;
        }
        
        // Update counts if elements exist
        // Filter addresses by type - handle both uppercase and lowercase, normalize first
        const homeAddresses = addresses.filter(addr => {
            const type = (addr.type || '').toUpperCase();
            return type === 'HOME';
        });
        const officeAddresses = addresses.filter(addr => {
            const type = (addr.type || '').toUpperCase();
            return type === 'OFFICE' || type === 'WORK';
        });
        
        console.log("=== Address Filtering Results ===");
        console.log("Total addresses:", addresses.length);
        console.log("Home addresses:", homeAddresses.length);
        console.log("Office addresses:", officeAddresses.length);
        
        // Log all address types for debugging
        if (addresses.length > 0) {
            console.log("All address types:", addresses.map(addr => ({ id: addr.id, type: addr.type, title: addr.title, address: addr.address })));
        }
        
        if ($('#homeCount').length) {
            $('#homeCount').text(homeAddresses.length);
        }
        if ($('#officeCount').length) {
            $('#officeCount').text(officeAddresses.length);
        }
        
        // For pages with addressModal but no renderAddresses function
        // Try to update the modal content if it has the standard structure
        
        // Structure 1: Settings page (has #homeAddressList and #officeAddressList)
        if ($('#addressModal').length && $('#homeAddressList').length) {
            // Render home addresses
            if (homeAddresses.length > 0) {
                const homeHtml = homeAddresses.map(addr => {
                    return `
                        <div class="d-flex align-items-center mb-3 p-3 border rounded" data-address-id="${addr.id}">
                            <div class="mr-3">
                                <i class="mdi mdi-home text-danger" style="font-size: 24px;"></i>
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${addr.title || 'Nhà'}</h6>
                                <p class="mb-0 text-muted small">${addr.address || ''}</p>
                            </div>
                        </div>
                    `;
                }).join('');
                $('#homeAddressList').html(homeHtml);
            } else {
                $('#homeAddressList').html('<p class="text-muted text-center py-3">Chưa có địa chỉ nhà</p>');
            }
            
            // Render office addresses
            if ($('#officeAddressList').length) {
                if (officeAddresses.length > 0) {
                    const officeHtml = officeAddresses.map(addr => {
                        return `
                            <div class="d-flex align-items-center mb-3 p-3 border rounded" data-address-id="${addr.id}">
                                <div class="mr-3">
                                    <i class="mdi mdi-office-building text-primary" style="font-size: 24px;"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">${addr.title || 'Cơ quan'}</h6>
                                    <p class="mb-0 text-muted small">${addr.address || ''}</p>
                                </div>
                            </div>
                        `;
                    }).join('');
                    $('#officeAddressList').html(officeHtml);
                } else {
                    $('#officeAddressList').html('<p class="text-muted text-center py-3">Chưa có địa chỉ cơ quan</p>');
                }
            }
        }
        
        // Structure 2: Other pages (has #home and #profile tabs)
        if ($('#addressModal').length && $('#home').length && !$('#homeAddressList').length) {
            console.log("Rendering addresses for Structure 2 (index.html style)");
            
            // Update tab counts - preserve original text format
            const homeTab = $('#home-tab');
            const profileTab = $('#profile-tab');
            
            // Update tab counts - check for dynamic count spans first
            if ($('#homeCountDynamic').length) {
                $('#homeCountDynamic').text(homeAddresses.length);
                console.log("Updated homeCountDynamic to:", homeAddresses.length);
            } else if (homeTab.length) {
                const originalText = homeTab.text();
                // Replace number in parentheses, or add if doesn't exist
                if (originalText.match(/\(\d+\)/)) {
                    homeTab.text(originalText.replace(/\(\d+\)/, `(${homeAddresses.length})`));
                } else {
                    // If no number, add it (e.g., "Home" -> "Home (2)")
                    const baseText = originalText.replace(/\s*\(\d+\)\s*$/, '').trim();
                    homeTab.text(`${baseText} (${homeAddresses.length})`);
                }
            }
            
            if ($('#workCountDynamic').length) {
                $('#workCountDynamic').text(officeAddresses.length);
            } else if (profileTab.length) {
                const originalText = profileTab.text();
                // Replace number in parentheses, or add if doesn't exist
                if (originalText.match(/\(\d+\)/)) {
                    profileTab.text(originalText.replace(/\(\d+\)/, `(${officeAddresses.length})`));
                } else {
                    // If no number, add it
                    const baseText = originalText.replace(/\s*\(\d+\)\s*$/, '').trim();
                    profileTab.text(`${baseText} (${officeAddresses.length})`);
                }
            }
            
            // Render home addresses in #home tab
            if (homeAddresses.length > 0) {
                const homeHtml = homeAddresses.map(addr => {
                    const title = addr.title || 'Nhà';
                    const address = addr.address || '';
                    console.log("Rendering home address:", title, address);
                    return `
                        <div type="button" data-dismiss="modal" class="d-flex align-items-center mb-2 border rounded p-2" data-address-id="${addr.id}">
                            <div class="mr-3 bg-light rounded p-2 osahan-icon">
                                <i class="mdi mdi-home-variant-outline"></i>
                            </div>
                            <div class="w-100">
                                <p class="mb-0 font-weight-bold text-dark">${title}</p>
                                <p class="mb-0 small">${address}</p>
                            </div>
                        </div>
                    `;
                }).join('');
                $('#home').html(homeHtml);
                console.log("✅ Rendered", homeAddresses.length, "home addresses");
            } else {
                $('#home').html('<p class="text-muted text-center py-3">Chưa có địa chỉ nhà</p>');
                console.log("No home addresses to render");
            }
            
            // Render office addresses in #profile tab
            if ($('#profile').length) {
                if (officeAddresses.length > 0) {
                    const officeHtml = officeAddresses.map(addr => {
                        const title = addr.title || 'Cơ quan';
                        const address = addr.address || '';
                        console.log("Rendering office address:", title, address);
                        return `
                            <div type="button" data-dismiss="modal" class="d-flex align-items-center mb-2 border rounded p-2" data-address-id="${addr.id}">
                                <div class="mr-3 bg-light rounded p-2 osahan-icon">
                                    <i class="mdi mdi-office-building-marker-outline"></i>
                                </div>
                                <div class="w-100">
                                    <p class="mb-0 font-weight-bold text-dark">${title}</p>
                                    <p class="mb-0 small">${address}</p>
                                </div>
                            </div>
                        `;
                    }).join('');
                    $('#profile').html(officeHtml);
                    console.log("✅ Rendered", officeAddresses.length, "office addresses");
                } else {
                    $('#profile').html('<p class="text-muted text-center py-3">Chưa có địa chỉ cơ quan</p>');
                    console.log("No office addresses to render");
                }
            }
            
            console.log("✅ Addresses rendered for Structure 2 - COMPLETE");
        } else {
            console.log("⚠️ Structure 2 conditions not met. addressModal:", $('#addressModal').length, "home:", $('#home').length, "homeAddressList:", $('#homeAddressList').length);
        }
    }
    
    /**
     * Trigger address sync event (to notify other tabs/pages)
     */
    function triggerAddressSync() {
        console.log("📢 Triggering address sync event...");
        
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
        
        console.log("✅ Address sync event triggered");
    }
    
    /**
     * Listen for address changes from other pages/modals
     */
    function setupAddressSyncListener() {
        console.log("=== setupAddressSyncListener() called ===");
        
        // Function to reload addresses
        function reloadAddressesIfNeeded() {
            // Check if any address modal is open
            const addressModalOpen = $('#addressModal').hasClass('show') || $('#addressModal').is(':visible');
            const myaddressModalOpen = $('#myaddressModal').hasClass('show') || $('#myaddressModal').is(':visible');
            
            if (addressModalOpen || myaddressModalOpen) {
                console.log("🔄 Reloading addresses in open modal...");
                // Try page-specific function first, then fallback to universal
                if (typeof loadAddresses === 'function') {
                    loadAddresses();
                } else {
                    loadAddressesUniversal();
                }
            }
            
            // Also reload delivery address in cart if cart modal is open
            if (typeof loadDeliveryAddress === 'function') {
                const cartModal = $('#cartModal');
                if (cartModal.hasClass('show') || cartModal.is(':visible')) {
                    console.log("🔄 Reloading delivery address in cart...");
                    loadDeliveryAddress();
                }
            }
        }
        
        // Listen for custom event (same page)
        window.addEventListener('addressesChanged', function(event) {
            console.log("📢 Addresses changed event received (custom event)");
            reloadAddressesIfNeeded();
        });
        
        // Listen for storage event (other tabs/pages)
        window.addEventListener('storage', function(event) {
            if (event.key === 'addressSync') {
                console.log("📢 Addresses changed event received (storage event)");
                reloadAddressesIfNeeded();
            }
            
            // Also listen for selected address changes
            if (event.key === 'selectedDeliveryAddress') {
                console.log("📢 Selected delivery address changed (storage event)");
                if (typeof loadDeliveryAddress === 'function') {
                    const cartModal = $('#cartModal');
                    if (cartModal.hasClass('show') || cartModal.is(':visible')) {
                        loadDeliveryAddress();
                    }
                }
            }
        });
        
        // Listen when address modal is shown to load addresses
        $(document).on('shown.bs.modal', '#addressModal, #myaddressModal', function() {
            console.log("📋 Address modal shown, loading addresses...");
            
            // Always load addresses when modal opens (to ensure fresh data)
            // Try page-specific function first, then fallback to universal
            if (typeof loadAddresses === 'function') {
                console.log("Using page-specific loadAddresses()");
                loadAddresses();
            } else {
                console.log("Using universal loadAddressesUniversal()");
                loadAddressesUniversal();
            }
        });
        
        // Also listen on 'show' event (before modal is fully shown) to clear old data
        $(document).on('show.bs.modal', '#addressModal, #myaddressModal', function() {
            console.log("📋 Address modal opening, preparing to load addresses...");
            // Show loading state immediately
            showAddressLoading();
        });
        
        // Listen for page visibility change to refresh addresses when tab becomes active
        $(document).on('visibilitychange', function() {
            if (!document.hidden) {
                console.log("Page became visible, checking for address updates...");
                // Check if any address modal is open
                const addressModalOpen = $('#addressModal').hasClass('show') || $('#addressModal').is(':visible');
                const myaddressModalOpen = $('#myaddressModal').hasClass('show') || $('#myaddressModal').is(':visible');
                if (addressModalOpen || myaddressModalOpen) {
                    reloadAddressesIfNeeded();
                }
            }
        });
        
        console.log("✅ Address sync listeners setup complete");
    }
    
    // Export trigger function globally
    window.triggerAddressSync = triggerAddressSync;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAddressSyncListener);
    } else {
        // DOM is already ready
        setupAddressSyncListener();
    }
    
    // Also initialize when jQuery is ready (if jQuery is loaded)
    if (typeof $ !== 'undefined') {
        $(document).ready(function() {
            setupAddressSyncListener();
        });
    }
    
    // Export function globally so it can be called from other scripts
    window.loadAddressesUniversal = loadAddressesUniversal;
})();

