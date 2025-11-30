package com.example.food_delivery.core.response;

import com.example.food_delivery.core.pagination.Pagination;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse {
    Integer code;           // 🔹 Mã lỗi hoặc mã thành công (vd: 200, 400, 401)
    String message;         // 🔹 Thông điệp
    Object result;          // 🔹 Dữ liệu trả về (DTO, List,...)
    Pagination pagination;  // 🔹 Thông tin phân trang (nếu có)
    Long timestamp;         // 🔹 Thời điểm trả về (tùy chọn)

    // ================== STATIC HELPERS ==================

    public static ResponseEntity<ApiResponse> success(String message, Object result, Pagination pagination){
        ApiResponse resp = new ApiResponse();
        resp.setCode(HttpStatus.OK.value());
        resp.setMessage(message);
        resp.setPagination(pagination);
        resp.setResult(result);
        resp.setTimestamp(System.currentTimeMillis());
        return ResponseEntity.ok().body(resp);
    }

    public static ResponseEntity<ApiResponse> success(String message, Object result){
        ApiResponse resp = new ApiResponse();
        resp.setCode(HttpStatus.OK.value());
        resp.setMessage(message);
        resp.setResult(result);
        resp.setTimestamp(System.currentTimeMillis());
        return ResponseEntity.ok().body(resp);
    }

    public static ResponseEntity<ApiResponse> success(String message){
        ApiResponse resp = new ApiResponse();
        resp.setCode(HttpStatus.OK.value());
        resp.setMessage(message);
        resp.setTimestamp(System.currentTimeMillis());
        return ResponseEntity.ok().body(resp);
    }

    public static ResponseEntity<ApiResponse> success(Object result){
        ApiResponse resp = new ApiResponse();
        resp.setCode(HttpStatus.OK.value());
        resp.setResult(result);
        resp.setTimestamp(System.currentTimeMillis());
        return ResponseEntity.ok().body(resp);
    }

    public static ResponseEntity<ApiResponse> error(int code, String message) {
        ApiResponse resp = new ApiResponse();
        resp.setCode(code);
        resp.setMessage(message);
        resp.setTimestamp(System.currentTimeMillis());
        return ResponseEntity.status(code).body(resp);
    }
}
