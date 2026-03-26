package com.workshop.catalog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA entity representing a failed pricing request that needs to be retried later.
 * This is the "distributed retry queue" — persisted to the database so retries
 * survive application restarts and can be processed by any instance.
 */
@Entity
@Table(name = "retry_requests")
public class RetryRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String productId;

    @Column(nullable = false)
    private int attempts;

    @Column(nullable = false)
    private int maxAttempts;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RetryStatus status;

    @Column(length = 1000)
    private String lastError;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime nextRetryAt;

    private LocalDateTime completedAt;

    public enum RetryStatus {
        PENDING, COMPLETED, FAILED
    }

    public RetryRequest() {
    }

    public RetryRequest(String productId, int maxAttempts) {
        this.productId = productId;
        this.attempts = 0;
        this.maxAttempts = maxAttempts;
        this.status = RetryStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.nextRetryAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public RetryStatus getStatus() {
        return status;
    }

    public void setStatus(RetryStatus status) {
        this.status = status;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getNextRetryAt() {
        return nextRetryAt;
    }

    public void setNextRetryAt(LocalDateTime nextRetryAt) {
        this.nextRetryAt = nextRetryAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    @Override
    public String toString() {
        return "RetryRequest{" +
                "id=" + id +
                ", productId='" + productId + '\'' +
                ", attempts=" + attempts + "/" + maxAttempts +
                ", status=" + status +
                '}';
    }
}
