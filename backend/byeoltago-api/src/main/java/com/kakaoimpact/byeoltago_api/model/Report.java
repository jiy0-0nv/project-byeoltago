package com.kakaoimpact.byeoltago_api.model;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table(name = "reports")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "cluster_id")
    private Long clusterId;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "reported_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp reportedAt;

    @Column(name = "type_id")
    private Integer typeId;

    @Column(name = "status_id")
    private Integer statusId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_path", length = 500)
    private String imagePath;

}
