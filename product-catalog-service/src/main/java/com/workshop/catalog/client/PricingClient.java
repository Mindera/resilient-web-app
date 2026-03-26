package com.workshop.catalog.client;

import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

/**
 * Client that calls Service B (Pricing Service) to get pricing information.
 *
 * Step 1: Basic retry added — retries up to 3 times with a 500ms wait.
 */
@Component
public class PricingClient {

    private static final Logger log = LoggerFactory.getLogger(PricingClient.class);

    private final WebClient pricingWebClient;

    public PricingClient(WebClient pricingWebClient) {
        this.pricingWebClient = pricingWebClient;
    }

    /**
     * Fetches pricing info for a given product ID from Service B.
     * Retries up to 3 times on failure.
     */
    @Retry(name = "pricingService")
    @SuppressWarnings("unchecked")
    public Map<String, Object> getPrice(String productId) {
        log.info("Calling pricing service for product: {}", productId);

        Map<String, Object> response = pricingWebClient.get()
                .uri("/pricing/{productId}", productId)
                .retrieve()
                .bodyToMono(Map.class)
                .block(); // Blocking call — no timeout configured!

        log.info("Received pricing for product: {} -> {}", productId, response);
        return response;
    }
}
