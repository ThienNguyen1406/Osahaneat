package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.UserPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPaymentMethodRepository extends JpaRepository<UserPaymentMethod, Integer> {
    List<UserPaymentMethod> findByUserId(int userId);
    List<UserPaymentMethod> findByUserIdAndIsActiveTrue(int userId);
    UserPaymentMethod findByUserIdAndIsDefaultTrue(int userId);
    UserPaymentMethod findByStripePaymentMethodId(String stripePaymentMethodId);
}

