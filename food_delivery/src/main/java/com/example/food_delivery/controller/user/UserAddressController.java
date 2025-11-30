package com.example.food_delivery.controller.user;

import com.example.food_delivery.dto.request.AddressRequest;
import com.example.food_delivery.dto.response.AddressDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.service.AddressService;
import com.example.food_delivery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController("userAddressController")
@RequestMapping("/user/address")
public class UserAddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserService userService;

    /**
     * GET /user/address - Lấy tất cả địa chỉ của user hiện tại
     */
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyAddresses() {
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

            List<AddressDTO> addresses = addressService.getMyAddresses(currentUser.getId());
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(addresses);
            responseData.setDesc("Lấy danh sách địa chỉ thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting addresses: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách địa chỉ: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/address/type/{type} - Lấy địa chỉ theo loại (HOME, OFFICE, OTHER)
     */
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAddressesByType(@PathVariable String type) {
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

            List<AddressDTO> addresses = addressService.getAddressesByType(currentUser.getId(), type);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(addresses);
            responseData.setDesc("Lấy danh sách địa chỉ thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting addresses by type: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách địa chỉ: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/address/default - Lấy địa chỉ mặc định (hoặc địa chỉ đầu tiên)
     */
    @GetMapping("/default")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getDefaultAddress() {
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

            AddressDTO address = addressService.getDefaultAddress(currentUser.getId());
            if (address != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(address);
                responseData.setDesc("Lấy địa chỉ mặc định thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa có địa chỉ nào được lưu!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (SecurityException e) {
            responseData.setStatus(HttpStatus.UNAUTHORIZED.value());
            responseData.setSuccess(false);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setDesc("Lỗi server khi lấy địa chỉ mặc định: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/address/{id} - Lấy địa chỉ theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAddressById(@PathVariable int id) {
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

            AddressDTO address = addressService.getAddressById(id, currentUser.getId());
            if (address == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy địa chỉ!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(address);
            responseData.setDesc("Lấy địa chỉ thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting address: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy địa chỉ: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /user/address - Tạo địa chỉ mới
     */
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createAddress(@RequestBody AddressRequest request) {
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
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tiêu đề địa chỉ không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            if (request.getAddress() == null || request.getAddress().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Địa chỉ không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            AddressDTO address = addressService.createAddress(currentUser.getId(), request);
            if (address == null) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tạo địa chỉ thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(address);
            responseData.setDesc("Tạo địa chỉ thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error creating address: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tạo địa chỉ: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/address/{id} - Cập nhật địa chỉ
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateAddress(@PathVariable int id, @RequestBody AddressRequest request) {
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

            AddressDTO address = addressService.updateAddress(id, currentUser.getId(), request);
            if (address == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy địa chỉ hoặc không có quyền cập nhật!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(address);
            responseData.setDesc("Cập nhật địa chỉ thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error updating address: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật địa chỉ: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /user/address/{id} - Xóa địa chỉ
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteAddress(@PathVariable int id) {
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

            boolean deleted = addressService.deleteAddress(id, currentUser.getId());
            if (!deleted) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy địa chỉ hoặc không có quyền xóa!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }

            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(true);
            responseData.setDesc("Xóa địa chỉ thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting address: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xóa địa chỉ: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

