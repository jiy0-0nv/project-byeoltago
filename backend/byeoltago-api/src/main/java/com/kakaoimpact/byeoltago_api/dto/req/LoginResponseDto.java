package com.kakaoimpact.byeoltago_api.dto.req;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDto {
    private String message;
    private String status;
    private String token;
    private Long userId;
    private String email;
}
