package com.mobicomm.app.service;

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
	
	public void addUsers(Users user) {
		userRepository.save(user);
	}
	
	public List<Users> getAllUsers() {
		return userRepository.findAll();
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
			return userRepository.save(updateUser);
		} else {
			throw new RuntimeException("user not found");
		}
	}
}
