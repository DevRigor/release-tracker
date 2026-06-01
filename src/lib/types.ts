export interface Component {
  id: string
  name: string
  gitlabProjectId?: number
  gitlabProjectName?: string
  gitlabProjectPath?: string
  lastTicketProd?: string
  comments?: string
  createdAt: Date
  updatedAt: Date
}

export type GitlabPipelineStatus = 'success' | 'failed' | 'running' | 'pending' | 'canceled' | 'skipped' | null

export interface GitlabProject {
  id: number
  name: string
  path: string
}

export interface Release {
  id: string
  componentId: string
  componentName: string
  ticket: string
  deployedAt: Date
}
