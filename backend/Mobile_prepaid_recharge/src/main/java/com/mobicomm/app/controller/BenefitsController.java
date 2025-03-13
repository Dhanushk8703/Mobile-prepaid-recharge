package com.mobicomm.app.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Benefits;
import com.mobicomm.app.service.BenefitsService;

@RestController
@RequestMapping("/api/benefits")
public class BenefitsController {
	
	@Autowired
	private BenefitsService benefitsService;
	
	@GetMapping
	public ResponseEntity<?> getAllBenefits() {
		List<Benefits> benefits = benefitsService.getAllBenefits();
		
		if (benefits.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(benefits,HttpStatus.OK);
		}
	}
	
	@PostMapping
	public ResponseEntity<?> addBenefits(@RequestBody Benefits benefit) {
		benefitsService.addBenefits(benefit);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
