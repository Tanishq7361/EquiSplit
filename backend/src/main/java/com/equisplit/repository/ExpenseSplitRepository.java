package com.equisplit.repository;

import com.equisplit.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseSplitRepository
        extends JpaRepository<ExpenseSplit, Long> {
}