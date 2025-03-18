package com.mobicomm.app.controller;

import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.mobicomm.app.service.RazorpayService;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/payment")
public class RazorpayController {

    @Autowired
    private RazorpayService razorpayService;

    @PostMapping("/create-order")
    public String createOrder(@RequestParam double amount) {
        try {
            return razorpayService.createOrder(amount);
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
    
    private static final String RAZORPAY_KEY_ID = "rzp_test_7jbN2F87afR6Hf";
    private static final String RAZORPAY_SECRET = "fRGO8y1UD7OT33jN2oV3n3HN";

    
    @GetMapping("/payment-details/{paymentId}")
    public ResponseEntity<String> getPaymentDetails(@PathVariable String paymentId) {
        String apiUrl = "https://api.razorpay.com/v1/payments/" + paymentId;

        HttpHeaders headers = new HttpHeaders();
        String auth = Base64.getEncoder().encodeToString((RAZORPAY_KEY_ID + ":" + RAZORPAY_SECRET).getBytes());
        headers.setBasicAuth(auth);

        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, String.class);
        return response;
    }
}
