package com.mobicomm.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mobicomm.app.model.Category;
import com.mobicomm.app.model.Plan;
import com.mobicomm.app.model.Users;

@Repository
public interface PlanRepository extends JpaRepository<Plan, String> {

	Optional<Plan> findTopByOrderByPlanIdDesc();

	List<Plan> findByCategory(Category category);

}