// MongoDB initialization script
//const testdb = db.getSiblingDB("testdb")
//const db = db.getSiblingDB("testdb")

/* global db */
// MongoDB initialization script
// 'db' is a global variable provided by MongoDB shell
const testdb = db.getSiblingDB("testdb")

testdb.createCollection("users")
testdb.createCollection("products")

testdb.users.insertMany([
  { name: "Roberto Díaz", email: "roberto@example.com", age: 28, createdAt: new Date() },
  { name: "Sofia Torres", email: "sofia@example.com", age: 32, createdAt: new Date() },
  { name: "Miguel Ruiz", email: "miguel@example.com", age: 25, createdAt: new Date() },
])

testdb.products.insertMany([
  { name: "Tablet", price: 399.99, stock: 12, category: "Electronics", createdAt: new Date() },
  { name: "Charger", price: 24.99, stock: 100, category: "Accessories", createdAt: new Date() },
  { name: "Case", price: 19.99, stock: 75, category: "Accessories", createdAt: new Date() },
])
