package com.workshop.catalog.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${pricing-service.base-url}")
    private String pricingServiceBaseUrl;

    @Bean
    public WebClient pricingWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(pricingServiceBaseUrl)
                .build();
    }
}
