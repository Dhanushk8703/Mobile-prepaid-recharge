package com.mobicomm.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
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
@CrossOrigin(origins = "*")
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
	
	@GetMapping("/{planId}")
	public ResponseEntity<Plan> getPlanById(@PathVariable String planId) {
	    Optional<Plan> planOptional = planService.getPlanById(planId); // Make sure your service has this method
	    if (planOptional.isPresent()) {
	        return ResponseEntity.ok(planOptional.get());
	    } else {
	        return ResponseEntity.notFound().build();
	    }
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PostMapping
	public ResponseEntity<?> addPlans(@RequestBody Plan plan) {
		planService.addPlan(plan);
		return new ResponseEntity<>(HttpStatus.CREATED);
	}
	
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PutMapping("/{planId}")
	public ResponseEntity<?> updatePlans(@PathVariable String planId, @RequestBody Plan plan) {
		planService.updatePlan(planId, plan);
		return new ResponseEntity<>(HttpStatus.OK);
	}
	
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PutMapping("/deactivate/{id}")
	public ResponseEntity<Map<String, String>> deactivatePlan(@PathVariable String id) {
	    planService.deactivatePlan(id);
	    Map<String, String> response = new HashMap<>();
	    response.put("message", "Plan activated successfully");
	    return ResponseEntity.ok(response);
	}
	
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PutMapping("/activate/{id}")
	public ResponseEntity<Map<String, String>> activatePlan(@PathVariable String id) {
	    planService.activatePlan(id);
	    Map<String, String> response = new HashMap<>();
	    response.put("message", "Plan activated successfully");
	    return ResponseEntity.ok(response);
	}
	
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@DeleteMapping("/{planId}")
	public ResponseEntity<Map<String, String>> deletePlanById(@PathVariable String planId) {
	    planService.deletePlanById(planId);
	    Map<String, String> responseBody = new HashMap<>();
	    responseBody.put("message", "Plan successfully deleted");
	    return ResponseEntity.ok(responseBody);
	}

}
