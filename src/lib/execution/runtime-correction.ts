export async function executeAutonomousCorrections({
  baseUrl,
  workspaceId,
  actions,
}: {
  baseUrl: string
  workspaceId: string
  actions: any[]
}) {
  const executed = []

  for (const action of actions) {
    if (action.automationLevel !== "autonomous") {
      continue
    }

    const eventResponse = await fetch(
      `${baseUrl}/api/workspace/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          eventType: `execution.${action.type}`,
          entityType: "autonomous_execution",
          title: action.title,
          description: action.description,
          severity: action.priority === "high" ? "warning" : "info",
          source: "autonomous_execution_engine",
          metadata: action,
          createNotification: true,
          notificationPriority:
            action.priority === "high" ? "high" : "medium",
          actionHref: "/dashboard/execution",
        }),
      }
    )

    const eventData = await eventResponse.json()

    executed.push({
      action,
      success: eventResponse.ok,
      event: eventData,
    })
  }

  return {
    executedCount: executed.length,
    executions: executed,
  }
}
