#!/usr/bin/env node

const redisPersistenceBridge = require('./redis-persistence-bridge')
const mysqlConnection = require('../connections/mysql').mysqlConnection

const MYSQL_TABLE = process.env.MYSQL_TABLE || 'table'
const MYSQL_CONTENT_FIELDS = process.env.MYSQL_CONTENT_FIELDS || 'content'
const MYSQL_KEY_FIELD = process.env.MYSQL_KEY_FIELD || 'id'

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
