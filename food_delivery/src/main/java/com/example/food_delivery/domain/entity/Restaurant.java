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
@Entity(name = "restaurant")

public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "title")
    private String title;
    @Column(name = "subtitle")
    private String subtitle;
    @Column(name = "description")
    private String description;
    @Column(name = "image")
    private String image;
    @Column(name = "is_freeship")
    private boolean isFreeship;
    @Column(name = "address")
    private String address;
    @Column(name = "open_date")
    private Date openDate;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private Users owner; // Chủ cửa hàng

    @Column(name = "is_active")
    private boolean isActive; // Trạng thái hoạt động của cửa hàng

    @Column(name = "is_approved")
    private Boolean isApproved; // Trạng thái duyệt của cửa hàng (admin phê duyệt)

    @OneToMany(mappedBy = "restaurant")
    private Set<RatingRestaurant> lisRatingRestaurant;

    @OneToMany(mappedBy = "restaurant")
    @JsonIgnore
    private Set<Orders> listOrders;

    @OneToMany(mappedBy = "restaurant")
    @JsonIgnore // Prevent circular reference when serializing to JSON (Restaurant -> MenuRestaurant -> Restaurant)
    private Set<MenuRestaurant> lisMenuRestaurant;

    @OneToMany(mappedBy = "restaurant")
    private Set<Promo> listPromo;

    public Set<Promo> getListPromo() {
        return listPromo;
    }

    public void setListPromo(Set<Promo> listPromo) {
        this.listPromo = listPromo;
    }

    public Set<MenuRestaurant> getLisMenuRestaurant() {
        return lisMenuRestaurant;
    }

    public void setLisMenuRestaurant(Set<MenuRestaurant> lisMenuRestaurant) {
        this.lisMenuRestaurant = lisMenuRestaurant;
    }

    public Set<Orders> getListOrders() {
        return listOrders;
    }

    public void setListOrders(Set<Orders> listOrders) {
        this.listOrders = listOrders;
    }

    public Set<RatingRestaurant> getLisRatingRestaurant() {
        return lisRatingRestaurant;
    }

    public void setLisRatingRestaurant(Set<RatingRestaurant> lisRatingRestaurant) {
        this.lisRatingRestaurant = lisRatingRestaurant;
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

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public boolean isFreeship() {
        return isFreeship;
    }

    public void setFreeship(boolean freeship) {
        isFreeship = freeship;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Date getOpenDate() {
        return openDate;
    }

    public void setOpenDate(Date openDate) {
        this.openDate = openDate;
    }

    public Users getOwner() {
        return owner;
    }

    public void setOwner(Users owner) {
        this.owner = owner;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean approved) {
        isApproved = approved;
    }
}
