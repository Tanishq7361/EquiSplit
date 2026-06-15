package com.equisplit.service;

import com.equisplit.dto.request.CreateExpenseRequest;
import com.equisplit.dto.response.ExpenseResponse;

public interface ExpenseService {

    ExpenseResponse createExpense(
            Long groupId,
            CreateExpenseRequest request,
            String userEmail
    );
}