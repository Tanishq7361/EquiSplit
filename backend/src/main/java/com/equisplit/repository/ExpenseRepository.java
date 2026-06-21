package com.equisplit.repository;

import com.equisplit.entity.Expense;
import com.equisplit.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import com.equisplit.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    boolean existsByGroupAndPaidBy(Group group, User user);
    List<Expense> findByGroup(Group group);
    void deleteByGroup(Group group);
    List<Expense> findByPaidBy(User user);

    @Query("""
    SELECT e.category, SUM(e.amount)
    FROM Expense e
    WHERE e.group.id = :groupId
    GROUP BY e.category
    """)
    List<Object[]> getCategorySummary(
            @Param("groupId") Long groupId
    );
}