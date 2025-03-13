package com.mobicomm.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Users;
import com.mobicomm.app.service.UsersService;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/users")
public class UsersController {
	
	@Autowired
	private UsersService userService;
	
	@GetMapping("/")
	public ResponseEntity<?> getUsersDetails() {
		List<Users> usersList = userService.getAllUsers();
		if (usersList.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(usersList, HttpStatus.OK);
		}
		
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<?> putMethodName(@PathVariable String userId, @RequestBody Users user) {
		Users updateUser = userService.updateUser(userId, user);
		 return new ResponseEntity<>(updateUser,HttpStatus.OK);
	}
}
