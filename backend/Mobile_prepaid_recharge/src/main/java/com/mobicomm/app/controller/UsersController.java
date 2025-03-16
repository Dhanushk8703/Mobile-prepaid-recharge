package com.mobicomm.app.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Users;
import com.mobicomm.app.service.UsersService;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://127.0.0.1:5500")

public class UsersController {
	
	@Autowired
	private UsersService userService;
	
	@GetMapping
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	public ResponseEntity<?> getUsersDetails() {
		List<Users> usersList = userService.getAllUsers();
		if (usersList.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(usersList, HttpStatus.OK);
		}
		
	}
	
	@GetMapping("/{userId}")
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	public ResponseEntity<?> getUserById(@PathVariable String userId) {
		Optional<Users> user = userService.getUserById(userId);
		
		if (user.isPresent()) {
			return new ResponseEntity<>(user, HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
	
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PostMapping("/admin")
	public ResponseEntity<?> addUsers(@RequestBody Users user) {
		userService.addUsers(user);
		return new ResponseEntity<>(HttpStatus.OK);
	}
	
	@GetMapping("/phone/{phone}")
	public ResponseEntity<?> getUserByPhone(@PathVariable Long phone) {
	    Optional<Users> user = userService.findByMobileNumber(phone);
	    if (user.isPresent()) {
	        return ResponseEntity.ok(user.get());
	    } else {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
	    }
	}
	
	@PutMapping("/{userId}")
	public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody Users user) {
	    System.out.println("Updating user: " + userId);
	    System.out.println("Received user data: " + user);

	    Users updatedUser = userService.updateUser(userId, user);
	    
	    if (updatedUser == null) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
	    }

	    return ResponseEntity.ok(updatedUser);
	}

}
