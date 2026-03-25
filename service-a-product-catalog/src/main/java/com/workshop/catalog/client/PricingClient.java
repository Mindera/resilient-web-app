package com.workshop.catalog.client;

import com.workshop.catalog.retry.DistributedRetryService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

/**
 * Client that calls Service B (Pricing Service) to get pricing information.
 *
 * Solution: Full resilience stack:
 * - Retry with exponential backoff + jitter + exception filtering
 * - Circuit breaker with fallback (returns cached/default prices)
 * - Distributed retry: enqueues failed requests to DB for background processing
 */
@Component
public class PricingClient {

    private static final Logger log = LoggerFactory.getLogger(PricingClient.class);

    private final WebClient pricingWebClient;
    private final Map<String, Map<String, Object>> priceCache;
    private final DistributedRetryService distributedRetryService;

    public PricingClient(
            WebClient pricingWebClient,
            Map<String, Map<String, Object>> priceCache,
            DistributedRetryService distributedRetryService) {
        this.pricingWebClient = pricingWebClient;
        this.priceCache = priceCache;
        this.distributedRetryService = distributedRetryService;
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
     * Also enqueues the request for distributed retry via the database.
     */
    private Map<String, Object> getPriceFallback(String productId, Throwable t) {
        log.warn("Fallback triggered for product {}: {} - {}", productId, t.getClass().getSimpleName(), t.getMessage());

        // Enqueue for distributed retry (background processing)
        try {
            distributedRetryService.enqueueRetry(productId);
        } catch (Exception e) {
            log.error("Failed to enqueue distributed retry for product {}: {}", productId, e.getMessage());
        }

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
