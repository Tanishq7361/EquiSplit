package com.equisplit.service.impl;

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
}