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

import com.mobicomm.app.model.Benefits;
import com.mobicomm.app.repository.PlanBenefitsRepository;
import com.mobicomm.app.service.BenefitsService;

@RestController
@RequestMapping("/api/benefits")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class BenefitsController {
	
	@Autowired
	private BenefitsService benefitsService;
	
	@Autowired
	private PlanBenefitsRepository benefitsRepository;
	
	@GetMapping
	public ResponseEntity<?> getAllBenefits() {
		List<Benefits> benefits = benefitsService.getAllBenefits();
		
		if (benefits.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(benefits,HttpStatus.OK);
		}
	}
	
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PostMapping
	public ResponseEntity<?> addBenefits(@RequestBody Benefits benefit) {
		benefitsService.addBenefits(benefit);
		return new ResponseEntity<>(HttpStatus.OK);
	}
	
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@GetMapping("/{benefitId}")
	public ResponseEntity<?> getBenefitById(@PathVariable String benefitId) {
		Optional<Benefits>benefit =  benefitsService.getBenefitById(benefitId);
		return new ResponseEntity<>(benefit,HttpStatus.OK);
	}
	
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PutMapping("/{benefitId}")
	public ResponseEntity<?> updateBenefits(@PathVariable String benefitId, @RequestBody Benefits benefit) {
	    Optional<Benefits> existingBenefit = benefitsService.getBenefitById(benefitId);
	    if (existingBenefit.isPresent()) {
	        Benefits updateBenefit = existingBenefit.get();
	        // Update the necessary fields (adjust field names if different)
	        updateBenefit.setBenefitsName(benefit.getBenefitsName());
//	        existingBenefit.setBenefitDetails(benefit.getBenefitDetails());
	        updateBenefit.setIcon(benefit.getIcon());
	        
	        benefitsRepository.save(updateBenefit);
	        return ResponseEntity.ok(updateBenefit);
	    } else {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                             .body("Benefit not found with ID: " + benefitId);
	    }
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@DeleteMapping("/delete/{benefitId}")
	public ResponseEntity<?> deleteBenefitById(@PathVariable String benefitId) {
	    benefitsService.deleteBenefitById(benefitId);
	    Map<String, String> response = new HashMap<>();
	    response.put("message", "Benefit deleted successfully");
	    return ResponseEntity.ok(response);
	}

}
