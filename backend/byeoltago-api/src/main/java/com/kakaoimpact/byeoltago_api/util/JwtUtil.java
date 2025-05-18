package com.kakaoimpact.byeoltago_api.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; // 더 구체적인 예외 타입
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${spring.jwt.secret}") // application.properties 또는 application.yml 에서 설정
    private String jwtSecretString;

    private SecretKey jwtSecretKey;

    // 기본 토큰 만료 시간: 3시간 (밀리초 단위)
    private static final long DEFAULT_TOKEN_VALIDITY_MS = 3 * 60 * 60 * 1000;
    private static final String AUTHORITIES_KEY = "roles"; // 토큰 내 권한 정보를 담을 클레임 키

    @PostConstruct
    public void init() {
        if (jwtSecretString == null || jwtSecretString.trim().isEmpty()) {
            logger.error("JWT secret key is not configured. Please set 'jwt.secret' in application properties.");
            throw new IllegalArgumentException("JWT secret key ('jwt.secret') is missing or empty in configuration.");
        }
        this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecretString.getBytes());
    }

    /**
     * 사용자 정보와 기본 만료 시간(3시간)을 사용하여 JWT를 생성합니다.
     *
     * @param username 사용자 식별자 (예: 이메일 또는 ID)
     * @return 생성된 JWT 문자열
     */
    public String generateToken(String username) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        return generateToken(username, authorities, DEFAULT_TOKEN_VALIDITY_MS);
    }

    /**
     * 사용자 정보와 지정된 만료 시간을 사용하여 JWT를 생성합니다.
     *
     * @param username         사용자 식별자
     * @param authorities      사용자의 권한 목록
     * @param expirationMillis 토큰 만료 시간 (밀리초 단위)
     * @return 생성된 JWT 문자열
     */
    public String generateToken(String username, Collection<? extends GrantedAuthority> authorities, long expirationMillis) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMillis);

        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(username)
                .claim(AUTHORITIES_KEY, roles) // "roles" 클레임에 권한 정보 저장
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey, SignatureAlgorithm.HS512) // HS512 알고리즘과 SecretKey 사용
                .compact();
    }

    /**
     * JWT 토큰에서 사용자 이름(subject)을 추출합니다.
     * 토큰 유효성 검증은 이 메서드 호출 전에 validateToken()을 통해 수행되어야 합니다.
     *
     * @param token JWT 토큰
     * @return 사용자 이름, 유효하지 않은 토큰이거나 subject가 없으면 null 반환 가능성 있음 (호출 전 validateToken 권장)
     */
    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtSecretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (JwtException e) {
            // 일반적으로 validateToken에서 처리되지만, 직접 호출 시 예외 발생 가능
            logger.warn("Could not get username from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * JWT 토큰에서 권한 정보를 추출합니다.
     * 토큰 유효성 검증은 이 메서드 호출 전에 validateToken()을 통해 수행되어야 합니다.
     *
     * @param token JWT 토큰
     * @return GrantedAuthority 컬렉션, 유효하지 않은 토큰이거나 roles 클레임이 없으면 빈 컬렉션 반환
     */
    public Collection<? extends GrantedAuthority> getAuthoritiesFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtSecretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            @SuppressWarnings("unchecked") // typesafe cast
            List<String> roles = claims.get(AUTHORITIES_KEY, List.class);

            if (roles == null) {
                return java.util.Collections.emptyList();
            }

            return roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        } catch (JwtException e) {
            logger.warn("Could not get authorities from token: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * JWT 토큰의 유효성을 검증합니다.
     *
     * @param authToken 검증할 JWT 토큰
     * @return 토큰이 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateToken(String authToken) {
        if (authToken == null || authToken.trim().isEmpty()) {
            logger.warn("JWT token is null or empty.");
            return false;
        }
        try {
            Jwts.parserBuilder().setSigningKey(jwtSecretKey).build().parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            // Jwts.parserBuilder().setSigningKey(null or empty) 시 발생 가능, 또는 토큰 자체가 부적절
            logger.error("JWT claims string is empty or key is invalid or token is malformed: {}", ex.getMessage());
        }
        return false;
    }
}