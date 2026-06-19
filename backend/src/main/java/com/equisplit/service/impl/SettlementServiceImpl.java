package com.equisplit.service.impl;

import com.equisplit.dto.request.CreateSettlementRequest;
import com.equisplit.dto.response.SettlementResponse;
import com.equisplit.entity.Group;
import com.equisplit.entity.Settlement;
import com.equisplit.entity.User;
import com.equisplit.exception.ResourceNotFoundException;
import com.equisplit.exception.UnauthorizedActionException;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.SettlementRepository;
import com.equisplit.repository.UserRepository;
import com.equisplit.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.equisplit.dto.response.SettlementSummaryResponse;
import java.util.List;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

    private final SettlementRepository settlementRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Override
    public SettlementResponse createSettlement(
            Long groupId,
            CreateSettlementRequest request,
            String userEmail) {

        User payer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, payer)
                .orElseThrow(() ->
                        new UnauthorizedActionException("You are not a member of this group"));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Receiver not found"));

        groupMemberRepository.findByGroupAndUser(group, receiver)
                .orElseThrow(() ->
                        new UnauthorizedActionException("Receiver is not a member of this group"));

        Settlement settlement = Settlement.builder()
                .group(group)
                .payer(payer)
                .receiver(receiver)
                .amount(request.getAmount())
                .createdAt(OffsetDateTime.now())
                .build();

        Settlement savedSettlement = settlementRepository.save(settlement);

        return SettlementResponse.builder()
                .id(savedSettlement.getId())
                .payerName(payer.getName())
                .receiverName(receiver.getName())
                .amount(savedSettlement.getAmount())
                .createdAt(settlement.getCreatedAt())
                .build();
    }

    @Override
        public List<SettlementSummaryResponse> getGroupSettlements(
                Long groupId,
                String userEmail) {

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, currentUser)
                .orElseThrow(() ->
                        new UnauthorizedActionException("You are not a member of this group"));

        return settlementRepository.findByGroup(group)
                .stream()
                .map(settlement -> SettlementSummaryResponse.builder()
                        .id(settlement.getId())
                        .payerName(settlement.getPayer().getName())
                        .receiverName(settlement.getReceiver().getName())
                        .amount(settlement.getAmount())
                        .createdAt(settlement.getCreatedAt())
                        .build())
                .toList();
        }

        @Override
        public void deleteSettlement(
                Long groupId,
                Long settlementId,
                String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() ->
                        new UnauthorizedActionException(
                                "You are not a member of this group"
                        ));

        Settlement settlement =
                settlementRepository.findById(settlementId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Settlement not found"
                                ));

        settlementRepository.delete(settlement);
        }
}