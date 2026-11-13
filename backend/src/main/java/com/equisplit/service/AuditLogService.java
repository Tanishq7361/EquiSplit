package com.equisplit.service;

import com.equisplit.dto.response.AuditLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    void logEvent(String action, String entityType, Long entityId, Long groupId, String performedBy, String details);

    Page<AuditLogResponse> getGroupAuditLogs(Long groupId, Pageable pageable, String userEmail);
}
