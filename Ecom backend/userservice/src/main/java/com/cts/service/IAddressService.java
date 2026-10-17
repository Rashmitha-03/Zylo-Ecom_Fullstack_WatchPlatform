package com.cts.service;

import com.cts.dto.*;


import java.util.List;

public interface IAddressService {
    AddressResponse addAddress(int userId, AddressRequest request);
    AddressResponse updateAddress(UpdateAddressRequest request);
    void deleteAddress(int addressId);
    List<AddressResponse> getUserAddresses(int userId);
    void setDefaultAddress(SetDefaultAddressRequest request);
    boolean isAddressOwnedByUser(int addressId, int userId);
    AddressResponse getAddressById(int addressId);
}
