package com.kakaoimpact.byeoltago_api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "frontend")
public class CorsProperties {
    private List<String> allowedOrigins;
}
