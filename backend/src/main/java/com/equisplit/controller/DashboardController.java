package com.equisplit.controller;

import com.equisplit.dto.response.CategoryExpenseResponse;
import com.equisplit.dto.response.DashboardResponse;
import com.equisplit.service.DashboardService;
import com.equisplit.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.equisplit.dto.response.MonthlyExpenseResponse;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

        private final DashboardService dashboardService;
        private final ExpenseService expenseService;
        
        @GetMapping
        public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {

                DashboardResponse response = dashboardService.getDashboard(authentication.getName());
                return ResponseEntity.ok(response);
        }

        @GetMapping("/category-summary")
        public ResponseEntity<List<CategoryExpenseResponse>>getOverallCategorySummary(Authentication authentication) {
                return ResponseEntity.ok(dashboardService.getOverallCategorySummary(authentication.getName()));
        }

        @GetMapping("/monthly-summary")
        public ResponseEntity<List<MonthlyExpenseResponse>>getMonthlySummary(Authentication authentication){
                return ResponseEntity.ok(expenseService.getMonthlyExpenseSummary(authentication.getName()));
        }
}