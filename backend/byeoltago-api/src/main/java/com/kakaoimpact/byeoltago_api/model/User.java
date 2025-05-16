package com.kakaoimpact.byeoltago_api.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email") // Corresponds to UNIQUE KEY `email` (`email`)
})
@Data
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA entities should have a protected no-args constructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "email", nullable = false, length = 255) // `unique = true` is handled by @Table's uniqueConstraints
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "nickname", length = 100)
    private String nickname;

    @Column(name = "points")
    private Integer points = 0;

}