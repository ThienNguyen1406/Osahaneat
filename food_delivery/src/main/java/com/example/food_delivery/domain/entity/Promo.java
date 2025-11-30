package com.example.food_delivery.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "promo")
public class Promo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "res_id", nullable = true)
    private Restaurant restaurant; // NULL = áp dụng cho tất cả nhà hàng

    @Column(name = "code")
    private String code; // Mã voucher (VD: GIAM50K)
    
    @Column(name = "name")
    private String name; // Tên khuyến mãi
    
    @Column(name = "type")
    private String type; // Loại giảm giá: FOOD_DISCOUNT, SHIP_DISCOUNT
    
    @Column(name = "percent")
    private Integer percent; // Phần trăm giảm (cũ, để tương thích)
    
    @Column(name = "value")
    private Long value; // Giá trị giảm (VND) - mới
    
    @Column(name = "start_date")
    private Date startDate;
    
    @Column(name = "end_date")
    private Date endDate;
    
    @Column(name = "max_usage")
    private Integer maxUsage; // Số lần sử dụng tối đa (NULL = không giới hạn)
    
    @Column(name = "used_count")
    private Integer usedCount; // Số lần đã sử dụng
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Mô tả chi tiết
    
    @Column(name = "is_active")
    private Boolean isActive; // Trạng thái hoạt động

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
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
