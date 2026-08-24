const assert = require('assert')
const http = require('http')
const authenticateWebSocket = require('./authenticate-websocket').authenticateWebSocket

const listen = server => new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const close = server => new Promise(resolve => server.close(resolve))

const rejectsWithStatus = async (promise, statusCode) => {
  await assert.rejects(promise, error => error.statusCode === statusCode)
}

const run = async () => {
  const authServer = http.createServer((request, response) => {
    const code = new URL(request.url, 'http://127.0.0.1').searchParams.get('code')

    if (code === 'forbidden') {
      response.writeHead(403)
      return response.end()
    }
    if (code === 'invalid') {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      return response.end('not json')
    }
    if (code === 'slow') {
      return setTimeout(() => response.end('{"status":"ok"}'), 200)
    }

    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ status: code === 'ok' ? 'ok' : 'denied' }))
  })

  await listen(authServer)
  const address = authServer.address()
  process.env.YWEBSOCKET_HTTP_AUTH_CALLBACK = `http://127.0.0.1:${address.port}/auth/`
  process.env.YWEBSOCKET_HTTP_AUTH_TIMEOUT = '50'
  const authenticate = require('./authenticators/http').authenticate
  const request = code => ({ url: '/' + code, headers: {} })

  assert.strictEqual(await authenticate(request('ok')), true)
  await rejectsWithStatus(authenticate(request('denied')), 403)
  await rejectsWithStatus(authenticate(request('forbidden')), 403)
  await assert.rejects(authenticate(request('invalid')), /Invalid authentication response/)
  await assert.rejects(authenticate(request('slow')), /timed out/)

  const closeCalls = []
  const ws = { close: (code, reason) => closeCalls.push({ code, reason }) }
  let successCalls = 0
  const originalWarn = console.warn
  console.warn = () => {}
  try {
    await authenticateWebSocket(() => Promise.resolve(true), request('ok'), ws, () => { successCalls += 1 })
    await authenticateWebSocket(() => Promise.reject(Object.assign(new Error('denied'), { statusCode: 403 })), request('denied'), ws, () => {})
    await authenticateWebSocket(() => Promise.reject(new Error('offline')), request('offline'), ws, () => {})
  } finally {
    console.warn = originalWarn
  }
  assert.strictEqual(successCalls, 1)
  assert.deepStrictEqual(closeCalls, [
    { code: 1008, reason: 'Authentication failed' },
    { code: 1011, reason: 'Authentication unavailable' }
  ])

  await close(authServer)
  await assert.rejects(authenticate(request('offline')), /ECONNREFUSED/)
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
