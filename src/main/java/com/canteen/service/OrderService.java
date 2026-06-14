package com.canteen.service;

import com.canteen.dto.OrderRequestDTO;
import com.canteen.model.*;
import com.canteen.repository.CartRepository;
import com.canteen.repository.MenuItemRepository;
import com.canteen.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public Order placeOrder(String userId, String userName, String userEmail, OrderRequestDTO dto) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        List<OrderItem> orderItems = cart.getItems().stream()
                .map(ci -> OrderItem.builder()
                        .menuItemId(ci.getMenuItemId())
                        .menuItemName(ci.getMenuItemName())
                        .quantity(ci.getQuantity())
                        .price(ci.getPrice())
                        .subtotal(ci.getPrice() * ci.getQuantity())
                        .isVeg(ci.isVeg())
                        .build())
                .collect(Collectors.toList());

        double subtotal = orderItems.stream().mapToDouble(OrderItem::getSubtotal).sum();
        double tax = subtotal * 0.05;
        double totalAmount = subtotal + tax;

        // Generate daily token number
        int tokenNumber = generateTokenNumber();

        // Calculate estimated delivery time
        int maxPrepTime = cart.getItems().stream()
                .map(ci -> menuItemRepository.findById(ci.getMenuItemId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .mapToInt(MenuItem::getPreparationTime)
                .max()
                .orElse(15);

        Order order = Order.builder()
                .studentId(userId)
                .studentName(userName)
                .studentEmail(userEmail)
                .items(orderItems)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .paymentMode(dto.getPaymentMode())
                .orderTime(LocalDateTime.now())
                .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(maxPrepTime))
                .specialInstructions(dto.getSpecialInstructions())
                .tokenNumber(tokenNumber)
                .isPaid(dto.getPaymentMode() != PaymentMode.CASH)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Update menu item order counts
        orderItems.forEach(item -> {
            menuItemRepository.findById(item.getMenuItemId()).ifPresent(menuItem -> {
                menuItem.setTotalOrders(menuItem.getTotalOrders() + item.getQuantity());
                menuItemRepository.save(menuItem);
            });
        });

        // Clear cart
        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return savedOrder;
    }

    private int generateTokenNumber() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long todayCount = orderRepository.countByOrderTimeBetween(startOfDay, endOfDay);
        return (int) (todayCount + 1);
    }

    public List<Order> getStudentOrders(String studentId) {
        return orderRepository.findByStudentIdOrderByOrderTimeDesc(studentId);
    }

    public List<Order> getStudentActiveOrders(String studentId) {
        return orderRepository.findByStudentIdAndStatusIn(studentId,
                List.of(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY));
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderTimeDesc();
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public List<Order> getOrdersByDateRange(LocalDateTime start, LocalDateTime end) {
        return orderRepository.findByOrderTimeBetween(start, end);
    }

    public Order updateStatus(String orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(newStatus);

        if (newStatus == OrderStatus.DELIVERED) {
            order.setActualDeliveryTime(LocalDateTime.now());
        }

        return orderRepository.save(order);
    }

    public Order cancelOrder(String orderId, String studentId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getStudentId().equals(studentId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    public Order rateOrder(String orderId, String studentId, int rating, String review) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getStudentId().equals(studentId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Can only rate delivered orders");
        }

        order.setRating(rating);
        order.setReview(review);
        Order savedOrder = orderRepository.save(order);

        // Update menu item ratings
        order.getItems().forEach(item -> {
            menuItemRepository.findById(item.getMenuItemId()).ifPresent(menuItem -> {
                double currentRating = menuItem.getRating();
                int ratingCount = menuItem.getRatingCount();
                double newRating = ((currentRating * ratingCount) + rating) / (ratingCount + 1);
                menuItem.setRating(Math.round(newRating * 10.0) / 10.0);
                menuItem.setRatingCount(ratingCount + 1);
                menuItemRepository.save(menuItem);
            });
        });

        return savedOrder;
    }

    // ===== Reports =====

    public Map<String, Object> getTodayStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<Order> todayOrders = orderRepository.findByOrderTimeBetween(startOfDay, endOfDay);
        double revenue = todayOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount)
                .sum();
        long pendingCount = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", todayOrders.size());
        stats.put("revenue", revenue);
        stats.put("pendingOrders", pendingCount);
        return stats;
    }

    public Map<String, Object> getDailyReport(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findByOrderTimeBetween(start, end);

        double revenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount).sum();

        Map<String, Object> report = new HashMap<>();
        report.put("date", date.toString());
        report.put("totalOrders", orders.size());
        report.put("revenue", revenue);
        report.put("averageOrderValue", orders.isEmpty() ? 0 : revenue / orders.size());
        return report;
    }

    public List<Map<String, Object>> getHourlyReport(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findByOrderTimeBetween(start, end);

        Map<Integer, List<Order>> byHour = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getOrderTime().getHour()));

        List<Map<String, Object>> hourlyData = new ArrayList<>();
        for (int h = 8; h <= 22; h++) {
            Map<String, Object> data = new HashMap<>();
            List<Order> hourOrders = byHour.getOrDefault(h, Collections.emptyList());
            data.put("hour", h);
            data.put("orders", hourOrders.size());
            data.put("revenue", hourOrders.stream().mapToDouble(Order::getTotalAmount).sum());
            hourlyData.add(data);
        }
        return hourlyData;
    }

    public List<Map<String, Object>> getWeeklyReport() {
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            weeklyData.add(getDailyReport(date));
        }
        return weeklyData;
    }

    public Map<String, Object> getRevenueReport(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findByOrderTimeBetween(start, end);

        double totalRevenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount).sum();

        Map<String, Long> byCategory = new HashMap<>();
        orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .flatMap(o -> o.getItems().stream())
                .forEach(item -> byCategory.merge(item.getMenuItemName(), (long) item.getQuantity(), Long::sum));

        Map<String, Object> report = new HashMap<>();
        report.put("from", from.toString());
        report.put("to", to.toString());
        report.put("totalRevenue", totalRevenue);
        report.put("totalOrders", orders.size());
        report.put("averageOrderValue", orders.isEmpty() ? 0 : totalRevenue / orders.size());
        report.put("itemBreakdown", byCategory);
        return report;
    }

    public List<Map<String, Object>> getTopItems(int limit) {
        List<MenuItem> allItems = menuItemRepository.findAll();
        return allItems.stream()
                .sorted(Comparator.comparingInt(MenuItem::getTotalOrders).reversed())
                .limit(limit)
                .map(item -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", item.getName());
                    map.put("totalOrders", item.getTotalOrders());
                    map.put("price", item.getPrice());
                    map.put("revenue", item.getPrice() * item.getTotalOrders());
                    map.put("category", item.getCategory());
                    map.put("rating", item.getRating());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
