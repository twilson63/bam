http = require 'http'
url = require 'url'
filed = require 'filed'
w3 = require 'w3'
log = console.log

module.exports = (proj='.') ->
  w3 3000, './gen'
  # server = http.createServer (req, resp) ->
  #   pathname = url.parse(req.url).pathname
  #   pathname = '/index.html' if pathname == '/'
  #   filed("#{proj}/gen#{pathname}").pipe(resp)
  # server.listen 3000, ->
  #   log 'Listening on 3000...'
  #   log 'CTRL-C to exit..'    