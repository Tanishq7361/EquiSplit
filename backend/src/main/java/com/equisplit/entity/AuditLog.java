package com.equisplit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_group_id", columnList = "group_id"),
        @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 64)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "performed_by", nullable = false, length = 255)
    private String performedBy;

    @Column(length = 1000)
    private String details;

    @Column(nullable = false)
    private OffsetDateTime timestamp;
}
