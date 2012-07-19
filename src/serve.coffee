http = require 'http'
url = require 'url'
filed = require 'filed'
log = console.log

module.exports = (proj='.') ->
  server = http.createServer (req, resp) ->
    # req.pipe(filed("#{proj}/gen")).pipe(resp)
    pathname = url.parse(req.url).pathname
    pathname = '/index.html' if pathname == '/'
    filed("#{proj}/gen#{pathname}").pipe(resp)
  server.listen 3000, ->
    log 'Listening on 3000...'
    log 'CTRL-C to exit..'    