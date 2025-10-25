import { type NextRequest, NextResponse } from "next/server"
import { Client as PgClient } from "pg"
import mysql from "mysql2/promise"
import { MongoClient } from "mongodb"
import { createClient as createRedisClient } from "redis"
import type { Connection } from "@/types/database"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { connection, query } = (await request.json()) as {
      connection: Connection
      query: string
    }

    if (!connection || !query) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos", executionTime: 0 },
        { status: 400 },
      )
    }

    let result

    switch (connection.type) {
      case "postgresql":
        result = await executePostgreSQL(connection, query)
        break
      case "mysql":
        result = await executeMySQL(connection, query)
        break
      case "mongodb":
        result = await executeMongoDB(connection, query)
        break
      case "redis":
        result = await executeRedis(connection, query)
        break
      default:
        return NextResponse.json(
          { success: false, error: "Tipo de base de datos no soportado", executionTime: 0 },
          { status: 400 },
        )
    }

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      ...result,
      executionTime,
    })
  } catch (error) {
    const executionTime = Date.now() - startTime
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        executionTime,
      },
      { status: 500 },
    )
  }
}

async function executePostgreSQL(connection: Connection, query: string) {
  const client = new PgClient({
    host: connection.host,
    port: connection.port,
    database: connection.database,
    user: connection.username,
    password: connection.password,
  })

  try {
    await client.connect()
    const result = await client.query(query)

    return {
      data: result.rows,
      columns: result.fields.map((field) => field.name),
      rowCount: result.rowCount || 0,
    }
  } finally {
    await client.end()
  }
}

async function executeMySQL(connection: Connection, query: string) {
  const conn = await mysql.createConnection({
    host: connection.host,
    port: connection.port,
    database: connection.database,
    user: connection.username,
    password: connection.password,
  })

  try {
    const [rows, fields] = await conn.execute(query)

    return {
      data: Array.isArray(rows) ? rows : [],
      columns: Array.isArray(fields) ? fields.map((field: any) => field.name) : [],
      rowCount: Array.isArray(rows) ? rows.length : 0,
    }
  } finally {
    await conn.end()
  }
}

async function executeMongoDB(connection: Connection, query: string) {
  console.log("[v0] MongoDB connection attempt:", {
    host: connection.host,
    port: connection.port,
    username: connection.username,
    database: connection.database,
  })

  const authDatabase = "admin" // Always authenticate against admin database
  const targetDatabase = connection.database || "testdb"

  const url = `mongodb://${connection.username}:${connection.password}@${connection.host}:${connection.port}/?authSource=${authDatabase}`

  console.log("[v0] MongoDB URL (without password):", url.replace(connection.password, "****"))

  const client = new MongoClient(url, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  })

  try {
    console.log("[v0] Attempting to connect to MongoDB...")
    await client.connect()
    console.log("[v0] MongoDB connected successfully")

    const db = client.db(targetDatabase)
    console.log("[v0] Using database:", targetDatabase)

    // Parse JSON query
    const parsedQuery = JSON.parse(query)

    if (parsedQuery.createCollection) {
      await db.createCollection(parsedQuery.createCollection)
      return {
        data: [{ message: `Colección '${parsedQuery.createCollection}' creada exitosamente` }],
        columns: ["message"],
        rowCount: 1,
      }
    }

    if (parsedQuery.listCollections) {
      const collections = await db.listCollections().toArray()
      return {
        data: collections,
        columns: collections.length > 0 ? Object.keys(collections[0]) : ["name"],
        rowCount: collections.length,
      }
    }

    const { collection, query: mongoQuery, document, update } = parsedQuery

    if (!collection) {
      throw new Error("Se requiere especificar una colección")
    }

    const coll = db.collection(collection)

    if (parsedQuery.delete || (mongoQuery && !document && !update)) {
      // Check if it's a delete operation
      if (parsedQuery.delete) {
        const result = await coll.deleteMany(mongoQuery || {})
        return {
          data: [{ deletedCount: result.deletedCount }],
          columns: ["deletedCount"],
          rowCount: 1,
        }
      }
    }

    // Determine operation type
    if (document) {
      // Insert operation
      const result = await coll.insertOne(document)
      return {
        data: [{ insertedId: result.insertedId }],
        columns: ["insertedId"],
        rowCount: 1,
      }
    } else if (update) {
      // Update operation
      const result = await coll.updateMany(mongoQuery || {}, update)
      return {
        data: [{ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount }],
        columns: ["matchedCount", "modifiedCount"],
        rowCount: 1,
      }
    } else if (mongoQuery && Object.keys(mongoQuery).length === 0) {
      // Find all
      const docs = await coll.find({}).limit(100).toArray()
      const columns = docs.length > 0 ? Object.keys(docs[0]) : []
      return {
        data: docs,
        columns,
        rowCount: docs.length,
      }
    } else {
      // Find with query
      const docs = await coll
        .find(mongoQuery || {})
        .limit(100)
        .toArray()
      const columns = docs.length > 0 ? Object.keys(docs[0]) : []
      return {
        data: docs,
        columns,
        rowCount: docs.length,
      }
    }
  } catch (error) {
    console.error("[v0] MongoDB error:", error)
    throw error
  } finally {
    await client.close()
  }
}

async function executeRedis(connection: Connection, query: string) {
  const client = createRedisClient({
    socket: {
      host: connection.host,
      port: connection.port,
    },
    password: connection.password,
  })

  try {
    await client.connect()

    // Parse Redis command
    const parts = query.trim().split(/\s+/)
    const command = parts[0].toUpperCase()
    const args = parts.slice(1)

    let result: any

    switch (command) {
      case "GET":
        result = await client.get(args[0])
        break
      case "SET":
        result = await client.set(args[0], args.slice(1).join(" "))
        break
      case "DEL":
        result = await client.del(args)
        break
      case "KEYS":
        result = await client.keys(args[0] || "*")
        break
      case "HGETALL":
        result = await client.hGetAll(args[0])
        break
      case "HGET":
        result = await client.hGet(args[0], args[1])
        break
      case "HSET":
        result = await client.hSet(args[0], args[1], args[2])
        break
      default:
        throw new Error(`Comando Redis no soportado: ${command}`)
    }

    // Format result for display
    const data = Array.isArray(result)
      ? result.map((item) => ({ value: item }))
      : typeof result === "object" && result !== null
        ? [result]
        : [{ value: result }]

    const columns = Array.isArray(result) ? ["value"] : Object.keys(data[0])

    return {
      data,
      columns,
      rowCount: data.length,
    }
  } finally {
    await client.disconnect()
  }
}
