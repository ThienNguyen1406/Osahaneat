package com.example.food_delivery.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Entity(name = "email_verification_token")
@Table(name = "email_verification_token")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    Users user;

    @Column(name = "token", nullable = false, unique = true, length = 255)
    String token;

    @Column(name = "expiry_date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    Date expiryDate;

    @Column(name = "used", nullable = false)
    Boolean used = false;
}

