package com.kakaoimpact.byeoltago_api.dto.req;

import lombok.*;

import java.sql.Timestamp;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDetailResponseDto {

    private Long clusterId;
    private Double latitude;
    private Double longitude;
    private Integer reportCount;
    private Integer riskLevel;
    private List<String> imagePaths;
    private List<String> descriptions;
    private Integer statusId;
    private Integer typeId;
    private Timestamp reportedAt;
}
