package com.equisplit.service.impl;

import com.equisplit.dto.request.CreateExpenseRequest;
import com.equisplit.dto.response.ExpenseResponse;
import com.equisplit.dto.response.ExpenseSummaryResponse;
import com.equisplit.entity.Expense;
import com.equisplit.entity.ExpenseSplit;
import com.equisplit.entity.GroupMember;
import com.equisplit.exception.UnauthorizedActionException;
import com.equisplit.repository.ExpenseRepository;
import com.equisplit.repository.ExpenseSplitRepository;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.SettlementRepository;
import com.equisplit.repository.UserRepository;
import com.equisplit.entity.Group;
import com.equisplit.entity.User;


import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceImplTest {

    @Mock
    private SettlementRepository settlementRepository;

    @Mock
    private ExpenseSplitRepository expenseSplitRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    @Test
    void createExpense_shouldCreateExpenseAndSplits() {

        User user = User.builder()
                .id(1L)
                .name("QuantumCoder")
                .email("owner@test.com")
                .build();

        Group group = Group.builder()
                .id(1L)
                .name("Goa Trip")
                .build();

        CreateExpenseRequest request =
                new CreateExpenseRequest();

        request.setAmount(BigDecimal.valueOf(1000));
        request.setCategory("FOOD");
        request.setDescription("Dinner");

        GroupMember member1 = GroupMember.builder()
                .user(user)
                .group(group)
                .build();

        User friend = User.builder()
                .id(2L)
                .name("Friend")
                .build();

        GroupMember member2 = GroupMember.builder()
                .user(friend)
                .group(group)
                .build();

        when(userRepository.findByEmail("owner@test.com"))
                .thenReturn(Optional.of(user));

        when(groupRepository.findById(1L))
                .thenReturn(Optional.of(group));

        when(groupMemberRepository.findByGroupAndUser(group, user))
                .thenReturn(Optional.of(member1));

        Expense savedExpense = Expense.builder()
                .id(1L)
                .amount(BigDecimal.valueOf(1000))
                .build();

        when(expenseRepository.save(any(Expense.class)))
                .thenReturn(savedExpense);

        when(groupMemberRepository.findByGroup(group))
                .thenReturn(List.of(member1, member2));

        ExpenseResponse response =
                expenseService.createExpense(
                        1L,
                        request,
                        "owner@test.com"
                );

        assertNotNull(response);

        verify(expenseRepository)
                .save(any(Expense.class));

        verify(expenseSplitRepository, times(2))
                .save(any(ExpenseSplit.class));
    }

    @Test
    void createExpense_shouldThrowWhenUserNotMember() {

        User user = User.builder()
                .email("owner@test.com")
                .build();

        Group group = Group.builder()
                .id(1L)
                .build();

        CreateExpenseRequest request =
                new CreateExpenseRequest();

        request.setAmount(BigDecimal.valueOf(1000));

        when(userRepository.findByEmail("owner@test.com"))
                .thenReturn(Optional.of(user));

        when(groupRepository.findById(1L))
                .thenReturn(Optional.of(group));

        when(groupMemberRepository.findByGroupAndUser(group, user))
                .thenReturn(Optional.empty());

        assertThrows(
                UnauthorizedActionException.class,
                () -> expenseService.createExpense(
                        1L,
                        request,
                        "owner@test.com"
                )
        );

        verify(expenseRepository, never())
                .save(any());
    }

    @Test
    void getGroupExpenses_shouldReturnExpenses() {

        User user = User.builder()
                .email("owner@test.com")
                .build();

        Group group = Group.builder()
                .id(1L)
                .build();

        Expense expense = Expense.builder()
                .id(1L)
                .amount(BigDecimal.valueOf(1000))
                .category("FOOD")
                .description("Dinner")
                .paidBy(user)
                .build();

        when(userRepository.findByEmail("owner@test.com"))
                .thenReturn(Optional.of(user));

        when(groupRepository.findById(1L))
                .thenReturn(Optional.of(group));

        when(groupMemberRepository.findByGroupAndUser(group, user))
                .thenReturn(Optional.of(mock(GroupMember.class)));

        when(expenseRepository.findByGroup(group))
                .thenReturn(List.of(expense));

        List<ExpenseSummaryResponse> result =
                expenseService.getGroupExpenses(
                        1L,
                        "owner@test.com"
                );

        assertEquals(1, result.size());

        assertEquals(
                "Dinner",
                result.getFirst().getDescription()
        );
    }
}