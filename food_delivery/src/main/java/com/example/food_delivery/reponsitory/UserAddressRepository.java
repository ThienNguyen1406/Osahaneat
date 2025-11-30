package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Integer> {
    List<UserAddress> findByUserId(int userId);
    List<UserAddress> findByUserIdAndType(int userId, String type);
    UserAddress findByUserIdAndIsDefaultTrue(int userId);
}

