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
    public ResponseEntity<String> sendHtmlEmail(@RequestBody EmailRequest request) {
        if (request.getTo() == null || request.getTo().isEmpty()) {
            return ResponseEntity.badRequest().body("Recipient email is missing!");
        }

        String htmlContent = buildHtmlEmail(request.getSubject(), request.getBody());
        emailService.sendHtmlEmail(request.getTo(), request.getSubject(), htmlContent);

        return ResponseEntity.ok("Email sent successfully to " + request.getTo());
    }

    // Function to generate HTML email template
    private String buildHtmlEmail(String subject, String body) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
                "<style>" +
                "  body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }" +
                "  .email-container { max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }" +
                "  .header { background-color: #4CAF50; color: white; padding: 15px; text-align: center; font-size: 22px; font-weight: bold; border-top-left-radius: 10px; border-top-right-radius: 10px; }" +
                "  .content { padding: 20px; font-size: 16px; color: #333333; line-height: 1.6; }" +
                "  .footer { background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 14px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; }" +
                "  a { color: #007bff; text-decoration: none; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='email-container'>" +
                "    <div class='header'>" + escapeHtml(subject) + "</div>" +
                "    <div class='content'>" + escapeHtml(body) + "</div>" +
                "    <div class='footer'>Thank you for using our service!<br><strong>MobiComm Team</strong></div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    // Escape HTML to prevent XSS
    private String escapeHtml(String input) {
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}
