package com.mobicomm.app.controller;

import com.mobicomm.app.model.RechargeHistory;
import com.mobicomm.app.service.RechargeHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recharge-history")
public class RechargeHistoryController {

    @Autowired
    private RechargeHistoryService rechargeHistoryService;

    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RechargeHistory>> getRechargeHistory(@PathVariable String userId) {
        List<RechargeHistory> rechargeHistory = rechargeHistoryService.getRechargeHistoryByUserId(userId);
        if (rechargeHistory.isEmpty()) {
        	return new ResponseEntity<List<RechargeHistory>>(HttpStatus.NO_CONTENT);
        } else {
        	return new ResponseEntity<List<RechargeHistory>>(rechargeHistory, HttpStatus.OK);
        }
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RechargeHistory> addRecharge(
            @RequestParam String planId,
            @RequestParam Double amountPaid,
            @RequestParam String paymentMethod) {

        RechargeHistory recharge = rechargeHistoryService.addRecharge(planId, amountPaid, paymentMethod);
        return ResponseEntity.ok(recharge);
    }
    
    
}
