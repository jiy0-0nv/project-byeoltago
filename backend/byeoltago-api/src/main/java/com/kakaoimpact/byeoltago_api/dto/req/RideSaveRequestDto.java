package com.kakaoimpact.byeoltago_api.dto.req;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RideSaveRequestDto {
    private String polyline;
    private Timestamp startedAt;
    private Timestamp endedAt;
    private Boolean isShared;
}