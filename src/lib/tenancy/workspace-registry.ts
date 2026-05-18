export type WorkspaceRegistryItem = {
  id: string
  name: string
  plan?: string
  owner_id?: string
  created_at?: string
}

export function summarizeWorkspaceRegistry(workspaces: WorkspaceRegistryItem[]) {
  return {
    totalWorkspaces: workspaces.length,
    businessWorkspaces: workspaces.filter((workspace) => workspace.plan === "business").length,
    freeWorkspaces: workspaces.filter((workspace) => workspace.plan === "free").length,
    unknownPlanWorkspaces: workspaces.filter((workspace) => !workspace.plan).length,
  }
}
