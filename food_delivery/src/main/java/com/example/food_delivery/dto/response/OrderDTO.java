package com.example.food_delivery.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Date;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderDTO {
    private int id;
    private int userId;
    private String userName;
    private String userFullName;
    private String userEmail;
    private String userAvatar;
    private String userPhoneNumber; // Số điện thoại khách hàng
    private int restaurantId;
    private String restaurantTitle;
    private int totalQuantity; // Tổng số lượng items trong đơn hàng
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Date createDate;
    
    private String status;
    private Long totalPrice;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentIntentId;
    private String transactionId;
    private String deliveryAddress; // Delivery address for this order
    private Long deliveryFee; // Delivery fee in VND
    private Long shippingFee; // Total shipping fee for shipper (revenue for shipper) in VND
    private Double userLat; // User latitude (vĩ độ khách hàng)
    private Double userLng; // User longitude (kinh độ khách hàng)
    private Double shipperLat; // Shipper latitude (vĩ độ shipper)
    private Double shipperLng; // Shipper longitude (kinh độ shipper)
    private List<OrderItemDTO> items;
    
    public OrderDTO() {
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public int getUserId() {
        return userId;
    }
    
    public void setUserId(int userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getUserFullName() {
        return userFullName;
    }
    
    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }
    
    public String getUserEmail() {
        return userEmail;
    }
    
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
    
    public String getUserAvatar() {
        return userAvatar;
    }
    
    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }
    
    public String getUserPhoneNumber() {
        return userPhoneNumber;
    }
    
    public void setUserPhoneNumber(String userPhoneNumber) {
        this.userPhoneNumber = userPhoneNumber;
    }
    
    public int getTotalQuantity() {
        return totalQuantity;
    }
    
    public void setTotalQuantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }
    
    public int getRestaurantId() {
        return restaurantId;
    }
    
    public void setRestaurantId(int restaurantId) {
        this.restaurantId = restaurantId;
    }
    
    public String getRestaurantTitle() {
        return restaurantTitle;
    }
    
    public void setRestaurantTitle(String restaurantTitle) {
        this.restaurantTitle = restaurantTitle;
    }
    
    public Date getCreateDate() {
        return createDate;
    }
    
    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Long getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(Long totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getPaymentStatus() {
        return paymentStatus;
    }
    
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    
    public String getPaymentIntentId() {
        return paymentIntentId;
    }
    
    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }
    
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    public String getDeliveryAddress() {
        return deliveryAddress;
    }
    
    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }
    
    public Long getDeliveryFee() {
        return deliveryFee;
    }
    
    public void setDeliveryFee(Long deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public Long getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(Long shippingFee) {
        this.shippingFee = shippingFee;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }

    public Double getUserLat() {
        return userLat;
    }

    public void setUserLat(Double userLat) {
        this.userLat = userLat;
    }

    public Double getUserLng() {
        return userLng;
    }

    public void setUserLng(Double userLng) {
        this.userLng = userLng;
    }

    public Double getShipperLat() {
        return shipperLat;
    }

    public void setShipperLat(Double shipperLat) {
        this.shipperLat = shipperLat;
    }

    public Double getShipperLng() {
        return shipperLng;
    }

    public void setShipperLng(Double shipperLng) {
        this.shipperLng = shipperLng;
    }
}

