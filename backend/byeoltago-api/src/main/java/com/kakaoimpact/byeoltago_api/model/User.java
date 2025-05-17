package com.kakaoimpact.byeoltago_api.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email") // Corresponds to UNIQUE KEY `email` (`email`)
})
@Data
@Builder // 이 어노테이션이 있는지 확인!
@AllArgsConstructor // @Builder는 모든 필드를 받는 생성자를 필요로 할 수 있습니다.
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA entities should have a protected no-args constructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "email", nullable = false, length = 255) // `unique = true` is handled by @Table's uniqueConstraints
    private String email;

    @Column(name = "phone_number", nullable = false, length = 20) // `unique = true` is handled by @Table's uniqueConstraints
    private String phoneNumber;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "nickname", length = 100)
    private String nickname;

    @Column(name = "points")
    private Integer points = 0;

}