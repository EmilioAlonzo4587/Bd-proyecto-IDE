# Database IDE - Mini Entorno de Desarrollo

Una aplicación web IDE que permite conectarse a bases de datos SQL (PostgreSQL, MySQL) y NoSQL (MongoDB, Redis), ejecutar comandos DDL y DML, y visualizar los resultados.

## Características

- ✅ Conexión a PostgreSQL y MySQL (SQL)
- ✅ Conexión a MongoDB y Redis (NoSQL)
- ✅ Ejecución de comandos DDL (CREATE, ALTER, DROP)
- ✅ Ejecución de comandos DML (SELECT, INSERT, UPDATE, DELETE)
- ✅ Visualización de resultados en tablas
- ✅ Interfaz moderna y responsive
- ✅ Configuración con Docker

## Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 18+ (para desarrollo local)

## Instalación y Uso

### 1. Iniciar las bases de datos con Docker

\`\`\`bash
# Iniciar todos los contenedores
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps

# Ver logs
docker-compose logs -f
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno

\`\`\`bash
cp .env.example .env
\`\`\`

### 4. Iniciar la aplicación

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en \`http://localhost:3000\`

## Credenciales de las Bases de Datos

### PostgreSQL
- Host: localhost
- Puerto: 5432
- Usuario: postgres
- Contraseña: postgres123
- Base de datos: testdb

### MySQL
- Host: localhost
- Puerto: 3306
- Usuario: mysql
- Contraseña: mysql123
- Base de datos: testdb

### MongoDB
- URI: mongodb://mongo:mongo123@localhost:27017/testdb?authSource=admin

### Redis
- Host: localhost
- Puerto: 6379
- Contraseña: redis123

## Ejemplos de Comandos

### PostgreSQL / MySQL (SQL)

**DDL:**
\`\`\`sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    salary DECIMAL(10,2)
);

ALTER TABLE employees ADD COLUMN department VARCHAR(50);

DROP TABLE employees;
\`\`\`

**DML:**
\`\`\`sql
SELECT * FROM users;
INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com');
UPDATE users SET name = 'Updated Name' WHERE id = 1;
DELETE FROM users WHERE id = 1;
\`\`\`

### MongoDB (NoSQL)

\`\`\`javascript
db.users.find({})
db.users.insertOne({ name: "New User", email: "new@example.com" })
db.users.updateOne({ name: "New User" }, { $set: { age: 30 } })
db.users.deleteOne({ name: "New User" })
db.createCollection("orders")
db.orders.drop()
\`\`\`

### Redis (NoSQL)

\`\`\`
SET mykey "Hello World"
GET mykey
DEL mykey
KEYS *
HSET user:1 name "John" age 30
HGET user:1 name
\`\`\`

## Detener los Contenedores

\`\`\`bash
docker-compose down

# Para eliminar también los volúmenes (datos)
docker-compose down -v
\`\`\`

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/          # API routes para conexiones a BD
│   ├── page.tsx      # Página principal
│   └── layout.tsx    # Layout de la aplicación
├── components/       # Componentes React
├── scripts/          # Scripts de inicialización de BD
├── docker-compose.yml
└── README.md
\`\`\`

## Tecnologías Utilizadas

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Bases de Datos:** PostgreSQL, MySQL, MongoDB, Redis
- **Contenedores:** Docker, Docker Compose
- **Librerías:** pg, mysql2, mongodb, redis
\`\`\`
