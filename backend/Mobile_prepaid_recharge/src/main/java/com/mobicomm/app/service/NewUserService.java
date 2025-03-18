package com.mobicomm.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.NewUserRequest;
import com.mobicomm.app.repository.NewUserRepository;

@Service
public class NewUserService {
	
	@Autowired
	private NewUserRepository newUserRepository;
	
	public NewUserRequest addNewUserRequest(NewUserRequest newUserRequest) {
		return newUserRepository.save(newUserRequest);
	}
	
	public List<NewUserRequest> getAllRequest() {
		return newUserRepository.findAll();
	}
}
