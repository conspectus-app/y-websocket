const yjs = require('yjs')
const RedisPersistence = require('y-redis').RedisPersistence

const REDIS_HOST = process.env.YPERSISTENCE_PATH || 'localhost'
const REDIS_PORT = process.env.YPERSISTENCE_POSRT || 6379

const redisPersistence = new RedisPersistence({
  redisOpts: { host: REDIS_HOST, port: REDIS_PORT }
})

// needs to be tested
module.exports = {
  saveDeltaToRedis: async function (docName, delta) {
    await redisPersistence.clearDocument(docName)
    const doc = new yjs.Doc()
    const persistedDoc = redisPersistence.bindState(docName, doc)
    await persistedDoc.synced
    doc.getText('note-quill-delta').applyDelta(delta)
    await persistedDoc.synced
  }
}
