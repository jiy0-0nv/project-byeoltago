package com.kakaoimpact.byeoltago_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("https://https://d1fkbh5rwn7h6q.cloudfront.net")  // 실제 CloudFront 도메인으로 교체
                        .allowedMethods("*")
                        .allowCredentials(true);
            }
        };
    }
}
