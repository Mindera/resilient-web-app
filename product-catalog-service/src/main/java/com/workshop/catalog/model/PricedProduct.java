package com.workshop.catalog.model;

import java.math.BigDecimal;

/**
 * A product enriched with pricing information from Service B.
 */
public class PricedProduct {

    private String id;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private String currency;
    private BigDecimal discount;
    private BigDecimal finalPrice;
    private boolean priceAvailable;
    private boolean priceStale;

    public PricedProduct() {
    }

    public PricedProduct(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.category = product.getCategory();
        this.priceAvailable = false;
        this.priceStale = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(BigDecimal finalPrice) {
        this.finalPrice = finalPrice;
    }

    public boolean isPriceAvailable() {
        return priceAvailable;
    }

    public void setPriceAvailable(boolean priceAvailable) {
        this.priceAvailable = priceAvailable;
    }

    public boolean isPriceStale() {
        return priceStale;
    }

    public void setPriceStale(boolean priceStale) {
        this.priceStale = priceStale;
    }
}
