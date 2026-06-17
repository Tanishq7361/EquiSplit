package com.equisplit.service.impl;

import com.equisplit.repository.ExpenseRepository;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.UserRepository;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.equisplit.dto.request.AddMemberRequest;
import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.response.GroupResponse;
import com.equisplit.dto.response.GroupSummaryResponse;
import com.equisplit.entity.Group;
import com.equisplit.entity.GroupMember;
import com.equisplit.entity.GroupRole;
import com.equisplit.entity.User;
import com.equisplit.exception.UnauthorizedActionException;

import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceImplTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private GroupServiceImpl groupService;

    @Test
    void createGroup_shouldCreateGroupAndOwnerMembership() {

        CreateGroupRequest request = new CreateGroupRequest();

        request.setName("Goa Trip");
        request.setDescription("Friends trip");

        User creator = User.builder()
                .id(1L)
                .name("QuantumCoder")
                .email("test@test.com")
                .build();

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(creator));

        Group savedGroup = Group.builder()
                .id(1L)
                .name("Goa Trip")
                .description("Friends trip")
                .createdBy(creator)
                .build();

        when(groupRepository.save(any(Group.class)))
                .thenReturn(savedGroup);

        GroupResponse response =
                groupService.createGroup(
                        request,
                        "test@test.com"
                );

        assertNotNull(response);

        assertEquals(
                "Goa Trip",
                response.getName()
        );

        verify(groupRepository)
                .save(any(Group.class));

        verify(groupMemberRepository)
                .save(any());
    }

    @Test
    void getMyGroups_shouldReturnUserGroups() {

        User user = User.builder()
                .id(1L)
                .name("QuantumCoder")
                .email("test@test.com")
                .build();

        Group group = Group.builder()
                .id(1L)
                .name("Goa Trip")
                .description("Friends Trip")
                .build();

        GroupMember membership = GroupMember.builder()
                .group(group)
                .user(user)
                .role(GroupRole.OWNER)
                .build();

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(groupMemberRepository.findByUser(user))
                .thenReturn(List.of(membership));
        
        when(groupMemberRepository.findByGroup(group))
                .thenReturn(List.of(membership));

        when(expenseRepository.findByGroup(group))
                .thenReturn(List.of());

        List<GroupSummaryResponse> result =
                groupService.getMyGroups("test@test.com");

        assertEquals(1, result.size());

        assertEquals(
                "Goa Trip",
                result.getFirst().getName()
        );
    }

    @Test
    void addMember_shouldAddMember() {

        User owner = User.builder()
                .id(1L)
                .email("owner@test.com")
                .build();

        User friend = User.builder()
                .id(2L)
                .email("friend@test.com")
                .build();

        Group group = Group.builder()
                .id(1L)
                .name("Goa Trip")
                .build();

        GroupMember ownerMembership =
                GroupMember.builder()
                        .group(group)
                        .user(owner)
                        .role(GroupRole.OWNER)
                        .build();

        AddMemberRequest request =
                new AddMemberRequest();

        request.setEmail("friend@test.com");

        when(userRepository.findByEmail("owner@test.com"))
                .thenReturn(Optional.of(owner));

        when(groupRepository.findById(1L))
                .thenReturn(Optional.of(group));

        when(groupMemberRepository.findByGroupAndUser(group, owner))
                .thenReturn(Optional.of(ownerMembership));

        when(userRepository.findByEmail("friend@test.com"))
                .thenReturn(Optional.of(friend));

        when(groupMemberRepository.findByGroupAndUser(group, friend))
                .thenReturn(Optional.empty());

        groupService.addMember(
                1L,
                request,
                "owner@test.com"
        );

        verify(groupMemberRepository)
                .save(any(GroupMember.class));
    }

    @Test
    void addMember_shouldThrowWhenCurrentUserNotOwner() {

        User member = User.builder()
                .id(1L)
                .email("member@test.com")
                .build();

        Group group = Group.builder()
                .id(1L)
                .build();

        GroupMember membership =
                GroupMember.builder()
                        .group(group)
                        .user(member)
                        .role(GroupRole.MEMBER)
                        .build();

        AddMemberRequest request =
                new AddMemberRequest();

        request.setEmail("friend@test.com");

        when(userRepository.findByEmail("member@test.com"))
                .thenReturn(Optional.of(member));

        when(groupRepository.findById(1L))
                .thenReturn(Optional.of(group));

        when(groupMemberRepository.findByGroupAndUser(group, member))
                .thenReturn(Optional.of(membership));

        assertThrows(
                UnauthorizedActionException.class,
                () -> groupService.addMember(
                        1L,
                        request,
                        "member@test.com"
                )
        );

        verify(groupMemberRepository, never())
                .save(any());
    }
}