package com.kakaoimpact.byeoltago_api.model;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Entity
@Table(name = "community_rides")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommunityRide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "ride_id")
    private Long rideId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "shared_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp sharedAt;

    @Column(name = "likes")
    private Integer likes = 0;
}
