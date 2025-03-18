package com.mobicomm.app.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {
    private String productName;
    private Long amount;
}
