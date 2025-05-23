package com.kakaoimpact.byeoltago_api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_types")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class ReportType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;
}
