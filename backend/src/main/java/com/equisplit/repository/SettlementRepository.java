package com.equisplit.repository;

import com.equisplit.entity.Group;
import com.equisplit.entity.Settlement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.equisplit.entity.User;

import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    List<Settlement> findByGroup(Group group);
    Page<Settlement> findByGroupOrderByCreatedAtDesc(Group group, Pageable pageable);
    boolean existsByGroupAndPayer(Group group, User user);
    boolean existsByGroupAndReceiver(Group group, User user);
    void deleteByGroup(Group group);
    List<Settlement> findByPayer(User payer);
}