package com.example.food_delivery.controller.user;

import com.example.food_delivery.dto.request.PaymentMethodRequest;
import com.example.food_delivery.dto.response.PaymentMethodDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.service.PaymentMethodService;
import com.example.food_delivery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController("userPaymentMethodController")
@RequestMapping("/user/payment-method")
public class UserPaymentMethodController {

    @Autowired
    private PaymentMethodService paymentMethodService;

    @Autowired
    private UserService userService;

    /**
     * GET /user/payment-method - Lấy tất cả phương thức thanh toán của user hiện tại
     */
    @GetMapping
    public ResponseEntity<?> getMyPaymentMethods() {
        ResponseData responseData = new ResponseData();
        try {
            UserDTO currentUser = userService.getMyInfo();
            if (currentUser == null) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }

            List<PaymentMethodDTO> methods = paymentMethodService.getMyPaymentMethods(currentUser.getId());
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(methods);
            responseData.setDesc("Lấy danh sách phương thức thanh toán thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting payment methods: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách phương thức thanh toán: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/payment-method/default - Lấy phương thức thanh toán mặc định
     */
    @GetMapping("/default")
    public ResponseEntity<?> getDefaultPaymentMethod() {
        ResponseData responseData = new ResponseData();
        try {
            UserDTO currentUser = userService.getMyInfo();
            if (currentUser == null) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }

            PaymentMethodDTO method = paymentMethodService.getDefaultPaymentMethod(currentUser.getId());
            if (method == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa có phương thức thanh toán mặc định!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(method);
            responseData.setDesc("Lấy phương thức thanh toán mặc định thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting default payment method: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy phương thức thanh toán mặc định: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/payment-method/{id} - Lấy phương thức thanh toán theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentMethodById(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            UserDTO currentUser = userService.getMyInfo();
            if (currentUser == null) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }

            PaymentMethodDTO method = paymentMethodService.getPaymentMethodById(id, currentUser.getId());
            if (method == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy phương thức thanh toán!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(method);
            responseData.setDesc("Lấy phương thức thanh toán thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting payment method: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy phương thức thanh toán: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /user/payment-method - Tạo phương thức thanh toán mới
     */
    @PostMapping
    public ResponseEntity<?> createPaymentMethod(@RequestBody PaymentMethodRequest request) {
        ResponseData responseData = new ResponseData();
        try {
            UserDTO currentUser = userService.getMyInfo();
            if (currentUser == null) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }

            // Validation
            if (request.getType() == null || request.getType().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Loại phương thức thanh toán không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            if (request.getType().equals("CREDIT_CARD") || request.getType().equals("DEBIT_CARD")) {
                if (request.getCardNumber() == null || request.getCardNumber().trim().isEmpty()) {
                    responseData.setStatus(400);
                    responseData.setSuccess(false);
                    responseData.setData(null);
                    responseData.setDesc("Số thẻ không được để trống!");
                    return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
                }
                if (request.getCardHolderName() == null || request.getCardHolderName().trim().isEmpty()) {
                    responseData.setStatus(400);
                    responseData.setSuccess(false);
                    responseData.setData(null);
                    responseData.setDesc("Tên chủ thẻ không được để trống!");
                    return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
                }
            }

            PaymentMethodDTO method = paymentMethodService.createPaymentMethod(currentUser.getId(), request);
            if (method == null) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tạo phương thức thanh toán thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(method);
            responseData.setDesc("Tạo phương thức thanh toán thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error creating payment method: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tạo phương thức thanh toán: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/payment-method/{id} - Cập nhật phương thức thanh toán
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePaymentMethod(@PathVariable int id, @RequestBody PaymentMethodRequest request) {
        ResponseData responseData = new ResponseData();
        try {
            UserDTO currentUser = userService.getMyInfo();
            if (currentUser == null) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }

            PaymentMethodDTO method = paymentMethodService.updatePaymentMethod(id, currentUser.getId(), request);
            if (method == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy phương thức thanh toán hoặc không có quyền cập nhật!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(method);
            responseData.setDesc("Cập nhật phương thức thanh toán thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error updating payment method: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật phương thức thanh toán: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/payment-method/{id}/set-default - Đặt làm phương thức thanh toán mặc định
     */
    @PutMapping("/{id}/set-default")
    public ResponseEntity<?> setDefaultPaymentMethod(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            UserDTO currentUser = userService.getMyInfo();
            if (currentUser == null) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }

            PaymentMethodDTO method = paymentMethodService.setDefaultPaymentMethod(id, currentUser.getId());
            if (method == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy phương thức thanh toán hoặc không có quyền!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(method);
            responseData.setDesc("Đặt làm phương thức thanh toán mặc định thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error setting default payment method: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi đặt phương thức thanh toán mặc định: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /user/payment-method/{id} - Xóa phương thức thanh toán
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePaymentMethod(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            UserDTO currentUser = userService.getMyInfo();
            if (currentUser == null) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }

            boolean deleted = paymentMethodService.deletePaymentMethod(id, currentUser.getId());
            if (!deleted) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy phương thức thanh toán hoặc không có quyền xóa!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(true);
            responseData.setDesc("Xóa phương thức thanh toán thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting payment method: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xóa phương thức thanh toán: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

