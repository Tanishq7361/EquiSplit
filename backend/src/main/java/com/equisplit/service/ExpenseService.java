package com.equisplit.service;

import com.equisplit.dto.request.CreateExpenseRequest;
import com.equisplit.dto.response.ExpenseResponse;
import com.equisplit.dto.response.ExpenseSummaryResponse;
import com.equisplit.dto.response.BalanceResponse;

import java.math.BigDecimal;
import java.util.List;

public interface ExpenseService {

    ExpenseResponse createExpense(
            Long groupId,
            CreateExpenseRequest request,
            String userEmail
    );

    List<BalanceResponse> getGroupBalances(
        Long groupId,
        String userEmail
    );

    List<ExpenseSummaryResponse> getGroupExpenses(
        Long groupId,
        String userEmail
    );

    BigDecimal getOutstandingBalance(String userEmail);

}