package com.cts.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import com.cts.dto.AddressRequest;
import com.cts.dto.AddressResponse;
import com.cts.dto.SetDefaultAddressRequest;
import com.cts.dto.UpdateAddressRequest;
import com.cts.entity.Address;
import com.cts.entity.User;
import com.cts.exception.AddressNotFoundException;
import com.cts.repository.AddressRepository;
import com.cts.repository.UserRepository;
import com.cts.service.AddressServiceImpl;

@ExtendWith(MockitoExtension.class)
class AddressImplTests {

    @InjectMocks
    private AddressServiceImpl addressService;

    @Mock 
    private AddressRepository addressRepository;
    @Mock 
    private UserRepository userRepository;
    @Mock 
    private ModelMapper modelMapper;

    private User user;
    private Address address;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserID(1);
        user.setEmail("test@example.com");

        address = new Address();
        address.setId(100);
        address.setStreet("123 Main St");
        address.setUser(user);
    }

    @Test
    void testAddAddress() {
        AddressRequest request = new AddressRequest();
        AddressResponse response = new AddressResponse();

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(modelMapper.map(request, Address.class)).thenReturn(address);
        when(modelMapper.map(address, AddressResponse.class)).thenReturn(response);

        AddressResponse result = addressService.addAddress(1, request);

        assertNotNull(result);
        verify(addressRepository).save(address);
    }

    @Test
    void testDeleteAddress_Success() {
        when(addressRepository.existsById(100)).thenReturn(true);

        addressService.deleteAddress(100);

        verify(addressRepository).deleteById(100);
    }

    @Test
    void testDeleteAddress_NotFound() {
        when(addressRepository.existsById(999)).thenReturn(false);

        assertThrows(AddressNotFoundException.class, () -> addressService.deleteAddress(999));
    }

    @Test
    void testGetUserAddresses() {
        when(addressRepository.findByUserUserID(1)).thenReturn(List.of(address));
        AddressResponse response = new AddressResponse();
        when(modelMapper.map(address, AddressResponse.class)).thenReturn(response);

        List<AddressResponse> result = addressService.getUserAddresses(1);

        assertEquals(1, result.size());
    }

    @Test
    void testSetDefaultAddress() {
        Address a1 = new Address();
        a1.setId(101);
        Address a2 = new Address();
        a2.setId(102);

        List<Address> all = List.of(a1, a2);

        SetDefaultAddressRequest request = new SetDefaultAddressRequest();
        request.setUserId(1);
        request.setAddressId(102);

        when(addressRepository.findByUserUserID(1)).thenReturn(all);

        addressService.setDefaultAddress(request);

        assertTrue(a2.isDefault());
        assertFalse(a1.isDefault());
        verify(addressRepository).saveAll(all);
    }
}
