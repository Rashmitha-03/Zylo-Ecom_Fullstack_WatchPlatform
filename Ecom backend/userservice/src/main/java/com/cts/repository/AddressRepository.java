package com.cts.repository;

import com.cts.dto.AddressResponse;
import com.cts.entity.*;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    List<Address> findByUserUserID(int userId);
    List<Address> findByUserUserIDAndIsDefaultTrue(int userId);
    boolean existsByIdAndUserUserID(int addressId, int userId);
    AddressResponse getAddressById(int addressId);
    
}
