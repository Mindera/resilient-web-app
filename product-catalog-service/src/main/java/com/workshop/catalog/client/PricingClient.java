package com.workshop.catalog.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Client that calls Service B (Pricing Service) to get pricing information.
 *
 * WORKSHOP NOTE: This is where you will add Resilience4j annotations!
 * Currently, there is NO resilience — if Service B is slow or down,
 * this client will hang or throw exceptions.
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
     *
     * TODO (Workshop): Add @Retry and @CircuitBreaker annotations here!
     *
     * @param productId the product ID to look up
     * @return a map containing pricing fields (price, currency, discount, finalPrice)
     */
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
