package com.mobicomm.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mobicomm.app.model.Category;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    Optional<Category> findTopByOrderByCategoryIdDesc(); // Order by category_id
}
