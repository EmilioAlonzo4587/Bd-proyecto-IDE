"use client"

import { CheckCircle2, XCircle, Clock, TableIcon, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { QueryResult } from "@/types/database"

interface ResultsDisplayProps {
  result: QueryResult
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const handleExport = () => {
    if (!result.data) return

    const csv = [result.columns?.join(",") || "", ...result.data.map((row) => Object.values(row).join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `query-results-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                result.success ? "bg-green-500/10" : "bg-red-500/10"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">Resultados</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {result.executionTime}ms
                {result.rowCount !== undefined && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <TableIcon className="h-3 w-3" />
                    {result.rowCount} {result.rowCount === 1 ? "fila" : "filas"}
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          {result.success && result.data && result.data.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!result.success ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="font-mono text-sm">{result.error}</AlertDescription>
          </Alert>
        ) : result.data && result.data.length > 0 ? (
          <div className="rounded-lg border">
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {result.columns?.map((column, index) => (
                      <TableHead key={index} className="font-semibold">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {result.columns?.map((column, colIndex) => (
                        <TableCell key={colIndex} className="font-mono text-sm">
                          {row[column] === null ? (
                            <Badge variant="secondary" className="text-xs">
                              NULL
                            </Badge>
                          ) : typeof row[column] === "object" ? (
                            <pre className="text-xs">{JSON.stringify(row[column], null, 2)}</pre>
                          ) : (
                            String(row[column])
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Consulta ejecutada exitosamente. No se devolvieron filas.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
