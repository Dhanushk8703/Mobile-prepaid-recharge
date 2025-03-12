package com.mobicomm.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mobicomm.app.model.Plan;

@Repository
public interface PlanRepository extends JpaRepository<Plan, String> {

	Optional<Plan> findTopByOrderByPlanIdDesc();

}