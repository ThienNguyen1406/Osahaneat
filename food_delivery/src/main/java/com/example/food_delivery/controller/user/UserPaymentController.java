package com.example.food_delivery.controller.user;

import com.example.food_delivery.dto.request.PaymentRequest;
import com.example.food_delivery.dto.response.PaymentResponse;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.PaymentServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController("userPaymentController")
@RequestMapping("/payment")
public class UserPaymentController {

    @Autowired
    PaymentServiceImp paymentService;
    
    @Value("${stripe.publishable-key}")
    private String stripePublishableKey;

    /**
     * POST /payment/process - Xử lý thanh toán
     * Yêu cầu authentication (user)
     * Body: PaymentRequest { userId, orderId, paymentMethod, stripeToken (optional), transactionId (optional) }
     */
    @PostMapping("/process")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        ResponseData responseData = new ResponseData();
        
        try {
            // Validate input
            if (request.getUserId() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (request.getOrderId() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Order ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (request.getPaymentMethod() == null || request.getPaymentMethod().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Phương thức thanh toán không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Process payment
            PaymentResponse paymentResponse = paymentService.processPayment(request);
            
            if (paymentResponse.getPaymentStatus().equals("FAILED")) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(paymentResponse);
                responseData.setDesc(paymentResponse.getMessage());
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(paymentResponse);
            responseData.setDesc(paymentResponse.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error processing payment: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xử lý thanh toán: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /payment/cod - Thanh toán COD (Cash on Delivery)
     * Yêu cầu authentication (user)
     */
    @PostMapping("/cod")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> processCOD(@RequestBody PaymentRequest request) {
        ResponseData responseData = new ResponseData();
        
        try {
            request.setPaymentMethod("COD");
            PaymentResponse paymentResponse = paymentService.processCOD(request);
            
            if (paymentResponse.getPaymentStatus().equals("FAILED")) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(paymentResponse);
                responseData.setDesc(paymentResponse.getMessage());
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(paymentResponse);
            responseData.setDesc(paymentResponse.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error processing COD: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xử lý thanh toán COD: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /payment/credit-card - Thanh toán bằng thẻ tín dụng (Stripe)
     * Yêu cầu authentication (user)
     */
    @PostMapping("/credit-card")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> processCreditCard(@RequestBody PaymentRequest request) {
        ResponseData responseData = new ResponseData();
        
        try {
            request.setPaymentMethod("CREDIT_CARD");
            PaymentResponse paymentResponse = paymentService.processCreditCard(request);
            
            if (paymentResponse.getPaymentStatus().equals("FAILED")) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(paymentResponse);
                responseData.setDesc(paymentResponse.getMessage());
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(paymentResponse);
            responseData.setDesc(paymentResponse.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error processing credit card: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xử lý thanh toán thẻ tín dụng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /payment/bank-transfer - Thanh toán chuyển khoản ngân hàng
     * Yêu cầu authentication (user)
     */
    @PostMapping("/bank-transfer")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> processBankTransfer(@RequestBody PaymentRequest request) {
        ResponseData responseData = new ResponseData();
        
        try {
            request.setPaymentMethod("BANK_TRANSFER");
            PaymentResponse paymentResponse = paymentService.processBankTransfer(request);
            
            if (paymentResponse.getPaymentStatus().equals("FAILED")) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(paymentResponse);
                responseData.setDesc(paymentResponse.getMessage());
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(paymentResponse);
            responseData.setDesc(paymentResponse.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error processing bank transfer: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xử lý chuyển khoản: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * GET /payment/stripe-key - Lấy Stripe publishable key để khởi tạo Stripe.js ở frontend
     * Không yêu cầu authentication (public endpoint)
     */
    @GetMapping("/stripe-key")
    public ResponseEntity<?> getStripePublishableKey() {
        ResponseData responseData = new ResponseData();
        
        try {
            Map<String, String> keyData = new HashMap<>();
            keyData.put("publishableKey", stripePublishableKey);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(keyData);
            responseData.setDesc("Lấy Stripe publishable key thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error getting Stripe publishable key: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy Stripe publishable key: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

