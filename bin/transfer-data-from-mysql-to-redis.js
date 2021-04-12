#!/usr/bin/env node

const redisPersistenceBridge = require('./redis-persistence-bridge')

const mysql = require('mysql2')

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost'
const MYSQL_USER = process.env.MYSQL_USER || 'root'
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || ''
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'database'
const MYSQL_TABLE = process.env.MYSQL_TABLE || 'table'
const MYSQL_CONTENT_FIELDS = process.env.MYSQL_CONTENT_FIELDS || 'content'
const MYSQL_KEY_FIELD = process.env.MYSQL_KEY_FIELD || 'id'
const MYSQL_PORT = process.env.MYSQL_PORT || 3306

const mysqlConnection = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  database: MYSQL_DATABASE,
  password: MYSQL_PASSWORD,
  port: MYSQL_PORT
})

mysqlConnection.connect(function (error) {
  if (error) throw error
})

mysqlConnection.query(
  `SELECT ${MYSQL_KEY_FIELD}, ${MYSQL_CONTENT_FIELDS} FROM ${MYSQL_TABLE}`,
  function (error, rows, fields) {
    if (error) {
      throw error
    }
    (async () => {
      processMysqlDeltas(rows, fields)
    })()
  }
)

async function processMysqlDeltas (rows, fields) {
  for (const row of rows) {
    const key = row[MYSQL_KEY_FIELD]
    for (const field of fields) {
      if (field.name === MYSQL_KEY_FIELD) {
        continue
      }
      const delta = JSON.parse(row[field.name])
      await redisPersistenceBridge.saveQuillDeltaToRedis(key, field.name, delta)
    }
  }
}
