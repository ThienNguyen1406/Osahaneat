/*
 * Admin Dashboard JavaScript
 * Load statistics and recent orders
 */

console.log("=== DASHBOARD.JS LOADED ===");
console.log("Dashboard.js version: 2.0 - with permissions count");

$(document).ready(function() {
    console.log("=== Dashboard ready ===");
    
    // Check if we're on dashboard page
    const isDashboardPage = window.location.pathname.indexOf('index.html') !== -1 || 
                            window.location.pathname.endsWith('/') ||
                            window.location.pathname === '/admin/' ||
                            window.location.pathname === '/admin';
    
    if (isDashboardPage) {
        console.log("✅ On dashboard page, loading dashboard data...");
        // Load dashboard data
        loadDashboardData();
        
    } else {
        console.log("Not on dashboard page, skipping dashboard data load");
    }
});


function loadDashboardData() {
    console.log("=== loadDashboardData() called ===");
    
    // Load statistics
    loadStatistics();
    
    // Load user growth chart
    loadUserGrowthChart();
}

function loadStatistics() {
    console.log("=== loadStatistics() called ===");
    
    // Load users count
    AdminApiService.getAllUsers()
        .done(function(response) {
            console.log("=== Users API Response ===", response);
            // Support both ResponseData and ApiResponse formats
            let users = [];
            if (response) {
                // Format mới: ResponseData { status, isSuccess, data, desc }
                if (response.data && Array.isArray(response.data)) {
                    users = response.data;
                }
                // Format cũ: ApiResponse { code, result, message }
                else if (response.code === 200 && response.result && Array.isArray(response.result)) {
                    users = response.result;
                }
            }
            updateStatCard('users-count', users.length, 'Người dùng');
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading users:", error);
            updateStatCard('users-count', 0, 'Người dùng');
        });
    
    // Load permissions/roles count
    AdminApiService.getRoles()
        .done(function(response) {
            console.log("=== Roles API Response ===", response);
            
            let roles = [];
            if (response && (response.isSuccess || response.success) && response.data) {
                roles = Array.isArray(response.data) ? response.data : [];
            } else if (Array.isArray(response)) {
                roles = response;
            }
            
            updateStatCard('permissions-count', roles.length, 'Phân quyền');
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading roles:", error);
            updateStatCard('permissions-count', 0, 'Phân quyền');
        });
    
    // Load restaurants count
    AdminApiService.getRestaurants()
        .done(function(response) {
            console.log("=== Restaurants API Response ===", response);
            if (response && response.status === 200 && response.data) {
                const restaurants = Array.isArray(response.data) ? response.data : [];
                updateStatCard('restaurants-count', restaurants.length, 'Nhà hàng');
            } else if (response && response.isSuccess && response.data) {
                const restaurants = Array.isArray(response.data) ? response.data : [];
                updateStatCard('restaurants-count', restaurants.length, 'Nhà hàng');
            }
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading restaurants:", error);
            updateStatCard('restaurants-count', 0, 'Nhà hàng');
        });
}

let userGrowthChart = null;

function loadUserGrowthChart() {
    console.log("=== loadUserGrowthChart() called ===");
    
    // Wait for Chart.js to be loaded
    if (typeof Chart === 'undefined') {
        console.warn("⚠️ Chart.js not loaded yet, waiting...");
        setTimeout(function() {
            if (typeof Chart !== 'undefined') {
                loadUserGrowthChart();
            }
        }, 500);
        return;
    }
    
    AdminApiService.getUserGrowthByMonth()
        .done(function(response) {
            console.log("=== User Growth API Response ===", response);
            
            let growthData = [];
            if (response && (response.isSuccess || response.success) && response.data) {
                growthData = Array.isArray(response.data) ? response.data : [];
            }
            
            console.log("Growth data:", growthData);
            
            // Render chart
            setTimeout(function() {
                renderUserGrowthChart(growthData);
            }, 100);
        })
        .fail(function(xhr, status, error) {
            console.error("Error loading user growth data:", error);
            // Render empty chart
            setTimeout(function() {
                renderUserGrowthChart([]);
            }, 100);
        });
}

function renderUserGrowthChart(growthData) {
    console.log("=== renderUserGrowthChart() called ===");
    console.log("Growth data:", growthData);
    
    const ctx = document.getElementById('userGrowthChart');
    if (!ctx) {
        console.error("❌ User growth chart canvas not found!");
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error("❌ Chart.js is not loaded!");
        return;
    }
    
    // Prepare data
    const months = [];
    const counts = [];
    
    if (growthData.length > 0) {
        growthData.forEach(function(item) {
            months.push(item.month || 'N/A');
            counts.push(item.count || 0);
        });
    } else {
        // Initialize with empty data for last 12 months if no data
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            months.push(`${month}/${year}`);
            counts.push(0);
        }
    }
    
    console.log("Chart labels:", months);
    console.log("Chart data:", counts);
    
    // Destroy existing chart if any
    if (userGrowthChart) {
        try {
            userGrowthChart.destroy();
        } catch (e) {
            console.warn("Error destroying chart:", e);
        }
        userGrowthChart = null;
    }
    
    // Create new line chart
    try {
        userGrowthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Số lượng người đăng ký',
                    data: counts,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4, // Smooth curve
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 12
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1,
                            callback: function(value) {
                                if (Number.isInteger(value)) {
                                    return value;
                                }
                            }
                        },
                        gridLines: {
                            display: true
                        }
                    }]
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            return 'Số lượng: ' + tooltipItem.yLabel;
                        }
                    }
                }
            }
        });
        
        console.log("✅ User growth chart rendered successfully");
    } catch (e) {
        console.error("❌ Error creating user growth chart:", e);
        console.error("Error stack:", e.stack);
    }
}

function updateStatCard(cardId, value, label) {
    const card = $(`#${cardId}`);
    if (card.length > 0) {
        card.find('.stat-value').text(value);
        card.find('.stat-label').text(label);
    }
}


