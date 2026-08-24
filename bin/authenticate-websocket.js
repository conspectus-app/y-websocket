exports.authenticateWebSocket = function (authenticate, request, ws, onSuccess) {
  return authenticate(request)
    .then(onSuccess)
    .catch(error => {
      const statusCode = error && error.statusCode
      const accessDenied = statusCode >= 400 && statusCode < 500
      const closeCode = accessDenied ? 1008 : 1011
      const closeReason = accessDenied ? 'Authentication failed' : 'Authentication unavailable'

      console.warn(closeReason + '.', error)
      ws.close(closeCode, closeReason)
    })
}
