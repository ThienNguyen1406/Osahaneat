package com.example.food_delivery.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "food")
public class Food {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "title")
    private String title;
    @Column(name = "image")
    private String image;
    @Column(name = "price")
    private double price;
    @Column(name = "is_freeship")
    private boolean isFreeShip;
    @Column(name = "time_ship")
    private String time_ship;
    @Column(name = "description")
    private String desc;

    @Column(name = "is_available")
    private boolean isAvailable; // Món có sẵn hay không

    @Column(name = "shipping_fee")
    private double shippingFee; // Phí ship cho shipper (doanh thu của shipper)

    public double getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(double shippingFee) {
        this.shippingFee = shippingFee;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getTime_ship() {
        return time_ship;
    }

    public void setTime_ship(String time_ship) {
        this.time_ship = time_ship;
    }

    @ManyToOne
    @JoinColumn(name = "cate_id")
    private Category category;

    public boolean isFreeShip() {
        return isFreeShip;
    }

    public void setFreeShip(boolean freeShip) {
        isFreeShip = freeShip;
    }

    @OneToMany(mappedBy = "food")
    private Set<RatingFood> listRatingFood;

    @OneToMany(mappedBy = "food")
    @JsonIgnore
    private Set<OrderItem> lisOrderItems;

//    @ManyToOne
//    @JoinColumn(name = "category_id")
//    Category category;
    public Set<OrderItem> getLisOrderItems() {
        return lisOrderItems;
    }

    public void setLisOrderItems(Set<OrderItem> lisOrderItems) {
        this.lisOrderItems = lisOrderItems;
    }

    public Set<RatingFood> getListRatingFood() {
        return listRatingFood;
    }

    public void setListRatingFood(Set<RatingFood> listRatingFood) {
        this.listRatingFood = listRatingFood;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }
}
