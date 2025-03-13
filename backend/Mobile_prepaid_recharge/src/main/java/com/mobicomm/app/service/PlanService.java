package com.mobicomm.app.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Category;
import com.mobicomm.app.model.Plan;
import com.mobicomm.app.model.Status;
import com.mobicomm.app.repository.CategoryRepository;
import com.mobicomm.app.repository.PlanRepository;

@Service
public class PlanService {
    @Autowired
    private PlanRepository planRepository;
    
    @Autowired
    private CategoryRepository categoryRepository; // **Added Category Repository**
    
    public Plan savePlanId(Plan plan) {
        String nextId = generateNextPlanId();
        plan.setPlanId(nextId);
        
        // **Fetch and Assign Category**
        if (plan.getCategory() == null || plan.getCategory().getCategoryId() == null) {
            throw new IllegalArgumentException("Category ID is required");
        }
        
        Category category = categoryRepository.findById(plan.getCategory().getCategoryId())
            .orElseThrow(() -> new IllegalArgumentException("Category not found for ID: " + plan.getCategory().getCategoryId()));
        
        plan.setCategory(category);
        return planRepository.save(plan);
    }

    private String generateNextPlanId() {
        Optional<Plan> lastPlan = planRepository.findTopByOrderByPlanIdDesc();

        if (lastPlan.isPresent()) {
            String lastId = lastPlan.get().getPlanId(); // e.g., "mbplan005"
            int num = Integer.parseInt(lastId.substring(6)); // Extract "005" -> 5
            return String.format("mbplan%03d", num + 1); // Generate "mbplan006"
        } else {
            return "mbplan001"; // First entry
        }
    }
    
    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }
    
    public void addPlan(Plan plan) {
        planRepository.save(savePlanId(plan));
    }
    
    public Optional<Plan> getPlanById(String planId) {
    	return planRepository.findById(planId);
    }
    
    public Plan updatePlan(String planId, Plan plan) {
    	Optional<Plan> existPlan = planRepository.findById(planId);
    	
    	if (existPlan.isPresent()) {
    		Plan updatePlan = existPlan.get();
    		updatePlan.setPlanName(plan.getPlanName());
    		updatePlan.setPlanPrice(plan.getPlanPrice());
    		updatePlan.setBenefits(plan.getBenefits());
    		updatePlan.setCategory(plan.getCategory());
    		updatePlan.setDescription(plan.getDescription());
    		updatePlan.setValidity(plan.getValidity());
    		return planRepository.save(updatePlan);
    	} else {
    		throw new RuntimeException("Plan not found");
    	}
    }
    
    public Plan deactivatePlan(String planId) {
    	Optional<Plan> existPlan = planRepository.findById(planId);
    	
    	if (existPlan.isPresent()) {
    		Plan plan = existPlan.get();
    		
    		if (plan.getStatus() == Status.STATUS_INACTIVE) {
    			throw new RuntimeException("The plan is Already in inactive");
    		} 
    		
    		plan.setStatus(Status.STATUS_INACTIVE);
    		
    		return planRepository.save(plan);
    	} else {
    		throw new RuntimeException("Plan not found");
    	}
    }
    
    public Plan activatePlan(String planId) {
	Optional<Plan> existPlan = planRepository.findById(planId);
    	
    	if (existPlan.isPresent()) {
    		Plan plan = existPlan.get();
    		
    		if (plan.getStatus() == Status.STATUS_ACTIVE) {
    			throw new RuntimeException("The plan is Already in active");
    		} 
    		
    		plan.setStatus(Status.STATUS_ACTIVE);
    		
    		return planRepository.save(plan);
    	} else {
    		throw new RuntimeException("Plan not found");
    	}
    }
    
    public void deletePlanById(String planId) {
    	if (planRepository.findById(planId).isEmpty()) {
    		throw new RuntimeException("Plan not found");
    	} else {
    		planRepository.deleteById(planId);
    	}
    }
}
