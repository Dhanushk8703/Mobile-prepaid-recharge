package com.mobicomm.app.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RechargeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String userId; 
    private String planId;   
    private Long mobileNumber;
    private LocalDateTime rechargeDate;  
    private Double amountPaid;  
    private String paymentMethod;

}
