package com.equisplit.service.impl;

import com.equisplit.dto.response.AuditLogResponse;
import com.equisplit.entity.AuditLog;
import com.equisplit.entity.Group;
import com.equisplit.entity.User;
import com.equisplit.exception.ResourceNotFoundException;
import com.equisplit.exception.UnauthorizedActionException;
import com.equisplit.repository.AuditLogRepository;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.UserRepository;
import com.equisplit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void logEvent(String action, String entityType, Long entityId, Long groupId, String performedBy, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .groupId(groupId)
                    .performedBy(performedBy)
                    .details(details != null && details.length() > 1000 ? details.substring(0, 1000) : details)
                    .timestamp(OffsetDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("AuditLog recorded: action={}, entityType={}, entityId={}, groupId={}, by={}",
                    action, entityType, entityId, groupId, performedBy);
        } catch (Exception ex) {
            log.error("Failed to record audit log: {}", ex.getMessage(), ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getGroupAuditLogs(Long groupId, Pageable pageable, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new UnauthorizedActionException("You are not a member of this group"));

        return auditLogRepository.findByGroupIdOrderByTimestampDesc(groupId, pageable)
                .map(logEntry -> AuditLogResponse.builder()
                        .id(logEntry.getId())
                        .action(logEntry.getAction())
                        .entityType(logEntry.getEntityType())
                        .entityId(logEntry.getEntityId())
                        .groupId(logEntry.getGroupId())
                        .performedBy(logEntry.getPerformedBy())
                        .details(logEntry.getDetails())
                        .timestamp(logEntry.getTimestamp())
                        .build());
    }
}
