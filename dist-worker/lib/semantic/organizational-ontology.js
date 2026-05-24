function scoreEntity(entity) {
    let score = 40;
    if (entity.email)
        score += 10;
    if (entity.title)
        score += 10;
    if (entity.status === "active")
        score += 15;
    if (entity.score)
        score += Math.min(25, entity.score);
    return Math.min(100, score);
}
export function buildSemanticWorkspaceModel({ workspace, contacts = [], sequences = [], workflows = [], engagement = [], predictions, }) {
    const entities = [];
    const relationships = [];
    const insights = [];
    entities.push({
        id: workspace.id,
        type: "workspace",
        label: workspace.name || "Workspace",
        semanticScore: 90,
        attributes: {
            plan: workspace.plan,
            intelligenceLevel: "enterprise",
        },
    });
    for (const contact of contacts) {
        entities.push({
            id: contact.id,
            type: "contact",
            label: [contact.first_name, contact.last_name]
                .filter(Boolean)
                .join(" ") || contact.email,
            semanticScore: scoreEntity(contact),
            attributes: {
                email: contact.email,
                title: contact.title,
                status: contact.status,
            },
        });
        relationships.push({
            source: workspace.id,
            target: contact.id,
            type: "owns_relationship",
            confidence: 92,
            reasoning: "Workspace operationally manages CRM contact relationship.",
        });
        if (contact.score >= 70) {
            insights.push(`High-value contact identified: ${contact.email || contact.id}`);
        }
    }
    for (const sequence of sequences) {
        entities.push({
            id: sequence.id,
            type: "sequence",
            label: sequence.name || "Outbound Sequence",
            semanticScore: sequence.status === "active" ? 88 : 55,
            attributes: {
                status: sequence.status,
            },
        });
        relationships.push({
            source: workspace.id,
            target: sequence.id,
            type: "operates_sequence",
            confidence: 90,
            reasoning: "Workspace actively operates outbound execution sequences.",
        });
    }
    for (const workflow of workflows) {
        entities.push({
            id: workflow.id,
            type: "workflow",
            label: workflow.name ||
                workflow.action_type ||
                "AI Workflow",
            semanticScore: workflow.status === "active" ? 90 : 60,
            attributes: {
                actionType: workflow.action_type,
                status: workflow.status,
            },
        });
        relationships.push({
            source: workspace.id,
            target: workflow.id,
            type: "executes_workflow",
            confidence: 95,
            reasoning: "Workspace executes AI operational workflow runtime.",
        });
    }
    for (const signal of engagement) {
        relationships.push({
            source: signal.contact_id || "unknown_contact",
            target: signal.queue_id || "unknown_email",
            type: signal.event_type || "engagement_signal",
            confidence: 80,
            reasoning: "Engagement telemetry indicates behavioral interaction.",
        });
    }
    if ((predictions?.conversionProbability || 0) >= 70) {
        insights.push("High conversion probability detected across operational pipeline.");
    }
    if ((predictions?.pipelineRiskScore || 0) >= 60) {
        insights.push("Operational risk threshold exceeded. Governance intervention recommended.");
    }
    if ((predictions?.anomalyScore || 0) >= 40) {
        insights.push("Telemetry anomalies detected in engagement intelligence layer.");
    }
    const semanticHealth = entities.length > 0
        ? Math.min(100, Math.round(entities.reduce((sum, entity) => sum + entity.semanticScore, 0) / entities.length))
        : 0;
    return {
        entities,
        relationships,
        insights,
        semanticHealth,
    };
}
