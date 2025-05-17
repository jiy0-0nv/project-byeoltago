package com.kakaoimpact.byeoltago_api.controller;

import com.kakaoimpact.byeoltago_api.common.Const;
import com.kakaoimpact.byeoltago_api.dto.req.PasswordResetRequestDto;
import com.kakaoimpact.byeoltago_api.dto.req.RegistrationDto;
import com.kakaoimpact.byeoltago_api.model.User;
import com.kakaoimpact.byeoltago_api.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping(Const.API_BASE_URL + "/users")
public class UserController {
    private final UserService userService;


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationDto registrationDto) {
        try {
            User registeredUser = userService.registerUser(registrationDto);
            // 회원가입 성공 시, 생성된 사용자 정보의 일부 또는 성공 메시지를 반환할 수 있습니다.
            // 여기서는 간단히 사용자 이메일과 성공 메시지를 포함한 객체를 반환하거나,
            // 생성된 리소스를 나타내는 201 Created 상태와 함께 사용자 정보를 반환합니다.
            // 예시: return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(registeredUser);
        } catch (IllegalArgumentException e) {
            // UserService에서 발생시킨 예외 (예: 이메일/닉네임 중복, 비밀번호 불일치 등)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // 기타 예상치 못한 서버 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    /**
     * 핸드폰 번호를 파라미터로 받아 이메일을 조회하는 API
     * @param phoneNumber 조회할 핸드폰 번호
     * @return 이메일 주소 또는 오류 메시지
     */
    @GetMapping("/find-email")
    public ResponseEntity<?> getEmailByPhoneNumber(
            @RequestParam("phone_number") @NotBlank(message = "핸드폰 번호는 필수입니다.") String phoneNumber) {
        try {
            String email = userService.findEmailByPhoneNumber(phoneNumber);
            return ResponseEntity.ok(email); // 성공 시 이메일 반환
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); // 사용자를 찾지 못한 경우 404
        } catch (Exception e) {
            // 기타 예상치 못한 서버 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("이메일 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }


    /**
     * 휴대폰 번호와 이메일을 확인하여 비밀번호를 재설정하는 API
     * @param requestDto 비밀번호 재설정 요청 데이터
     * @return 성공 또는 실패 메시지
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetUserPassword(@Valid @RequestBody PasswordResetRequestDto requestDto) {
        try {
            userService.resetPassword(requestDto);
            return ResponseEntity.ok("비밀번호가 성공적으로 재설정되었습니다.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // 기타 예상치 못한 서버 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비밀번호 재설정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
