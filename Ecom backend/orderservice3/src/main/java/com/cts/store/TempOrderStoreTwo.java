package com.cts.store;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
 
import com.cts.dto.CartClientOnlineDTO;
@Component
public class TempOrderStoreTwo {
	private final Map<Long, CartClientOnlineDTO> orderCache = new ConcurrentHashMap<>();
    public void save(Long paymentId, CartClientOnlineDTO orderDTO) {
        orderCache.put(paymentId, orderDTO);
    }
    public CartClientOnlineDTO get(Long paymentId) {
        return orderCache.get(paymentId);
    }
    public void remove(Long paymentId) {
        orderCache.remove(paymentId);
    }

}
