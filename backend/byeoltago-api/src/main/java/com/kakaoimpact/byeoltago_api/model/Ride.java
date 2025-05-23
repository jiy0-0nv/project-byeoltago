package com.kakaoimpact.byeoltago_api.model;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Entity
@Table(name = "rides")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "started_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp startedAt;

    @Column(name = "ended_at")
    private Timestamp endedAt;

    @Column(name = "polyline", columnDefinition = "TEXT")
    private String polyline;

    @Column(name = "is_shared")
    private Boolean isShared = false;
}
