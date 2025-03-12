package com.mobicomm.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Category;
import com.mobicomm.app.repository.CategoryRepository;

@Service
public class CategoryService {

	@Autowired
    private CategoryRepository categoryRepository;

    public Category saveCategoryId(Category category) {
        // Generate the next plan_id dynamically
        String nextId = generateNextPlanId();
        category.setCategoryId(nextId);

        return categoryRepository.save(category);
    }

    private String generateNextPlanId() {
        Optional<Category> lastPlan = categoryRepository.findTopByOrderByCategoryIdDesc();

        if (lastPlan.isPresent()) {
            // Extract number from last ID and increment
            String lastId = lastPlan.get().getCategoryId(); // e.g., "mbplan005"
            int num = Integer.parseInt(lastId.substring(6)); // Extract "005" -> 5
            return String.format("mbcat%03d", num + 1); // Generate "mbplan006"
        } else {
            return "mbcat001"; // First entry
        }
    }
    
    public List<Category> getAllCategory() {
    	return categoryRepository.findAll();
    }
    
    public void addCategory(Category category) {
    	categoryRepository.save(saveCategoryId(category));
    }
}
