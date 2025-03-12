package com.mobicomm.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.mobicomm.app.model.Category;
import com.mobicomm.app.service.CategoryService;

@Controller
public class CategoryController {
	
	@Autowired
	private CategoryService categoryService;
	
	@GetMapping("/category")
	public ResponseEntity<?> getAllCategory() {
		
		List<Category> category = categoryService.getAllCategory();
		
		if (category.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(category, HttpStatus.OK);
		}
	}
	
	@PostMapping("/category")
	public ResponseEntity<?> addCategory(@RequestBody Category category) {
		categoryService.addCategory(category);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
