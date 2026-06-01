export type EnvStatus = 'pending' | 'in-progress' | 'done'

export interface Component {
  id: string
  name: string
  branch: string
  ticket: string
  devStatus: EnvStatus
  masterStatus: EnvStatus
  prodStatus: EnvStatus
  lastTicketProd?: string
  comments?: string
  createdAt: Date
  updatedAt: Date
}

export interface Release {
  id: string
  componentId: string
  componentName: string
  ticket: string
  deployedAt: Date
}
