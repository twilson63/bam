http = require 'http'
url = require 'url'
fs = require 'fs'
filed = require 'filed'
log = console.log
Page = require './page'

module.exports = (port, proj='.') ->
  server = http.createServer (req, resp) ->
    pathname = url.parse(req.url).pathname
    pathname = '/index.html' if pathname is '/'

    try
      if /^\/(stylesheets|images|javascripts|css|img|js)/.test(pathname)
        filed(".#{pathname}").pipe(resp)
      else
        pathname = pathname.replace '.html', ''
        resp.writeHead 200, 'Content-Type: text/html'
        resp.end (new Page(pathname)).render()
    catch err
      log "Unable to locate file #{pathname}"
      filed('./404.html').pipe(resp)

  try
    server.listen port or 3000, -> log "Server running on port #{port or 3000}" 
  catch err
    log 'Not able to detect BAM application'