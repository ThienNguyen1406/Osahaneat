package com.example.food_delivery.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DriverStatisticsDTO {
    private int todayOrders; // Số đơn hàng hôm nay
    private int activeOrders; // Số đơn hàng đang giao
    private long todayEarnings; // Thu nhập hôm nay (từ delivery_fee)
    private int totalDeliveries; // Tổng số đơn đã giao
    private double averageRating; // Đánh giá trung bình (nếu có)

    public DriverStatisticsDTO() {
    }

    public int getTodayOrders() {
        return todayOrders;
    }

    public void setTodayOrders(int todayOrders) {
        this.todayOrders = todayOrders;
    }

    public int getActiveOrders() {
        return activeOrders;
    }

    public void setActiveOrders(int activeOrders) {
        this.activeOrders = activeOrders;
    }

    public long getTodayEarnings() {
        return todayEarnings;
    }

    public void setTodayEarnings(long todayEarnings) {
        this.todayEarnings = todayEarnings;
    }

    public int getTotalDeliveries() {
        return totalDeliveries;
    }

    public void setTotalDeliveries(int totalDeliveries) {
        this.totalDeliveries = totalDeliveries;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
}

