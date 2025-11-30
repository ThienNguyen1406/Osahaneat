/*
 * Admin Orders Page - Quản lý đơn hàng
 */

// Global function to handle update status button click
window.handleUpdateStatus = function(orderId) {
    console.log("=== handleUpdateStatus() called ===");
    console.log("Order ID:", orderId);
    console.log("Type of orderId:", typeof orderId);
    
    // Convert to number if string
    if (typeof orderId === 'string') {
        orderId = parseInt(orderId);
    }
    
    if (!orderId || orderId <= 0 || isNaN(orderId)) {
        console.error("Invalid order ID:", orderId);
        alert('ID đơn hàng không hợp lệ: ' + orderId);
        showToast('ID đơn hàng không hợp lệ!', 'error');
        return false;
    }
    
    const $select = $(`#status-select-${orderId}`);
    console.log("Select element found:", $select.length);
    console.log("Select element:", $select);
    console.log("Select value:", $select.val());
    
    if ($select.length === 0) {
        console.error("Select element not found for order ID:", orderId);
        alert('Không tìm thấy dropdown trạng thái cho order ID: ' + orderId);
        showToast('Không tìm thấy dropdown trạng thái!', 'error');
        return false;
    }
    
    const newStatus = $select.val();
    if (!newStatus) {
        console.error("New status is empty!");
        alert('Trạng thái không được để trống!');
        return false;
    }
    
    const originalValue = $select.data('original-value');
    console.log("New Status:", newStatus);
    console.log("Original Value:", originalValue);
    
    if (originalValue === newStatus) {
        console.log("Status unchanged, showing info");
        showToast('Trạng thái không thay đổi!', 'info');
        return false;
    }
    
    console.log("Calling updateOrderStatus with:", {
        orderId: orderId,
        newStatus: newStatus,
        selectElement: $select
    });
    
    updateOrderStatus(orderId, newStatus, $select);
    return false;
};

$(document).ready(function() {
    // Load orders list
    loadOrders();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Setup status filter
    $('#status-filter').on('change', function() {
        loadOrders();
    });
    
    // Use event delegation (works with DataTable)
    $(document).on('click', '.update-status-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("=== Update button clicked via event delegation ===");
        const orderId = $(this).data('order-id');
        console.log("Order ID from button:", orderId);
        
        if (!orderId) {
            console.error("No order ID found on button");
            alert('Không tìm thấy ID đơn hàng!');
            return false;
        }
        
        console.log("Calling handleUpdateStatus with orderId:", orderId);
        handleUpdateStatus(orderId);
        return false;
    });
});

function loadOrders() {
    console.log("=== loadOrders() called ===");
    
    AdminApiService.getAllOrders()
        .done(function(response) {
            try {
                console.log("=== Orders API Response ===", response);
                console.log("Response type:", typeof response);
                console.log("Response keys:", Object.keys(response || {}));
                
                let orders = [];
                
                // Check nhiều format khác nhau
                if (response) {
                    // Format 1: { status: 200, isSuccess: true, data: [...] }
                    if (response.status === 200 && (response.isSuccess === true || response.success === true) && response.data) {
                        orders = Array.isArray(response.data) ? response.data : [];
                        console.log("✅ Orders loaded (format 1):", orders.length);
                        console.log("Orders array:", orders);
                    }
                    // Format 2: Direct array
                    else if (Array.isArray(response)) {
                        orders = response;
                        console.log("✅ Orders loaded (format 2 - direct array):", orders.length);
                    }
                    // Format 3: { data: [...] } without status
                    else if (response.data && Array.isArray(response.data)) {
                        orders = response.data;
                        console.log("✅ Orders loaded (format 3):", orders.length);
                    }
                    else {
                        console.warn("⚠️ Unknown response format:", response);
                    }
                }
                
                console.log("After parsing, orders.length =", orders.length);
                console.log("Orders array:", orders);
                
                if (orders.length > 0) {
                    console.log("Orders array has", orders.length, "items");
                    
                    // Update statistics
                    try {
                        updateOrderStatistics(orders);
                        console.log("Statistics updated successfully");
                    } catch (e) {
                        console.error("Error updating statistics:", e);
                        console.error("Stack trace:", e.stack);
                    }
                    
                    // Filter orders by status if filter is set
                    const statusFilter = $('#status-filter').val();
                    console.log("Status filter value:", statusFilter);
                    let filteredOrders = orders;
                    if (statusFilter) {
                        filteredOrders = orders.filter(function(order) {
                            return (order.status || 'created') === statusFilter;
                        });
                        console.log("After filtering, orders count:", filteredOrders.length);
                    }
                    
                    console.log("About to call renderOrdersTable with", filteredOrders.length, "orders");
                    if (filteredOrders.length > 0) {
                        console.log("Calling renderOrdersTable...");
                        try {
                            renderOrdersTable(filteredOrders);
                            console.log("renderOrdersTable called successfully");
                        } catch (e) {
                            console.error("Error in renderOrdersTable:", e);
                            console.error("Stack trace:", e.stack);
                            alert("Lỗi khi render bảng đơn hàng: " + e.message);
                        }
                    } else {
                        console.log("No filtered orders, showing no orders message");
                        showNoOrdersMessage('Không có đơn hàng nào với trạng thái đã chọn.');
                    }
                } else {
                    console.log("No orders found, showing no orders message");
                    updateOrderStatistics([]);
                    showNoOrdersMessage();
                }
            } catch (e) {
                console.error("❌ CRITICAL ERROR in loadOrders done handler:", e);
                console.error("Error message:", e.message);
                console.error("Stack trace:", e.stack);
                alert("Lỗi khi xử lý dữ liệu đơn hàng: " + e.message);
            }
        })
        .fail(function(xhr, status, error) {
            console.error('=== Error loading orders ===');
            console.error('XHR:', xhr);
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Response Text:', xhr.responseText);
            console.error('Response JSON:', xhr.responseJSON);
            console.error('Status Code:', xhr.status);
            console.error('Ready State:', xhr.readyState);
            console.error('Request URL:', xhr.responseURL || 'N/A');
            
            let errorMsg = "Không thể tải danh sách đơn hàng!";
            
            // Try to parse responseText as JSON if responseJSON is undefined
            let errorObj = null;
            console.log("Attempting to parse error response...");
            console.log("xhr.responseJSON:", xhr.responseJSON);
            console.log("xhr.responseText:", xhr.responseText);
            console.log("xhr.responseText type:", typeof xhr.responseText);
            
            if (xhr.responseJSON) {
                errorObj = xhr.responseJSON;
                console.log("✅ Using responseJSON:", errorObj);
            } else if (xhr.responseText) {
                try {
                    // Try to parse as JSON string
                    const text = typeof xhr.responseText === 'string' ? xhr.responseText : String(xhr.responseText);
                    console.log("Attempting to parse responseText:", text.substring(0, 200));
                    errorObj = JSON.parse(text);
                    console.log("✅ Parsed responseText as JSON:", errorObj);
                } catch (e) {
                    console.warn("⚠️ Could not parse responseText as JSON:", e);
                    console.warn("ResponseText content:", xhr.responseText);
                    console.warn("ResponseText length:", xhr.responseText ? xhr.responseText.length : 0);
                }
            }
            
            // Try to get error message from parsed object
            if (errorObj) {
                console.log("Error object:", errorObj);
                console.log("Error object keys:", Object.keys(errorObj));
                if (errorObj.message) {
                    errorMsg = errorObj.message;
                    console.log("Using errorObj.message:", errorMsg);
                } else if (errorObj.desc) {
                    errorMsg = errorObj.desc;
                    console.log("Using errorObj.desc:", errorMsg);
                } else if (errorObj.error) {
                    errorMsg = errorObj.error;
                    console.log("Using errorObj.error:", errorMsg);
                } else if (errorObj.code && errorObj.code === 9999) {
                    errorMsg = "Lỗi không xác định từ server. Vui lòng kiểm tra lại!";
                    console.log("Using generic error message for code 9999");
                } else {
                    console.warn("⚠️ No error message found in errorObj:", errorObj);
                }
            } else {
                console.warn("⚠️ No errorObj parsed, using default error message");
            }
            
            // Handle specific status codes
            if (xhr.status === 0 || (status === 'error' && xhr.readyState === 0)) {
                // Network error - server not reachable
                errorMsg = "Không thể kết nối đến server. Vui lòng:\n1. Kiểm tra server có đang chạy không\n2. Kiểm tra kết nối mạng\n3. Thử lại sau";
                console.error("❌ Network error: Server not reachable");
                alert(errorMsg);
                showNoOrdersMessage();
                return;
            } else if (xhr.status === 400) {
                errorMsg = errorMsg || "Thông tin không hợp lệ. Vui lòng kiểm tra lại!";
                console.error('Error message:', errorMsg);
                alert(errorMsg);
            } else if (xhr.status === 403) {
                alert('Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản admin.');
                if (typeof removeToken === 'function') {
                    removeToken();
                }
                window.location.href = 'login.html';
                return;
            } else if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
                if (typeof removeToken === 'function') {
                    removeToken();
                }
                window.location.href = 'login.html';
                return;
            } else if (status === 'parsererror') {
                // Don't show alert for parsererror, just log it
                console.error('JSON parsing error. Backend may need to add more @JsonIgnore annotations.');
            } else {
                console.error('Error message:', errorMsg);
                // Show alert for other errors
                alert(errorMsg);
            }
            
            showNoOrdersMessage();
        });
}

function renderOrdersTable(orders) {
    console.log("=== renderOrdersTable() called ===");
    console.log("Orders count:", orders ? orders.length : 0);
    
    const tbody = $('#dataTable tbody');
    console.log("Table tbody found:", tbody.length > 0);
    
    if (tbody.length === 0) {
        console.error("Orders table tbody not found");
        return;
    }
    
    if (!orders || orders.length === 0) {
        console.log("No orders to render, showing no orders message");
        showNoOrdersMessage();
        return;
    }
    
    console.log("Rendering", orders.length, "orders...");
    
    let html = '';
    orders.forEach(function(order) {
        const orderDate = order.createDate 
            ? new Date(order.createDate).toLocaleString('vi-VN') 
            : 'N/A';
        
        const userName = order.users ? (order.users.fullName || order.users.userName || 'N/A') : 'N/A';
        const restaurantName = order.restaurant ? (order.restaurant.title || 'N/A') : 'N/A';
        const orderItemsCount = order.listOrderItems ? (order.listOrderItems.size || order.listOrderItems.length || 0) : 0;
        
        // Get total price from order, or calculate from order items if not available
        let totalPrice = 0;
        if (order.totalPrice != null && order.totalPrice !== undefined) {
            // Use totalPrice from backend
            totalPrice = parseFloat(order.totalPrice) || 0;
        } else if (order.listOrderItems) {
            // Fallback: Calculate from order items
            let itemsArray = [];
            
            // Handle different types: Array, Set, or object with size property
            if (Array.isArray(order.listOrderItems)) {
                itemsArray = order.listOrderItems;
            } else if (order.listOrderItems.size !== undefined) {
                itemsArray = Array.from(order.listOrderItems);
            } else if (typeof order.listOrderItems === 'object') {
                itemsArray = Object.values(order.listOrderItems);
            }
            
            if (itemsArray.length > 0) {
                itemsArray.forEach(function(item) {
                    if (item && item.food && item.food.price) {
                        // Lấy số lượng (quantity) - có thể là item.quantity, item.amount, hoặc mặc định là 1
                        const quantity = item.quantity || item.amount || 1;
                        const itemPrice = parseFloat(item.food.price) || 0;
                        totalPrice += itemPrice * quantity;
                    }
                });
            }
        }
        
        // Get current status
        const currentStatus = order.status || 'created';
        const statusClass = getStatusClass(currentStatus);
        const statusText = getStatusText(currentStatus);
        
        // Lấy avatar user hoặc dùng default
        const userAvatar = order.users && order.users.avatar 
            ? order.users.avatar 
            : 'img/user/1.png';
        
        html += `
            <tr data-order-id="${order.id}">
                <td><img class="img-profile rounded-circle" src="${userAvatar}" alt="${userName}" style="width: 40px; height: 40px;"></td>
                <td>${userName}</td>
                <td>${restaurantName}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <select class="form-control form-control-sm order-status-select" data-order-id="${order.id}" id="status-select-${order.id}" style="min-width: 120px;">
                            <option value="created" ${currentStatus === 'created' ? 'selected' : ''}>Mới tạo</option>
                            <option value="processing" ${currentStatus === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                            <option value="delivered" ${currentStatus === 'delivered' ? 'selected' : ''}>Đã giao</option>
                            <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                        </select>
                        <button type="button" class="btn btn-success btn-sm ml-2 update-status-btn" data-order-id="${order.id}" title="Cập nhật trạng thái">
                            <i class="feather-check"></i> Cập nhật
                        </button>
                    </div>
                </td>
                <td>${orderDate}</td>
                <td>${formatVND(totalPrice)}</td>
                <td>${orderItemsCount}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="viewOrder(${order.id})">
                        <i class="feather-eye"></i> Xem
                    </button>
                    <button class="btn btn-danger btn-sm ml-1" onclick="deleteOrder(${order.id})">
                        <i class="feather-trash-2"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
    });
    
    console.log("Setting HTML to tbody, HTML length:", html.length);
    tbody.html(html);
    
    console.log("=== renderOrdersTable: HTML rendered ===");
    
    // Wait a bit for DOM to update
    setTimeout(function() {
        const buttonCount = $('.update-status-btn').length;
        console.log("Number of update buttons found:", buttonCount);
        
        if (buttonCount === 0) {
            console.error("⚠️ No update buttons found in DOM!");
            console.log("Checking if buttons exist in HTML...");
            const htmlHasButton = html.includes('update-status-btn');
            console.log("HTML contains 'update-status-btn':", htmlHasButton);
        }
        
        // Attach event handlers for status dropdowns and update buttons
        $('.order-status-select').each(function() {
            const $select = $(this);
            const currentValue = $select.val();
            $select.data('original-value', currentValue);
        });
        
        // Attach click handler directly (before DataTable)
        $('.update-status-btn').each(function() {
            const $btn = $(this);
            const orderId = $btn.data('order-id');
            console.log("Found button with order ID:", orderId, "Button element:", $btn[0]);
            
            if (!orderId) {
                console.error("⚠️ Button found but no order-id attribute!");
                console.log("Button attributes:", $btn[0] ? Array.from($btn[0].attributes).map(a => a.name + '=' + a.value) : 'N/A');
            }
            
            // Remove any existing handlers and attach new one
            $btn.off('click.updateStatus').on('click.updateStatus', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("=== Button clicked directly (before DataTable) ===");
                console.log("Order ID:", orderId);
                if (orderId) {
                    handleUpdateStatus(orderId);
                } else {
                    console.error("No order ID available!");
                }
                return false;
            });
        });
    }, 100);
    
    // Initialize DataTable nếu có
    if ($.fn.DataTable) {
        if ($.fn.DataTable.isDataTable('#dataTable')) {
            $('#dataTable').DataTable().destroy();
        }
        $('#dataTable').DataTable({
            language: {
                "sProcessing": "Đang xử lý...",
                "sLengthMenu": "Hiển thị _MENU_ mục",
                "sZeroRecords": "Không tìm thấy dữ liệu",
                "sInfo": "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
                "sInfoEmpty": "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
                "sInfoFiltered": "(được lọc từ _MAX_ mục)",
                "sInfoPostFix": "",
                "sSearch": "Tìm kiếm:",
                "sUrl": "",
                "oPaginate": {
                    "sFirst": "Đầu",
                    "sPrevious": "Trước",
                    "sNext": "Tiếp",
                    "sLast": "Cuối"
                }
            },
            drawCallback: function() {
                // Re-attach event handlers after DataTable redraws
                $('.order-status-select').each(function() {
                    const $select = $(this);
                    if (!$select.data('original-value')) {
                        const currentValue = $select.val();
                        $select.data('original-value', currentValue);
                    }
                });
                
                // Re-attach button click handlers
                console.log("DataTable drawCallback: Re-attaching button handlers");
                console.log("Number of buttons found:", $('.update-status-btn').length);
                
                $('.update-status-btn').each(function() {
                    const $btn = $(this);
                    const orderId = $btn.data('order-id');
                    console.log("Re-attaching handler for button with order ID:", orderId);
                    
                    // Remove all existing handlers and attach new one
                    $btn.off('click.updateStatus').on('click.updateStatus', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("=== Button clicked in drawCallback ===");
                        console.log("Order ID:", orderId);
                        if (orderId) {
                            handleUpdateStatus(orderId);
                        }
                        return false;
                    });
                });
            }
        });
    }
}

function getStatusClass(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'delivered') return 'btn-success';
    if (statusLower === 'cancelled') return 'btn-danger';
    if (statusLower === 'processing') return 'btn-warning';
    return 'btn-primary';
}

function getStatusText(status) {
    const statusLower = (status || '').toLowerCase();
    const statusMap = {
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy',
        'processing': 'Đang xử lý',
        'created': 'Mới tạo'
    };
    return statusMap[statusLower] || status;
}

function formatVND(price) {
    if (price == null || price === undefined) return '0 ₫';
    return parseFloat(price).toLocaleString('vi-VN') + ' ₫';
}

function updateOrderStatus(orderId, newStatus, selectElement) {
    console.log("=== updateOrderStatus() called ===");
    console.log("Order ID:", orderId);
    console.log("New Status:", newStatus);
    console.log("Select Element:", selectElement);
    
    if (!orderId || orderId <= 0) {
        console.error("Invalid order ID:", orderId);
        showToast('ID đơn hàng không hợp lệ!', 'error');
        return;
    }
    
    if (!newStatus || newStatus.trim() === '') {
        console.error("Invalid status:", newStatus);
        showToast('Trạng thái không được để trống!', 'error');
        return;
    }
    
    // Get original value before change
    const originalValue = selectElement.data('original-value');
    
    // If status hasn't changed, do nothing
    if (originalValue === newStatus) {
        console.log("Status unchanged, skipping update");
        return;
    }
    
    // Disable select while updating
    selectElement.prop('disabled', true);
    const originalText = selectElement.find('option:selected').text();
    selectElement.find('option:selected').text('Đang cập nhật...');
    
    console.log("Calling AdminApiService.updateOrder with:", {
        orderId: orderId,
        status: newStatus
    });
    
    AdminApiService.updateOrder(orderId, newStatus)
        .done(function(response) {
            console.log("=== Update Order Status Response ===", response);
            console.log("Response type:", typeof response);
            console.log("Response keys:", Object.keys(response || {}));
            console.log("Response.status:", response?.status);
            console.log("Response.success:", response?.success);
            console.log("Response.isSuccess:", response?.isSuccess);
            console.log("Response.desc:", response?.desc);
            console.log("Response.data:", response?.data);
            
            // Check multiple response formats - be more flexible
            let isSuccess = false;
            
            if (response) {
                // Check status code
                if (response.status === 200) {
                    isSuccess = true;
                }
                // Check success flags (both isSuccess and success)
                else if (response.isSuccess === true || response.success === true) {
                    isSuccess = true;
                }
                // Check if status is not an error code
                else if (response.status && response.status >= 200 && response.status < 300) {
                    isSuccess = true;
                }
                // If no status but has success flag
                else if (!response.status && (response.isSuccess === true || response.success === true)) {
                    isSuccess = true;
                }
            }
            
            console.log("isSuccess check result:", isSuccess);
            console.log("Full response check:", {
                hasResponse: !!response,
                status: response?.status,
                isSuccess: response?.isSuccess,
                success: response?.success,
                desc: response?.desc,
                data: response?.data
            });
            
            if (isSuccess) {
                console.log("✅ Order status updated successfully");
                
                // Update UI immediately
                selectElement.prop('disabled', false);
                selectElement.data('original-value', newStatus);
                selectElement.val(newStatus); // Ensure select value is updated
                selectElement.find('option:selected').text(getStatusText(newStatus));
                
                // Show success message
                const successMsg = response?.desc || 'Cập nhật trạng thái đơn hàng thành công!';
                showToast(successMsg, 'success');
                
                // Reload orders to refresh statistics and get updated data from server
                setTimeout(function() {
                    console.log("Reloading orders...");
                    loadOrders();
                }, 500);
            } else {
                console.warn("⚠️ Update order status failed:", response);
                console.warn("Response object:", JSON.stringify(response, null, 2));
                const errorMsg = response?.desc || response?.message || response?.description || 'Cập nhật trạng thái thất bại!';
                console.error("Error message:", errorMsg);
                showToast(errorMsg, 'error');
                
                // Revert select value
                selectElement.val(originalValue);
                selectElement.find('option:selected').text(getStatusText(originalValue));
                selectElement.prop('disabled', false);
            }
        })
        .fail(function(xhr, status, error) {
            console.error("=== Update Order Status Error ===");
            console.error("XHR:", xhr);
            console.error("Status:", status);
            console.error("Error:", error);
            console.error("Response Text:", xhr.responseText);
            console.error("Response JSON:", xhr.responseJSON);
            console.error("HTTP Status:", xhr.status);
            
            let errorMsg = 'Không thể cập nhật trạng thái đơn hàng!';
            if (xhr.responseJSON) {
                errorMsg = xhr.responseJSON.desc || xhr.responseJSON.message || errorMsg;
            } else if (xhr.responseText) {
                try {
                    const errorObj = JSON.parse(xhr.responseText);
                    errorMsg = errorObj.desc || errorObj.message || errorMsg;
                } catch (e) {
                    console.error("Failed to parse error response:", e);
                }
            }
            
            if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
                if (typeof removeToken === 'function') {
                    removeToken();
                }
                window.location.href = 'login.html';
                return;
            } else if (xhr.status === 403) {
                errorMsg = 'Bạn không có quyền thực hiện thao tác này!';
            }
            
            showToast(errorMsg, 'error');
            
            // Revert select value
            selectElement.val(originalValue);
            selectElement.find('option:selected').text(getStatusText(originalValue));
            selectElement.prop('disabled', false);
        });
}

function viewOrder(orderId) {
    window.location.href = `edit-order.html?id=${orderId}`;
}

function showToast(message, type = 'info') {
    // Simple toast notification
    const toastClass = type === 'success' ? 'alert-success' : 
                       type === 'error' ? 'alert-danger' : 
                       type === 'info' ? 'alert-info' : 'alert-warning';
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="alert ${toastClass} alert-dismissible fade show position-fixed" 
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" role="alert">
            <strong>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</strong> ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;
    
    // Remove existing toasts
    $('.alert.position-fixed').remove();
    
    // Add new toast
    $('body').append(toastHtml);
    
    // Auto remove after 3 seconds
    setTimeout(function() {
        $(`#${toastId}`).fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
    
    console.log(`${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}`, message);
}

function updateOrderStatistics(orders) {
    const stats = {
        created: 0,
        processing: 0,
        delivered: 0,
        cancelled: 0
    };
    
    orders.forEach(function(order) {
        const status = (order.status || 'created').toLowerCase();
        if (stats.hasOwnProperty(status)) {
            stats[status]++;
        } else {
            stats.created++;
        }
    });
    
    // Update stat cards
    updateStatCard('orders-pending', stats.created, 'Chờ xử lý');
    updateStatCard('orders-processing', stats.processing, 'Đang xử lý');
    updateStatCard('orders-delivered', stats.delivered, 'Đã giao');
    updateStatCard('orders-cancelled', stats.cancelled, 'Đã hủy');
}

function updateStatCard(cardId, value, label) {
    const card = $(`#${cardId}`);
    if (card.length > 0) {
        card.find('.stat-value').text(value);
        card.find('.stat-label').text(label);
    }
}

function showNoOrdersMessage(message) {
    const tbody = $('#dataTable tbody');
    if (tbody.length > 0) {
        const msg = message || 'Chưa có đơn hàng nào.';
        tbody.html(`
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="alert alert-info mb-0">
                        <i class="feather-info"></i>
                        ${msg}
                    </div>
                </td>
            </tr>
        `);
    }
}

function setupEventHandlers() {
    // Search orders
    $('.navbar-search input').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        $('#dataTable tbody tr').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(searchTerm) > -1);
        });
    });
    
    // Refresh orders button (nếu có)
    $('#refresh-orders').on('click', function() {
        loadOrders();
    });
}

// Delete order function
function deleteOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
        return;
    }
    
    AdminApiService.deleteOrder(orderId)
        .done(function(response) {
            console.log("Delete order response:", response);
            if (response && (response.isSuccess === true || response.success === true || response.status === 200)) {
                showToast('Xóa đơn hàng thành công!', 'success');
                loadOrders(); // Reload orders list
            } else {
                const errorMsg = response?.desc || 'Xóa đơn hàng thất bại!';
                showToast(errorMsg, 'error');
            }
        })
        .fail(function(xhr, status, error) {
            console.error('Error deleting order:', xhr);
            let errorMsg = 'Không thể xóa đơn hàng!';
            if (xhr.responseJSON && xhr.responseJSON.desc) {
                errorMsg = xhr.responseJSON.desc;
            }
            showToast(errorMsg, 'error');
        });
}

