fs = require 'fs'
ghm = require 'github-flavored-markdown'
cc = require('./zeke')()
wrench = require 'wrench'
eco = require 'eco'

renderTemplate = (proj='.', body="") ->
  template = fs.readFileSync "#{proj}/layout.html", "utf8"
  eco.render(template, body: body)

class Page
  constructor: (@pathname='') ->
    @pages = wrench.readdirSyncRecursive('pages')
    
    # find first ext from pages folder
    unless @pathname is ''
      (@ext = page.split('.')[1] for page, index in @pages when '/' + page?.split('.')[0] is pathname)

  markdown: -> ghm.parse fs.readFileSync("./pages#{@pathname}.md").toString()
  html: -> fs.readFileSync("./pages#{@pathname}.html").toString()
  coffee: -> cc.render fs.readFileSync("./pages#{@pathname}.coffee").toString()

  render: -> 
    body = switch @ext
      when 'coffee' then do @coffee
      when 'md' then do @markdown
      else do @html
    renderTemplate('.', body)

  build: (body, page, gen) ->
    name = page.split('.')[0]
    if body is 'DIR'
      fs.mkdirSync "#{gen}/#{name}"
    else
      fullName = [name, 'html'].join('.')
      fs.writeFileSync "#{gen}/#{fullName}", body, 'utf8'
  
  # generate html for all pages
  all: (dest, proj) ->
    @proj = proj
    console.log @pages
    for page in @pages
      [@pathname, @ext] = "/#{page}".split('.')
      body = if @ext? then do @render else 'DIR'
      @build body, page, dest

module.exports = Page
