package com.mobicomm.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mobicomm.app.model.EmailRequest;
import com.mobicomm.app.service.EmailService;

@RestController
@RequestMapping("email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest request) {
        if (request.getTo() == null || request.getTo().isEmpty()) {
            return ResponseEntity.badRequest().body("Recipient email is missing!");
        }
        emailService.sendEmail(request.getTo(), request.getSubject(), request.getBody());
        return ResponseEntity.ok("Email sent successfully to " + request.getTo());
    }
}

