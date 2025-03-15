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

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user; 

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;   

    private LocalDateTime rechargeDate;  
    private Double amountPaid;  
    private String paymentMethod;

}
