package com.equisplit.service.impl;
import com.equisplit.dto.response.GroupSummaryResponse;
import java.util.List;
import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.response.GroupResponse;
import com.equisplit.entity.Group;
import com.equisplit.entity.GroupMember;
import com.equisplit.entity.GroupRole;
import com.equisplit.entity.User;
import com.equisplit.exception.ResourceNotFoundException;
import com.equisplit.exception.UnauthorizedActionException;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.SettlementRepository;
import com.equisplit.repository.UserRepository;
import com.equisplit.service.GroupService;
import lombok.RequiredArgsConstructor;
import com.equisplit.dto.request.AddMemberRequest;
import org.springframework.stereotype.Service;
import com.equisplit.dto.response.GroupDetailsResponse;
import com.equisplit.dto.response.GroupMemberResponse;
import com.equisplit.repository.ExpenseRepository;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;

    @Override
    public GroupResponse createGroup(
            CreateGroupRequest request,
            String userEmail) {

        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(creator)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Group savedGroup = groupRepository.save(group);

        GroupMember member = GroupMember.builder()
                .group(savedGroup)
                .user(creator)
                .role(GroupRole.OWNER)
                .joinedAt(OffsetDateTime.now())
                .build();

        groupMemberRepository.save(member);

        return GroupResponse.builder()
                .id(savedGroup.getId())
                .name(savedGroup.getName())
                .description(savedGroup.getDescription())
                .build();
    }

    @Override
        public List<GroupSummaryResponse> getMyGroups(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return groupMemberRepository.findByUser(user)
                .stream()
                .map(member -> {

                        Group group = member.getGroup();

                        int memberCount =
                                groupMemberRepository.findByGroup(group).size();

                        int totalExpenses =
                                expenseRepository.findByGroup(group).size();

                        return GroupSummaryResponse.builder()
                                .id(group.getId())
                                .name(group.getName())
                                .description(group.getDescription())
                                .memberCount(memberCount)
                                .totalExpenses(totalExpenses)
                                .build();
                })
                .toList();
        }

    @Override
    public void addMember(
            Long groupId,
            AddMemberRequest request,
            String userEmail) {

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        GroupMember ownerMembership =
                groupMemberRepository.findByGroupAndUser(group, currentUser)
                        .orElseThrow(() -> new UnauthorizedActionException("You are not a member of this group"));

        if (ownerMembership.getRole() != GroupRole.OWNER) {
            throw new UnauthorizedActionException("Only owner can add members");
        }

        User userToAdd = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User to add not found"));

        boolean alreadyMember =
                groupMemberRepository.findByGroupAndUser(group, userToAdd)
                        .isPresent();

        if (alreadyMember) {
            throw new UnauthorizedActionException("User already in group");
        }

        GroupMember newMember = GroupMember.builder()
                .group(group)
                .user(userToAdd)
                .role(GroupRole.MEMBER)
                .joinedAt(OffsetDateTime.now())
                .build();

        groupMemberRepository.save(newMember);
    }

    @Override
    public GroupDetailsResponse getGroupDetails(
            Long groupId,
            String userEmail) {

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, currentUser)
                .orElseThrow(() -> new UnauthorizedActionException("You are not a member of this group"));

        List<GroupMemberResponse> members =
                groupMemberRepository.findByGroup(group)
                        .stream()
                        .map(member -> GroupMemberResponse.builder()
                                .id(member.getUser().getId())
                                .name(member.getUser().getName())
                                .role(member.getRole().name())
                                .build())
                        .toList();

        return GroupDetailsResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .members(members)
                .build();
    }

    @Override
        public List<GroupMemberResponse> getGroupMembers(
                Long groupId,
                String userEmail) {

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, currentUser)
                .orElseThrow(() ->
                        new UnauthorizedActionException("You are not a member of this group"));

        return groupMemberRepository.findByGroup(group)
                .stream()
                .map(member -> GroupMemberResponse.builder()
                        .id(member.getUser().getId())
                        .name(member.getUser().getName())
                        .email(member.getUser().getEmail())
                        .role(member.getRole().name())
                        .build())
                .toList();
        }

        @Override
        public void removeMember(
                Long groupId,
                Long userId,
                String userEmail) {

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Group not found"));

        GroupMember ownerMembership =
                groupMemberRepository.findByGroupAndUser(group, currentUser)
                        .orElseThrow(() ->
                                new UnauthorizedActionException(
                                        "You are not a member of this group"));

        if (ownerMembership.getRole() != GroupRole.OWNER) {
                throw new UnauthorizedActionException(
                        "Only owner can remove members");
        }

        User memberToRemove = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        GroupMember membership =
                groupMemberRepository.findByGroupAndUser(group, memberToRemove)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Member not found"));

        if (membership.getRole() == GroupRole.OWNER) {
                throw new UnauthorizedActionException(
                        "Owner cannot be removed");
        }

        if (expenseRepository.existsByGroupAndPaidBy(group, memberToRemove)) {
                throw new UnauthorizedActionException(
                        "Member has existing expenses");
        }

        if (settlementRepository.existsByGroupAndPayer(group, memberToRemove)
                || settlementRepository.existsByGroupAndReceiver(group, memberToRemove)) {

                throw new UnauthorizedActionException(
                        "Member has existing settlements");
        }

        groupMemberRepository.deleteByGroupAndUser(group, memberToRemove);
        }
}