const http = require('http')

const host = process.env.YPERSISTENCE_SYNCHRONIZER_HOST || 'localhost'
const port = process.env.YPERSISTENCE_SYNCHRONIZER_PORT || 1235

const server = http.createServer((request, response) => {
  if (request.method === 'POST') {
    let body = ''

    request.on('data', function (data) {
      body += data
    })

    request.on('end', function () {
      const post = JSON.parse(body)
      for (const sharedObject of post.sharedObjects) {
        // redisPersistenceBridge.saveQuillDeltaToRedis(post.documentName, sharedObject.name, sharedObject.delta)
      }
    })
  }
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ status: 'ok' }))
})

server.listen({ host, port })

console.log(`note synchronizer is running at '${host}' on port ${port}`)
