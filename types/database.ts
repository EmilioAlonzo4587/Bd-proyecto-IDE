export type DatabaseType = "postgresql" | "mysql" | "mongodb" | "redis"

export interface Connection {
  id: string
  name: string
  type: DatabaseType
  host: string
  port: number
  database?: string
  username?: string
  password?: string
}

export interface QueryResult {
  success: boolean
  data?: any[]
  columns?: string[]
  rowCount?: number
  error?: string
  executionTime: number
}
