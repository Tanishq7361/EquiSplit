package com.equisplit.service.impl;

import com.equisplit.dto.response.AuditLogResponse;
import com.equisplit.entity.AuditLog;
import com.equisplit.entity.Group;
import com.equisplit.entity.GroupMember;
import com.equisplit.entity.User;
import com.equisplit.exception.UnauthorizedActionException;
import com.equisplit.repository.AuditLogRepository;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuditLogServiceImpl auditLogService;

    @Test
    void logEvent_shouldSaveAuditLog() {
        auditLogService.logEvent(
                "CREATE_EXPENSE",
                "EXPENSE",
                10L,
                1L,
                "user@test.com",
                "Created test expense"
        );

        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void getGroupAuditLogs_shouldReturnPagedAuditLogs() {
        User user = User.builder().id(1L).email("user@test.com").build();
        Group group = Group.builder().id(1L).name("Trip").build();
        GroupMember member = GroupMember.builder().user(user).group(group).build();

        AuditLog logEntry = AuditLog.builder()
                .id(1L)
                .action("CREATE_EXPENSE")
                .entityType("EXPENSE")
                .entityId(10L)
                .groupId(1L)
                .performedBy("user@test.com")
                .details("Created expense")
                .timestamp(OffsetDateTime.now())
                .build();

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(groupMemberRepository.findByGroupAndUser(group, user)).thenReturn(Optional.of(member));

        Pageable pageable = PageRequest.of(0, 10);
        when(auditLogRepository.findByGroupIdOrderByTimestampDesc(1L, pageable))
                .thenReturn(new PageImpl<>(List.of(logEntry)));

        Page<AuditLogResponse> response = auditLogService.getGroupAuditLogs(1L, pageable, "user@test.com");

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals("CREATE_EXPENSE", response.getContent().get(0).getAction());
    }

    @Test
    void getGroupAuditLogs_shouldThrowWhenUserNotMember() {
        User user = User.builder().id(1L).email("user@test.com").build();
        Group group = Group.builder().id(1L).name("Trip").build();

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(groupMemberRepository.findByGroupAndUser(group, user)).thenReturn(Optional.empty());

        Pageable pageable = PageRequest.of(0, 10);
        assertThrows(UnauthorizedActionException.class,
                () -> auditLogService.getGroupAuditLogs(1L, pageable, "user@test.com"));
    }
}
