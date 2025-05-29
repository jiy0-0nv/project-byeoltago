package com.kakaoimpact.byeoltago_api.dto.req;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;

@Getter
@Setter
public class ReportRequestDto {

    @NotNull
    private Long userId;

    @NotNull(message = "위도는 필수입니다.")
    @DecimalMin(value = "33.0", message = "위도는 33.0 이상이어야 합니다.")
    @DecimalMax(value = "38.9", message = "위도는 38.9 이하이어야 합니다.")
    private Double latitude;

    @NotNull(message = "경도는 필수입니다.")
    @DecimalMin(value = "124.5", message = "경도는 124.5 이상이어야 합니다.")
    @DecimalMax(value = "132.0", message = "경도는 132.0 이하이어야 합니다.")
    private Double longitude;

    @NotNull(message = "신고 유형은 필수입니다.")
    private Integer typeId;

    private String description;

    private String imagePath;
}