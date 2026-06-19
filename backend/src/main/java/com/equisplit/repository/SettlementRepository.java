package com.equisplit.repository;

import com.equisplit.entity.Group;
import com.equisplit.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import com.equisplit.entity.User;

import java.util.List;

public interface SettlementRepository
        extends JpaRepository<Settlement, Long> {

    List<Settlement> findByGroup(Group group);
    boolean existsByGroupAndPayer(Group group, User user);
    boolean existsByGroupAndReceiver(Group group, User user);
}