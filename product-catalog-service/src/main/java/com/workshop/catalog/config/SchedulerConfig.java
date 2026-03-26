package com.workshop.catalog.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbctemplate.JdbcTemplateLockProvider;
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import javax.sql.DataSource;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "5m")
public class SchedulerConfig {

    /**
     * ShedLock lock provider backed by JDBC (H2 in this workshop).
     * In production, you'd use PostgreSQL, MySQL, or Redis.
     */
    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(
                JdbcTemplateLockProvider.Configuration.builder()
                        .withJdbcTemplate(new org.springframework.jdbc.core.JdbcTemplate(dataSource))
                        .usingDbTime()
                        .build()
        );
    }

    /**
     * Shared price cache bean — used by both PricingClient (write on success)
     * and DistributedRetryService (update on background retry success).
     */
    @Bean
    public Map<String, Map<String, Object>> priceCache() {
        return new ConcurrentHashMap<>();
    }
}
