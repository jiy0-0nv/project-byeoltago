package com.kakaoimpact.byeoltago_api.dto.req;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ReportInfoResponseDto {
    private Long id;
    private Float latitude;
    private Float longitude;
    private Integer reportCount;
    private Integer riskLevel;
}