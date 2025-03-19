package com.mobicomm.app.exception;

@SuppressWarnings("serial")
public class PhoneNumberNotFoundException extends RuntimeException {
    public PhoneNumberNotFoundException(String message) {
        super(message);
    }
}

