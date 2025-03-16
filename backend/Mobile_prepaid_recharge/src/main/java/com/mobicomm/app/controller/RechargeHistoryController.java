package com.mobicomm.app.controller;

import com.mobicomm.app.model.Plan;
import com.mobicomm.app.model.RechargeHistory;
import com.mobicomm.app.model.UserPlanDetail;
import com.mobicomm.app.model.Users;
import com.mobicomm.app.repository.RechargeHistoryRepository;
import com.mobicomm.app.repository.UserPlanDetailRepository;
import com.mobicomm.app.service.PlanService;
import com.mobicomm.app.service.RechargeHistoryService;
import com.mobicomm.app.service.UsersService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/recharge-history")
public class RechargeHistoryController {

    @Autowired
    private RechargeHistoryService rechargeHistoryService;

    @Autowired
    private PlanService planService;
    
    @Autowired
    private UsersService userService;
    
    @Autowired
    private UserPlanDetailRepository userPlanDetailRepository;
    
    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RechargeHistory>> getRechargeHistoryByUserId(@PathVariable String userId) {
        List<RechargeHistory> history = rechargeHistoryService.getRechargeHistoryByUserId(userId);
        return ResponseEntity.ok(history);
    }

    private Users getCurrentUser(Long mobileNumber) {
        return userService.findByMobileNumber(mobileNumber)
               .orElseThrow(() -> new RuntimeException("User not found with mobile number: " + mobileNumber));
    }

    @PostMapping("/add")
    public ResponseEntity<RechargeHistory> addRecharge(
            @RequestParam String planId,
            @RequestParam Double amountPaid,
            @RequestParam String paymentMethod,
            @RequestParam Long mobileNumber) {

        // 1. Fetch the user using the mobile number
        Users currentUser = getCurrentUser(mobileNumber);

        // 2. Retrieve the plan details using planId
        Optional<Plan> planOptional = planService.getPlanById(planId);
        if (!planOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Plan currentPlan = planOptional.get();
        
        // 3. Create a new RechargeHistory record with explicit IDs
        RechargeHistory recharge = new RechargeHistory();
        recharge.setUserId(currentUser.getUserId());
        recharge.setPlanId(currentPlan.getPlanId());
        recharge.setMobileNumber(mobileNumber);
        recharge.setAmountPaid(amountPaid);
        recharge.setPaymentMethod(paymentMethod);
        recharge.setRechargeDate(LocalDateTime.now());

        RechargeHistory savedRecharge = rechargeHistoryRepository.save(recharge);

        // 4. Create an active plan record for the user with explicit IDs
        UserPlanDetail activePlan = new UserPlanDetail();
        activePlan.setUserId(currentUser.getUserId());
        activePlan.setPlanId(currentPlan.getPlanId());
        activePlan.setRechargedDate(LocalDateTime.now());
        activePlan.setExpiryDate(LocalDateTime.now().plusDays(currentPlan.getValidity()));
        
        userPlanDetailRepository.save(activePlan);

        // 5. Return the saved recharge history
        return ResponseEntity.ok(savedRecharge);
    }
}


    
    
