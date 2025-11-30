/*
 * Edit Order Page - Quản lý đơn hàng
 * Load orders from API and display in table
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
        return;
    }
    
    const $select = $(`#status-select-${orderId}`);
    console.log("Select element found:", $select.length);
    console.log("Select element:", $select);
    
    if ($select.length === 0) {
        console.error("Select element not found for order ID:", orderId);
        alert('Không tìm thấy dropdown trạng thái cho order ID: ' + orderId);
        showToast('Không tìm thấy dropdown trạng thái!', 'error');
        return;
    }
    
    const newStatus = $select.val();
    const originalValue = $select.data('original-value') || $select.val();
    
    console.log("New Status:", newStatus);
    console.log("Original Value:", originalValue);
    
    if (originalValue === newStatus) {
        console.log("Status unchanged, showing info");
        showToast('Trạng thái không thay đổi!', 'info');
        return;
    }
    
    console.log("Calling updateOrderStatus...");
    updateOrderStatus(orderId, newStatus, $select);
};

$(document).ready(function() {
    // Load orders list
    loadOrders();
    
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
            
            // Debug: Log first order to check totalPrice
            if (orders.length > 0) {
                console.log("=== First Order Sample ===", {
                    id: orders[0].id,
                    totalPrice: orders[0].totalPrice,
                    totalPriceType: typeof orders[0].totalPrice,
                    hasListOrderItems: !!orders[0].listOrderItems,
                    orderKeys: Object.keys(orders[0])
                });
            }
            
            if (orders.length > 0) {
                renderOrdersTable(orders);
            } else {
                showNoOrdersMessage();
            }
        })
        .fail(function(xhr, status, error) {
            console.error('=== Error loading orders ===');
            console.error('XHR:', xhr);
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Response Text:', xhr.responseText);
            console.error('Response JSON:', xhr.responseJSON);
            
            let errorMsg = "Không thể tải danh sách đơn hàng!";
            if (xhr.responseJSON) {
                errorMsg = xhr.responseJSON.desc || xhr.responseJSON.message || errorMsg;
            }
            
            if (xhr.status === 403) {
                alert('Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản admin.');
                removeToken();
                window.location.href = 'login.html';
            } else if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
                removeToken();
                window.location.href = 'login.html';
            } else {
                console.error('Error message:', errorMsg);
            }
            
            showNoOrdersMessage();
        });
}

function renderOrdersTable(orders) {
    const tbody = $('#orders-tbody');
    
    if (tbody.length === 0) {
        console.error("Orders table tbody not found");
        return;
    }
    
    if (!orders || orders.length === 0) {
        showNoOrdersMessage();
        return;
    }
    
    let html = '';
    orders.forEach(function(order) {
        const orderDate = order.createDate 
            ? new Date(order.createDate).toLocaleString('vi-VN') 
            : 'N/A';
        
        const userName = order.users ? (order.users.fullName || order.users.userName || 'N/A') : 'N/A';
        const restaurantName = order.restaurant ? (order.restaurant.title || 'N/A') : 'N/A';
        const orderItemsCount = order.listOrderItems ? (order.listOrderItems.size || order.listOrderItems.length || 0) : 0;
        
        // Get total price from order - ưu tiên totalPrice từ backend
        let totalPrice = 0;
        
        // Debug: Log order data
        console.log(`Order ${order.id} data:`, {
            totalPrice: order.totalPrice,
            hasListOrderItems: !!order.listOrderItems,
            listOrderItemsType: order.listOrderItems ? (Array.isArray(order.listOrderItems) ? 'array' : typeof order.listOrderItems) : 'null',
            listOrderItemsLength: order.listOrderItems ? (order.listOrderItems.length || order.listOrderItems.size || 0) : 0
        });
        
        // Check totalPrice field first
        if (order.totalPrice != null && order.totalPrice !== undefined && order.totalPrice !== '') {
            const parsedPrice = parseFloat(order.totalPrice);
            if (!isNaN(parsedPrice)) {
                totalPrice = parsedPrice;
                console.log(`Order ${order.id}: Using totalPrice from backend: ${totalPrice}`);
            }
        } 
        // Fallback: Calculate from order items if totalPrice is not available
        else if (order.listOrderItems) {
            let itemsArray = [];
            
            // Handle different types: Array, Set, or object with size property
            if (Array.isArray(order.listOrderItems)) {
                itemsArray = order.listOrderItems;
            } else if (order.listOrderItems.size !== undefined) {
                // It's a Set or similar collection
                itemsArray = Array.from(order.listOrderItems);
            } else if (typeof order.listOrderItems === 'object') {
                // Try to convert object to array
                itemsArray = Object.values(order.listOrderItems);
            }
            
            if (itemsArray.length > 0) {
                itemsArray.forEach(function(item) {
                    if (item && item.food && item.food.price) {
                        // Lấy số lượng (quantity) - có thể là item.quantity, item.amount, hoặc mặc định là 1
                        const quantity = item.quantity || item.amount || 1;
                        const itemPrice = parseFloat(item.food.price) || 0;
                        totalPrice += itemPrice * quantity;
                        console.log(`Order ${order.id} - Item: ${item.food.title || 'N/A'}, Quantity: ${quantity}, Price: ${itemPrice}, Subtotal: ${itemPrice * quantity}`);
                    }
                });
                console.log(`Order ${order.id}: Calculated totalPrice from ${itemsArray.length} items: ${totalPrice}`);
            } else {
                console.warn(`Order ${order.id}: listOrderItems exists but is empty`);
            }
        } else {
            console.warn(`Order ${order.id}: No totalPrice and no listOrderItems available`);
        }
        
        // Ensure totalPrice is a valid number
        if (isNaN(totalPrice) || totalPrice < 0) {
            totalPrice = 0;
            console.warn(`Order ${order.id}: Invalid totalPrice, set to 0`);
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
    
    tbody.html(html);
    
    console.log("=== renderOrdersTable: HTML rendered ===");
    console.log("Number of update buttons:", $('.update-status-btn').length);
    
    // Attach event handlers for status dropdowns and update buttons
    $('.order-status-select').each(function() {
        const $select = $(this);
        const currentValue = $select.val();
        $select.data('original-value', currentValue);
    });
    
    // Test: Try to attach click handler directly (before DataTable)
    $('.update-status-btn').each(function() {
        const $btn = $(this);
        const orderId = $btn.data('order-id');
        console.log("Found button with order ID:", orderId);
        
        // Remove any existing handlers and attach new one
        $btn.off('click.updateStatus').on('click.updateStatus', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("=== Button clicked directly (before DataTable) ===");
            console.log("Order ID:", orderId);
            if (orderId) {
                handleUpdateStatus(orderId);
            }
            return false;
        });
    });
    
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
    if (statusLower === 'delivered') return 'success';
    if (statusLower === 'cancelled') return 'danger';
    if (statusLower === 'processing') return 'warning';
    return 'primary';
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
                
                // Update UI
                selectElement.prop('disabled', false);
                selectElement.data('original-value', newStatus);
                selectElement.val(newStatus);
                selectElement.find('option:selected').text(getStatusText(newStatus));
                
                // Show success message
                const successMsg = response?.desc || 'Cập nhật trạng thái đơn hàng thành công!';
                showToast(successMsg, 'success');
                
                // Reload orders to refresh data
                setTimeout(function() {
                    loadOrders();
                }, 500);
            } else {
                console.warn("⚠️ Update order status failed:", response);
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
            console.error("Ready State:", xhr.readyState);
            
            // Try to parse response even if it's an error
            let errorMsg = 'Không thể cập nhật trạng thái đơn hàng!';
            let parsedResponse = null;
            
            if (xhr.responseJSON) {
                parsedResponse = xhr.responseJSON;
                errorMsg = parsedResponse.desc || parsedResponse.message || parsedResponse.description || errorMsg;
                
                // Check if response actually indicates success despite being in fail handler
                if (parsedResponse.status === 200 || parsedResponse.isSuccess === true || parsedResponse.success === true) {
                    console.log("⚠️ Response indicates success but in fail handler, treating as success");
                    selectElement.prop('disabled', false);
                    selectElement.data('original-value', newStatus);
                    selectElement.val(newStatus);
                    selectElement.find('option:selected').text(getStatusText(newStatus));
                    showToast(parsedResponse.desc || 'Cập nhật trạng thái đơn hàng thành công!', 'success');
                    setTimeout(function() {
                        loadOrders();
                    }, 500);
                    return;
                }
            } else if (xhr.responseText) {
                try {
                    parsedResponse = JSON.parse(xhr.responseText);
                    errorMsg = parsedResponse.desc || parsedResponse.message || parsedResponse.description || errorMsg;
                    
                    // Check if response actually indicates success
                    if (parsedResponse.status === 200 || parsedResponse.isSuccess === true || parsedResponse.success === true) {
                        console.log("⚠️ Response indicates success but in fail handler, treating as success");
                        selectElement.prop('disabled', false);
                        selectElement.data('original-value', newStatus);
                        selectElement.val(newStatus);
                        selectElement.find('option:selected').text(getStatusText(newStatus));
                        showToast(parsedResponse.desc || 'Cập nhật trạng thái đơn hàng thành công!', 'success');
                        setTimeout(function() {
                            loadOrders();
                        }, 500);
                        return;
                    }
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
            } else if (xhr.status === 0) {
                errorMsg = 'Không thể kết nối đến server! Vui lòng kiểm tra kết nối mạng.';
            }
            
            // Revert to original value
            selectElement.val(originalValue);
            selectElement.find('option:selected').text(originalText);
            selectElement.prop('disabled', false);
            
            showToast(errorMsg, 'error');
        })
        .always(function() {
            // Re-enable select
            selectElement.prop('disabled', false);
        });
}

function viewOrder(orderId) {
    console.log("=== viewOrder() called ===");
    console.log("Order ID:", orderId);
    
    // Show modal
    $('#orderDetailModal').modal('show');
    
    // Load order details
    loadOrderDetail(orderId);
}

function loadOrderDetail(orderId) {
    console.log("=== loadOrderDetail() called ===");
    console.log("Order ID:", orderId);
    
    const contentDiv = $('#orderDetailContent');
    contentDiv.html('<div class="text-center"><i class="feather-loader spinner-border spinner-border-sm"></i> Đang tải chi tiết đơn hàng...</div>');
    
    // Get order from current orders list or fetch from API
    AdminApiService.getOrderById(orderId)
        .done(function(response) {
            console.log("=== Order Detail Response ===", response);
            
            let order = null;
            if (response && response.data) {
                order = response.data;
            } else if (response && response.status === 200 && (response.success || response.isSuccess)) {
                order = response.data;
            } else if (Array.isArray(response) && response.length > 0) {
                order = response[0];
            } else if (response && response.id) {
                order = response;
            }
            
            if (!order) {
                contentDiv.html('<div class="alert alert-danger">Không tìm thấy đơn hàng!</div>');
                return;
            }
            
            renderOrderDetail(order);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading order detail:", error);
            console.error("XHR:", xhr);
            
            // Try to get order from current list
            const orderFromList = findOrderInCurrentList(orderId);
            if (orderFromList) {
                renderOrderDetail(orderFromList);
            } else {
                contentDiv.html('<div class="alert alert-danger">Không thể tải chi tiết đơn hàng!</div>');
            }
        });
}

function findOrderInCurrentList(orderId) {
    // This would need to be implemented to search in current orders
    return null;
}

function renderOrderDetail(order) {
    console.log("=== renderOrderDetail() called ===");
    console.log("Order:", order);
    
    const contentDiv = $('#orderDetailContent');
    
    const orderDate = order.createDate 
        ? new Date(order.createDate).toLocaleString('vi-VN') 
        : 'N/A';
    
    const userName = order.users ? (order.users.fullName || order.users.userName || 'N/A') : 'N/A';
    const userEmail = order.users ? (order.users.email || 'N/A') : 'N/A';
    const userPhone = order.users ? (order.users.phone || 'N/A') : 'N/A';
    
    const restaurantName = order.restaurant ? (order.restaurant.title || 'N/A') : 'N/A';
    const restaurantAddress = order.restaurant ? (order.restaurant.address || 'N/A') : 'N/A';
    
    const currentStatus = order.status || 'created';
    const statusText = getStatusText(currentStatus);
    
    // Get total price
    let totalPrice = 0;
    if (order.totalPrice != null && order.totalPrice !== undefined) {
        totalPrice = parseFloat(order.totalPrice) || 0;
    }
    
    // Render order items
    let itemsHtml = '';
    let itemsArray = [];
    
    if (order.listOrderItems) {
        if (Array.isArray(order.listOrderItems)) {
            itemsArray = order.listOrderItems;
        } else if (order.listOrderItems.size !== undefined) {
            itemsArray = Array.from(order.listOrderItems);
        } else if (typeof order.listOrderItems === 'object') {
            itemsArray = Object.values(order.listOrderItems);
        }
    }
    
    console.log("Order items array:", itemsArray);
    
    if (itemsArray.length > 0) {
        itemsArray.forEach(function(item, index) {
            const foodName = item.food ? (item.food.title || 'N/A') : 'N/A';
            const foodPrice = item.food ? (parseFloat(item.food.price) || 0) : 0;
            const quantity = item.quantity || item.amount || 1;
            const itemTotal = foodPrice * quantity;
            
            // Get food image
            let foodImage = 'img/1.jpg';
            if (item.food && item.food.image) {
                if (item.food.image.startsWith('http')) {
                    foodImage = item.food.image;
                } else {
                    foodImage = `http://localhost:82/menu/file/${item.food.image}`;
                }
            }
            
            itemsHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <img src="${foodImage}" alt="${foodName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='img/1.jpg'">
                    </td>
                    <td>${foodName}</td>
                    <td class="text-right">${formatVND(foodPrice)}</td>
                    <td class="text-center">${quantity}</td>
                    <td class="text-right">${formatVND(itemTotal)}</td>
                </tr>
            `;
        });
    } else {
        itemsHtml = '<tr><td colspan="6" class="text-center text-muted">Không có món ăn nào</td></tr>';
    }
    
    // If totalPrice is 0, recalculate from items
    if (totalPrice === 0 && itemsArray.length > 0) {
        itemsArray.forEach(function(item) {
            if (item && item.food && item.food.price) {
                const quantity = item.quantity || item.amount || 1;
                totalPrice += parseFloat(item.food.price) * quantity;
            }
        });
    }
    
    const html = `
        <div class="order-detail">
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6 class="font-weight-bold">Thông tin đơn hàng</h6>
                    <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
                    <p><strong>Ngày đặt:</strong> ${orderDate}</p>
                    <p><strong>Trạng thái:</strong> <span class="badge badge-${currentStatus === 'delivered' ? 'success' : currentStatus === 'cancelled' ? 'danger' : currentStatus === 'processing' ? 'warning' : 'primary'}">${statusText}</span></p>
                </div>
                <div class="col-md-6">
                    <h6 class="font-weight-bold">Thông tin khách hàng</h6>
                    <p><strong>Tên:</strong> ${userName}</p>
                    <p><strong>Email:</strong> ${userEmail}</p>
                    <p><strong>Điện thoại:</strong> ${userPhone}</p>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-12">
                    <h6 class="font-weight-bold">Nhà hàng</h6>
                    <p><strong>Tên nhà hàng:</strong> ${restaurantName}</p>
                    <p><strong>Địa chỉ:</strong> ${restaurantAddress}</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <h6 class="font-weight-bold mb-3">Danh sách món ăn</h6>
                    <div class="table-responsive">
                        <table class="table table-bordered table-sm">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ảnh</th>
                                    <th>Tên món</th>
                                    <th class="text-right">Đơn giá</th>
                                    <th class="text-center">Số lượng</th>
                                    <th class="text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="text-right font-weight-bold">Tổng cộng:</td>
                                    <td class="text-right font-weight-bold text-danger">${formatVND(totalPrice)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    contentDiv.html(html);
}

function deleteOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
        return;
    }
    
    AdminApiService.deleteOrder(orderId)
        .done(function(response) {
            console.log("=== Delete Order Response ===", response);
            
            if (response && (response.status === 200 || response.success === true)) {
                showToast('Xóa đơn hàng thành công!', 'success');
                // Reload orders list
                loadOrders();
            } else {
                showToast('Xóa đơn hàng thất bại!', 'error');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error deleting order:", error);
            
            let errorMsg = "Không thể xóa đơn hàng!";
            if (xhr.responseJSON) {
                errorMsg = xhr.responseJSON.desc || xhr.responseJSON.message || errorMsg;
            }
            
            if (xhr.status === 403) {
                alert('Bạn không có quyền thực hiện thao tác này!');
            } else if (xhr.status === 401) {
                alert('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
                removeToken();
                window.location.href = 'login.html';
            } else {
                showToast(errorMsg, 'error');
            }
        });
}

function showNoOrdersMessage() {
    const tbody = $('#orders-tbody');
    if (tbody.length > 0) {
        tbody.html('<tr><td colspan="8" class="text-center text-muted">Không có đơn hàng nào</td></tr>');
    }
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

