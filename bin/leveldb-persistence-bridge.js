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
    console.log('saving to yjs is disabled')
    return

    // This code does not work properly: it does not use what's already in leveldb
    // and also results in document content doubling (since it is not cleared).

    // console.log(documentName, sharedObjectName, delta)
    // const leveldbPersistenceInstance = this.getLeveldbPersistenceInsatnce()
    // await leveldbPersistenceInstance.clearDocument(documentName) // need to ivestigate how to clear single shared object, not entire doc
    // const doc = await getYDoc(documentName)
    // await doc.getText(sharedObjectName).applyDelta(delta)

  },
  getLeveldbPersistenceInsatnce: function () {
    if (leveldbPersistenceInstance === null) {
      leveldbPersistenceInstance = new LeveldbPersistence(persistenceDir)
    }
    return leveldbPersistenceInstance
  }
}
