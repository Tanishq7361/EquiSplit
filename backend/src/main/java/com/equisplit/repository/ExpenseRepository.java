package com.equisplit.repository;

import com.equisplit.entity.Expense;
import com.equisplit.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import com.equisplit.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    boolean existsByGroupAndPaidBy(Group group, User user);
    List<Expense> findByGroup(Group group);
    
    @Query("""
    SELECT e
    FROM Expense e
    WHERE e.group.id = :groupId
      AND (:search IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Expense> findByGroupIdAndSearch(
            @Param("groupId") Long groupId,
            @Param("search") String search,
            Pageable pageable
    );
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

    @Query("""
    SELECT e.category, SUM(e.amount)
    FROM Expense e
    WHERE e.group.id IN (
        SELECT gm.group.id
        FROM GroupMember gm
        WHERE gm.user.id = :userId
    )
    GROUP BY e.category
    """)
    List<Object[]> getOverallCategorySummary(
            @Param("userId") Long userId
    );

    @Query("""
    SELECT
    FUNCTION('TO_CHAR', e.createdAt, 'Mon'),
    SUM(e.amount)
    FROM Expense e
    WHERE e.group IN (
        SELECT gm.group
        FROM GroupMember gm
        WHERE gm.user.email = :email
    )
    GROUP BY
    FUNCTION('TO_CHAR', e.createdAt, 'Mon'),
    FUNCTION('DATE_TRUNC','month',e.createdAt)
    ORDER BY
    FUNCTION('DATE_TRUNC','month',e.createdAt)
    """)
    List<Object[]> getMonthlyExpenseSummary(
            @Param("email")
            String email
    );
}