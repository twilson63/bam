http = require 'http'
url = require 'url'
eco = require 'eco'
ghm = require 'github-flavored-markdown'
fs = require 'fs'
filed = require 'filed'
log = console.log

renderMarkdown = (name) ->
  md = fs.readFileSync("./pages#{name}.md").toString()
  ghm.parse(md)

renderTemplate = (body="") ->
  template = fs.readFileSync "./layout.html", "utf8"
  eco.render(template, body: body)

module.exports = (proj='.') ->
  server = http.createServer (req, resp) ->
    pathname = url.parse(req.url).pathname
    pathname = '/index.html' if pathname == '/'
    try
      if pathname.match /(stylesheets|images|javascripts)/
        filed(".#{pathname}").pipe(resp)
      else
        pathname = pathname.replace '.html', ''
        body = renderMarkdown pathname
        resp.writeHead 200, 'Content-Type: text/html'
        resp.end renderTemplate(body)
    catch err
      console.log err
      filed('./404.html').pipe(resp)

  server.listen 3000, ->
    log 'Listening on 3000...'
    log 'CTRL-C to exit..'