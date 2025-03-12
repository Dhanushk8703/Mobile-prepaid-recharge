package com.mobicomm.app.util;

import java.io.Serializable;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

public class PlanIdGenerator implements IdentifierGenerator {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final String PREFIX = "mbplan";

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        long uniqueNumber = System.currentTimeMillis() % 1000000; // Keeping last 6 digits of timestamp
        return PREFIX + String.format("%03d", uniqueNumber);
    }
}
