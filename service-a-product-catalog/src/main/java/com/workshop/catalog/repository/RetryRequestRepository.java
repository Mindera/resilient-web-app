package com.workshop.catalog.repository;

import com.workshop.catalog.entity.RetryRequest;
import com.workshop.catalog.entity.RetryRequest.RetryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RetryRequestRepository extends JpaRepository<RetryRequest, Long> {

    /**
     * Find all pending retry requests that are due for processing.
     */
    List<RetryRequest> findByStatusAndNextRetryAtBefore(RetryStatus status, LocalDateTime now);

    /**
     * Check if a pending retry already exists for a product (avoid duplicates).
     */
    boolean existsByProductIdAndStatus(String productId, RetryStatus status);
}
