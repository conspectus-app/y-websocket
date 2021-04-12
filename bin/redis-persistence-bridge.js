const yjs = require('yjs')
const RedisPersistence = require('y-redis').RedisPersistence

const REDIS_HOST = process.env.YPERSISTENCE_PATH || 'localhost'
const REDIS_PORT = process.env.YPERSISTENCE_PORT || 6379

const redisPersistence = new RedisPersistence({
  redisOpts: { host: REDIS_HOST, port: REDIS_PORT }
})

// needs to be tested
module.exports = {
  saveQuillDeltaToRedis: async function (documentName, sharedObjectName, delta) {
    await redisPersistence.clearDocument(documentName) // need to ivestigate how to clear single shared object, not entire doc
    const doc = new yjs.Doc()
    const persistedDoc = redisPersistence.bindState(documentName, doc)
    await persistedDoc.synced
    doc.getText(sharedObjectName).applyDelta(delta)
    await persistedDoc.synced
  }
}
