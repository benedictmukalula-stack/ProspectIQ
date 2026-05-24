export function buildWorkspaceCopilotPrompt({ intelligence, recommendations, actions, executiveSummary, events, }) {
    return {
        executiveSummary,
        operationalContext: {
            intelligence,
            recommendations,
            autonomousActions: actions,
            recentEvents: events?.slice?.(0, 10) || [],
        },
    };
}
