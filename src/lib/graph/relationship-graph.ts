import { QUEUE_STATUS } from "@/lib/queue/status";
export type GraphNode = {
  id: string
  type: "workspace" | "contact" | "sequence" | "email" | "workflow" | "agent" | "signal"
  label: string
  score?: number
  metadata?: Record<string, any>
}

export type GraphEdge = {
  id: string
  source: string
  target: string
  type: string
  strength: number
  metadata?: Record<string, any>
}

export type WorkspaceCommandGraph = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  summary: {
    nodes: number
    edges: number
    contacts: number
    sequences: number
    workflows: number
    signals: number
    graphDensity: number
  }
}

function edgeId(source: string, target: string, type: string) {
  return `${source}:${target}:${type}`
}

export function buildWorkspaceCommandGraph({
  workspace,
  contacts = [],
  sequences = [],
  queue = [],
  engagement = [],
  workflows = [],
  runtimeSnapshots = [],
}: any): WorkspaceCommandGraph {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  const workspaceNodeId = `workspace:${workspace.id}`

  nodes.push({
    id: workspaceNodeId,
    type: "workspace",
    label: workspace.name || "Workspace",
    metadata: {
      plan: workspace.plan,
      ownerId: workspace.owner_id,
    },
  })

  for (const contact of contacts) {
    const contactId = `contact:${contact.id}`

    nodes.push({
      id: contactId,
      type: "contact",
      label:
        [contact.first_name, contact.last_name].filter(Boolean).join(" ") ||
        contact.email ||
        "CRM Contact",
      score: contact.score || 0,
      metadata: {
        email: contact.email,
        status: contact.status,
        title: contact.title,
      },
    })

    edges.push({
      id: edgeId(workspaceNodeId, contactId, "owns_contact"),
      source: workspaceNodeId,
      target: contactId,
      type: "owns_contact",
      strength: 70,
    })
  }

  for (const sequence of sequences) {
    const sequenceId = `sequence:${sequence.id}`

    nodes.push({
      id: sequenceId,
      type: "sequence",
      label: sequence.name || "Outbound Sequence",
      metadata: {
        status: sequence.status,
      },
    })

    edges.push({
      id: edgeId(workspaceNodeId, sequenceId, "runs_sequence"),
      source: workspaceNodeId,
      target: sequenceId,
      type: "runs_sequence",
      strength: sequence.status === "active" ? 90 : 40,
    })
  }

  for (const message of queue) {
    const emailId = `email:${message.id}`
    const contactId = message.contact_id ? `contact:${message.contact_id}` : null
    const sequenceId = message.sequence_id ? `sequence:${message.sequence_id}` : null

    nodes.push({
      id: emailId,
      type: "email",
      label: message.subject || "Outbound Email",
      metadata: {
        status: message.status,
        channel: message.channel,
        scheduledFor: message.scheduled_for,
        sentAt: message.sent_at,
      },
    })

    if (contactId) {
      edges.push({
        id: edgeId(contactId, emailId, "received_email"),
        source: contactId,
        target: emailId,
        type: "received_email",
        strength: message.status === QUEUE_STATUS.SENT ? 80 : 50,
      })
    }

    if (sequenceId) {
      edges.push({
        id: edgeId(sequenceId, emailId, "generated_email"),
        source: sequenceId,
        target: emailId,
        type: "generated_email",
        strength: 70,
      })
    }
  }

  for (const event of engagement) {
    const signalId = `signal:${event.id}`
    const emailId = event.queue_id ? `email:${event.queue_id}` : null
    const contactId = event.contact_id ? `contact:${event.contact_id}` : null

    nodes.push({
      id: signalId,
      type: "signal",
      label: event.event_type || "Engagement Signal",
      metadata: {
        eventType: event.event_type,
        source: event.source,
        createdAt: event.created_at,
      },
    })

    if (emailId) {
      edges.push({
        id: edgeId(emailId, signalId, "created_signal"),
        source: emailId,
        target: signalId,
        type: "created_signal",
        strength: 90,
      })
    }

    if (contactId) {
      edges.push({
        id: edgeId(contactId, signalId, "produced_signal"),
        source: contactId,
        target: signalId,
        type: "produced_signal",
        strength: 85,
      })
    }
  }

  for (const workflow of workflows) {
    const workflowId = `workflow:${workflow.id}`

    nodes.push({
      id: workflowId,
      type: "workflow",
      label: workflow.name || workflow.action_type || "AI Workflow",
      metadata: {
        status: workflow.status,
        actionType: workflow.action_type,
      },
    })

    edges.push({
      id: edgeId(workspaceNodeId, workflowId, "uses_workflow"),
      source: workspaceNodeId,
      target: workflowId,
      type: "uses_workflow",
      strength: workflow.status === "active" ? 85 : 45,
    })
  }

  if (runtimeSnapshots.length) {
    const latest = runtimeSnapshots[0]
    const agentId = `agent:runtime`

    nodes.push({
      id: agentId,
      type: "agent",
      label: "Autonomous Runtime",
      score: latest.readiness_score || 0,
      metadata: {
        totalSignals: latest.total_signals,
        failedAgents: latest.failed_agents,
      },
    })

    edges.push({
      id: edgeId(workspaceNodeId, agentId, "monitored_by"),
      source: workspaceNodeId,
      target: agentId,
      type: "monitored_by",
      strength: 95,
    })
  }

  const nodeCount = nodes.length
  const maxEdges = nodeCount > 1 ? nodeCount * (nodeCount - 1) : 1

  return {
    nodes,
    edges,
    summary: {
      nodes: nodes.length,
      edges: edges.length,
      contacts: contacts.length,
      sequences: sequences.length,
      workflows: workflows.length,
      signals: engagement.length,
      graphDensity: Math.round((edges.length / maxEdges) * 100),
    },
  }
}
