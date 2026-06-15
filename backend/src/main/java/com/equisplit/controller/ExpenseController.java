package com.equisplit.controller;

import com.equisplit.dto.request.CreateExpenseRequest;
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
}