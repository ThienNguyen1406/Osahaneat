package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.UserAddress;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.request.AddressRequest;
import com.example.food_delivery.dto.response.AddressDTO;
import com.example.food_delivery.reponsitory.UserAddressRepository;
import com.example.food_delivery.reponsitory.UserReponsitory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AddressService {

    @Autowired
    private UserAddressRepository addressRepository;

    @Autowired
    private UserReponsitory userRepository;

    /**
     * Get all addresses for current user
     */
    public List<AddressDTO> getMyAddresses(int userId) {
        List<UserAddress> addresses = addressRepository.findByUserId(userId);
        return addresses.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Get addresses by type (HOME, OFFICE, OTHER)
     */
    public List<AddressDTO> getAddressesByType(int userId, String type) {
        List<UserAddress> addresses = addressRepository.findByUserIdAndType(userId, type);
        return addresses.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Get address by ID
     */
    public AddressDTO getAddressById(int addressId, int userId) {
        Optional<UserAddress> addressOpt = addressRepository.findById(addressId);
        if (addressOpt.isPresent()) {
            UserAddress address = addressOpt.get();
            // Verify that the address belongs to the user
            if (address.getUser() != null && address.getUser().getId() == userId) {
                return toDTO(address);
            }
        }
        return null;
    }

    /**
     * Get default address for user, or first address if no default exists
     */
    public AddressDTO getDefaultAddress(int userId) {
        // First try to get default address
        UserAddress defaultAddress = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        if (defaultAddress != null) {
            return toDTO(defaultAddress);
        }
        
        // If no default, get first address
        List<UserAddress> addresses = addressRepository.findByUserId(userId);
        if (addresses != null && !addresses.isEmpty()) {
            return toDTO(addresses.get(0));
        }
        
        return null;
    }

    /**
     * Create new address
     */
    @Transactional
    public AddressDTO createAddress(int userId, AddressRequest request) {
        // Verify user exists
        Optional<Users> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return null;
        }

        // If this address is set as default, unset other default addresses
        if (request.getIsDefault() != null && request.getIsDefault()) {
            UserAddress currentDefault = addressRepository.findByUserIdAndIsDefaultTrue(userId);
            if (currentDefault != null) {
                currentDefault.setIsDefault(false);
                addressRepository.save(currentDefault);
            }
        }

        UserAddress address = new UserAddress();
        address.setUser(userOpt.get());
        address.setTitle(request.getTitle());
        address.setAddress(request.getAddress());
        address.setType(request.getType() != null ? request.getType() : "OTHER");
        address.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        address.setCreateDate(new Date());

        address = addressRepository.save(address);
        return toDTO(address);
    }

    /**
     * Update address
     */
    @Transactional
    public AddressDTO updateAddress(int addressId, int userId, AddressRequest request) {
        Optional<UserAddress> addressOpt = addressRepository.findById(addressId);
        if (addressOpt.isEmpty()) {
            return null;
        }

        UserAddress address = addressOpt.get();
        // Verify that the address belongs to the user
        if (address.getUser() == null || address.getUser().getId() != userId) {
            return null;
        }

        // Update fields
        if (request.getTitle() != null) {
            address.setTitle(request.getTitle());
        }
        if (request.getAddress() != null) {
            address.setAddress(request.getAddress());
        }
        if (request.getType() != null) {
            address.setType(request.getType());
        }
        if (request.getIsDefault() != null) {
            // If setting as default, unset other default addresses
            if (request.getIsDefault()) {
                UserAddress currentDefault = addressRepository.findByUserIdAndIsDefaultTrue(userId);
                if (currentDefault != null && currentDefault.getId() != addressId) {
                    currentDefault.setIsDefault(false);
                    addressRepository.save(currentDefault);
                }
            }
            address.setIsDefault(request.getIsDefault());
        }

        address = addressRepository.save(address);
        return toDTO(address);
    }

    /**
     * Delete address
     */
    @Transactional
    public boolean deleteAddress(int addressId, int userId) {
        Optional<UserAddress> addressOpt = addressRepository.findById(addressId);
        if (addressOpt.isEmpty()) {
            return false;
        }

        UserAddress address = addressOpt.get();
        // Verify that the address belongs to the user
        if (address.getUser() == null || address.getUser().getId() != userId) {
            return false;
        }

        addressRepository.delete(address);
        return true;
    }

    /**
     * Convert entity to DTO
     */
    private AddressDTO toDTO(UserAddress address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        if (address.getUser() != null) {
            dto.setUserId(address.getUser().getId());
        }
        dto.setTitle(address.getTitle());
        dto.setAddress(address.getAddress());
        dto.setType(address.getType());
        dto.setIsDefault(address.getIsDefault());
        dto.setCreateDate(address.getCreateDate());
        return dto;
    }
}

