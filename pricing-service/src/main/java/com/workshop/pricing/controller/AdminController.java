package com.workshop.pricing.controller;

import com.workshop.pricing.config.FailureConfig;
import com.workshop.pricing.config.FailureConfig.FailureMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin API to toggle failure modes at runtime.
 *
 * Endpoints:
 *   POST /admin/healthy          - Normal operation
 *   POST /admin/slow             - 10s delay on every request
 *   POST /admin/fail             - 500 error on every request
 *   POST /admin/random?rate=40   - 40% of requests fail randomly
 *   GET  /admin/status           - Current failure mode and config
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final FailureConfig failureConfig;

    public AdminController(FailureConfig failureConfig) {
        this.failureConfig = failureConfig;
    }

    @PostMapping("/healthy")
    public Map<String, Object> setHealthy() {
        failureConfig.setMode(FailureMode.HEALTHY);
        log.info("=== FAILURE MODE CHANGED TO: HEALTHY ===");
        return getStatus();
    }

    @PostMapping("/slow")
    public Map<String, Object> setSlow() {
        failureConfig.setMode(FailureMode.SLOW);
        log.info("=== FAILURE MODE CHANGED TO: SLOW ({}ms delay) ===", failureConfig.getSlowDelayMs());
        return getStatus();
    }

    @PostMapping("/fail")
    public Map<String, Object> setFail() {
        failureConfig.setMode(FailureMode.FAIL);
        log.info("=== FAILURE MODE CHANGED TO: FAIL (500 errors) ===");
        return getStatus();
    }

    @PostMapping("/random")
    public Map<String, Object> setRandom(@RequestParam(defaultValue = "50") int rate) {
        failureConfig.setMode(FailureMode.RANDOM);
        failureConfig.setRandomFailureRate(rate);
        log.info("=== FAILURE MODE CHANGED TO: RANDOM ({}% failure rate) ===", rate);
        return getStatus();
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return Map.of(
                "mode", failureConfig.getMode().name(),
                "randomFailureRate", failureConfig.getRandomFailureRate(),
                "slowDelayMs", failureConfig.getSlowDelayMs()
        );
    }
}
