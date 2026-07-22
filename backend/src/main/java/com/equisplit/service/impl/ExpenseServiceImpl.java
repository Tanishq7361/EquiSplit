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
import com.equisplit.dto.response.ExpenseSplitResponse;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import com.equisplit.dto.response.BalanceResponse;
import com.equisplit.dto.response.CategoryExpenseResponse;

import java.util.List;
import java.util.PriorityQueue;
import com.equisplit.repository.SettlementRepository;
import com.equisplit.dto.response.ExpenseSummaryResponse;
import com.equisplit.dto.response.MonthlyExpenseResponse;

import org.springframework.transaction.annotation.Transactional;
import com.equisplit.dto.response.DebtResponse;
import com.equisplit.dto.request.UpdateExpenseRequest;
import java.util.ArrayList;

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

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        
        

        User payer = userRepository.findById(
                        request.getPaidByUserId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException("Payer not found"));

        groupMemberRepository.findByGroupAndUser(group, payer)
            .orElseThrow(() ->
                    new UnauthorizedActionException("Payer are not a member of this group"));
        Expense expense = Expense.builder()
                .group(group)
                .paidBy(payer)
                .amount(request.getAmount())
                .category(request.getCategory())
                .description(request.getDescription())
                .splitType(request.getSplitType())
                .createdAt(OffsetDateTime.now())
                .build();

        Expense savedExpense = expenseRepository.save(expense);

        var members = groupMemberRepository.findByGroup(group);

        members = members.stream()
                .filter(member ->
                        request.getParticipantIds()
                                .contains(member.getUser().getId()))
                .toList();

        if (members.isEmpty()) {
                throw new IllegalArgumentException(
                        "Select at least one participant."
                );
        }

        switch (request.getSplitType()) {

        case "EQUAL" -> {

                int memberCount = members.size();

                BigDecimal equalShare = request.getAmount()
                        .divide(
                                BigDecimal.valueOf(memberCount),
                                2,
                                java.math.RoundingMode.DOWN
                        );

                BigDecimal assigned = BigDecimal.ZERO;

                for (int i = 0; i < members.size(); i++) {

                GroupMember member = members.get(i);

                BigDecimal share;

                if (i == members.size() - 1) {
                        share = request.getAmount().subtract(assigned);
                } else {
                        share = equalShare;
                        assigned = assigned.add(equalShare);
                }

                expenseSplitRepository.save(
                        ExpenseSplit.builder()
                                .expense(savedExpense)
                                .user(member.getUser())
                                .shareAmount(share)
                                .build()
                );
                }
        }

        case "EXACT" -> {

                BigDecimal total = request.getSplits()
                        .stream()
                        .map(split -> split.getValue())
                        .reduce(BigDecimal.ZERO,(a, b) -> a.add(b));

                if (total.compareTo(request.getAmount()) != 0) {
                throw new IllegalArgumentException(
                        "Split amounts must equal expense amount"
                );
                }

                for (var split : request.getSplits()) {

                User splitUser = userRepository.findById(split.getUserId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException("User not found"));

                expenseSplitRepository.save(
                        ExpenseSplit.builder()
                                .expense(savedExpense)
                                .user(splitUser)
                                .shareAmount(split.getValue())
                                .build()
                );
                }
        }

        case "PERCENTAGE" -> {

                BigDecimal totalPercentage = request.getSplits()
                        .stream()
                        .map(split -> split.getValue())
                        .reduce(BigDecimal.ZERO,(a, b) -> a.add(b));

                if (totalPercentage.compareTo(BigDecimal.valueOf(100)) != 0) {
                throw new IllegalArgumentException(
                        "Percentages must sum to 100"
                );
                }

                for (var split : request.getSplits()) {

                User splitUser = userRepository.findById(split.getUserId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException("User not found"));

                BigDecimal share = request.getAmount()
                        .multiply(split.getValue())
                        .divide(BigDecimal.valueOf(100), 2,
                                java.math.RoundingMode.HALF_UP);

                expenseSplitRepository.save(
                        ExpenseSplit.builder()
                                .expense(savedExpense)
                                .user(splitUser)
                                .shareAmount(share)
                                .build()
                );
                }
        }

        default -> throw new IllegalArgumentException(
                "Invalid split type"
        );
        }
        

        return ExpenseResponse.builder()
                .id(savedExpense.getId())
                .amount(savedExpense.getAmount())
                .category(savedExpense.getCategory())
                .description(savedExpense.getDescription())
                .paidBy(payer.getName())
                .build();
        }



        @Override
        @Transactional
        public ExpenseResponse updateExpense(
                Long groupId,
                Long expenseId,
                UpdateExpenseRequest request,
                String userEmail) {

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, currentUser)
                .orElseThrow(() ->
                        new UnauthorizedActionException(
                                "You are not a member of this group"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Expense not found"));

        User paidBy = userRepository.findById(request.getPaidBy())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Paid by user not found"));

        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setSplitType(request.getSplitType());
        expense.setPaidBy(paidBy);

        expenseRepository.save(expense);

        expenseSplitRepository.deleteAll(expenseSplitRepository.findByExpense(expense));

        expenseSplitRepository.flush();

        createExpenseSplits(expense, request, group);

        return ExpenseResponse.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .paidBy(paidBy.getName())
                .build();
        }

        @Override
        public ExpenseSummaryResponse getExpense(
                Long groupId,
                Long expenseId,
                String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() ->
                        new UnauthorizedActionException(
                                "You are not a member of this group"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Expense not found"));

        List<ExpenseSplitResponse> splits =
                expenseSplitRepository.findByExpense(expense)
                        .stream()
                        .map(split -> ExpenseSplitResponse.builder()
                                .userId(split.getUser().getId())
                                .userName(split.getUser().getName())
                                .shareAmount(split.getShareAmount())
                                .build())
                        .toList();

        return ExpenseSummaryResponse.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .paidBy(expense.getPaidBy().getName())
                .paidById(expense.getPaidBy().getId())
                .splitType(expense.getSplitType())
                .createdAt(expense.getCreatedAt())
                .splits(splits)
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
                                        .map(expense -> expense.getAmount())
                                        .reduce(
                                                BigDecimal.ZERO,
                                                (a, b) -> a.add(b)
                                        );

                        java.math.BigDecimal owes =
                                expenses.stream()
                                        .flatMap(expense ->
                                                expenseSplitRepository.findByExpense(expense).stream())
                                        .filter(split ->
                                                split.getUser().getId().equals(memberUser.getId()))
                                        .map(split -> split.getShareAmount())
                                        .reduce(
                                                BigDecimal.ZERO,
                                                (a, b) -> a.add(b)
                                        );

                        java.math.BigDecimal sentSettlements =
                                settlements.stream()
                                        .filter(settlement ->
                                                settlement.getPayer().getId().equals(memberUser.getId()))
                                        .map(settlement -> settlement.getAmount())
                                        .reduce(
                                                BigDecimal.ZERO,
                                                (a, b) -> a.add(b)
                                        );

                        java.math.BigDecimal receivedSettlements =
                                settlements.stream()
                                        .filter(settlement ->
                                                settlement.getReceiver().getId().equals(memberUser.getId()))
                                        .map(settlement -> settlement.getAmount())
                                        .reduce(
                                                BigDecimal.ZERO,
                                                (a, b) -> a.add(b)
                                        );

                        java.math.BigDecimal balance = paid
                                .subtract(owes)
                                .add(sentSettlements)
                                .subtract(receivedSettlements);

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
                .orElseThrow(() -> new UnauthorizedActionException("You are not a member of this group"));

        return expenseRepository.findByGroup(group)
                .stream()
                .map(expense -> {

                List<ExpenseSplitResponse> splits =
                        expenseSplitRepository.findByExpense(expense)
                                .stream()
                                .map(split -> ExpenseSplitResponse.builder()
                                        .userId(split.getUser().getId())
                                        .userName(split.getUser().getName())
                                        .shareAmount(split.getShareAmount())
                                        .build())
                                .toList();

                return ExpenseSummaryResponse.builder()
                        .id(expense.getId())
                        .amount(expense.getAmount())
                        .category(expense.getCategory())
                        .description(expense.getDescription())
                        .paidBy(expense.getPaidBy().getName())
                        .paidById(expense.getPaidBy().getId())
                        .splitType(expense.getSplitType())
                        .createdAt(expense.getCreatedAt())
                        .splits(splits)
                        .build();
                })
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
                                .map(balance -> balance.getBalance())
                                .orElse(java.math.BigDecimal.ZERO);

                })
                .reduce(
                        BigDecimal.ZERO,
                        (a, b) -> a.add(b)
                );
        }

        @Override
        @Transactional
        public void deleteExpense(
                Long groupId,
                Long expenseId,
                String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new UnauthorizedActionException("You are not a member of this group"));

        expenseSplitRepository.deleteAll(expenseSplitRepository.findByExpense(expense));

        expenseRepository.delete(expense);
        }

        @Override
        public List<DebtResponse> getSimplifiedDebts(Long groupId, String userEmail) {

                List<BalanceResponse> balances = getGroupBalances(groupId, userEmail);

                PriorityQueue<BalanceResponse> creditors = new PriorityQueue<>(
                        (a, b) -> b.getBalance().compareTo(a.getBalance())
                );

                PriorityQueue<BalanceResponse> debtors = new PriorityQueue<>(
                        (a, b) -> b.getBalance().abs().compareTo(a.getBalance().abs())
                );

                for (BalanceResponse balance : balances) {
                        if (balance.getBalance().compareTo(BigDecimal.ZERO) > 0) {
                                creditors.offer(balance);
                        } else if (balance.getBalance().compareTo(BigDecimal.ZERO) < 0) {
                                debtors.offer(balance);
                        }
                }

                List<DebtResponse> debts = new ArrayList<>();

                while (!creditors.isEmpty() && !debtors.isEmpty()) {

                        BalanceResponse creditor = creditors.poll();
                        BalanceResponse debtor = debtors.poll();

                        BigDecimal transfer = creditor.getBalance().min(debtor.getBalance().abs());

                        debts.add(
                                DebtResponse.builder()
                                        .fromUser(debtor.getUserName())
                                        .toUser(creditor.getUserName())
                                        .amount(transfer)
                                        .build()
                        );

                        BigDecimal creditorRemaining = creditor.getBalance().subtract(transfer);

                        BigDecimal debtorRemaining = debtor.getBalance().abs().subtract(transfer);

                        if (creditorRemaining.compareTo(BigDecimal.ZERO) > 0) {
                                creditor.setBalance(creditorRemaining);
                                creditors.offer(creditor);
                        }

                        if (debtorRemaining.compareTo(BigDecimal.ZERO) > 0) {
                                debtor.setBalance(debtorRemaining.negate());
                                debtors.offer(debtor);
                        }
                }
                
                return debts;
        }

        private void createExpenseSplits(Expense expense, UpdateExpenseRequest request, Group group) {

        switch (request.getSplitType()) {

                case "EQUAL" -> {

                        var participants = request.getSplits();

                        if (participants == null || participants.isEmpty()) {
                                throw new IllegalArgumentException("Select at least one participant.");
                        }

                        int memberCount = participants.size();

                        BigDecimal equalShare = request.getAmount()
                                .divide(
                                        BigDecimal.valueOf(memberCount),
                                        2,
                                        java.math.RoundingMode.DOWN
                                );

                        BigDecimal assigned = BigDecimal.ZERO;

                        for (int i = 0; i < participants.size(); i++) {

                                User user = userRepository.findById(
                                        participants.get(i).getUserId()
                                ).orElseThrow(() ->
                                        new ResourceNotFoundException("User not found"));

                                BigDecimal share;

                                if (i == participants.size() - 1) {
                                share = request.getAmount().subtract(assigned);
                                } else {
                                share = equalShare;
                                assigned = assigned.add(equalShare);
                                }

                                expenseSplitRepository.save(
                                        ExpenseSplit.builder()
                                                .expense(expense)
                                                .user(user)
                                                .shareAmount(share)
                                                .build()
                                );
                        }
                }

                case "EXACT" -> {

                        for (var split : request.getSplits()) {

                                User user = userRepository.findById(split.getUserId())
                                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                                expenseSplitRepository.save(
                                        ExpenseSplit.builder()
                                                .expense(expense)
                                                .user(user)
                                                .shareAmount(split.getValue())
                                                .build()
                                );
                        }
                }

                case "PERCENTAGE" -> {

                for (var split : request.getSplits()) {

                        User user = userRepository.findById(split.getUserId())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                        BigDecimal share = request.getAmount()
                                .multiply(split.getValue())
                                .divide(
                                        BigDecimal.valueOf(100),
                                        2,
                                        java.math.RoundingMode.HALF_UP
                                );

                        expenseSplitRepository.save(
                                ExpenseSplit.builder()
                                        .expense(expense)
                                        .user(user)
                                        .shareAmount(share)
                                        .build()
                        );
                }
                }

                default ->
                        throw new IllegalArgumentException("Invalid split type");
        }
        }


        @Override
        public List<CategoryExpenseResponse> getCategorySummary(
                Long groupId,
                String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new UnauthorizedActionException("You are not a member of this group"));

        return expenseRepository
                .getCategorySummary(groupId)
                .stream()
                .map(result ->
                        CategoryExpenseResponse.builder()
                                .category((String) result[0])
                                .amount((BigDecimal) result[1])
                                .build())
                .toList();
        }
        

        @Override
        public List<CategoryExpenseResponse> getOverallCategorySummary(
                String userEmail) {

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

        @Override
        public List<MonthlyExpenseResponse>
        getMonthlyExpenseSummary(
                String email
        ) {

        return expenseRepository
                .getMonthlyExpenseSummary(email)
                .stream()
                .map(row ->

                        MonthlyExpenseResponse.builder()

                                .month((String) row[0])

                                .totalAmount(
                                        (BigDecimal) row[1]
                                )

                                .build()

                )
                .toList();

        }
}