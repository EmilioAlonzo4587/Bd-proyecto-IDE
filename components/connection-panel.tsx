"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Database, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Connection, DatabaseType } from "@/types/database"

interface ConnectionPanelProps {
  activeConnection: Connection | null
  onConnect: (connection: Connection) => void
}

const DB_ICONS: Record<DatabaseType, string> = {
  postgresql: "🐘",
  mysql: "🐬",
  mongodb: "🍃",
  redis: "🔴",
}

const DB_COLORS: Record<DatabaseType, string> = {
  postgresql: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  mysql: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  mongodb: "bg-green-500/10 text-green-500 border-green-500/20",
  redis: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function ConnectionPanel({ activeConnection, onConnect }: ConnectionPanelProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    type: "postgresql" as DatabaseType,
    host: "localhost",
    port: 5432,
    database: "",
    username: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newConnection: Connection = {
      id: editingConnection?.id || Date.now().toString(),
      ...formData,
    }

    if (editingConnection) {
      setConnections(connections.map((c) => (c.id === editingConnection.id ? newConnection : c)))
    } else {
      setConnections([...connections, newConnection])
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "postgresql",
      host: "localhost",
      port: 5432,
      database: "",
      username: "",
      password: "",
    })
    setEditingConnection(null)
  }

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection)
    setFormData({
      name: connection.name,
      type: connection.type,
      host: connection.host,
      port: connection.port,
      database: connection.database || "",
      username: connection.username || "",
      password: connection.password || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setConnections(connections.filter((c) => c.id !== id))
    if (activeConnection?.id === id) {
      onConnect(null as any)
    }
  }

  const handleTypeChange = (type: DatabaseType) => {
    const defaultPorts: Record<DatabaseType, number> = {
      postgresql: 5432,
      mysql: 3306,
      mongodb: 27017,
      redis: 6379,
    }
    setFormData({ ...formData, type, port: defaultPorts[type] })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Conexiones</CardTitle>
            <CardDescription>Gestiona tus bases de datos</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingConnection ? "Editar Conexión" : "Nueva Conexión"}</DialogTitle>
                <DialogDescription>Configura los detalles de tu base de datos</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mi Base de Datos"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={handleTypeChange}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      {/*<SelectItem value="mysql">MySQL</SelectItem>*/}
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      {/*<SelectItem value="redis">Redis</SelectItem>*/}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Puerto</Label>
                    <Input
                      id="port"
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                {formData.type !== "redis" && (
                  <div className="space-y-2">
                    <Label htmlFor="database">Base de Datos</Label>
                    <Input
                      id="database"
                      value={formData.database}
                      onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                      placeholder={formData.type === "mongodb" ? "admin" : "postgres"}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="off"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingConnection ? "Actualizar" : "Crear"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {connections.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Database className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No hay conexiones</p>
            <p className="text-xs">Crea una para comenzar</p>
          </div>
        ) : (
          connections.map((connection) => (
            <div
              key={connection.id}
              className={`group relative rounded-lg border p-3 transition-colors hover:bg-accent ${
                activeConnection?.id === connection.id ? "border-primary bg-accent" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => onConnect(connection)} className="flex flex-1 items-start gap-3 text-left">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border ${DB_COLORS[connection.type]}`}
                  >
                    <span className="text-xl">{DB_ICONS[connection.type]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{connection.name}</h3>
                      {activeConnection?.id === connection.id && (
                        <Badge variant="default" className="text-xs">
                          Activa
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {connection.host}:{connection.port}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{connection.type}</p>
                  </div>
                </button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(connection)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(connection.id)
                    }}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
