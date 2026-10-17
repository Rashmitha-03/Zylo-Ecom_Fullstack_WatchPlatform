package com.cts.store;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.cts.dto.OrderDTO;

@Component
public class TempOrderStore {
    private final Map<Long, OrderDTO> orderCache = new ConcurrentHashMap<>();

    public void save(Long paymentId, OrderDTO dto) {
        orderCache.put(paymentId, dto);
    }

    public OrderDTO get(Long paymentId) {
        return orderCache.get(paymentId);
    }
    
    

    public void remove(Long paymentId) {
        orderCache.remove(paymentId);
    }
}

