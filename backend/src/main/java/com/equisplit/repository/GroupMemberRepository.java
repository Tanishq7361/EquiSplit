package com.equisplit.repository;

import com.equisplit.entity.GroupMember;
import com.equisplit.entity.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByUser(User user);
}