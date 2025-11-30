package com.example.food_delivery.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardStatsDTO {
    private long todayRevenue; // Doanh thu hôm nay
    private long monthRevenue; // Doanh thu tháng này
    private int todayOrders; // Số đơn hàng hôm nay
    private int totalRestaurants; // Tổng số cửa hàng
    private double todayRevenueChange; // % thay đổi doanh thu hôm nay so với hôm qua
    private double monthRevenueChange; // % thay đổi doanh thu tháng này so với tháng trước
    private int todayOrdersChange; // Số đơn hàng thay đổi hôm nay so với hôm qua

    public DashboardStatsDTO() {
    }

    public long getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(long todayRevenue) {
        this.todayRevenue = todayRevenue;
    }

    public long getMonthRevenue() {
        return monthRevenue;
    }

    public void setMonthRevenue(long monthRevenue) {
        this.monthRevenue = monthRevenue;
    }

    public int getTodayOrders() {
        return todayOrders;
    }

    public void setTodayOrders(int todayOrders) {
        this.todayOrders = todayOrders;
    }

    public int getTotalRestaurants() {
        return totalRestaurants;
    }

    public void setTotalRestaurants(int totalRestaurants) {
        this.totalRestaurants = totalRestaurants;
    }

    public double getTodayRevenueChange() {
        return todayRevenueChange;
    }

    public void setTodayRevenueChange(double todayRevenueChange) {
        this.todayRevenueChange = todayRevenueChange;
    }

    public double getMonthRevenueChange() {
        return monthRevenueChange;
    }

    public void setMonthRevenueChange(double monthRevenueChange) {
        this.monthRevenueChange = monthRevenueChange;
    }

    public int getTodayOrdersChange() {
        return todayOrdersChange;
    }

    public void setTodayOrdersChange(int todayOrdersChange) {
        this.todayOrdersChange = todayOrdersChange;
    }
}

