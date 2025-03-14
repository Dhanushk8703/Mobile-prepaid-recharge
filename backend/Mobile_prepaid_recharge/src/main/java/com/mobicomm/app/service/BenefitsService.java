package com.mobicomm.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Benefits;
import com.mobicomm.app.model.Plan;
import com.mobicomm.app.repository.PlanBenefitsRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class BenefitsService {
	
	@Autowired
	private PlanBenefitsRepository benefitsRepository;
	
	public Benefits saveBenefitsId(Benefits benefit) {
        // Generate the next plan_id dynamically
        String nextId = generateNextBenefitsId();
        benefit.setBenefitsId(nextId);

        return benefitsRepository.save(benefit);
    }

    private String generateNextBenefitsId() {
        Optional<Benefits> lastPlan = benefitsRepository.findTopByOrderByBenefitsIdDesc();

        if (lastPlan.isPresent()) {
            // Extract number from last ID and increment
            String lastId = lastPlan.get().getBenefitsId(); // e.g., "mbplan005"
            int num = Integer.parseInt(lastId.substring(5)); // Extract "005" -> 5
            return String.format("mbben%03d", num + 1); // Generate "mbplan006"
        } else {
            return "mbben001"; // First entry
        }
    }
    
    public void addBenefits(Benefits benefits) {
    	benefitsRepository.save(saveBenefitsId(benefits));
    }
    
    public List<Benefits> getAllBenefits() {
    	return benefitsRepository.findAll();
    }
    
    public Optional<Benefits> getBenefitById(String benefitId) {
    	Optional<Benefits> benefits = benefitsRepository.findById(benefitId);
    	if (benefits.isPresent()) {
    		return benefits;
    	} else {
    		throw new RuntimeException("Benefit not found");
    	}
    }
    
    @Transactional
    public void deleteBenefitById(String benefitId) {
        // Find the benefit (or throw if not found)
        Benefits benefit = benefitsRepository.findById(benefitId)
                .orElseThrow(() -> new EntityNotFoundException("Benefit not found with id: " + benefitId));
        
        // Remove the benefit from all associated plans
        // This assumes your Benefits entity has a collection of plans
        if (benefit.getPlans() != null) {
            for (Plan plan : benefit.getPlans()) {
                plan.getBenefits().remove(benefit);
            }
        }
        
        // Now you can safely delete the benefit
        benefitsRepository.delete(benefit);
    }

}
