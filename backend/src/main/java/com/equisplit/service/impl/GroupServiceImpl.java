package com.equisplit.service.impl;
import com.equisplit.dto.response.GroupSummaryResponse;
import java.util.List;
import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.response.GroupResponse;
import com.equisplit.entity.Group;
import com.equisplit.entity.GroupMember;
import com.equisplit.entity.GroupRole;
import com.equisplit.entity.User;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.UserRepository;
import com.equisplit.service.GroupService;
import lombok.RequiredArgsConstructor;
import com.equisplit.dto.request.AddMemberRequest;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Override
    public GroupResponse createGroup(
            CreateGroupRequest request,
            String userEmail) {

        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
                .orElseThrow(() -> new RuntimeException("User not found"));

        return groupMemberRepository.findByUser(user)
                .stream()
                .map(member -> GroupSummaryResponse.builder()
                        .id(member.getGroup().getId())
                        .name(member.getGroup().getName())
                        .description(member.getGroup().getDescription())
                        .build())
                .toList();
    }

    @Override
    public void addMember(
            Long groupId,
            AddMemberRequest request,
            String userEmail) {

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        GroupMember ownerMembership =
                groupMemberRepository.findByGroupAndUser(group, currentUser)
                        .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (ownerMembership.getRole() != GroupRole.OWNER) {
            throw new RuntimeException("Only owner can add members");
        }

        User userToAdd = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User to add not found"));

        boolean alreadyMember =
                groupMemberRepository.findByGroupAndUser(group, userToAdd)
                        .isPresent();

        if (alreadyMember) {
            throw new RuntimeException("User already in group");
        }

        GroupMember newMember = GroupMember.builder()
                .group(group)
                .user(userToAdd)
                .role(GroupRole.MEMBER)
                .joinedAt(OffsetDateTime.now())
                .build();

        groupMemberRepository.save(newMember);
    }
}