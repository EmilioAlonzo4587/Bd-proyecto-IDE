"use client"

import { useState } from "react"
import { Database, Server, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConnectionPanel } from "@/components/connection-panel"
import { QueryEditor } from "@/components/query-editor"
import { ResultsDisplay } from "@/components/results-display"
import type { Connection, QueryResult } from "@/types/database"

export default function DatabaseIDE() {
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null)
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleConnect = (connection: Connection) => {
    setActiveConnection(connection)
    setQueryResult(null)
  }

  const handleDisconnect = () => {
    setActiveConnection(null)
    setQueryResult(null)
  }

  const handleExecuteQuery = async (query: string) => {
    if (!activeConnection || !query.trim()) return

    setIsExecuting(true)
    setQueryResult(null)

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection: activeConnection,
          query: query.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setQueryResult({
          success: false,
          error: data.error || "Error al ejecutar la consulta",
          executionTime: data.executionTime || 0,
        })
      } else {
        setQueryResult(data)
      }
    } catch (error) {
      setQueryResult({
        success: false,
        error: error instanceof Error ? error.message : "Error de conexión",
        executionTime: 0,
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Database className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ARROW GRIP</h1>
                <p className="text-sm text-muted-foreground">SQL & NoSQL Query Tool</p>
              </div>
            </div>

            {activeConnection && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-foreground">
                    {activeConnection.type.toUpperCase()} - {activeConnection.name}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect} className="gap-2 bg-transparent">
                  <XCircle className="h-4 w-4" />
                  Desconectar
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar - Connection Panel */}
          <aside>
            <ConnectionPanel activeConnection={activeConnection} onConnect={handleConnect} />
          </aside>

          {/* Main Area - Query Editor & Results */}
          <div className="space-y-6">
            {!activeConnection ? (
              <Card className="flex min-h-[500px] flex-col items-center justify-center p-12 text-center">
                <Server className="mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-2xl font-semibold text-foreground">No hay conexión activa</h2>
                <p className="text-muted-foreground">Selecciona una base de datos del panel izquierdo para comenzar</p>
              </Card>
            ) : (
              <>
                <QueryEditor connection={activeConnection} onExecute={handleExecuteQuery} isExecuting={isExecuting} />

                {queryResult && <ResultsDisplay result={queryResult} />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
