package com.cts.controller;

import com.cts.dto.*;
import com.cts.service.IAddressService;
import jakarta.validation.Valid; // Import the @Valid annotation
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final IAddressService addressService;

    // ADMIN or the user themselves
    @PostMapping("/{userId}/add")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<AddressResponse> addAddress(
            @PathVariable int userId,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.addAddress(userId, request));
    }

    // ADMIN or the user themselves
    @PutMapping("/update/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable int userId,
            @Valid @RequestBody UpdateAddressRequest request) {
        return ResponseEntity.ok(addressService.updateAddress(request));
    }

    // ADMIN or the user themselves — userId explicitly passed in URL
    @DeleteMapping("/{userId}/delete/{addressId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable int userId,
            @PathVariable int addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }

    // ADMIN or the user themselves
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<List<AddressResponse>> getUserAddresses(
            @PathVariable int userId) {
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    // ADMIN or the user themselves — userId added for authorization
    @PutMapping("/{userId}/set-default")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.claims['userId']")
    public ResponseEntity<Void> setDefaultAddress(
            @PathVariable int userId,
            @Valid @RequestBody SetDefaultAddressRequest request) {
        addressService.setDefaultAddress(request);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("address/{addressId}") // No @Valid needed for @PathVariable
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER') ")
    public ResponseEntity<AddressResponse> getAddressById(@PathVariable int addressId) {
    	        AddressResponse addressResponse = addressService.getAddressById(addressId);
    	        return ResponseEntity.ok(addressResponse);
    }
 
}
