package com.mobicomm.app.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.NewUserRequest;
import com.mobicomm.app.service.NewUserService;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("api/newUser")
public class NewUserController {
	
	@Autowired
	private NewUserService newUserService;
	
	@PostMapping
	public ResponseEntity<?> newUserRequested(@RequestBody NewUserRequest newUserRequest) {
		newUserService.addNewUserRequest(newUserRequest);
		return new ResponseEntity<>(HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<?> getAllRequest() {
		List<NewUserRequest> allRequest = newUserService.getAllRequest();
		if(allRequest.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(allRequest,HttpStatus.OK);
		}
	}
}
