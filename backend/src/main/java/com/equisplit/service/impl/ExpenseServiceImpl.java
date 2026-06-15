package com.equisplit.service.impl;

import com.equisplit.dto.request.CreateExpenseRequest;
import com.equisplit.dto.response.ExpenseResponse;
import com.equisplit.entity.Expense;
import com.equisplit.entity.Group;
import com.equisplit.entity.User;
import com.equisplit.repository.ExpenseRepository;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.UserRepository;
import com.equisplit.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Override
    public ExpenseResponse createExpense(
            Long groupId,
            CreateExpenseRequest request,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        
        groupMemberRepository.findByGroupAndUser(group, user)
            .orElseThrow(() ->
                    new RuntimeException("You are not a member of this group"));

        Expense expense = Expense.builder()
                .group(group)
                .paidBy(user)
                .amount(request.getAmount())
                .category(request.getCategory())
                .description(request.getDescription())
                .splitType("EQUAL")
                .createdAt(OffsetDateTime.now())
                .build();

        Expense savedExpense = expenseRepository.save(expense);

        return ExpenseResponse.builder()
                .id(savedExpense.getId())
                .amount(savedExpense.getAmount())
                .category(savedExpense.getCategory())
                .description(savedExpense.getDescription())
                .paidBy(user.getName())
                .build();
    }
}