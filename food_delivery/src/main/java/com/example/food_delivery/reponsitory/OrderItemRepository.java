package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.OrderItem;
import com.example.food_delivery.domain.entity.keys.KeyOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, KeyOrderItem> {}
