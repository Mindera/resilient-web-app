package com.workshop.pricing.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Holds the current failure mode for the pricing service.
 * Can be toggled via the Admin API or configured via application.yml / env vars.
 *
 * Failure modes:
 * - HEALTHY: normal operation
 * - SLOW: adds a configurable delay (default 10s) to every request
 * - FAIL: returns 500 on every request
 * - RANDOM: fails a configurable percentage of requests
 */
@Component
public class FailureConfig {

    public enum FailureMode {
        HEALTHY, SLOW, FAIL, RANDOM
    }

    private final AtomicReference<FailureMode> mode = new AtomicReference<>(FailureMode.HEALTHY);
    private final AtomicInteger randomFailureRate = new AtomicInteger(0);

    @Value("${failure.default-mode:HEALTHY}")
    private String defaultMode;

    @Value("${failure.slow-delay-ms:10000}")
    private long slowDelayMs;

    @Value("${failure.default-random-rate:0}")
    private int defaultRandomRate;

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            mode.set(FailureMode.valueOf(defaultMode.toUpperCase()));
        } catch (IllegalArgumentException e) {
            mode.set(FailureMode.HEALTHY);
        }
        randomFailureRate.set(defaultRandomRate);
    }

    public FailureMode getMode() {
        return mode.get();
    }

    public void setMode(FailureMode mode) {
        this.mode.set(mode);
    }

    public int getRandomFailureRate() {
        return randomFailureRate.get();
    }

    public void setRandomFailureRate(int rate) {
        this.randomFailureRate.set(Math.max(0, Math.min(100, rate)));
    }

    public long getSlowDelayMs() {
        return slowDelayMs;
    }

    /**
     * Returns true if this request should fail based on the random failure rate.
     */
    public boolean shouldRandomlyFail() {
        return ThreadLocalRandom.current().nextInt(100) < randomFailureRate.get();
    }
}
