package com.kakaoimpact.byeoltago_api.common;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor 한번에 제공
@NoArgsConstructor
@AllArgsConstructor
public class Coordinates {
    private double latitude;
    private double longitude;
}