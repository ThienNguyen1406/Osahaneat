package com.example.food_delivery.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Entity(name = "password_reset_request")
@Table(name = "password_reset_request")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordResetRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "listRatingFood", "listRatingRestaurant", "listOrders"})
    Users user;
    
    @Column(name = "request_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    Date requestDate;
    
    @Column(name = "status", nullable = false, length = 20)
    String status; // PENDING, APPROVED, REJECTED, COMPLETED
    
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    String adminNotes;
    
    @ManyToOne
    @JoinColumn(name = "processed_by")
    @JsonIgnoreProperties({"password", "roles", "listRatingFood", "listRatingRestaurant", "listOrders"})
    Users processedBy; // Admin who processed the request
    
    @Column(name = "processed_date")
    @Temporal(TemporalType.TIMESTAMP)
    Date processedDate;
    
    @Column(name = "reason", columnDefinition = "TEXT")
    String reason; // User's reason for password reset
}

