package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserReponsitory extends JpaRepository <Users,Integer>{
    //custom query login
    List<Users> findByUserNameAndPassword(String userName, String password);
    Optional<Users> findFirstByUserName(String userName);
    Boolean existsByUserName(String username);
    
    // Search users by username or fullname
    @Query("SELECT u FROM users u WHERE LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Users> searchUsers(@Param("keyword") String keyword);
    
    // Find users by role name
    @Query("SELECT u FROM users u JOIN u.roles r WHERE r.roleName = :roleName")
    List<Users> findByRoleName(@Param("roleName") String roleName);
    
    // Search users by role name and keyword
    @Query("SELECT u FROM users u JOIN u.roles r WHERE r.roleName = :roleName " +
           "AND (LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Users> findByRoleNameAndKeyword(@Param("roleName") String roleName, @Param("keyword") String keyword);
}
