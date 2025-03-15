package com.mobicomm.app.service;

import com.mobicomm.app.model.RechargeHistory;
import com.mobicomm.app.model.UserPlanDetail;
import com.mobicomm.app.model.Users;
import com.mobicomm.app.repository.RechargeHistoryRepository;
import com.mobicomm.app.repository.UserPlanDetailRepository;
import com.mobicomm.app.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserPlanDetailService {

    @Autowired
    private UserPlanDetailRepository userPlanDetailRepository;

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    @Autowired
    private UsersRepository usersRepository;

    private Users getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long phoneNumber;
        try {
            phoneNumber = Long.parseLong(auth.getName());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid phone number format in authentication principal: " + auth.getName());
        }
        return usersRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found with phone number: " + phoneNumber));
    }

    // Retrieve active UserPlanDetail records for the authenticated user
    public List<UserPlanDetail> getActiveUserPlanDetails() {
        Users user = getAuthenticatedUser();
        return userPlanDetailRepository.findByUserAndExpiryDateAfter(user, LocalDateTime.now());
    }

    public void cleanupExpiredPlans() {
        LocalDateTime now = LocalDateTime.now();
        List<UserPlanDetail> expiredPlans = userPlanDetailRepository.findByExpiryDateBefore(now);
        for (UserPlanDetail upd : expiredPlans) {
            RechargeHistory history = new RechargeHistory();
            history.setUser(upd.getUser());
            history.setPlan(upd.getPlan());
            history.setRechargeDate(now);
            history.setAmountPaid(upd.getPlan().getPlanPrice());
            history.setPaymentMethod("Auto-Expired");
            
            rechargeHistoryRepository.save(history);
            userPlanDetailRepository.delete(upd);
        }
    }
}
