package com.kakaoimpact.byeoltago_api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_status")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReportStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;
}
