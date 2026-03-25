package com.workshop.pricing.model;

import java.math.BigDecimal;

public class PriceInfo {

    private String productId;
    private BigDecimal price;
    private String currency;
    private BigDecimal discount;
    private BigDecimal finalPrice;

    public PriceInfo() {
    }

    public PriceInfo(String productId, BigDecimal price, String currency, BigDecimal discount) {
        this.productId = productId;
        this.price = price;
        this.currency = currency;
        this.discount = discount;
        this.finalPrice = price.subtract(price.multiply(discount).divide(BigDecimal.valueOf(100)));
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
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
}
