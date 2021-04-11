const redisPersistenceBridge = require('./redis-persistence-bridge')

const http = require('http')

const host = process.env.YPERSISTENCE_HOST || 'localhost'
const port = process.env.YPERSISTENCE_PORT || 1235

const server = http.createServer((request, response) => {
  if (request.method === 'POST') {
    let body = ''

    request.on('data', function (data) {
      body += data
    })

    request.on('end', function () {
      const post = JSON.parse(body)
      redisPersistenceBridge.saveDeltaToRedis(post.docName, post.delta)
    })
  }
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

server.listen({ host, port })

console.log(`note syncronizer is running at '${host}' on port ${port}`)
