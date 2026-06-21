package com.equisplit.repository;

import com.equisplit.entity.Expense;
import com.equisplit.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import com.equisplit.entity.User;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    boolean existsByGroupAndPaidBy(Group group, User user);
    List<Expense> findByGroup(Group group);
    void deleteByGroup(Group group);
    List<Expense> findByPaidBy(User user);
}