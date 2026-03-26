package com.workshop.catalog.service;

import com.workshop.catalog.client.PricingClient;
import com.workshop.catalog.model.PricedProduct;
import com.workshop.catalog.model.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final PricingClient pricingClient;

    // Simulated product catalog (in a real app, this would come from a database)
    private static final List<Product> PRODUCTS = List.of(
            new Product("PROD-001", "Wireless Mouse", "Ergonomic wireless mouse with USB receiver", "Electronics"),
            new Product("PROD-002", "Mechanical Keyboard", "RGB mechanical keyboard with Cherry MX switches", "Electronics"),
            new Product("PROD-003", "4K Monitor", "27-inch 4K UHD IPS monitor", "Electronics"),
            new Product("PROD-004", "USB-C Hub", "7-in-1 USB-C hub with HDMI and ethernet", "Accessories"),
            new Product("PROD-005", "Standing Desk", "Electric height-adjustable standing desk", "Furniture")
    );

    public ProductService(PricingClient pricingClient) {
        this.pricingClient = pricingClient;
    }

    /**
     * Returns all products enriched with pricing from Service B.
     */
    public List<PricedProduct> getAllProducts() {
        return PRODUCTS.stream()
                .map(this::enrichWithPricing)
                .toList();
    }

    /**
     * Returns a single product enriched with pricing from Service B.
     */
    public PricedProduct getProduct(String productId) {
        Product product = PRODUCTS.stream()
                .filter(p -> p.getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (product == null) {
            return null;
        }

        return enrichWithPricing(product);
    }

    private PricedProduct enrichWithPricing(Product product) {
        PricedProduct pricedProduct = new PricedProduct(product);

        try {
            Map<String, Object> priceInfo = pricingClient.getPrice(product.getId());

            pricedProduct.setPrice(toBigDecimal(priceInfo.get("price")));
            pricedProduct.setCurrency((String) priceInfo.get("currency"));
            pricedProduct.setDiscount(toBigDecimal(priceInfo.get("discount")));
            pricedProduct.setFinalPrice(toBigDecimal(priceInfo.get("finalPrice")));
            pricedProduct.setPriceAvailable(true);
            pricedProduct.setPriceStale(false);

        } catch (Exception e) {
            log.error("Failed to get pricing for product {}: {}", product.getId(), e.getMessage());
            pricedProduct.setPriceAvailable(false);
            pricedProduct.setPriceStale(false);
        }

        return pricedProduct;
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return new BigDecimal(value.toString());
    }
}
