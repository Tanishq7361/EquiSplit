package com.equisplit.controller;

import com.equisplit.dto.request.CreateExpenseRequest;
import com.equisplit.dto.response.BalanceResponse;
import com.equisplit.dto.response.ExpenseSummaryResponse;

import java.math.BigDecimal;
import java.util.List;
import com.equisplit.dto.response.ExpenseResponse;
import com.equisplit.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateExpenseRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                expenseService.createExpense(
                        groupId,
                        request,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/balances")
        public ResponseEntity<List<BalanceResponse>> getBalances(
                @PathVariable Long groupId,
                Authentication authentication) {

        return ResponseEntity.ok(
                expenseService.getGroupBalances(
                        groupId,
                        authentication.getName()
                )
        );
        }

        @GetMapping
        public ResponseEntity<List<ExpenseSummaryResponse>> getGroupExpenses(
                @PathVariable Long groupId,
                Authentication authentication) {

        return ResponseEntity.ok(
                expenseService.getGroupExpenses(
                        groupId,
                        authentication.getName()
                )
        );
        }

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
