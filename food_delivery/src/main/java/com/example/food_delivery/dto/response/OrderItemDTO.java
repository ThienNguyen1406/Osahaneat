package com.example.food_delivery.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Date;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderItemDTO {
    private int orderId;
    private int foodId;
    private String foodTitle;
    private String foodImage;
    private double foodPrice;
    private int quantity;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Date createDate;
    
    public OrderItemDTO() {
    }
    
    public int getOrderId() {
        return orderId;
    }
    
    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }
    
    public int getFoodId() {
        return foodId;
    }
    
    public void setFoodId(int foodId) {
        this.foodId = foodId;
    }
    
    public String getFoodTitle() {
        return foodTitle;
    }
    
    public void setFoodTitle(String foodTitle) {
        this.foodTitle = foodTitle;
    }
    
    public String getFoodImage() {
        return foodImage;
    }
    
    public void setFoodImage(String foodImage) {
        this.foodImage = foodImage;
    }
    
    public double getFoodPrice() {
        return foodPrice;
    }
    
    public void setFoodPrice(double foodPrice) {
        this.foodPrice = foodPrice;
    }
    
    public int getQuantity() {
        return quantity;
    }
    
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    
    public Date getCreateDate() {
        return createDate;
    }
    
    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }
}

