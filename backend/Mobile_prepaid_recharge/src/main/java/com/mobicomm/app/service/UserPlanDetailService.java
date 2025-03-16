package com.mobicomm.app.service;

import com.mobicomm.app.model.Plan;
import com.mobicomm.app.model.RechargeHistory;
import com.mobicomm.app.model.UserPlanDetail;
import com.mobicomm.app.repository.RechargeHistoryRepository;
import com.mobicomm.app.repository.UserPlanDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserPlanDetailService {

    @Autowired
    private UserPlanDetailRepository userPlanDetailRepository;

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;
    
    @Autowired
    private PlanService planService;  // Needed for retrieving plan details

    // Retrieve active UserPlanDetail records for the provided userId
    public List<UserPlanDetail> getActiveUserPlanDetails(String userId) {
        return userPlanDetailRepository.findByUserIdAndExpiryDateAfter(userId, LocalDateTime.now());
    }
    
    public UserPlanDetail addActivePlan(UserPlanDetail activePlan) {
        return userPlanDetailRepository.save(activePlan);
    }
    
    public Optional<UserPlanDetail> getLastActivePlan(String userId) {
        return userPlanDetailRepository
            .findTopByUserIdAndExpiryDateAfterOrderByRechargedDateDesc(userId, LocalDateTime.now());
    }


    public void cleanupExpiredPlans() {
        LocalDateTime now = LocalDateTime.now();
        // Retrieve all expired active plan records
        List<UserPlanDetail> expiredPlans = userPlanDetailRepository.findByExpiryDateBefore(now);
        for (UserPlanDetail upd : expiredPlans) {
            RechargeHistory history = new RechargeHistory();
            history.setUserId(upd.getUserId());
            history.setPlanId(upd.getPlanId());
            history.setRechargeDate(now);
            
            // Retrieve the plan to get its price (if available)
            Optional<Plan> planOpt = planService.getPlanById(upd.getPlanId());
            if (planOpt.isPresent()) {
                Plan plan = planOpt.get();
                history.setAmountPaid(plan.getPlanPrice());
            } else {
                history.setAmountPaid(0.0);
            }
            history.setPaymentMethod("Auto-Expired");
            
            rechargeHistoryRepository.save(history);
            userPlanDetailRepository.delete(upd);
        }
    }

	public List<UserPlanDetail> getAllActivePlans() {
		return userPlanDetailRepository.findAll();
	}
}
