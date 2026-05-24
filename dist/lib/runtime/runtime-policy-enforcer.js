export function enforceRuntimePolicy(workspacePolicy) {
    const policy = workspacePolicy.policy;
    return {
        workspaceId: workspacePolicy.workspaceId,
        active: workspacePolicy.status === "active",
        queue: {
            mode: policy.queuePolicy.mode,
            maxDailySends: policy.queuePolicy.maxDailySends,
            minDelayHours: policy.queuePolicy.minDelayHours,
            canAccelerate: workspacePolicy.governance.autoApplyQueuePolicy &&
                policy.queuePolicy.mode === "accelerated",
        },
        sequence: {
            preferredLength: policy.sequencePolicy.preferredLength,
            cadence: policy.sequencePolicy.cadence,
            tone: policy.sequencePolicy.recipientne,
            ctaStrength: policy.sequencePolicy.ctaStrength,
        },
        copy: {
            style: policy.copyPolicy.style,
            verticalInstruction: policy.copyPolicy.verticalInstruction,
            requiredElements: policy.copyPolicy.requiredElements,
        },
        delivery: {
            throttleEnabled: policy.deliveryPolicy.throttleEnabled,
            suppressOnBounce: policy.deliveryPolicy.suppressOnBounce,
            riskMode: policy.deliveryPolicy.riskMode,
        },
        enforcementActions: [
            {
                action: "queue_governance",
                enabled: workspacePolicy.governance.autoApplyQueuePolicy,
                description: `Apply ${policy.queuePolicy.mode} queue mode with ${policy.queuePolicy.minDelayHours} hour minimum delay.`,
            },
            {
                action: "sequence_governance",
                enabled: workspacePolicy.governance.autoApplySequencePolicy,
                description: `Generate ${policy.sequencePolicy.preferredLength}-step sequences using ${policy.sequencePolicy.recipientne} tone.`,
            },
            {
                action: "copy_governance",
                enabled: workspacePolicy.governance.autoApplyCopyPolicy,
                description: policy.copyPolicy.verticalInstruction,
            },
            {
                action: "delivery_protection",
                enabled: workspacePolicy.governance.autoApplyDeliveryProtection,
                description: `Delivery risk mode is ${policy.deliveryPolicy.riskMode}.`,
            },
        ],
    };
}
export function applyRuntimeDelay({ baseDelayDays, enforcement, }) {
    if (!enforcement.active)
        return baseDelayDays;
    if (enforcement.queue.mode === "accelerated") {
        return Math.max(0, Math.min(baseDelayDays, 1));
    }
    if (enforcement.queue.mode === "conservative") {
        return Math.max(baseDelayDays, 3);
    }
    return baseDelayDays;
}
export function applyRuntimeSequenceLength({ requestedLength, enforcement, }) {
    if (!enforcement.active)
        return requestedLength;
    return enforcement.sequence.preferredLength;
}
