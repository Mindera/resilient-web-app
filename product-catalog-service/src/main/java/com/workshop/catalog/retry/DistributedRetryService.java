package com.workshop.catalog.retry;

import com.workshop.catalog.entity.RetryRequest;
import com.workshop.catalog.entity.RetryRequest.RetryStatus;
import com.workshop.catalog.repository.RetryRequestRepository;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Distributed retry service that processes failed pricing requests from the database.
 *
 * How it works:
 * 1. When the circuit breaker fallback fires, a RetryRequest is saved to the DB
 * 2. This scheduled job runs every 30 seconds
 * 3. It picks up PENDING requests whose nextRetryAt has passed
 * 4. For each request, it calls Service B directly (bypassing the circuit breaker)
 * 5. On success: marks as COMPLETED and updates the price cache
 * 6. On failure: increments attempts, sets nextRetryAt with exponential backoff
 * 7. If max attempts reached: marks as FAILED
 *
 * ShedLock ensures only ONE instance runs this job at a time in a multi-instance deployment.
 */
@Service
public class DistributedRetryService {

    private static final Logger log = LoggerFactory.getLogger(DistributedRetryService.class);

    private final RetryRequestRepository retryRequestRepository;
    private final WebClient pricingWebClient;

    // Shared price cache — in production, use Redis or similar
    private final Map<String, Map<String, Object>> priceCache;

    public DistributedRetryService(
            RetryRequestRepository retryRequestRepository,
            WebClient pricingWebClient,
            Map<String, Map<String, Object>> priceCache) {
        this.retryRequestRepository = retryRequestRepository;
        this.pricingWebClient = pricingWebClient;
        this.priceCache = priceCache;
    }

    /**
     * Scheduled job that processes pending retry requests.
     * Runs every 30 seconds. ShedLock ensures only one instance executes this.
     */
    @Scheduled(fixedDelayString = "${distributed-retry.interval-ms:30000}")
    @SchedulerLock(
            name = "retryPricingRequests",
            lockAtLeastFor = "10s",
            lockAtMostFor = "5m"
    )
    public void processRetryRequests() {
        List<RetryRequest> pendingRequests = retryRequestRepository
                .findByStatusAndNextRetryAtBefore(RetryStatus.PENDING, LocalDateTime.now());

        if (pendingRequests.isEmpty()) {
            return;
        }

        log.info("Processing {} pending retry requests", pendingRequests.size());

        for (RetryRequest request : pendingRequests) {
            processRetryRequest(request);
        }
    }

    @SuppressWarnings("unchecked")
    private void processRetryRequest(RetryRequest request) {
        request.setAttempts(request.getAttempts() + 1);
        log.info("Retrying request {} (attempt {}/{}): product={}",
                request.getId(), request.getAttempts(), request.getMaxAttempts(), request.getProductId());

        try {
            // Call Service B directly (no circuit breaker — this is a background retry)
            Map<String, Object> response = pricingWebClient.get()
                    .uri("/pricing/{productId}", request.getProductId())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            // Success! Update cache and mark as completed
            priceCache.put(request.getProductId(), response);
            request.setStatus(RetryStatus.COMPLETED);
            request.setCompletedAt(LocalDateTime.now());
            log.info("Retry succeeded for product {}: price updated in cache", request.getProductId());

        } catch (Exception e) {
            request.setLastError(e.getClass().getSimpleName() + ": " + e.getMessage());

            if (request.getAttempts() >= request.getMaxAttempts()) {
                request.setStatus(RetryStatus.FAILED);
                log.error("Retry exhausted for product {} after {} attempts: {}",
                        request.getProductId(), request.getAttempts(), e.getMessage());
            } else {
                // Exponential backoff: 30s, 60s, 120s, 240s...
                long backoffSeconds = 30L * (long) Math.pow(2, request.getAttempts() - 1);
                request.setNextRetryAt(LocalDateTime.now().plusSeconds(backoffSeconds));
                log.warn("Retry failed for product {} (attempt {}/{}), next retry in {}s: {}",
                        request.getProductId(), request.getAttempts(), request.getMaxAttempts(),
                        backoffSeconds, e.getMessage());
            }
        }

        retryRequestRepository.save(request);
    }

    /**
     * Enqueue a failed request for distributed retry.
     * Called from the circuit breaker fallback.
     */
    public void enqueueRetry(String productId) {
        // Avoid duplicate pending retries for the same product
        if (retryRequestRepository.existsByProductIdAndStatus(productId, RetryStatus.PENDING)) {
            log.debug("Retry already pending for product {}, skipping", productId);
            return;
        }

        RetryRequest request = new RetryRequest(productId, 5);
        retryRequestRepository.save(request);
        log.info("Enqueued distributed retry for product {}", productId);
    }
}
