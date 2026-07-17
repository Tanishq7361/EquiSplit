package com.equisplit.service;

import com.equisplit.dto.request.CreateExpenseRequest;
import com.equisplit.dto.request.UpdateExpenseRequest;
import com.equisplit.dto.response.ExpenseResponse;
import com.equisplit.dto.response.ExpenseSummaryResponse;
import com.equisplit.dto.response.MonthlyExpenseResponse;
import com.equisplit.dto.response.BalanceResponse;
import com.equisplit.dto.response.CategoryExpenseResponse;
import com.equisplit.dto.response.DebtResponse;

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

    void deleteExpense(
        Long groupId,
        Long expenseId,
        String userEmail);

    List<DebtResponse> getSimplifiedDebts(
        Long groupId,
        String userEmail);

    ExpenseResponse updateExpense(
            Long groupId,
            Long expenseId,
            UpdateExpenseRequest request,
            String userEmail
    );

    ExpenseSummaryResponse getExpense(
            Long groupId,
            Long expenseId,
            String userEmail
    );

    List<CategoryExpenseResponse> getCategorySummary(Long groupId, String userEmail);

    List<CategoryExpenseResponse> getOverallCategorySummary(String userEmail);

    List<MonthlyExpenseResponse> getMonthlyExpenseSummary(String email);
}