package com.mobicomm.app.controller;

import com.mobicomm.app.model.UserPlanDetail;
import com.mobicomm.app.service.UserPlanDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/userplan")
public class UserPlanDetailController {

    @Autowired
    private UserPlanDetailService userPlanDetailService;

    // Endpoint to get active user plan details for the authenticated user
    @GetMapping("/active")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<UserPlanDetail>> getActiveUserPlanDetails() {
        List<UserPlanDetail> activePlans = userPlanDetailService.getActiveUserPlanDetails();
        return ResponseEntity.ok(activePlans);
    }

    // Endpoint to cleanup expired user plan details.
    // This can be called manually (or scheduled via a scheduler) to transfer expired plans.
    @PostMapping("/cleanup")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> cleanupExpiredPlans() {
        userPlanDetailService.cleanupExpiredPlans();
        return ResponseEntity.ok("Expired plans have been moved to recharge history and removed from active plans.");
    }
}
