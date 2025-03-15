package com.mobicomm.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Users;
import com.mobicomm.app.repository.UsersRepository;

@Service
public class UsersService {
	
	@Autowired
	private UsersRepository userRepository;
	
	public Users saveUserId(Users user) {
        String nextId = generateNextUserId();
        user.setUserId(nextId);
        

        return userRepository.save(user);
    }

    private String generateNextUserId() {
        Optional<Users> lastPlan = userRepository.findTopByOrderByUserIdDesc();

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
		userRepository.save(saveUserId(user));
	}
	
	public List<Users> getAllUsers() {
		return (List<Users>) userRepository.findAll();
	}
	
	public Optional<Users> getUserById(String userId) {
		return userRepository.findById(userId);
	}
	
	public Users updateUser(String userId, Users user) {
		Optional<Users> existUser = userRepository.findById(userId);
		if (existUser.isPresent()) {
			Users updateUser = existUser.get();
			updateUser.setUserName(user.getUserName());
			updateUser.setEmail(user.getEmail());
			updateUser.setUpdatedAt(LocalDate.now());
			return userRepository.save(updateUser);
		} else {
			throw new RuntimeException("user not found");
		}
	}
}
