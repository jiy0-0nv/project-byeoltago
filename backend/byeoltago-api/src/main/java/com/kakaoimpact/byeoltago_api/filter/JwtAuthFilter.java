package com.kakaoimpact.byeoltago_api.filter;

import com.kakaoimpact.byeoltago_api.common.UserContext;
import com.kakaoimpact.byeoltago_api.model.User;
import com.kakaoimpact.byeoltago_api.repository.UserRepository;
import com.kakaoimpact.byeoltago_api.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    // private static final String JWT_TOKEN_COOKIE_NAME = "byeoltago-jwt";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractTokenFromHeader(request);

        if (StringUtils.hasText(token)) {
            try {
                log.debug("JWT token received: {}", token);

                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getUsernameFromToken(token);
                    log.debug("Token validated. Extracted username/email: {}", username);

                    Collection<? extends GrantedAuthority> authorities = jwtUtil.getAuthoritiesFromToken(token);
                    Optional<User> user = userRepository.findUserByEmail(username);
                    if (user.isPresent()) {
                        log.debug("User found: {} (ID: {})", user.get().getEmail(), user.get().getId());

                        SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken(username, null, authorities)
                        );
                        log.debug("Authenticated user: {}, authorities: {}", username, authorities);

                        UserContext.setUserId(user.get().getId().toString());
                        log.debug("UserContext userId set to: {}", UserContext.getUserId());

                    } else {
                        log.warn("User not found for username: {}", username);
                    }
                } else {
                    log.warn("Invalid JWT token received: {}", token);
                }
            } catch (Exception e) {
                log.error("JWT token processing error: {}", e.getMessage(), e);
                SecurityContextHolder.clearContext();
            }
        } else {
            log.debug("No JWT token found in Authorization header.");
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
            log.debug("UserContext cleared after request.");
        }
    }

    // private String extractTokenFromCookies(HttpServletRequest request) {
    //     Cookie[] cookies = request.getCookies();
    //     if (cookies != null) {
    //         return Arrays.stream(cookies)
    //                 .filter(cookie -> JWT_TOKEN_COOKIE_NAME.equals(cookie.getName()))
    //                 .map(Cookie::getValue)
    //                 .findFirst()
    //                 .orElse(null);
    //     }
    //     return null;
    // }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7); // "Bearer " 이후의 토큰 반환
        }
        return null;
    }
}
