package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.Orders;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Integer> {
    
    /**
     * Find all orders with eagerly loaded Users and Restaurant relationships
     * to avoid lazy loading issues
     */
    @Query("SELECT o FROM orders o LEFT JOIN FETCH o.users LEFT JOIN FETCH o.restaurant")
    List<Orders> findAllWithRelations();
    
    /**
     * Tìm đơn hàng chưa có driver nhận (status = "created" hoặc "ready")
     */
    List<Orders> findByDriverIdIsNullAndStatusIn(List<String> statuses);
    
    /**
     * Tìm đơn hàng chưa có driver nhận với status cụ thể
     */
    List<Orders> findByDriverIdIsNullAndStatus(String status);
    
    /**
     * Tìm đơn hàng của driver với status cụ thể
     */
    List<Orders> findByDriverIdAndStatus(int driverId, String status);
    
    /**
     * Tìm tất cả đơn hàng của driver
     */
    List<Orders> findByDriverId(int driverId);
    
    /**
     * Tìm đơn hàng của nhà hàng với status cụ thể
     */
    List<Orders> findByRestaurantIdAndStatus(int restaurantId, String status);
    
    /**
     * Tìm tất cả đơn hàng của nhà hàng
     */
    List<Orders> findByRestaurantId(int restaurantId);
    
    /**
     * Tìm đơn hàng của driver trong khoảng thời gian
     */
    List<Orders> findByDriverIdAndCreateDateBetween(int driverId, Date startDate, Date endDate);
    
    /**
     * Tìm đơn hàng của nhà hàng trong khoảng thời gian
     */
    List<Orders> findByRestaurantIdAndCreateDateBetween(int restaurantId, Date startDate, Date endDate);
    
    /**
     * Tìm đơn hàng đã giao của driver (để tính thống kê)
     */
    @Query("SELECT o FROM orders o WHERE o.driver.id = :driverId AND o.status = 'delivered' AND DATE(o.createDate) = DATE(:date)")
    List<Orders> findDeliveredOrdersByDriverAndDate(int driverId, Date date);
    
    /**
     * Tìm đơn hàng của nhà hàng trong ngày
     */
    @Query("SELECT o FROM orders o WHERE o.restaurant.id = :restaurantId AND DATE(o.createDate) = DATE(:date)")
    List<Orders> findOrdersByRestaurantAndDate(int restaurantId, Date date);
    
    /**
     * Đếm đơn hàng của driver trong ngày
     */
    @Query("SELECT COUNT(o) FROM orders o WHERE o.driver.id = :driverId AND DATE(o.createDate) = DATE(:date)")
    long countOrdersByDriverAndDate(int driverId, Date date);
    
    /**
     * Tính tổng doanh thu của driver trong ngày (từ delivery_fee)
     */
    @Query("SELECT COALESCE(SUM(o.deliveryFee), 0) FROM orders o WHERE o.driver.id = :driverId AND o.status = 'delivered' AND DATE(o.deliveredAt) = DATE(:date)")
    Long sumDeliveryFeeByDriverAndDate(int driverId, Date date);
    
    /**
     * Tính tổng doanh thu của driver trong ngày (từ shipping_fee - phí ship cho shipper)
     */
    @Query("SELECT COALESCE(SUM(o.shippingFee), 0) FROM orders o WHERE o.driver.id = :driverId AND o.status = 'delivered' AND DATE(o.deliveredAt) = DATE(:date)")
    Long sumShippingFeeByDriverAndDate(int driverId, Date date);
    
    /**
     * Tính tổng doanh thu của nhà hàng trong ngày
     */
    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM orders o WHERE o.restaurant.id = :restaurantId AND o.status = 'delivered' AND DATE(o.deliveredAt) = DATE(:date)")
    Long sumRevenueByRestaurantAndDate(int restaurantId, Date date);
    
    /**
     * Tìm đơn hàng của driver với phân trang
     */
    Page<Orders> findByDriverIdOrderByCreateDateDesc(int driverId, Pageable pageable);
    
    /**
     * Tìm đơn hàng của nhà hàng với phân trang
     */
    Page<Orders> findByRestaurantIdOrderByCreateDateDesc(int restaurantId, Pageable pageable);
}
