export function summarizeWorkspaceRegistry(workspaces) {
    return {
        totalWorkspaces: workspaces.length,
        businessWorkspaces: workspaces.filter((workspace) => workspace.plan === "business").length,
        freeWorkspaces: workspaces.filter((workspace) => workspace.plan === "free").length,
        unknownPlanWorkspaces: workspaces.filter((workspace) => !workspace.plan).length,
    };
}
