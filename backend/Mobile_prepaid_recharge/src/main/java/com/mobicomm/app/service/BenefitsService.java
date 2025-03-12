package com.mobicomm.app.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Benefits;
import com.mobicomm.app.repository.PlanBenefitsRepository;

@Service
public class BenefitsService {
	@Autowired
    private PlanBenefitsRepository planBenefitsRepository;

    public Benefits savePlan(Benefits planBenefits) {
        // Generate the next plan_id dynamically
        String nextId = generateNextPlanId();
        planBenefits.setBenefitsId(nextId);

        return planBenefitsRepository.save(planBenefits);
    }

    private String generateNextPlanId() {
        Optional<Benefits> lastPlan = planBenefitsRepository.findTopByOrderByBenefitsIdDesc();

        if (lastPlan.isPresent()) {
            // Extract number from last ID and increment
            String lastId = lastPlan.get().getBenefitsId(); // e.g., "mbplan005"
            int num = Integer.parseInt(lastId.substring(6)); // Extract "005" -> 5
            return String.format("mbcat%03d", num + 1); // Generate "mbplan006"
        } else {
            return "mbcat001"; // First entry
        }
    }
}
