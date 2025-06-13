package com.kakaoimpact.byeoltago_api.controller;

import com.kakaoimpact.byeoltago_api.common.Const;
import com.kakaoimpact.byeoltago_api.dto.req.LoginRequestDto;
import com.kakaoimpact.byeoltago_api.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://jiy0-0nv.github.io",
                "https://d1fkbh5rwn7h6q.cloudfront.net"
        },
        allowCredentials = "true"
)@RestController
@RequestMapping(Const.API_BASE_URL + "/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil; // JwtUtil 주입

    private final String jwtCookieName = "byeoltago-jwt";

    private final long jwtExpirationMs = 10800000L; // 3시간 (10_800_000 밀리초)

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequestDto, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequestDto.getEmail(), loginRequestDto.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            // JwtUtil을 사용하여 토큰 생성
            String accessToken = jwtUtil.generateToken(userDetails.getUsername());

            // 쿠키 생성 (Spring의 ResponseCookie 사용)
            ResponseCookie cookie = ResponseCookie.from(jwtCookieName, accessToken)
                    .httpOnly(true)       // JavaScript에서 접근 불가
                    .secure(true)         // HTTPS 환경 필수
                    .sameSite("None")
                    .path("/")            // 쿠키 유효 경로
                    .maxAge(jwtExpirationMs / 1000) // 쿠키 만료 시간 (초 단위)
                    .domain("jiy0-0nv.github.io") // 필요시 도메인 설정
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(Map.of("message", "로그인 성공", "status", "OK"));

        } catch (BadCredentialsException e) {
            log.warn("Login failed for email {}: Invalid credentials", loginRequestDto.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("이메일 또는 비밀번호가 일치하지 않습니다.");
        } catch (Exception e) {
            log.error("Error during login for email {}: {}", loginRequestDto.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("로그인 처리 중 오류가 발생했습니다.");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(jwtCookieName, "")
                .httpOnly(true)
                .path("/")
                .maxAge(0) // 즉시 만료
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok("성공적으로 로그아웃되었습니다. 쿠키가 삭제되었습니다.");
    }
}