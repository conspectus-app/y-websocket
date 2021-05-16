const yjs = require('yjs')
const LeveldbPersistence = require('y-leveldb').LeveldbPersistence
const getYDoc = require('./utils.js').getYDoc
const persistenceDir = process.env.YPERSISTENCE_LEVELDB_PATH

let leveldbPersistenceInstance = null

// needs to be tested
module.exports = {
  saveQuillDeltaToLevelDB: async function (
    documentName,
    sharedObjectName,
    delta
  ) {
    const leveldbPersistenceInstance = this.getLeveldbPersistenceInsatnce()
    await leveldbPersistenceInstance.clearDocument(documentName) // need to ivestigate how to clear single shared object, not entire doc
    const doc = await getYDoc(documentName)
    await doc.getText(sharedObjectName).applyDelta(delta)

  },
  getLeveldbPersistenceInsatnce: function () {
    if (leveldbPersistenceInstance === null) {
      leveldbPersistenceInstance = new LeveldbPersistence(persistenceDir)
    }
    return leveldbPersistenceInstance
  }
}
