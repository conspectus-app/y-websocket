const http = require('http')

const host = process.env.YPERSISTENCE_SYNCHRONIZER_HOST || 'localhost'
const port = process.env.YPERSISTENCE_SYNCHRONIZER_PORT || 1235
const leveldbPersistenceInstance = require('./leveldb-persistence-bridge')

const synchronizationQueue = []

setInterval(() => {
  if (synchronizationQueue.length === 0) {
    return
  }
  const post = synchronizationQueue.pop()
  for (const sharedObject of post.shared_objects) {
    console.log(post.document_name, sharedObject.name, sharedObject.delta)
    leveldbPersistenceInstance.saveQuillDeltaToLevelDB(
      post.document_name,
      sharedObject.name,
      sharedObject.delta
    )
  }
})

const server = http.createServer((request, response) => {
  if (request.method === 'POST') {
    let body = ''

    request.on('data', function (data) {
      body += data
    })

    request.on('end', function () {
      const post = JSON.parse(body)
      synchronizationQueue.unshift(post)
    })
  }
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ status: 'ok' }))
})

server.listen({ host, port })

console.log(`note synchronizer is running at '${host}' on port ${port}`)
