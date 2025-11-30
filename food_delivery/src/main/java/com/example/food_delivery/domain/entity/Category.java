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
@Entity (name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "name_cate")
    private String nameCate;

    @Column(name = "created_date")
    private Date createDate;

    @OneToMany(mappedBy = "category")
    @JsonIgnore // Prevent circular reference when serializing to JSON
    private Set<Food> lisFood;

    @OneToMany(mappedBy = "category")
    @JsonIgnore // Prevent circular reference when serializing to JSON
    private Set<MenuRestaurant> lisMenuRestaurant;

    public Set<MenuRestaurant> getLisMenuRestaurant() {
        return lisMenuRestaurant;
    }

    public void setLisMenuRestaurant(Set<MenuRestaurant> lisMenuRestaurant) {
        this.lisMenuRestaurant = lisMenuRestaurant;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNameCate() {
        return nameCate;
    }

    public void setNameCate(String nameCate) {
        this.nameCate = nameCate;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Set<Food> getLisFood() {
        return lisFood;
    }

    public void setLisFood(Set<Food> lisFood) {
        this.lisFood = lisFood;
    }
}
