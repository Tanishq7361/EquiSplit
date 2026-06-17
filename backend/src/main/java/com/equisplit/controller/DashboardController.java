package com.equisplit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.equisplit.service.ExpenseService;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ExpenseService expenseService;

    @GetMapping("/outstanding")
    public ResponseEntity<BigDecimal> getOutstandingBalance(
            Authentication authentication) {

        return ResponseEntity.ok(
                expenseService.getOutstandingBalance(
                        authentication.getName()
                )
        );
    }
}