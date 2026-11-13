package com.equisplit.integration;

import com.equisplit.dto.request.AddMemberRequest;
import com.equisplit.dto.request.CreateExpenseRequest;
import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.request.CreateSettlementRequest;
import com.equisplit.dto.request.RegisterRequest;
import com.equisplit.dto.response.AuditLogResponse;
import com.equisplit.dto.response.DebtResponse;
import com.equisplit.dto.response.ExpenseResponse;
import com.equisplit.dto.response.GroupResponse;
import com.equisplit.dto.response.SettlementResponse;
import com.equisplit.entity.Expense;
import com.equisplit.entity.User;
import com.equisplit.repository.ExpenseRepository;
import com.equisplit.service.AuditLogService;
import com.equisplit.service.ExpenseService;
import com.equisplit.service.GroupService;
import com.equisplit.service.SettlementService;
import com.equisplit.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class EquiSplitIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("equisplit_test")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (postgres.isRunning()) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
            registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        }
    }

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private SettlementService settlementService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Test
    @DisplayName("End-to-End Financial Flow: Register -> Group -> Expense -> Min Cash Flow -> Settle -> Audit")
    void fullFinancialFlowIntegrationTest() {
        // 1. Register users
        RegisterRequest user1Req = new RegisterRequest();
        user1Req.setName("Alice");
        user1Req.setEmail("alice@integration.test");
        user1Req.setPassword("Password@123");
        User alice = userService.register(user1Req);
        assertNotNull(alice.getId());

        RegisterRequest user2Req = new RegisterRequest();
        user2Req.setName("Bob");
        user2Req.setEmail("bob@integration.test");
        user2Req.setPassword("Password@123");
        User bob = userService.register(user2Req);
        assertNotNull(bob.getId());

        // 2. Create Group
        CreateGroupRequest groupReq = new CreateGroupRequest();
        groupReq.setName("Weekend Getaway");
        groupReq.setDescription("Cabin trip");
        GroupResponse group = groupService.createGroup(groupReq, alice.getEmail());
        assertNotNull(group.getId());

        // 3. Add Member
        AddMemberRequest addBobReq = new AddMemberRequest();
        addBobReq.setEmail(bob.getEmail());
        groupService.addMember(group.getId(), addBobReq, alice.getEmail());

        // 4. Create Shared Expense with Equal Split
        CreateExpenseRequest expenseReq = new CreateExpenseRequest();
        expenseReq.setPaidByUserId(alice.getId());
        expenseReq.setAmount(BigDecimal.valueOf(200.00));
        expenseReq.setCategory("Food & Dining");
        expenseReq.setDescription("Cabin groceries");
        expenseReq.setSplitType("EQUAL");
        expenseReq.setParticipantIds(List.of(alice.getId(), bob.getId()));

        ExpenseResponse expense = expenseService.createExpense(group.getId(), expenseReq, alice.getEmail());
        assertNotNull(expense.getId());
        assertEquals(BigDecimal.valueOf(200.00), expense.getAmount());

        // 5. Verify Optimistic Locking (@Version) is initialized
        Expense persistedExpense = expenseRepository.findById(expense.getId()).orElseThrow();
        assertNotNull(persistedExpense.getVersion(), "Entity must have concurrency control version initialized");

        // 6. Test Min Cash Flow Algorithm debt simplification
        List<DebtResponse> simplifiedDebts = expenseService.getSimplifiedDebts(group.getId(), alice.getEmail());
        assertFalse(simplifiedDebts.isEmpty());
        DebtResponse debt = simplifiedDebts.get(0);
        assertEquals("Bob", debt.getFromUser());
        assertEquals("Alice", debt.getToUser());
        assertEquals(new BigDecimal("100.00"), debt.getAmount());

        // 7. Settle Debt
        CreateSettlementRequest settlementReq = new CreateSettlementRequest();
        settlementReq.setPayerId(bob.getId());
        settlementReq.setReceiverId(alice.getId());
        settlementReq.setAmount(new BigDecimal("100.00"));
        settlementReq.setDescription("Settling groceries");

        SettlementResponse settlement = settlementService.createSettlement(group.getId(), settlementReq, bob.getEmail());
        assertNotNull(settlement.getId());
        assertEquals(new BigDecimal("100.00"), settlement.getAmount());

        // 8. Verify Audit Logging tracked all financial events
        Page<AuditLogResponse> auditLogs = auditLogService.getGroupAuditLogs(group.getId(), PageRequest.of(0, 50), alice.getEmail());
        assertTrue(auditLogs.getTotalElements() >= 4, "Audit trail must record group creation, member add, expense, and settlement");

        List<String> actions = auditLogs.getContent().stream().map(AuditLogResponse::getAction).toList();
        assertTrue(actions.contains("CREATE_GROUP"));
        assertTrue(actions.contains("ADD_MEMBER"));
        assertTrue(actions.contains("CREATE_EXPENSE"));
        assertTrue(actions.contains("CREATE_SETTLEMENT"));
    }
}
