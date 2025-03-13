package com.mobicomm.app.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Category;
import com.mobicomm.app.service.CategoryService;

@RestController
@RequestMapping("/api/category")
public class CategoryController {
	
	@Autowired
	private CategoryService categoryService;
	
	@GetMapping
	public ResponseEntity<?> getAllCategory() {
		
		List<Category> category = categoryService.getAllCategory();
		
		if (category.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(category, HttpStatus.OK);
		}
	}
	
	@PostMapping
	public ResponseEntity<?> addCategory(@RequestBody Category category) {
		categoryService.addCategory(category);
		return new ResponseEntity<>(HttpStatus.CREATED);
	}
	
	@PutMapping("/{categoryId}")
	public ResponseEntity<?> updateCategory(@PathVariable String categoryId, @RequestBody Category category) {
		Optional<Category> existCategory = categoryService.getCategoryById(categoryId);
		
		if (existCategory.isPresent()) {
			categoryService.updateCategory(categoryId, category);
			return new ResponseEntity<>(HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
	
	@PutMapping("/deactivate/{categoryId}")
	public ResponseEntity<?> deactivateCategory(@PathVariable String categoryId) {
		categoryService.deactivateCategory(categoryId);
		return new ResponseEntity<>(HttpStatus.OK);
	}
	
	@PutMapping("/activate/{categoryId}")
	public ResponseEntity<?> activateCategory(@PathVariable String categoryId) {
		categoryService.activateCategory(categoryId);
		return new ResponseEntity<>(HttpStatus.OK);
	}
	
	@DeleteMapping("/delete/{categoryId}")
	public ResponseEntity<?> deleteCategoryById(@PathVariable String categoryId) {
		categoryService.deleteCategoryById(categoryId);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
