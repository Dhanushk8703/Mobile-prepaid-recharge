package com.mobicomm.app.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Plan;
import com.mobicomm.app.model.RechargeHistory;
import com.mobicomm.app.model.Users;
import com.mobicomm.app.repository.PlanRepository;
import com.mobicomm.app.repository.RechargeHistoryRepository;
import com.mobicomm.app.repository.UsersRepository;

@Service
public class RechargeHistoryService {

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    @Autowired
    private UsersRepository userRepository;

    @Autowired
    private PlanRepository planRepository;

    // Get the currently authenticated user based on phone number
    private Users getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Convert the authentication principal (String) to Long
        Long phoneNumber;
        try {
            phoneNumber = Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid phone number format in authentication principal: " + authentication.getName());
        }

        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found with phone number: " + phoneNumber));
    }

    public List<RechargeHistory> getRechargeHistoryByUserId(String userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return rechargeHistoryRepository.findByUser(user);
    }


    // Add a new Recharge Record
    public RechargeHistory addRecharge(String planId, Double amountPaid, String paymentMethod) {
        Users user = getAuthenticatedUser();
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with ID: " + planId));

        RechargeHistory recharge = new RechargeHistory();
        recharge.setUser(user);
        recharge.setPlan(plan);
        recharge.setRechargeDate(LocalDateTime.now());
        recharge.setAmountPaid(amountPaid);
        recharge.setPaymentMethod(paymentMethod);

        return rechargeHistoryRepository.save(recharge);
    }
    
    
}
