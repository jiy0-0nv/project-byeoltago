package com.kakaoimpact.byeoltago_api.dto.req;

import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideInfoResponseDto {
    private Long id;
    private Timestamp startedAt;
    private Timestamp endedAt;
    private String polyline;
    private Boolean isShared;
}