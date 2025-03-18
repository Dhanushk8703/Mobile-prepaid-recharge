package com.mobicomm.app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "")
public class CashfreeController {

    private final WebClient webClient;

    @Value("${cashfree.app-id}")
    private String appId;

    @Value("${cashfree.secret-key}")
    private String secretKey;

    private static final String CASHFREE_SANDBOX_URL = "https://sandbox.cashfree.com/pg/orders";

    public CashfreeController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl(CASHFREE_SANDBOX_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
                .build();
    }

    @PostMapping(value = "/create-order", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<Map>> createOrder(@RequestBody Map<String, Object> paymentRequest) {
        System.out.println("Received Request: " + paymentRequest);  // Debugging Log

        return webClient.post()
                .uri("")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("x-client-id", appId)
                .header("x-client-secret", secretKey)
                .header("x-api-version", "2022-09-01")
                .bodyValue(paymentRequest)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> ResponseEntity.ok().body(response))
                .onErrorResume(e -> {
                    System.err.println("Error: " + e.getMessage());  // Log error
                    return Mono.just(ResponseEntity.badRequest().body(Map.of("error", e.getMessage())));
         });
    }
}
