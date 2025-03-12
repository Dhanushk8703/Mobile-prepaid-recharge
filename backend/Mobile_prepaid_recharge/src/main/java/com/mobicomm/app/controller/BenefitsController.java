package com.mobicomm.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Benefits;
import com.mobicomm.app.service.BenefitsService;

@RestController
public class BenefitsController {
	
	@Autowired
	private BenefitsService benefitService;
	
	@GetMapping("/benefits")
	public ResponseEntity<?> getAllBenefits() {
		List<Benefits>benefits = benefitService.getAllBeneifts();
		if (benefits.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(benefits, HttpStatus.OK);
		}
		
	}
	
	@PostMapping("/benefits")
	public ResponseEntity<?> addBenefits(@RequestBody Benefits benefit) {
		benefitService.addBenefits(benefit);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
