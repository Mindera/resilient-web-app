package com.workshop.catalog.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Client that calls Service B (Pricing Service) to get pricing information.
 *
 * Step 2 complete: Circuit breaker with fallback.
 * - On success: caches the price for future fallback use
 * - On failure (circuit open): returns cached price with priceStale=true,
 *   or a default "unavailable" response if no cache exists
 */
@Component
public class PricingClient {

    private static final Logger log = LoggerFactory.getLogger(PricingClient.class);

    private final WebClient pricingWebClient;

    // Simple in-memory cache of last known good prices
    private final Map<String, Map<String, Object>> priceCache = new ConcurrentHashMap<>();

    public PricingClient(WebClient pricingWebClient) {
        this.pricingWebClient = pricingWebClient;
    }

    /**
     * Fetches pricing info for a given product ID from Service B.
     * Circuit breaker opens after 50% failure rate.
     * Falls back to cached/default prices when circuit is open.
     * Retries up to 3 times with exponential backoff.
     */
    @CircuitBreaker(name = "pricingService", fallbackMethod = "getPriceFallback")
    @Retry(name = "pricingService")
    @SuppressWarnings("unchecked")
    public Map<String, Object> getPrice(String productId) {
        log.info("Calling pricing service for product: {}", productId);

        Map<String, Object> response = pricingWebClient.get()
                .uri("/pricing/{productId}", productId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        log.info("Received pricing for product: {} -> {}", productId, response);

        // Cache the successful response for fallback use
        priceCache.put(productId, response);

        return response;
    }

    /**
     * Fallback method — called when the circuit breaker is open or all retries are exhausted.
     * Returns cached price (marked as stale) or a default "unavailable" response.
     *
     * IMPORTANT: The method signature must match getPrice() params + a Throwable at the end.
     */
    private Map<String, Object> getPriceFallback(String productId, Throwable t) {
        log.warn("Fallback triggered for product {}: {} - {}", productId, t.getClass().getSimpleName(), t.getMessage());

        // Try to return cached price
        Map<String, Object> cached = priceCache.get(productId);
        if (cached != null) {
            log.info("Returning cached (stale) price for product: {}", productId);
            Map<String, Object> result = new HashMap<>(cached);
            result.put("priceStale", true);
            return result;
        }

        // No cached price — return default "unavailable" response
        log.warn("No cached price available for product: {}", productId);
        return Map.of(
                "productId", productId,
                "price", 0,
                "currency", "EUR",
                "discount", 0,
                "finalPrice", 0,
                "priceStale", true,
                "error", "Price temporarily unavailable"
        );
    }
}
