package com.mobicomm.app.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPlanDetail {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@ManyToOne  
    @JoinColumn(name = "plan_id", nullable = false) 
    private Plan plan;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
	private LocalDateTime rechargedDate;
	private LocalDateTime expiryDate;
}
