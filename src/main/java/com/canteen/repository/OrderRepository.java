package com.canteen.repository;

import com.canteen.model.Order;
import com.canteen.model.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByStudentIdOrderByOrderTimeDesc(String studentId);
    List<Order> findByStudentIdAndStatusIn(String studentId, List<OrderStatus> statuses);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByOrderTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Order> findByOrderTimeBetweenAndStatus(LocalDateTime start, LocalDateTime end, OrderStatus status);
    List<Order> findAllByOrderByOrderTimeDesc();
    long countByOrderTimeBetween(LocalDateTime start, LocalDateTime end);
    long countByStatus(OrderStatus status);
}
