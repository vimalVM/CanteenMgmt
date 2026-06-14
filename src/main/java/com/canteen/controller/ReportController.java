package com.canteen.controller;

import com.canteen.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/daily")
    public ResponseEntity<Map<String, Object>> getDailyReport(
            @RequestParam(required = false) String date) {
        LocalDate reportDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(orderService.getDailyReport(reportDate));
    }

    @GetMapping("/hourly")
    public ResponseEntity<List<Map<String, Object>>> getHourlyReport(
            @RequestParam(required = false) String date) {
        LocalDate reportDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(orderService.getHourlyReport(reportDate));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyReport() {
        return ResponseEntity.ok(orderService.getWeeklyReport());
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        LocalDate fromDate = from != null ? LocalDate.parse(from) : LocalDate.now().minusDays(30);
        LocalDate toDate = to != null ? LocalDate.parse(to) : LocalDate.now();
        return ResponseEntity.ok(orderService.getRevenueReport(fromDate, toDate));
    }

    @GetMapping("/top-items")
    public ResponseEntity<List<Map<String, Object>>> getTopItems(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(orderService.getTopItems(limit));
    }
}
