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
    private static final String JWT_TOKEN_COOKIE_NAME = "byeoltago-jwt";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractTokenFromCookies(request);

        if (StringUtils.hasText(token)) {
            try {
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getUsernameFromToken(token);
                    Collection<? extends GrantedAuthority> authorities = jwtUtil.getAuthoritiesFromToken(token);
                    Optional<User> user = userRepository.findUserByEmail(username);
                    if (username != null) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(username, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("Authenticated user: {}, authorities: {}", username, authorities);

                        // Set user ID in UserContext if user exists
                        user.ifPresent(u -> UserContext.setUserId(u.getId().toString()));
                    }
                } else {
                    log.warn("Invalid JWT token received: {}", token);
                }
            } catch (Exception e) {
                log.error("JWT token processing error: {}", e.getMessage(), e);
                SecurityContextHolder.clearContext();
            }
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
        }

    }

    private String extractTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            return Arrays.stream(cookies)
                    .filter(cookie -> JWT_TOKEN_COOKIE_NAME.equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }
}
