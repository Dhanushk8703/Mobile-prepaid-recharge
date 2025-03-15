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

import com.mobicomm.app.model.Category;
import com.mobicomm.app.service.CategoryService;

@RestController
@RequestMapping("/api/category")
@CrossOrigin(origins = "http://127.0.0.1:5500")
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
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	public ResponseEntity<?> addCategory(@RequestBody Category category) {
		categoryService.addCategory(category);
		return new ResponseEntity<>(HttpStatus.CREATED);
	}
	
	@GetMapping("/{categoryId}")
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	public ResponseEntity<?> getCategoryById(@PathVariable String categoryId) {
		Optional<Category> categoryExist = categoryService.getCategoryById(categoryId);
		
		if (categoryExist.isPresent()) {
			Category category = categoryExist.get();
			return new ResponseEntity<>(category,HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
	
	@PutMapping("/{categoryId}")
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
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
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	public ResponseEntity<Map<String, String>> deactivateCategory(@PathVariable String categoryId) {
	    categoryService.deactivateCategory(categoryId);
	    Map<String, String> response = new HashMap<>();
	    response.put("message", "Category deactivated successfully");
	    return ResponseEntity.ok(response);
	}

	@PutMapping("/activate/{categoryId}")
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	public ResponseEntity<Map<String, String>> activateCategory(@PathVariable String categoryId) {
	    categoryService.activateCategory(categoryId);
	    Map<String, String> response = new HashMap<>();
	    response.put("message", "Category activated successfully");
	    return ResponseEntity.ok(response);
	}

	@DeleteMapping("/delete/{categoryId}")
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	public ResponseEntity<Map<String, String>> deleteCategoryById(@PathVariable String categoryId) {
	    categoryService.deleteCategoryById(categoryId);
	    Map<String, String> response = new HashMap<>();
	    response.put("message", "Category deleted successfully");
	    return ResponseEntity.ok(response);
	}

}
