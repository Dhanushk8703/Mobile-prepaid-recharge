package com.mobicomm.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.mobicomm.app.model.Plan;
import com.mobicomm.app.model.RechargeHistory;
import com.mobicomm.app.model.UserPlanDetail;
import com.mobicomm.app.model.Users;
import com.mobicomm.app.repository.RechargeHistoryRepository;
import com.mobicomm.app.repository.UserPlanDetailRepository;
import com.mobicomm.app.repository.UsersRepository;

@Service
public class RechargeHistoryService {

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    @Autowired
    private UsersRepository userRepository;

    @Autowired
    private PlanService planService;

    @Autowired
    private UserPlanDetailRepository userPlanDetailRepository;
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
        return rechargeHistoryRepository.findByUserId(userId);
    }


    // Add a new Recharge Record
    @PostMapping("/add")
    public ResponseEntity<RechargeHistory> addRecharge(
            @RequestParam String planId,
            @RequestParam Double amountPaid,
            @RequestParam String paymentMethod,
            @RequestParam Long mobileNumber) {

        // Retrieve current user and plan
        Users currentUser = getAuthenticatedUser();
        Optional<Plan> planOptional = planService.getPlanById(planId);
        if (!planOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Plan currentPlan = planOptional.get();

        // 1. Create and save a new RechargeHistory record (always record the recharge)
        RechargeHistory recharge = new RechargeHistory();
        recharge.setUserId(currentUser.getUserId());
        recharge.setPlanId(currentPlan.getPlanId());
        recharge.setAmountPaid(amountPaid);
        recharge.setPaymentMethod(paymentMethod);
        recharge.setRechargeDate(LocalDateTime.now());
        RechargeHistory savedRecharge = rechargeHistoryRepository.save(recharge);

        // 2. Check if an active plan already exists for this user and plan
        List<UserPlanDetail> existingActivePlans = userPlanDetailRepository
            .findByUserIdAndPlanIdAndExpiryDateAfter(currentUser.getUserId(), currentPlan.getPlanId(), LocalDateTime.now());

        if (existingActivePlans.isEmpty()) {
            // No active plan exists; create a new one.
            UserPlanDetail activePlan = new UserPlanDetail();
            activePlan.setUserId(currentUser.getUserId());
            activePlan.setPlanId(currentPlan.getPlanId());
            activePlan.setRechargedDate(LocalDateTime.now());
            activePlan.setExpiryDate(LocalDateTime.now().plusDays(currentPlan.getValidity()));
            userPlanDetailRepository.save(activePlan);
        } else {
            // Active plan exists; update its expiry date (e.g., extend it by the plan validity)
            UserPlanDetail activePlan = existingActivePlans.get(0);
            // Option 1: Extend expiry date by adding new validity days to current expiry
            activePlan.setExpiryDate(activePlan.getExpiryDate().plusDays(currentPlan.getValidity()));
            // Option 2: Or reset expiry from now:
            // activePlan.setExpiryDate(LocalDateTime.now().plusDays(currentPlan.getValidity()));
            userPlanDetailRepository.save(activePlan);
        }

        return ResponseEntity.ok(savedRecharge);
    }


    
    
}
