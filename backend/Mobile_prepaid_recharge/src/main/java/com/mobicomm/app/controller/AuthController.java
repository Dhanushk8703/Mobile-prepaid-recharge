package com.mobicomm.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Status;
import com.mobicomm.app.service.CategoryService;
import com.mobicomm.app.service.PlanService;

@RestController
public class AuthController {
	
	@Autowired
	private PlanService planService;
	
	@Autowired
	private CategoryService categoryService;
	
	private Status status;
	
	@GetMapping("/")
	public String show() {
		return "Hello World";
	}
}
