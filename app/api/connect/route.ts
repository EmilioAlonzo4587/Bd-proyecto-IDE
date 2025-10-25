import { type NextRequest, NextResponse } from "next/server"
import { Client as PgClient } from "pg"
import mysql from "mysql2/promise"
import { MongoClient } from "mongodb"
import { createClient as createRedisClient } from "redis"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    switch (type) {
      case "postgres": {
        const { host, port, user, password, database } = body
        const client = new PgClient({
          host,
          port,
          user,
          password,
          database,
        })
        await client.connect()
        await client.end()
        return NextResponse.json({ success: true, message: "Conectado a PostgreSQL" })
      }

      case "mysql": {
        const { host, port, user, password, database } = body
        const connection = await mysql.createConnection({
          host,
          port,
          user,
          password,
          database,
        })
        await connection.end()
        return NextResponse.json({ success: true, message: "Conectado a MySQL" })
      }

      case "mongodb": {
        const { uri } = body
        const client = new MongoClient(uri)
        await client.connect()
        await client.close()
        return NextResponse.json({ success: true, message: "Conectado a MongoDB" })
      }

      case "redis": {
        const { host, port, password } = body
        const client = createRedisClient({
          socket: { host, port },
          password,
        })
        await client.connect()
        await client.quit()
        return NextResponse.json({ success: true, message: "Conectado a Redis" })
      }

      default:
        return NextResponse.json({ error: "Tipo de base de datos no soportado" }, { status: 400 })
    }
  } catch (error) {
    console.error("Connection error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al conectar" }, { status: 500 })
  }
}
