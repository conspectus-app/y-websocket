const authCallback = process.env.YWEBSOCKET_HTTP_AUTH_CALLBACK || 'http://localhost/auth/'
const authCallbackParam = process.env.YWEBSOCKET_HTTP_AUTH_CALLBACK_GET_PARAM || 'code'
const configuredAuthTimeout = Number(process.env.YWEBSOCKET_HTTP_AUTH_TIMEOUT || 5000)
const authTimeout = Number.isFinite(configuredAuthTimeout) && configuredAuthTimeout > 0
  ? configuredAuthTimeout
  : 5000
const querystring = require('querystring')

const createAuthError = function (message, statusCode) {
  const error = new Error(message)
  if (statusCode) {
    error.statusCode = statusCode
  }
  return error
}

module.exports = {
  authenticate: function (request) {
    return new Promise(function (resolve, reject) {
      const docName = request.url.substring(1)
      const query = querystring.stringify({
        [authCallbackParam]: docName
      })
      let authRequester
      if (authCallback.indexOf('https:') === 0) {
        authRequester = require('https')
      } else {
        authRequester = require('http')
      }
      const authCallbackWithRoomCode = authCallback + '?' + query
      const authRequest = authRequester.request(
        authCallbackWithRoomCode,
        {
          method: 'GET',
          timeout: authTimeout,
          headers: {
            Cookie: request.headers.cookie || ''
          }
        },
        response => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            response.resume()
            return reject(createAuthError('statusCode=' + response.statusCode, response.statusCode))
          }
          response.setEncoding('utf8')
          let rawData = ''
          response.on('data', chunk => {
            rawData += chunk
          })
          response.on('error', reject)
          response.on('end', () => {
            let data
            try {
              data = JSON.parse(rawData)
            } catch (error) {
              return reject(createAuthError('Invalid authentication response: ' + error.message))
            }

            if (data.status === 'ok') {
              return resolve(true)
            }

            reject(createAuthError('Authentication denied', 403))
          })
        }
      )
      authRequest.on('timeout', function () {
        authRequest.destroy(createAuthError('Authentication request timed out'))
      })
      authRequest.on('error', function (error) {
        reject(error)
      })
      authRequest.end()
    })
  }
}
