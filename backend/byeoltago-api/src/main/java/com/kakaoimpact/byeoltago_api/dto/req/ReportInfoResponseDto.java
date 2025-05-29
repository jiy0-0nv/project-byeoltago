package com.kakaoimpact.byeoltago_api.dto.req;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ReportInfoResponseDto {
    private Long id;
    private Double latitude;
    private Double longitude;
    private Integer riskLevel;
    private Integer reportType;
}