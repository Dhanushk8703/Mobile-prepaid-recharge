package com.mobicomm.app.model;

import java.time.LocalDate;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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
	private String plan_name;
	
	private String description;
	private Double plan_price;
	private Long validity;
	private LocalDate created_at;
	private LocalDate updated_at;
	
	 @ManyToOne
	 @JoinColumn(name = "category_id", nullable = false) // Foreign Key
	 private Category category;
	 
	 @ManyToMany
	 @JoinTable(
	    name = "plan_benefit",
	    joinColumns = @JoinColumn(name = "plan_id"),
	    inverseJoinColumns = @JoinColumn(name = "benefit_id")
	  )
	    private Set<Benefits> benefits;

	 @Enumerated(EnumType.STRING)
	 private Status status;
}
