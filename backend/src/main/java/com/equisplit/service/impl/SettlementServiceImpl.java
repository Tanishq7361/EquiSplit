package com.equisplit.service.impl;

import com.equisplit.dto.request.CreateSettlementRequest;
import com.equisplit.dto.response.SettlementResponse;
import com.equisplit.entity.Group;
import com.equisplit.entity.Settlement;
import com.equisplit.entity.User;
import com.equisplit.repository.GroupMemberRepository;
import com.equisplit.repository.GroupRepository;
import com.equisplit.repository.SettlementRepository;
import com.equisplit.repository.UserRepository;
import com.equisplit.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        groupMemberRepository.findByGroupAndUser(group, payer)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this group"));

        User receiver = userRepository.findByEmail(request.getReceiverEmail())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        groupMemberRepository.findByGroupAndUser(group, receiver)
                .orElseThrow(() ->
                        new RuntimeException("Receiver is not a member of this group"));

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
                .build();
    }
}