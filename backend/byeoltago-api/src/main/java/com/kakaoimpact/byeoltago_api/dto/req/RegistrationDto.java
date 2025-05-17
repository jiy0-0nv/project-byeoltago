package com.kakaoimpact.byeoltago_api.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationDto {

    @NotBlank(message = "이메일은 필수 입력 항목입니다.")
    @Email(message = "유효한 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력 항목입니다.")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "비밀번호 확인은 필수 입력 항목입니다.")
    private String passwordConfirmation;

    @NotBlank(message = "휴대전화 번호는 필수 입력 항목입니다.")
    private String phoneNumber;

    @NotBlank(message = "닉네임은 필수 입력 항목입니다.")
    @Size(min = 2, max = 100, message = "닉네임은 2자 이상 100자 이하로 입력해주세요.") // User 엔티티의 nickname 컬럼 길이에 맞춰 조정
    private String nickname; // 닉네임 필드 추가
}
