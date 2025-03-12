package com.mobicomm.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mobicomm.app.model.Benefits;

@Repository
public interface PlanBenefitsRepository extends JpaRepository<Benefits, String> {

	Optional<Benefits> findTopByOrderByBenefitsIdDesc();

}
