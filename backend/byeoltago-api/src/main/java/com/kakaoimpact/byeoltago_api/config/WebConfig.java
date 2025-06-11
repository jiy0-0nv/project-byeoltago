package com.kakaoimpact.byeoltago_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://jiy0-0nv.github.io/project-byeoltago/frontend") // 배포된 프론트 주소
                .allowedMethods("*")
                .allowCredentials(true);
    }
}
