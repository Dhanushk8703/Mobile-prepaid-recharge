package com.mobicomm.app.exception;

@SuppressWarnings("serial")
public class PhoneNotFoundException extends RuntimeException {
    public PhoneNotFoundException(String message) {
        super(message);
    }
}

