package com.mobicomm.app.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class StripeService {

    @Value("${stripe.secretKey}")
    private String secretKey;

    public String createCheckoutSession(String productName, Long amount) throws StripeException {
        Stripe.apiKey = secretKey;

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://127.0.0.1:5500/success.html") // Replace with actual success page
                .setCancelUrl("http://127.0.0.1:5500/cancel.html")  // Replace with actual cancel page
                
                // Enable multiple payment methods
                .addAllPaymentMethodType(Arrays.asList(
                        SessionCreateParams.PaymentMethodType.CARD,  // Card payments
                        SessionCreateParams.PaymentMethodType.valueOf("upi"), // UPI
                        SessionCreateParams.PaymentMethodType.valueOf("netbanking"), // Net Banking
                        SessionCreateParams.PaymentMethodType.valueOf("wallet") // Wallets
                ))

                .setCustomerEmail("customer@example.com")  // Optional: Prefill customer email
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("INR")  // Use your currency
                                .setUnitAmount(amount)  // Amount in the smallest currency unit (paise for INR)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(productName)
                                        .build())
                                .build())
                        .build())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }
}
