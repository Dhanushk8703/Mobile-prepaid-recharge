package com.mobicomm.app.service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Benefits;
import com.mobicomm.app.model.Category;
import com.mobicomm.app.model.Plan;
import com.mobicomm.app.repository.CategoryRepository;
import com.mobicomm.app.repository.PlanBenefitsRepository;
import com.mobicomm.app.repository.PlanRepository;

@Service
public class PlanService {
    @Autowired
    private PlanRepository planRepository;
    
    @Autowired
    private PlanBenefitsRepository benefitsRepository;
    
    @Autowired
    private BenefitsService benefitsService;
    
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
        
        // **Handle Benefits Mapping**
        Set<Benefits> managedBenefits = new HashSet<>();
        for (Benefits benefit : plan.getBenefits()) {
            Benefits existingBenefit = benefitsRepository.findById(benefit.getBenefitsId())
                .orElseGet(() -> benefitsRepository.save(benefitsService.saveBenefitsId(benefit)));
            
            managedBenefits.add(existingBenefit);
        }
        plan.setBenefits(managedBenefits);
        
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
}
