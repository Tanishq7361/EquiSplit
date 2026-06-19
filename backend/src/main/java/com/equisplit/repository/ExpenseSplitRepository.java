package com.equisplit.repository;

import com.equisplit.entity.Expense;
import com.equisplit.entity.ExpenseSplit;
import com.equisplit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseSplitRepository
        extends JpaRepository<ExpenseSplit, Long> {

    List<ExpenseSplit> findByExpense(Expense expense);

    List<ExpenseSplit> findByUser(User user);
    void deleteByExpense(Expense expense);
    void deleteByExpenseIn(List<Expense> expenses);
}