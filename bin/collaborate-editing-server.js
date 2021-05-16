/**
 * @type {any}
 */
const WebSocket = require('ws')
const http = require('http')
const wss = new WebSocket.Server({ noServer: true })
const setupWSConnection = require('./utils.js').setupWSConnection

const host = process.env.YWEBSOCKET_HOST || 'localhost'
const port = process.env.YWEBSOCKET_PORT || 1234
const authenticator = process.env.YWEBSOCKET_AUTHENTICATOR || null

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ status: 'ok' }))
})

wss.on('connection', setupWSConnection)

server.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  /**
    * @param {any} ws
    */
  const handleAuth = ws => {
    if (authenticator) {
      const authenticate = require('./authenticators/' + authenticator).authenticate
      authenticate(request).then(() => {
        wss.emit('connection', ws, request)
      })
    } else {
      wss.emit('connection', ws, request)
    }
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen({ host, port })

console.log(`collabortate editing server is running at '${host}' on port ${port}`)
