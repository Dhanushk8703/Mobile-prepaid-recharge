package com.mobicomm.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Plan;
import com.mobicomm.app.repository.PlanRepository;

@Service
public class PlanService {
	@Autowired
    private PlanRepository planRepository;

    public Plan savePlanId(Plan plan) {
        // Generate the next plan_id dynamically
        String nextId = generateNextPlanId();
        plan.setPlanId(nextId);

        return planRepository.save(plan);
    }

    private String generateNextPlanId() {
        Optional<Plan> lastPlan = planRepository.findTopByOrderByPlanIdDesc();

        if (lastPlan.isPresent()) {
            // Extract number from last ID and increment
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
}
