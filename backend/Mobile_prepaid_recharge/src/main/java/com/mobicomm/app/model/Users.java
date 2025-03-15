package com.mobicomm.app.model;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Users {
	@Id
	private String userId;
	private String userName;
	
	@Column(unique = true)
	private String email;
	
	@Column(unique = true)
	private Long phoneNumber;
	private LocalDate createdAt;
	private LocalDate updatedAt;
	
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<UserPlanDetail> userPlanDetails;
}
