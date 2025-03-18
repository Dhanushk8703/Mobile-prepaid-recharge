package com.mobicomm.app.controller;

import com.mobicomm.app.model.Users;
import com.mobicomm.app.service.RechargeHistoryService;
import com.mobicomm.app.service.UsersService;
import com.mobicomm.app.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
public class CashfreeWebhookController {

    @Autowired
    private RechargeHistoryService rechargeHistoryService;
    
    @Autowired
    private UsersService userService;
    
    @Autowired
    private EmailService emailService;

    @PostMapping("/webhook")
    public ResponseEntity<String> handlePaymentWebhook(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("Webhook Triggered! Received Payload: " + payload);

            String status = (String) payload.get("order_status");
            String planId = (String) payload.get("plan_id");
            String customerPhone = (String) payload.get("customer_phone");
            String amountStr = (String) payload.get("order_amount");
            String paymentMethod = (String) payload.get("payment_method");

            if (status == null || planId == null || customerPhone == null || amountStr == null || paymentMethod == null) {
                return ResponseEntity.badRequest().body("Invalid request: Missing required fields");
            }

            if (!"PAID".equalsIgnoreCase(status)) {
                return ResponseEntity.badRequest().body("Payment not successful");
            }

            System.out.println("Extracted Customer Phone: " + customerPhone);

            if (!customerPhone.matches("\\d{10}")) {
                return ResponseEntity.badRequest().body("Invalid phone number format: " + customerPhone);
            }

            Long mobileNumber = Long.parseLong(customerPhone);
            Double amountPaid = Double.parseDouble(amountStr);

            Optional<Users> users = userService.findByMobileNumber(mobileNumber);
            if (users.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            Users user = users.get();
            System.out.println("User found: " + user.getEmail());

            rechargeHistoryService.addRecharge(planId, amountPaid, paymentMethod, mobileNumber);
            emailService.sendRechargeConfirmation(user.getEmail(), planId, amountPaid);

            return ResponseEntity.ok("Payment processed successfully");
        } catch (Exception e) {
            System.err.println("Error processing payment: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error processing payment: " + e.getMessage());
        }
    }

}
