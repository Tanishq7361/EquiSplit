package com.equisplit.service.impl;

import com.equisplit.dto.request.CreateExpenseRequest;
import com.equisplit.dto.response.ExpenseResponse;
import com.equisplit.entity.Expense;
import com.equisplit.entity.Group;
import com.equisplit.entity.GroupMember;
import com.equisplit.entity.User;
import com.equisplit.exception.ResourceNotFoundException;
import com.equisplit.exception.UnauthorizedActionException;
import com.equisplit.repository.ExpenseRepository;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.UserRepository;
import com.equisplit.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.equisplit.entity.ExpenseSplit;
import com.equisplit.repository.ExpenseSplitRepository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import com.equisplit.dto.response.BalanceResponse;
import java.util.List;
import com.equisplit.entity.Settlement;
import com.equisplit.repository.SettlementRepository;
import com.equisplit.dto.response.ExpenseSummaryResponse;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {
        
    private final SettlementRepository settlementRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Override
        @Transactional
        public ExpenseResponse createExpense(
                Long groupId,
                CreateExpenseRequest request,
                String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        
        groupMemberRepository.findByGroupAndUser(group, user)
            .orElseThrow(() ->
                    new UnauthorizedActionException("You are not a member of this group"));

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

        var members = groupMemberRepository.findByGroup(group);

        int memberCount = members.size();

        var equalShare = request.getAmount()
        .divide(
                java.math.BigDecimal.valueOf(memberCount),
                2,
                java.math.RoundingMode.DOWN
        );

        java.math.BigDecimal assigned =
                java.math.BigDecimal.ZERO;

        for (int i = 0; i < members.size(); i++) {

                GroupMember member = members.get(i);

                java.math.BigDecimal share;

                if (i == members.size() - 1) {
                        share = request.getAmount().subtract(assigned);
                } else {
                        share = equalShare;
                        assigned = assigned.add(equalShare);
                }

                ExpenseSplit split = ExpenseSplit.builder()
                        .expense(savedExpense)
                        .user(member.getUser())
                        .shareAmount(share)
                        .build();

                expenseSplitRepository.save(split);
        }

        return ExpenseResponse.builder()
                .id(savedExpense.getId())
                .amount(savedExpense.getAmount())
                .category(savedExpense.getCategory())
                .description(savedExpense.getDescription())
                .paidBy(user.getName())
                .build();
    }

    @Override
        public List<BalanceResponse> getGroupBalances(
                Long groupId,
                String userEmail) {

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, currentUser)
                .orElseThrow(() ->
                        new UnauthorizedActionException("You are not a member of this group"));

        var members = groupMemberRepository.findByGroup(group);

        var expenses = expenseRepository.findByGroup(group);

        var settlements = settlementRepository.findByGroup(group);

        return members.stream()
                .map(member -> {

                        User memberUser = member.getUser();

                        java.math.BigDecimal paid =
                                expenses.stream()
                                        .filter(expense ->
                                                expense.getPaidBy().getId().equals(memberUser.getId()))
                                        .map(Expense::getAmount)
                                        .reduce(
                                                java.math.BigDecimal.ZERO,
                                                java.math.BigDecimal::add
                                        );

                        java.math.BigDecimal owes =
                                expenses.stream()
                                        .flatMap(expense ->
                                                expenseSplitRepository.findByExpense(expense).stream())
                                        .filter(split ->
                                                split.getUser().getId().equals(memberUser.getId()))
                                        .map(split -> split.getShareAmount())
                                        .reduce(
                                                java.math.BigDecimal.ZERO,
                                                java.math.BigDecimal::add
                                        );

                        java.math.BigDecimal sentSettlements =
                                settlements.stream()
                                        .filter(settlement ->
                                                settlement.getPayer().getId().equals(memberUser.getId()))
                                        .map(Settlement::getAmount)
                                        .reduce(
                                                java.math.BigDecimal.ZERO,
                                                java.math.BigDecimal::add
                                        );

                        java.math.BigDecimal receivedSettlements =
                                settlements.stream()
                                        .filter(settlement ->
                                                settlement.getReceiver().getId().equals(memberUser.getId()))
                                        .map(Settlement::getAmount)
                                        .reduce(
                                                java.math.BigDecimal.ZERO,
                                                java.math.BigDecimal::add
                                        );

                        java.math.BigDecimal balance = paid
                                .subtract(owes)
                                .add(sentSettlements)
                                .subtract(receivedSettlements);
                        
                        // java.math.BigDecimal remainingOwes = owes
                        //         .subtract(sentSettlements)
                        //         .add(receivedSettlements);
                        return BalanceResponse.builder()
                                .userName(memberUser.getName())
                                .paid(paid)
                                .owes(owes)
                                .balance(balance)
                                .build();
                })
                .toList();
        }

        @Override
        public List<ExpenseSummaryResponse> getGroupExpenses(
                Long groupId,
                String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() ->
                        new UnauthorizedActionException("You are not a member of this group"));

        return expenseRepository.findByGroup(group)
                .stream()
                .map(expense -> ExpenseSummaryResponse.builder()
                        .id(expense.getId())
                        .amount(expense.getAmount())
                        .category(expense.getCategory())
                        .description(expense.getDescription())
                        .paidBy(expense.getPaidBy().getName())
                        .build())
                .toList();
        }
        @Override
        public BigDecimal getOutstandingBalance(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<GroupMember> memberships =
                groupMemberRepository.findByUser(user);

        return memberships.stream()
                .map(member -> {

                        Long groupId = member.getGroup().getId();

                        return getGroupBalances(groupId, userEmail)
                                .stream()
                                .filter(balance ->
                                        balance.getUserName().equals(user.getName()))
                                .findFirst()
                                .map(BalanceResponse::getBalance)
                                .orElse(java.math.BigDecimal.ZERO);

                })
                .reduce(
                        java.math.BigDecimal.ZERO,
                        java.math.BigDecimal::add
                );
        }
}