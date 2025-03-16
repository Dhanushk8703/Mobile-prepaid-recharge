package com.mobicomm.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Plan;
import com.mobicomm.app.model.Users;
import com.mobicomm.app.repository.UsersRepository;

@Service
public class UsersService {
	
	@Autowired
	private UsersRepository usersRepository;
	
	public Users saveUserId(Users user) {
        String nextId = generateNextUserId();
        user.setUserId(nextId);
        

        return usersRepository.save(user);
    }

    private String generateNextUserId() {
        Optional<Users> lastPlan = usersRepository.findTopByOrderByUserIdDesc();

        if (lastPlan.isPresent()) {
            // Extract number from last ID and increment
            String lastId = lastPlan.get().getUserId(); // e.g., "mbplan005"
            int num = Integer.parseInt(lastId.substring(7)); // Extract "005" -> 5
            return String.format("mbuser%03d", num + 1); // Generate "mbplan006"
        } else {
            return "mbuser001"; // First entry
        }
    }
	
	public void addUsers(Users user) {
		user.setCreatedAt(LocalDate.now());
		user.setUpdatedAt(LocalDate.now());
		usersRepository.save(saveUserId(user));
	}
	
	public List<Users> getAllUsers() {
		return (List<Users>) usersRepository.findAll();
	}
	
	public Optional<Users> getUserById(String userId) {
		return usersRepository.findById(userId);
	}
	
	public Users updateUser(String userId, Users updatedUser) {
	    return usersRepository.findById(userId)
	        .map(user -> {
	            user.setUserName(updatedUser.getUserName() != null ? updatedUser.getUserName() : user.getUserName());
	            user.setEmail(updatedUser.getEmail() != null ? updatedUser.getEmail() : user.getEmail());
	            return usersRepository.save(user);
	        })
	        .orElse(null);  // Ensures that if user is not found, null is returned
	}



	public Optional<Users> findByMobileNumber(Long mobileNumber) {
		return usersRepository.findByPhoneNumber(mobileNumber);
	}
}
