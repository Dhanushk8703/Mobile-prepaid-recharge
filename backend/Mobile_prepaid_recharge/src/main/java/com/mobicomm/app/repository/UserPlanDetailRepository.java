package com.mobicomm.app.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.mobicomm.app.model.UserPlanDetail;

public interface UserPlanDetailRepository extends JpaRepository<UserPlanDetail, Long> {
    List<UserPlanDetail> findByUserIdAndExpiryDateAfter(String userId, LocalDateTime now);
    List<UserPlanDetail> findByExpiryDateBefore(LocalDateTime now);
	List<UserPlanDetail> findByUserIdAndPlanIdAndExpiryDateAfter(String userId, String planId, LocalDateTime now);
	Optional<UserPlanDetail> findTopByUserIdAndExpiryDateAfterOrderByRechargedDateDesc(String userId,
			LocalDateTime now);
}
