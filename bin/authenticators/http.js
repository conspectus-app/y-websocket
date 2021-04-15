const authCallback = process.env.YWEBSOCKET_HTTP_AUTH_CALLBACK || 'http://localhost/auth/'
const authRequester = require('http')

module.exports = {
  authenticate: function (request) {
    return new Promise(function (resolve, reject) {
      const docName = request.url.substring(1)
      const authCallbackWithRoomCode = authCallback + docName
      const authRequest = authRequester.request(authCallbackWithRoomCode,
        {
          method: 'GET',
          headers: {
            Cookie: request.headers.cookie || ''
          }
        },
        (response) => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            return reject(new Error('statusCode=' + response.statusCode))
          }
          response.setEncoding('utf8')
          let rawData = ''
          response.on('data', (chunk) => {
            rawData += chunk
          })
          response.on('end', () => {
            const data = JSON.parse(rawData)
            if (data.status === 'ok') {
              resolve(true)
            }
          })
          authRequest.on('error', function (error) {
            reject(error)
          })
          authRequest.end()
        })
    })
  }
}
