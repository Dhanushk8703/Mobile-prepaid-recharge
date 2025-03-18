package com.mobicomm.app.service;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RazorpayService {
    @Value("${razorpay.api.key}")
    private String apiKey;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    public String createOrder(double amount) throws Exception {
        RazorpayClient razorpay = new RazorpayClient(apiKey, apiSecret);
        
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (amount));
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_123456");
        orderRequest.put("payment_capture", 1); // Auto-capture payment
        
        Order order = razorpay.orders.create(orderRequest);
        return order.toString();
    }
}
