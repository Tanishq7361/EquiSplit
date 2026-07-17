package com.equisplit.service.impl;
import org.springframework.stereotype.Service;

import com.equisplit.dto.response.DashboardResponse;
import com.equisplit.entity.User;
import com.equisplit.entity.Expense;
import com.equisplit.entity.GroupMember;
import com.equisplit.exception.ResourceNotFoundException;
import com.equisplit.repository.ExpenseRepository;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.SettlementRepository;
import com.equisplit.repository.UserRepository;
import com.equisplit.service.DashboardService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import com.equisplit.dto.response.CategoryExpenseResponse;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;

        @Override
        public DashboardResponse getDashboard(String userEmail) {

                User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                List<GroupMember> memberships = groupMemberRepository.findByUser(user);

                long totalGroups = memberships.size();

                long totalExpenses = 0;

                BigDecimal totalExpenseAmount = BigDecimal.ZERO;

                for(GroupMember membership : memberships) {
                        List<Expense> expenses = expenseRepository.findByGroup(membership.getGroup());
                        totalExpenses += expenses.size();
                        for(Expense expense : expenses) {
                                totalExpenseAmount = totalExpenseAmount.add(expense.getAmount());
                        }
                }

                long totalSettlements =
                        settlementRepository.findByPayer(user).size();

                return DashboardResponse.builder()
                        .totalGroups(totalGroups)
                        .totalExpenses(totalExpenses)
                        .totalSettlements(totalSettlements)
                        .totalExpenseAmount(totalExpenseAmount)
                        .build();
        }

        @Override
        public List<CategoryExpenseResponse> getOverallCategorySummary(String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                return expenseRepository
                        .getOverallCategorySummary(user.getId())
                        .stream()
                        .map(result ->
                                CategoryExpenseResponse.builder()
                                        .category(result[0].toString())
                                        .amount((BigDecimal) result[1])
                                        .build())
                        .toList();
        }
}
