package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.UserPaymentMethod;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.request.PaymentMethodRequest;
import com.example.food_delivery.dto.response.PaymentMethodDTO;
import com.example.food_delivery.reponsitory.UserPaymentMethodRepository;
import com.example.food_delivery.reponsitory.UserReponsitory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentMethodService {

    @Autowired
    private UserPaymentMethodRepository paymentMethodRepository;

    @Autowired
    private UserReponsitory userRepository;

    /**
     * Get all payment methods for current user
     */
    public List<PaymentMethodDTO> getMyPaymentMethods(int userId) {
        List<UserPaymentMethod> methods = paymentMethodRepository.findByUserIdAndIsActiveTrue(userId);
        return methods.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Get payment method by ID
     */
    public PaymentMethodDTO getPaymentMethodById(int methodId, int userId) {
        Optional<UserPaymentMethod> methodOpt = paymentMethodRepository.findById(methodId);
        if (methodOpt.isPresent()) {
            UserPaymentMethod method = methodOpt.get();
            // Verify that the payment method belongs to the user
            if (method.getUser() != null && method.getUser().getId() == userId) {
                return toDTO(method);
            }
        }
        return null;
    }

    /**
     * Get default payment method
     */
    public PaymentMethodDTO getDefaultPaymentMethod(int userId) {
        UserPaymentMethod method = paymentMethodRepository.findByUserIdAndIsDefaultTrue(userId);
        return method != null ? toDTO(method) : null;
    }

    /**
     * Create new payment method
     */
    @Transactional
    public PaymentMethodDTO createPaymentMethod(int userId, PaymentMethodRequest request) {
        // Verify user exists
        Optional<Users> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return null;
        }

        // If this payment method is set as default, unset other default payment methods
        if (request.getIsDefault() != null && request.getIsDefault()) {
            UserPaymentMethod currentDefault = paymentMethodRepository.findByUserIdAndIsDefaultTrue(userId);
            if (currentDefault != null) {
                currentDefault.setIsDefault(false);
                paymentMethodRepository.save(currentDefault);
            }
        }

        UserPaymentMethod method = new UserPaymentMethod();
        method.setUser(userOpt.get());
        method.setType(request.getType() != null ? request.getType() : "CREDIT_CARD");
        
        // Mask card number - only store last 4 digits
        if (request.getCardNumber() != null && !request.getCardNumber().trim().isEmpty()) {
            String cardNumber = request.getCardNumber().trim().replaceAll("[^0-9]", "");
            if (cardNumber.length() >= 4) {
                method.setCardNumber(cardNumber.substring(cardNumber.length() - 4));
            } else {
                method.setCardNumber(cardNumber);
            }
        }
        
        method.setCardHolderName(request.getCardHolderName());
        method.setExpiryMonth(request.getExpiryMonth());
        method.setExpiryYear(request.getExpiryYear());
        method.setCardBrand(request.getCardBrand());
        method.setStripePaymentMethodId(request.getStripePaymentMethodId());
        method.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        method.setIsActive(true);
        method.setCreateDate(new Date());

        method = paymentMethodRepository.save(method);
        return toDTO(method);
    }

    /**
     * Update payment method
     */
    @Transactional
    public PaymentMethodDTO updatePaymentMethod(int methodId, int userId, PaymentMethodRequest request) {
        Optional<UserPaymentMethod> methodOpt = paymentMethodRepository.findById(methodId);
        if (methodOpt.isEmpty()) {
            return null;
        }

        UserPaymentMethod method = methodOpt.get();
        // Verify that the payment method belongs to the user
        if (method.getUser() == null || method.getUser().getId() != userId) {
            return null;
        }

        // Update fields
        if (request.getCardHolderName() != null) {
            method.setCardHolderName(request.getCardHolderName());
        }
        if (request.getExpiryMonth() != null) {
            method.setExpiryMonth(request.getExpiryMonth());
        }
        if (request.getExpiryYear() != null) {
            method.setExpiryYear(request.getExpiryYear());
        }
        if (request.getCardBrand() != null) {
            method.setCardBrand(request.getCardBrand());
        }
        if (request.getStripePaymentMethodId() != null) {
            method.setStripePaymentMethodId(request.getStripePaymentMethodId());
        }
        if (request.getIsDefault() != null) {
            // If setting as default, unset other default payment methods
            if (request.getIsDefault()) {
                UserPaymentMethod currentDefault = paymentMethodRepository.findByUserIdAndIsDefaultTrue(userId);
                if (currentDefault != null && currentDefault.getId() != methodId) {
                    currentDefault.setIsDefault(false);
                    paymentMethodRepository.save(currentDefault);
                }
            }
            method.setIsDefault(request.getIsDefault());
        }

        method = paymentMethodRepository.save(method);
        return toDTO(method);
    }

    /**
     * Delete payment method (soft delete - set isActive = false)
     */
    @Transactional
    public boolean deletePaymentMethod(int methodId, int userId) {
        Optional<UserPaymentMethod> methodOpt = paymentMethodRepository.findById(methodId);
        if (methodOpt.isEmpty()) {
            return false;
        }

        UserPaymentMethod method = methodOpt.get();
        // Verify that the payment method belongs to the user
        if (method.getUser() == null || method.getUser().getId() != userId) {
            return false;
        }

        // Soft delete
        method.setIsActive(false);
        paymentMethodRepository.save(method);
        return true;
    }

    /**
     * Set payment method as default
     */
    @Transactional
    public PaymentMethodDTO setDefaultPaymentMethod(int methodId, int userId) {
        Optional<UserPaymentMethod> methodOpt = paymentMethodRepository.findById(methodId);
        if (methodOpt.isEmpty()) {
            return null;
        }

        UserPaymentMethod method = methodOpt.get();
        // Verify that the payment method belongs to the user
        if (method.getUser() == null || method.getUser().getId() != userId) {
            return null;
        }

        // Unset current default
        UserPaymentMethod currentDefault = paymentMethodRepository.findByUserIdAndIsDefaultTrue(userId);
        if (currentDefault != null && currentDefault.getId() != methodId) {
            currentDefault.setIsDefault(false);
            paymentMethodRepository.save(currentDefault);
        }

        // Set new default
        method.setIsDefault(true);
        method = paymentMethodRepository.save(method);
        return toDTO(method);
    }

    /**
     * Convert entity to DTO
     */
    private PaymentMethodDTO toDTO(UserPaymentMethod method) {
        PaymentMethodDTO dto = new PaymentMethodDTO();
        dto.setId(method.getId());
        if (method.getUser() != null) {
            dto.setUserId(method.getUser().getId());
        }
        dto.setType(method.getType());
        dto.setCardNumber(method.getCardNumber());
        dto.setCardHolderName(method.getCardHolderName());
        dto.setExpiryMonth(method.getExpiryMonth());
        dto.setExpiryYear(method.getExpiryYear());
        dto.setCardBrand(method.getCardBrand());
        dto.setStripePaymentMethodId(method.getStripePaymentMethodId());
        dto.setIsDefault(method.getIsDefault());
        dto.setIsActive(method.getIsActive());
        dto.setCreateDate(method.getCreateDate());
        dto.setLastUsedDate(method.getLastUsedDate());
        return dto;
    }
}

