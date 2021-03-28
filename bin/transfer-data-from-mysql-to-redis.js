#!/usr/bin/env node

const yjs = require('yjs')
const mysql = require('mysql2')
const RedisPersistence = require('y-redis').RedisPersistence

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost'
const MYSQL_USER = process.env.MYSQL_USER || 'root'
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || ''
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'database'
const MYSQL_TABLE = process.env.MYSQL_TABLE || 'table'
const MYSQL_CONTENT_FIELD = process.env.MYSQL_CONTENT_FIELD || 'content'
const MYSQL_KEY_FIELD = process.env.MYSQL_KEY_FIELD || 'id'
const MYSQL_PORT = process.env.MYSQL_PORT || 3306

const REDIS_HOST = process.env.YPERSISTENCE_PATH || 'localhost'
const REDIS_PORT = process.env.YPERSISTENCE_POSRT || 6379

const redisPersistence = new RedisPersistence({
  redisOpts: { host: REDIS_HOST, port: REDIS_PORT }
})

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
  'SELECT ' +
    MYSQL_KEY_FIELD +
    ', ' +
    MYSQL_CONTENT_FIELD +
    ' FROM ' +
    MYSQL_TABLE,
  function (error, notes, fields) {
    if (error) {
      throw error
    }
    (async () => {
      processMysqlDeltas(notes)
    })()
  }
)

// needs to be tested
async function saveDeltaToRedis (docName, delta) {
  await redisPersistence.clearDocument(docName)
  const doc = new yjs.Doc()
  const persistedDoc = redisPersistence.bindState(docName, doc)
  await persistedDoc.synced
  doc.getText('note-quill-delta').applyDelta(delta)
  await persistedDoc.synced
}

async function processMysqlDeltas (notes) {
  for (const note of notes) {
    const noteCode = note.code
    const noteDelta = JSON.parse(note.ops_json)
    await saveDeltaToRedis(noteCode, noteDelta)
  }
}

// process.exit(0)
