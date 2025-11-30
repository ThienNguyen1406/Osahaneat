package com.example.food_delivery.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "orders")
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users users;

    @ManyToOne
    @JoinColumn(name = "res_id")
    private  Restaurant restaurant;

    @Column(name = "created_date")
    private Date createDate;

    @Column(name = "status")
    private String status; // Order status: "created", "processing", "delivered", "cancelled"

    @Column(name = "total_price")
    private Long totalPrice; // Total price of the order

    @Column(name = "payment_method")
    private String paymentMethod; // Payment method: "COD", "CREDIT_CARD", "BANK_TRANSFER"

    @Column(name = "payment_status")
    private String paymentStatus; // Payment status: "PENDING", "PAID", "FAILED", "REFUNDED"

    @Column(name = "payment_intent_id")
    private String paymentIntentId; // Stripe payment intent ID (for credit card)

    @Column(name = "transaction_id")
    private String transactionId; // Bank transaction ID (for bank transfer)

    @Column(name = "delivery_address")
    private String deliveryAddress; // Delivery address for this order

    @Column(name = "delivery_fee")
    private Long deliveryFee; // Delivery fee in VND

    @Column(name = "shipping_fee")
    private Long shippingFee; // Total shipping fee for shipper (revenue for shipper) in VND

    @Column(name = "user_lat")
    private Double userLat; // User latitude (vĩ độ khách hàng)

    @Column(name = "user_lng")
    private Double userLng; // User longitude (kinh độ khách hàng)

    @Column(name = "shipper_lat")
    private Double shipperLat; // Shipper latitude (vĩ độ shipper)

    @Column(name = "shipper_lng")
    private Double shipperLng; // Shipper longitude (kinh độ shipper)

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Users driver; // Driver/Shipper nhận đơn hàng

    @Column(name = "accepted_at")
    private Date acceptedAt; // Thời gian driver nhận đơn

    @Column(name = "picked_up_at")
    private Date pickedUpAt; // Thời gian driver lấy hàng

    @Column(name = "delivered_at")
    private Date deliveredAt; // Thời gian driver giao hàng

    @Column(name = "processing_started_at")
    private Date processingStartedAt; // Thời gian nhà hàng bắt đầu chế biến

    @Column(name = "ready_at")
    private Date readyAt; // Thời gian món ăn sẵn sàng

    @OneToMany(mappedBy = "orders")
    @JsonIgnore
    private Set<OrderItem> listOrderItems;

    public Set<OrderItem> getListOrderItems() {
        return listOrderItems;
    }

    public void setListOrderItems(Set<OrderItem> listOrderItems) {
        this.listOrderItems = listOrderItems;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Users getUsers() {
        return users;
    }

    public void setUsers(Users users) {
        this.users = users;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
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

    public Users getDriver() {
        return driver;
    }

    public void setDriver(Users driver) {
        this.driver = driver;
    }

    public Date getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Date acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public Date getPickedUpAt() {
        return pickedUpAt;
    }

    public void setPickedUpAt(Date pickedUpAt) {
        this.pickedUpAt = pickedUpAt;
    }

    public Date getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Date deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public Date getProcessingStartedAt() {
        return processingStartedAt;
    }

    public void setProcessingStartedAt(Date processingStartedAt) {
        this.processingStartedAt = processingStartedAt;
    }

    public Date getReadyAt() {
        return readyAt;
    }

    public void setReadyAt(Date readyAt) {
        this.readyAt = readyAt;
    }
}
