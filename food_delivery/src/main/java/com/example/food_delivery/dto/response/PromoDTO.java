package com.example.food_delivery.dto.response;

import java.util.Date;

public class PromoDTO {
    private Integer id;
    private Integer restaurantId;
    private String restaurantName;
    private String code; // Mã voucher
    private String name; // Tên khuyến mãi
    private String type; // Loại giảm giá: FOOD_DISCOUNT, SHIP_DISCOUNT
    private Integer percent; // Phần trăm giảm (cũ, để tương thích)
    private Long value; // Giá trị giảm (VND) - mới
    private Long discountValue; // Alias cho value (để frontend dùng)
    private Date startDate;
    private Date endDate;
    private Integer maxUsage; // Số lần sử dụng tối đa
    private Integer usedCount; // Số lần đã sử dụng
    private String description; // Mô tả
    private Boolean isActive; // Trạng thái hoạt động

    public PromoDTO() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Integer restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getPercent() {
        return percent;
    }

    public void setPercent(Integer percent) {
        this.percent = percent;
    }

    public Long getValue() {
        return value;
    }

    public void setValue(Long value) {
        this.value = value;
        this.discountValue = value; // Đồng bộ với discountValue
    }

    public Long getDiscountValue() {
        return discountValue != null ? discountValue : value;
    }

    public void setDiscountValue(Long discountValue) {
        this.discountValue = discountValue;
        this.value = discountValue; // Đồng bộ với value
    }

    public Integer getMaxUsage() {
        return maxUsage;
    }

    public void setMaxUsage(Integer maxUsage) {
        this.maxUsage = maxUsage;
    }

    public Integer getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(Integer usedCount) {
        this.usedCount = usedCount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

