package com.equisplit.repository;

import com.equisplit.entity.Group;
import com.equisplit.entity.GroupMember;
import com.equisplit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    List<GroupMember> findByUser(User user);

    Optional<GroupMember> findByGroupAndUser(Group group, User user);
    void deleteByGroupAndUser(Group group, User user);
    List<GroupMember> findByGroup(Group group);
    void deleteByGroup(Group group);
}