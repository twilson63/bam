http = require 'http'
url = require 'url'
eco = require 'eco'
ghm = require 'github-flavored-markdown'
fs = require 'fs'
filed = require 'filed'
log = console.log
wrench = require 'wrench'
cc = require('./zeke')()

renderMarkdown = (name) ->
  md = fs.readFileSync("./pages#{name}.md").toString()
  ghm.parse(md)

renderHtml = (name) ->
  console.log name
  fs.readFileSync("./pages#{name}.html").toString()

renderCoffee = (name) ->
  coffee = fs.readFileSync("./pages#{name}.coffee").toString()
  cc.render coffee

renderTemplate = (body="") ->
  template = fs.readFileSync "./layout.html", "utf8"
  eco.render(template, body: body)

module.exports = (port, proj='.') ->
  server = http.createServer (req, resp) ->
    pages = wrench.readdirSyncRecursive('pages')
    pathname = url.parse(req.url).pathname
    pathname = '/index.html' if pathname == '/'
    try
      if pathname.match /^\/(stylesheets|images|javascripts|css|img|js)/
        filed(".#{pathname}").pipe(resp)
      else
        pathname = pathname.replace '.html', ''
        (ext = page.split('.')[1] for page, index in pages when '/' + page?.split('.')[0] is pathname)
        if ext is 'html'
          body = renderHtml pathname
        else if ext is 'coffee'
          body = renderCoffee pathname
        else
          body = renderMarkdown pathname
        resp.writeHead 200, 'Content-Type: text/html'
        resp.end renderTemplate(body)
    catch err
      console.log "Unable to locate file #{pathname}"
      filed('./404.html').pipe(resp)
  
  try
    server.listen port or 3000, ->
      console.log 'Server running on port ' + port or '3000'
  catch err
    console.log 'Not able to detect BAM application'