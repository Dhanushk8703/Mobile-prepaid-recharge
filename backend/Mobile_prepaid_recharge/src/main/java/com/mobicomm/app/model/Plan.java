package com.mobicomm.app.model;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Plan {
	@Id
	private String planId;
	private String planName;
	private String description;
	private Double planPrice;
	private Long data;
	private Long sms;
	private Long validity;
	private LocalDate createdAt;
	private LocalDate updatedAt;
	
	@ManyToOne
	@JoinColumn(name = "category_id", nullable = false) // Foreign Key
	private Category category;
	 
	@ManyToMany(cascade = CascadeType.PERSIST)
	@JoinTable(name = "planbenefits",
		joinColumns = @JoinColumn(name = "planId"),inverseJoinColumns = @JoinColumn(name = "benefitsId"))
	private Set<Benefits> benefits;
	
	@Enumerated(EnumType.STRING)
	private Status status;
}

