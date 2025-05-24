package com.kakaoimpact.byeoltago_api.dto.req;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;

@Getter
@Setter
public class ReportRequestDto {

    @NotNull
    @JsonProperty("user_id")
    private Long userId;

    @NotNull
    private Float latitude;

    @NotNull
    private Float longitude;

    @NotNull
    @JsonProperty("type_id")
    private Integer typeId;

    private String description;
}