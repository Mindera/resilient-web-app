package com.workshop.catalog.controller;

import com.workshop.catalog.model.PricedProduct;
import com.workshop.catalog.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<PricedProduct> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{productId}")
    public PricedProduct getProduct(@PathVariable String productId) {
        PricedProduct product = productService.getProduct(productId);
        if (product == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + productId);
        }
        return product;
    }
}
