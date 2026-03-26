package com.workshop.pricing.controller;

import com.workshop.pricing.config.FailureConfig;
import com.workshop.pricing.config.FailureConfig.FailureMode;
import com.workshop.pricing.model.PriceInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/pricing")
public class PricingController {

    private static final Logger log = LoggerFactory.getLogger(PricingController.class);

    private final FailureConfig failureConfig;

    // Simulated pricing data
    private static final Map<String, PriceInfo> PRICES = Map.of(
            "PROD-001", new PriceInfo("PROD-001", new BigDecimal("29.99"), "EUR", new BigDecimal("10")),
            "PROD-002", new PriceInfo("PROD-002", new BigDecimal("49.99"), "EUR", new BigDecimal("0")),
            "PROD-003", new PriceInfo("PROD-003", new BigDecimal("99.99"), "EUR", new BigDecimal("25")),
            "PROD-004", new PriceInfo("PROD-004", new BigDecimal("14.99"), "EUR", new BigDecimal("5")),
            "PROD-005", new PriceInfo("PROD-005", new BigDecimal("199.99"), "EUR", new BigDecimal("15"))
    );

    public PricingController(FailureConfig failureConfig) {
        this.failureConfig = failureConfig;
    }

    @GetMapping("/{productId}")
    public PriceInfo getPrice(@PathVariable String productId) {
        log.info("Received pricing request for product: {} | Mode: {}", productId, failureConfig.getMode());

        applyFailureMode();

        PriceInfo price = PRICES.get(productId);
        if (price == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + productId);
        }

        log.info("Returning price for product: {} -> {}", productId, price.getFinalPrice());
        return price;
    }

    private void applyFailureMode() {
        FailureMode mode = failureConfig.getMode();

        switch (mode) {
            case SLOW -> {
                log.warn("SLOW MODE: Sleeping for {}ms", failureConfig.getSlowDelayMs());
                try {
                    Thread.sleep(failureConfig.getSlowDelayMs());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            case FAIL -> {
                log.error("FAIL MODE: Returning 500 Internal Server Error");
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Service B is in FAIL mode - simulated failure");
            }
            case RANDOM -> {
                if (failureConfig.shouldRandomlyFail()) {
                    log.error("RANDOM MODE: This request failed (rate: {}%)", failureConfig.getRandomFailureRate());
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Service B random failure (rate: " + failureConfig.getRandomFailureRate() + "%)");
                }
                log.info("RANDOM MODE: This request succeeded (rate: {}%)", failureConfig.getRandomFailureRate());
            }
            case HEALTHY -> {
                // Normal operation
            }
        }
    }
}
