package com.mobicomm.app.repository;

import com.mobicomm.app.model.UserPlanDetail;
import com.mobicomm.app.model.Users;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPlanDetailRepository extends JpaRepository<UserPlanDetail, Long> {
    
    List<UserPlanDetail> findByUserAndExpiryDateAfter(Users user, LocalDateTime now);
    
    List<UserPlanDetail> findByExpiryDateBefore(LocalDateTime now);
}
