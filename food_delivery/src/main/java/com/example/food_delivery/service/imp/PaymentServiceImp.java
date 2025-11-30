package com.example.food_delivery.service.imp;

import com.example.food_delivery.domain.entity.Orders;
import com.example.food_delivery.dto.request.PaymentRequest;
import com.example.food_delivery.dto.response.PaymentResponse;
import com.example.food_delivery.reponsitory.OrderRepository;
import com.example.food_delivery.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class PaymentServiceImp implements PaymentService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Autowired
    private OrderRepository orderRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        String paymentMethod = request.getPaymentMethod().toUpperCase();
        
        switch (paymentMethod) {
            case "COD":
                return processCOD(request);
            case "CREDIT_CARD":
                return processCreditCard(request);
            case "BANK_TRANSFER":
                return processBankTransfer(request);
            default:
                return PaymentResponse.builder()
                    .orderId(request.getOrderId())
                    .paymentMethod(request.getPaymentMethod())
                    .paymentStatus("FAILED")
                    .message("Phương thức thanh toán không hợp lệ")
                    .build();
        }
    }

    @Override
    public PaymentResponse processCOD(PaymentRequest request) {
        try {
            Optional<Orders> orderOpt = orderRepository.findById(request.getOrderId());
            if (orderOpt.isEmpty()) {
                return PaymentResponse.builder()
                    .orderId(request.getOrderId())
                    .paymentMethod("COD")
                    .paymentStatus("FAILED")
                    .message("Không tìm thấy đơn hàng")
                    .build();
            }

            Orders order = orderOpt.get();
            order.setPaymentMethod("COD");
            order.setPaymentStatus("PENDING"); // COD sẽ thanh toán khi nhận hàng
            orderRepository.save(order);

            return PaymentResponse.builder()
                .orderId(order.getId())
                .paymentMethod("COD")
                .paymentStatus("PENDING")
                .amount(order.getTotalPrice())
                .paymentDate(new Date())
                .message("Đơn hàng đã được tạo. Thanh toán khi nhận hàng.")
                .build();
        } catch (Exception e) {
            System.err.println("Error processing COD payment: " + e.getMessage());
            e.printStackTrace();
            return PaymentResponse.builder()
                .orderId(request.getOrderId())
                .paymentMethod("COD")
                .paymentStatus("FAILED")
                .message("Lỗi xử lý thanh toán COD: " + e.getMessage())
                .build();
        }
    }

    @Override
    public PaymentResponse processCreditCard(PaymentRequest request) {
        try {
            Optional<Orders> orderOpt = orderRepository.findById(request.getOrderId());
            if (orderOpt.isEmpty()) {
                return PaymentResponse.builder()
                    .orderId(request.getOrderId())
                    .paymentMethod("CREDIT_CARD")
                    .paymentStatus("FAILED")
                    .message("Không tìm thấy đơn hàng")
                    .build();
            }

            Orders order = orderOpt.get();

            if (request.getStripeToken() == null || request.getStripeToken().isEmpty()) {
                return PaymentResponse.builder()
                    .orderId(order.getId())
                    .paymentMethod("CREDIT_CARD")
                    .paymentStatus("FAILED")
                    .message("Stripe token không hợp lệ")
                    .build();
            }

            // Create Stripe Payment Intent
            // Note: Stripe không hỗ trợ VND trực tiếp
            // Option 1: Sử dụng USD (cần convert VND sang USD)
            // Option 2: Sử dụng Stripe cho các quốc gia khác hỗ trợ VND
            // Ở đây sử dụng USD làm ví dụ
            // Convert VND to USD cents (approximate: 1 USD = 24000 VND)
            long amountInCents = (order.getTotalPrice() * 100) / 24000; // Convert VND to USD cents
            if (amountInCents < 50) amountInCents = 50; // Minimum $0.50
            
            // request.getStripeToken() should be a PaymentMethod ID (pm_xxx) created from frontend
            // Frontend should use Stripe.js to create PaymentMethod and send the ID
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents) // Amount in cents
                .setCurrency("usd") // Using USD - change to supported currency if needed
                .setPaymentMethod(request.getStripeToken()) // PaymentMethod ID from frontend
                .setConfirm(true)
                .setReturnUrl("https://your-app.com/payment/return")
                .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Update order with payment info
            order.setPaymentMethod("CREDIT_CARD");
            if (paymentIntent.getStatus().equals("succeeded")) {
                order.setPaymentStatus("PAID");
            } else {
                order.setPaymentStatus("PENDING");
            }
            order.setPaymentIntentId(paymentIntent.getId());
            orderRepository.save(order);

            return PaymentResponse.builder()
                .orderId(order.getId())
                .paymentMethod("CREDIT_CARD")
                .paymentStatus(paymentIntent.getStatus().equals("succeeded") ? "PAID" : "PENDING")
                .paymentIntentId(paymentIntent.getId())
                .amount(order.getTotalPrice())
                .paymentDate(new Date())
                .message(paymentIntent.getStatus().equals("succeeded") 
                    ? "Thanh toán thành công" 
                    : "Đang xử lý thanh toán")
                .build();
        } catch (StripeException e) {
            System.err.println("Stripe error: " + e.getMessage());
            e.printStackTrace();
            return PaymentResponse.builder()
                .orderId(request.getOrderId())
                .paymentMethod("CREDIT_CARD")
                .paymentStatus("FAILED")
                .message("Lỗi thanh toán Stripe: " + e.getMessage())
                .build();
        } catch (Exception e) {
            System.err.println("Error processing credit card payment: " + e.getMessage());
            e.printStackTrace();
            return PaymentResponse.builder()
                .orderId(request.getOrderId())
                .paymentMethod("CREDIT_CARD")
                .paymentStatus("FAILED")
                .message("Lỗi xử lý thanh toán: " + e.getMessage())
                .build();
        }
    }

    @Override
    public PaymentResponse processBankTransfer(PaymentRequest request) {
        try {
            Optional<Orders> orderOpt = orderRepository.findById(request.getOrderId());
            if (orderOpt.isEmpty()) {
                return PaymentResponse.builder()
                    .orderId(request.getOrderId())
                    .paymentMethod("BANK_TRANSFER")
                    .paymentStatus("FAILED")
                    .message("Không tìm thấy đơn hàng")
                    .build();
            }

            Orders order = orderOpt.get();

            if (request.getTransactionId() == null || request.getTransactionId().isEmpty()) {
                return PaymentResponse.builder()
                    .orderId(order.getId())
                    .paymentMethod("BANK_TRANSFER")
                    .paymentStatus("FAILED")
                    .message("Mã giao dịch không được để trống")
                    .build();
            }

            // Update order with bank transfer info
            order.setPaymentMethod("BANK_TRANSFER");
            order.setPaymentStatus("PENDING"); // Cần xác nhận từ admin
            order.setTransactionId(request.getTransactionId());
            orderRepository.save(order);

            return PaymentResponse.builder()
                .orderId(order.getId())
                .paymentMethod("BANK_TRANSFER")
                .paymentStatus("PENDING")
                .transactionId(request.getTransactionId())
                .amount(order.getTotalPrice())
                .paymentDate(new Date())
                .message("Đã ghi nhận thông tin chuyển khoản. Đang chờ xác nhận.")
                .build();
        } catch (Exception e) {
            System.err.println("Error processing bank transfer: " + e.getMessage());
            e.printStackTrace();
            return PaymentResponse.builder()
                .orderId(request.getOrderId())
                .paymentMethod("BANK_TRANSFER")
                .paymentStatus("FAILED")
                .message("Lỗi xử lý chuyển khoản: " + e.getMessage())
                .build();
        }
    }
}

