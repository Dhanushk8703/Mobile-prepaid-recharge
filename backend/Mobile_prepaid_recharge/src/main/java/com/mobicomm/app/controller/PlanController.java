package com.mobicomm.app.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Plan;
import com.mobicomm.app.service.PlanService;

@RestController
public class PlanController {
	
	@Autowired
	private PlanService planService;
	
	@GetMapping("/plans")
	public ResponseEntity<?> showPlans() {
		List<Plan> plans = planService.getAllPlans();
		
		if (plans.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(plans,HttpStatus.OK);
		}
	}
	
	@PostMapping("/plans")
	public ResponseEntity<?> addPlans(@RequestBody Plan plan) {
		planService.addPlan(plan);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
