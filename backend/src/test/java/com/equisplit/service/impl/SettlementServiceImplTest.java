package com.equisplit.service.impl;

import com.equisplit.dto.request.CreateSettlementRequest;
import com.equisplit.dto.response.SettlementResponse;
import com.equisplit.dto.response.SettlementSummaryResponse;
import com.equisplit.entity.GroupMember;
import com.equisplit.entity.Settlement;
import com.equisplit.exception.UnauthorizedActionException;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.SettlementRepository;
import com.equisplit.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.equisplit.entity.Group;
import com.equisplit.entity.User;
import java.util.List;
import java.util.Optional;


@ExtendWith(MockitoExtension.class)
class SettlementServiceImplTest {

    @Mock
    private SettlementRepository settlementRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SettlementServiceImpl settlementService;

    @Test
    void createSettlement_shouldSaveSettlement() {

        User payer = User.builder()
                .id(1L)
                .name("QuantumCoder")
                .email("owner@test.com")
                .build();

        User receiver = User.builder()
                .id(2L)
                .name("Friend")
                .email("friend@test.com")
                .build();

        Group group = Group.builder()
                .id(1L)
                .name("Goa Trip")
                .build();

        CreateSettlementRequest request =
                new CreateSettlementRequest();

        request.setReceiverId(2L);
        request.setAmount(BigDecimal.valueOf(500));

        when(userRepository.findByEmail("owner@test.com"))
                .thenReturn(Optional.of(payer));

        when(groupRepository.findById(1L))
                .thenReturn(Optional.of(group));

        when(groupMemberRepository.findByGroupAndUser(group, payer))
                .thenReturn(Optional.of(mock(GroupMember.class)));

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(receiver));

        when(groupMemberRepository.findByGroupAndUser(group, receiver))
                .thenReturn(Optional.of(mock(GroupMember.class)));

        Settlement savedSettlement = Settlement.builder()
                .id(1L)
                .group(group)
                .payer(payer)
                .receiver(receiver)
                .amount(BigDecimal.valueOf(500))
                .build();

        when(settlementRepository.save(any(Settlement.class)))
                .thenReturn(savedSettlement);

        SettlementResponse response =
                settlementService.createSettlement(
                        1L,
                        request,
                        "owner@test.com"
                );

        assertNotNull(response);

        assertEquals(
                BigDecimal.valueOf(500),
                response.getAmount()
        );

        verify(settlementRepository)
                .save(any(Settlement.class));
    }

    @Test
    void createSettlement_shouldThrowWhenUserNotMember() {

        User payer = User.builder()
                .email("owner@test.com")
                .build();

        Group group = Group.builder()
                .id(1L)
                .build();

        CreateSettlementRequest request =
                new CreateSettlementRequest();

        request.setReceiverId(2L);
        request.setAmount(BigDecimal.valueOf(500));

        when(userRepository.findByEmail("owner@test.com"))
                .thenReturn(Optional.of(payer));

        when(groupRepository.findById(1L))
                .thenReturn(Optional.of(group));

        when(groupMemberRepository.findByGroupAndUser(group, payer))
                .thenReturn(Optional.empty());

        assertThrows(
                UnauthorizedActionException.class,
                () -> settlementService.createSettlement(
                        1L,
                        request,
                        "owner@test.com"
                )
        );

        verify(settlementRepository, never())
                .save(any());
    }

    @Test
    void getGroupSettlements_shouldReturnHistory() {

        User user = User.builder()
                .email("owner@test.com")
                .build();

        User payer = User.builder()
                .name("QuantumCoder")
                .build();

        User receiver = User.builder()
                .name("Friend")
                .build();

        Group group = Group.builder()
                .id(1L)
                .build();

        Settlement settlement = Settlement.builder()
                .id(1L)
                .payer(payer)
                .receiver(receiver)
                .amount(BigDecimal.valueOf(500))
                .build();

        when(userRepository.findByEmail("owner@test.com"))
                .thenReturn(Optional.of(user));

        when(groupRepository.findById(1L))
                .thenReturn(Optional.of(group));

        when(groupMemberRepository.findByGroupAndUser(group, user))
                .thenReturn(Optional.of(mock(GroupMember.class)));

        when(settlementRepository.findByGroup(group))
                .thenReturn(List.of(settlement));

        List<SettlementSummaryResponse> result =
                settlementService.getGroupSettlements(
                        1L,
                        "owner@test.com"
                );

        assertEquals(1, result.size());

        assertEquals(
                "QuantumCoder",
                result.getFirst().getPayerName()
        );
    }
}