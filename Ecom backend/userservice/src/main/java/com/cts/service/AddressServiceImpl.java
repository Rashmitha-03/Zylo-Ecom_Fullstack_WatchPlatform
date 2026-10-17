package com.cts.service;

import com.cts.dto.*;
import com.cts.entity.Address;
import com.cts.entity.User;
import com.cts.exception.AddressNotFoundException;
import com.cts.exception.UserNotFoundException;
import com.cts.repository.AddressRepository;
import com.cts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements IAddressService {

    // Initialize the logger instance
    private static final Logger logger = LoggerFactory.getLogger(AddressServiceImpl.class);

    @Autowired
    private final AddressRepository addressRepository;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final ModelMapper modelMapper;

    @Override
    public AddressResponse addAddress(int userId, AddressRequest request) {
        logger.info("Attempting to add new address for user ID: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            logger.debug("User found with ID: {}", userId);

            Address address = modelMapper.map(request, Address.class);
            address.setUser(user);
            addressRepository.save(address);
            logger.info("Address added successfully for user ID {}. New address ID: {}", userId, address.getId());
            return modelMapper.map(address, AddressResponse.class);
        } catch (UserNotFoundException e) {
            logger.warn("Failed to add address: User with ID {} not found. Error: {}", userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("An unexpected error occurred while adding address for user ID {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to add address.", e);
        }
    }

    @Override
    public AddressResponse updateAddress(UpdateAddressRequest request) {
        logger.info("Attempting to update address with ID: {}", request.getId());
        try {
            Address address = addressRepository.findById(request.getId())
                    .orElseThrow(() -> new AddressNotFoundException("Address not found"));
            logger.debug("Address found with ID: {}", request.getId());

            modelMapper.map(request, address);
            addressRepository.save(address);
            logger.info("Address updated successfully for ID: {}", address.getId());
            return modelMapper.map(address, AddressResponse.class);
        } catch (AddressNotFoundException e) {
            logger.warn("Failed to update address: Address with ID {} not found. Error: {}", request.getId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("An unexpected error occurred while updating address ID {}: {}", request.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update address.", e);
        }
    }

    @Override
    public void deleteAddress(int addressId) {
        logger.info("Attempting to delete address with ID: {}", addressId);
        try {
            if (!addressRepository.existsById(addressId)) {
                logger.warn("Failed to delete address: Address with ID {} not found.", addressId);
                throw new AddressNotFoundException("Address not found");
            }
            addressRepository.deleteById(addressId);
            logger.info("Address with ID {} deleted successfully.", addressId);
        } catch (AddressNotFoundException e) {
            throw e; // Re-throw specific exception
        } catch (Exception e) {
            logger.error("An unexpected error occurred while deleting address ID {}: {}", addressId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete address.", e);
        }
    }

    @Override
    public List<AddressResponse> getUserAddresses(int userId) {
        logger.info("Fetching all addresses for user ID: {}", userId);
        try {
            List<AddressResponse> addresses = addressRepository.findByUserUserID(userId).stream()
                    .map(address -> modelMapper.map(address, AddressResponse.class))
                    .collect(Collectors.toList());
            logger.debug("Successfully fetched {} addresses for user ID: {}", addresses.size(), userId);
            return addresses;
        } catch (Exception e) {
            logger.error("An unexpected error occurred while fetching addresses for user ID {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve user addresses.", e);
        }
    }

    @Override
    public void setDefaultAddress(SetDefaultAddressRequest request) {
        logger.info("Setting default address for user ID: {} to address ID: {}", request.getUserId(), request.getAddressId());
        try {
            List<Address> addresses = addressRepository.findByUserUserID(request.getUserId());
            if (addresses.isEmpty()) {
                logger.warn("No addresses found for user ID: {}", request.getUserId());
                throw new UserNotFoundException("No addresses found for user."); // Or a more specific exception
            }

            boolean addressFound = false;
            for (Address addr : addresses) {
                if (addr.getId() == request.getAddressId()) {
                    addr.setDefault(true);
                    addressFound = true;
                    logger.debug("Found and setting address ID {} as default for user {}", addr.getId(), request.getUserId());
                } else {
                    if (addr.isDefault()) { // Only log if it's currently default and being unset
                        logger.debug("Unsetting previous default address ID {} for user {}", addr.getId(), request.getUserId());
                    }
                    addr.setDefault(false);
                }
            }

            if (!addressFound) {
                logger.warn("Failed to set default address: Address ID {} not found for user ID {}.", request.getAddressId(), request.getUserId());
                throw new AddressNotFoundException("Address ID not found for the given user.");
            }

            addressRepository.saveAll(addresses);
            logger.info("Default address for user ID {} set to address ID {} successfully.", request.getUserId(), request.getAddressId());
        } catch (UserNotFoundException e) {
            throw e;
        } catch (AddressNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("An unexpected error occurred while setting default address for user ID {} and address ID {}: {}", request.getUserId(), request.getAddressId(), e.getMessage(), e);
            throw new RuntimeException("Failed to set default address.", e);
        }
    }
    @Override
    public boolean isAddressOwnedByUser(int addressId, int userId) {
        // Implement logic to check if the addressId belongs to the userId
        // e.g., return addressRepository.existsByIdAndUserId(addressId, userId);
        // This would require a method in your AddressRepository.
        return false; // Placeholder, implement actual logic
    }
    
    
    @Override
    public AddressResponse getAddressById(int addressId) {
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new AddressNotFoundException("Address with ID " + addressId + " not found."));
        return modelMapper.map(address, AddressResponse.class);
    }
    
    
}