package com.mobicomm.app.security;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.mobicomm.app.model.Admin;
import com.mobicomm.app.repository.AdminRepository;
import com.mobicomm.app.repository.RevokedRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private AdminRepository adminRepository;

	@Autowired
	private RevokedRepository revokedTokenRepository;

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, 
	                                @NonNull HttpServletResponse response, 
	                                @NonNull FilterChain chain)
			throws ServletException, IOException {
		
		// Only process URLs that start with /admin
		String path = request.getRequestURI();
		if (!path.startsWith("/admin")) {
			chain.doFilter(request, response);
			return;
		}

		String token = request.getHeader("Authorization");

		// Check if the Authorization header contains a Bearer token
		if (token != null && token.startsWith("Bearer ")) {
			token = token.substring(7);

			// Check if the token is expired
			if (jwtUtil.isTokenExpired(token)) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().write("Invalid or expired token.");
				return;
			}

			// Check if the token has been revoked
			if (revokedTokenRepository.findById(token).isPresent()) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().write("Token has been revoked.");
				return;
			}

			// Get the username and role from the token
			String username = jwtUtil.getUsernameFromToken(token);
			String role = jwtUtil.getRoleFromToken(token);

			// Find the admin from the database using the username
			Optional<Admin> admin = adminRepository.findByUsername(username);

			if (admin.isPresent()) {
				// Create an authority using the role directly from the enum
				List<SimpleGrantedAuthority> authorities = 
				    Collections.singletonList(new SimpleGrantedAuthority(role));

				// Set the authentication in the security context
				SecurityContextHolder.getContext()
						.setAuthentication(new UsernamePasswordAuthenticationToken(username, null, authorities));

				System.out.println("Authorities: " + authorities);
			}
		}

		chain.doFilter(request, response);
	}
}
