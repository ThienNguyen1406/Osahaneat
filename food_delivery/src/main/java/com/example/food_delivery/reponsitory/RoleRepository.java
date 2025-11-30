package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Roles, Integer> {
    Optional<Roles> findByRoleName(String roleName);
    @Query(
            value = """
                    SELECT r.*
                    FROM roles r
                    INNER JOIN users_roles ur ON r.id = ur.roles_name
                    WHERE ur.users_id = :userId
                    """,
            nativeQuery = true

    )
    List<Roles> findAllByUserId(int userId);
}
