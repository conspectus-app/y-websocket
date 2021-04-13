const mysqlConnection = require('../connections/mysql').mysqlConnection

function parseCookies (cookies) {
  const list = {}

  cookies && cookies.split(';').forEach(function (cookie) {
    const parts = cookie.split('=')
    list[parts.shift().trim()] = decodeURI(parts.join('='))
  })

  return list
}

module.exports = {
  authenticate: function (request) {
    const rawCookies = request.headers.cookie
    if (!rawCookies) {
      return false
    }
    const cookies = parseCookies(rawCookies)
    if (!cookies.sessionId) {
      return false
    }
    let authenticated = false
    mysqlConnection.query(
      'SELECT session_key FROM django_session WHERE session_key = ?',
      [cookies.sessionId],
      function (error, rows, fields) {
        if (error) {
          throw error
        }
        authenticated = rows.length === 1
      }
    )
    return authenticated
  }
}
