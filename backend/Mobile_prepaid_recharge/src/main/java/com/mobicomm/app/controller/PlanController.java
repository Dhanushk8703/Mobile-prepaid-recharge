package com.mobicomm.app.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Plan;
import com.mobicomm.app.service.PlanService;

@RestController
@RequestMapping("/api/plans")
public class PlanController {
	
	@Autowired
	private PlanService planService;
	
	@GetMapping
	public ResponseEntity<?> showPlans() {
		List<Plan> plans = planService.getAllPlans();
		
		if (plans.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(plans,HttpStatus.OK);
		}
	}
	
	@PostMapping
	public ResponseEntity<?> addPlans(@RequestBody Plan plan) {
		planService.addPlan(plan);
		return new ResponseEntity<>(HttpStatus.CREATED);
	}
	
	@PutMapping("/{planId}")
	public ResponseEntity<?> updatePlans(@PathVariable String planId, @RequestBody Plan plan) {
		planService.updatePlan(planId, plan);
		return new ResponseEntity<>(HttpStatus.OK);
	}
	
	@PutMapping("/deactivate/{planId}")
	public ResponseEntity<?> deactivatePlan(@PathVariable String planId) {
		planService.deactivatePlan(planId);
		return new ResponseEntity<>(HttpStatus.OK);
	}
	
	@PutMapping("/activate/{planId}")
	public ResponseEntity<?> activatePlan(@PathVariable String planId) {
		planService.activatePlan(planId);
		return new ResponseEntity<>(HttpStatus.OK);
	}
	
	@DeleteMapping("/{planId}")
	public ResponseEntity<?> deletePlanById(@PathVariable String planId) {
		planService.deletePlanById(planId);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
