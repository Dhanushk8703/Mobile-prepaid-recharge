package com.mobicomm.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Category;
import com.mobicomm.app.model.Plan;
import com.mobicomm.app.model.Status;
import com.mobicomm.app.repository.CategoryRepository;
import com.mobicomm.app.repository.PlanRepository;

@Service
public class CategoryService {

	@Autowired
    private CategoryRepository categoryRepository;
	
	@Autowired
	private PlanRepository planRepository;

    public Category saveCategoryId(Category category) {
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
    	if (category.getStatus() == null) {
    		category.setStatus(Status.STATUS_ACTIVE);
    		category.setCreatedAt(LocalDate.now());
    		category.setUpdatedAt(LocalDate.now());
    		categoryRepository.save(saveCategoryId(category));

    	} else {
    		categoryRepository.save(saveCategoryId(category));
    	}
    }

	public Optional<Category> getCategoryById(String categoryId) {
		return categoryRepository.findById(categoryId);
	}
	
	public Category updateCategory(String categoryId, Category category) {
		Optional<Category> existCategory = categoryRepository.findById(categoryId);
		if(existCategory.isPresent()) {
			Category updateCategory = existCategory.get();
			updateCategory.setCategoryName(category.getCategoryName());
    		updateCategory.setUpdatedAt(LocalDate.now());

			return categoryRepository.save(updateCategory);
		} else {
			throw new RuntimeException("Category not found");
		}
	}
	
	public Category deactivateCategory(String categoryId) {
		Optional<Category> existCategory = categoryRepository.findById(categoryId);
		
		if (existCategory.isPresent()) {
			Category category = existCategory.get();
			
			if(category.getStatus() == Status.STATUS_INACTIVE) {
				throw new RuntimeException("The category is already inactive");
			} else {
				category.setStatus(Status.STATUS_INACTIVE);
			}
			
			List<Plan> plansCategory = existCategory.get().getPlans();
			
			for (Plan plan : plansCategory) {
				plan.setStatus(Status.STATUS_INACTIVE);
				planRepository.save(plan);
			}
			return categoryRepository.save(category);
		} else {
			throw new RuntimeException("Category not found");
		}
	}
	
	public Category activateCategory(String categoryId) {
		Optional<Category> existCategory = categoryRepository.findById(categoryId);
		
		if (existCategory.isPresent()) {
			Category category = existCategory.get();
			
			if(category.getStatus() == Status.STATUS_ACTIVE) {
				throw new RuntimeException("The category is already active");
			} else {
				category.setStatus(Status.STATUS_ACTIVE);
			}
			
			List<Plan> plansCategory = existCategory.get().getPlans();
			
			for (Plan plan : plansCategory) {
				plan.setStatus(Status.STATUS_ACTIVE);
				planRepository.save(plan);
			}
			return categoryRepository.save(category);
		} else {
			throw new RuntimeException("Category not found");
		}
	}
	
	public void deleteCategoryById(String categoryId) {
	    Optional<Category> categoryOptional = categoryRepository.findById(categoryId);

	    if (categoryOptional.isPresent()) {
	        Category category = categoryOptional.get();

	        // Fetch associated plans
	        List<Plan> plans = planRepository.findByCategory(category);

	        if (!plans.isEmpty()) {
	            // Delete all associated plans before deleting the category
	            planRepository.deleteAll(plans);
	        }

	        // Delete the category
	        categoryRepository.delete(category);
	    } else {
	        throw new RuntimeException("Category not found with ID: " + categoryId);
	    }
	}

}
