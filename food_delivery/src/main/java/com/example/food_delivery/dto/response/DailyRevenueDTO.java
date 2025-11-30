package com.example.food_delivery.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DailyRevenueDTO {
    private long revenue; // Doanh thu
    private int orderCount; // Số đơn hàng
    private long averageOrderValue; // Giá trị đơn hàng trung bình

    public DailyRevenueDTO() {
    }

    public DailyRevenueDTO(long revenue, int orderCount, long averageOrderValue) {
        this.revenue = revenue;
        this.orderCount = orderCount;
        this.averageOrderValue = averageOrderValue;
    }

    public long getRevenue() {
        return revenue;
    }

    public void setRevenue(long revenue) {
        this.revenue = revenue;
    }

    public int getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(int orderCount) {
        this.orderCount = orderCount;
    }

    public long getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(long averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
}

