package com.mobicomm.app.controller;

import com.mobicomm.app.model.UserPlanDetail;
import com.mobicomm.app.service.UserPlanDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/userplan")
public class UserPlanDetailController {

    @Autowired
    private UserPlanDetailService userPlanDetailService;

    @GetMapping("/active/{userId}")
    public ResponseEntity<?> getActivePlan(@PathVariable String userId) {
        Optional<UserPlanDetail> activePlan = userPlanDetailService.getLastActivePlan(userId);

        if (activePlan.isPresent()) {
            return ResponseEntity.ok(activePlan.get());
        } else {
            System.out.println("No active plan found for user: " + userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No active plan found");
        }
    }

    @GetMapping("/active/all")
    public ResponseEntity<List<UserPlanDetail>> getAllActiveUserPlans() {
        List<UserPlanDetail> activePlans = userPlanDetailService.getAllActivePlans();
        if (activePlans.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(activePlans);
    }

    // Example endpoint to add a new active plan along with a recharge history record
    @PostMapping("/add")
    public ResponseEntity<?> addRecharge(
            @RequestParam String planId,
            @RequestParam Double amountPaid,
            @RequestParam String paymentMethod,
            @RequestParam String userId) {

        // Create and populate a new RechargeHistory record
        // (Assuming you have similar code in your recharge history service/controller)
        // ...

        // Create and save the UserPlanDetail record with explicit IDs
        UserPlanDetail activePlan = new UserPlanDetail();
        activePlan.setUserId(userId);
        activePlan.setPlanId(planId);
        activePlan.setRechargedDate(java.time.LocalDateTime.now());
        // For example, expiry is now plus the validity days of the plan.
        // You may want to retrieve the plan details from planService here.
        // activePlan.setExpiryDate(java.time.LocalDateTime.now().plusDays(validityDays));

        userPlanDetailService.addActivePlan(activePlan);

        // Return an appropriate response
        return ResponseEntity.ok("Active plan added/updated successfully");
    }
}
