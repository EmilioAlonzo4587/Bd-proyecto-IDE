"use client"

import { useState } from "react"
import { Play, Save, Trash2, Clock, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Connection } from "@/types/database"

interface QueryEditorProps {
  connection: Connection
  onExecute: (query: string) => void
  isExecuting: boolean
}

interface SavedQuery {
  id: string
  name: string
  query: string
  type: string
  timestamp: number
}

const SQL_TEMPLATES = {
  select: "SELECT * FROM table_name LIMIT 10;",
  insert: "INSERT INTO table_name (column1, column2) VALUES (value1, value2);",
  update: "UPDATE table_name SET column1 = value1 WHERE condition;",
  delete: "DELETE FROM table_name WHERE condition;",
  create: "CREATE TABLE table_name (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL\n);",
}

const NOSQL_TEMPLATES = {
  find: '{"collection": "users", "query": {}}',
  findOne: '{"collection": "users", "query": {"_id": "..."}}',
  insert: '{"collection": "users", "document": {"name": "John", "email": "john@example.com"}}',
  update: '{"collection": "users", "query": {"_id": "..."}, "update": {"$set": {"name": "Jane"}}}',
  delete: '{"collection": "users", "query": {"_id": "..."}}',
  createCollection: '{"createCollection": "new_collection_name"}',
  listCollections: '{"listCollections": true}',
}

const REDIS_TEMPLATES = {
  get: "GET key",
  set: "SET key value",
  del: "DEL key",
  keys: "KEYS pattern",
  hgetall: "HGETALL key",
}

export function QueryEditor({ connection, onExecute, isExecuting }: QueryEditorProps) {
  const [query, setQuery] = useState("")
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const isSQL = connection.type === "postgresql" || connection.type === "mysql"
  const isMongoDB = connection.type === "mongodb"
  const isRedis = connection.type === "redis"

  const templates = isSQL ? SQL_TEMPLATES : isMongoDB ? NOSQL_TEMPLATES : REDIS_TEMPLATES

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template)
    setQuery(templates[template as keyof typeof templates])
  }

  const handleSaveQuery = () => {
    if (!query.trim()) return

    const name = prompt("Nombre de la consulta:")
    if (!name) return

    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      name,
      query,
      type: connection.type,
      timestamp: Date.now(),
    }

    setSavedQueries([...savedQueries, newQuery])
  }

  const handleLoadQuery = (savedQuery: SavedQuery) => {
    setQuery(savedQuery.query)
  }

  const handleDeleteQuery = (id: string) => {
    setSavedQueries(savedQueries.filter((q) => q.id !== id))
  }

  const getPlaceholder = () => {
    if (isSQL) return "SELECT * FROM users WHERE id = 1;"
    if (isMongoDB) return '{"collection": "users", "query": {"name": "John"}}'
    return "GET mykey"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Editor de Consultas</CardTitle>
              <CardDescription>
                {isSQL && "Escribe tu consulta SQL"}
                {isMongoDB && "Escribe tu consulta MongoDB (formato JSON)"}
                {isRedis && "Escribe tu comando Redis"}
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-2">
              <Database className="h-3 w-3" />
              {connection.type.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Plantillas" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(templates).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleSaveQuery} disabled={!query.trim()}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuery("")} disabled={!query.trim()}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Query Input */}
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className="min-h-[200px] font-mono text-sm"
            spellCheck={false}
          />

          {/* Execute Button */}
          <div className="flex justify-end">
            <Button onClick={() => onExecute(query)} disabled={!query.trim() || isExecuting} className="gap-2">
              {isExecuting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Ejecutar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Queries */}
      {savedQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consultas Guardadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {savedQueries.map((savedQuery) => (
              <div
                key={savedQuery.id}
                className="group flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
              >
                <button onClick={() => handleLoadQuery(savedQuery)} className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-foreground">{savedQuery.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {savedQuery.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate mt-1">{savedQuery.query}</p>
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteQuery(savedQuery.id)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
