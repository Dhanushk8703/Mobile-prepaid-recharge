package com.mobicomm.app.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Admin;
import com.mobicomm.app.model.RevokedToken;
import com.mobicomm.app.model.Role;
import com.mobicomm.app.repository.AdminRepository;
import com.mobicomm.app.repository.RevokedRepository;
import com.mobicomm.app.security.JwtUtil;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private RevokedRepository revokedTokenRepository;
	
	@Autowired
	private AdminRepository adminRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
		
	@PostMapping("/register")
	public ResponseEntity<String> registerUser(@RequestBody Admin admin) {
	    if (adminRepository.findByUsername(admin.getUsername()).isPresent()) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists!");
	    }
	    
	    admin.setPassword(passwordEncoder.encode(admin.getPassword()));

	    // Default role assignment
	    if (admin.getRole() == null) {
	        admin.setRole(Role.ROLE_USER); 
	    }

	    adminRepository.save(admin);
	    return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
	}
	
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Admin admin) {
		Optional<Admin> existingAdmin = adminRepository.findByUsername(admin.getUsername());

		if (existingAdmin.isPresent() && passwordEncoder.matches(admin.getPassword(), existingAdmin.get().getPassword())) {
			return ResponseEntity.ok(Map.of(
				    "accessToken", jwtUtil.generateToken(existingAdmin.get().getUsername(), existingAdmin.get().getRole().name()), 
				    "refreshToken", jwtUtil.generateRefreshToken(existingAdmin.get().getUsername())
			
				));

		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
	}

	@PostMapping("/logout")
	public ResponseEntity<String> logout(@RequestHeader("Authorization") String token,
			@RequestBody Map<String, String> request) {
		token = token.substring(7);
		revokedTokenRepository.save(new RevokedToken(token));

		String refreshToken = request.get("refreshToken");
		if (refreshToken != null) {
			revokedTokenRepository.save(new RevokedToken(refreshToken));
		}

		return ResponseEntity.ok("Logged out successfully.");
	}

}
