fs = require 'fs'
eco = require 'eco'
ghm = require 'github-flavored-markdown'
filed = require 'filed'
wrench = require 'wrench'
cc = require('./zeke')()

renderMarkdown = (proj='.', name) ->
  md = fs.readFileSync("#{proj}/pages#{name}.md").toString()
  ghm.parse(md)

renderHtml = (name) ->
  fs.readFileSync("./pages#{name}.html").toString()

renderCoffee = (name) ->
  coffee = fs.readFileSync("./pages#{name}.coffee").toString()
  cc.render coffee

renderTemplate = (proj='.', body="") ->
  template = fs.readFileSync "#{proj}/layout.html", "utf8"
  eco.render(template, body: body)

checkexists = (name, cb) ->
  fs.stat name, (err, stat) ->
    cb if err? then false else true

module.exports = (proj='.', cb) ->
  gen = "#{proj}/gen"
  # Remove gen directory if exists
  checkexists gen, (exists) -> 
    wrench.rmdirSyncRecursive(gen) if exists 
    # Create gen directory
    fs.mkdirSync(gen)
    # Read Pages Directory
    pages = wrench.readdirSyncRecursive("#{proj}/pages")
    # for each page render to gen directory as html files
    for page in pages
      console.log page
      page = page.replace("pages/",'')
      ext = page.split('.')[1]
      if ext is 'html'
        body = renderHtml '/' + page.replace('.html','')
      else if ext is 'coffee'
        body = renderCoffee '/' + page.replace('.coffee','')
        page = page.replace '.coffee', '.html'
      else if ext is 'md'
        body = renderMarkdown proj, '/' + page.replace('.md','')
        page = page.replace '.md', '.html'
      else
        fs.mkdirSync "#{gen}/#{page}"
      if ext?
        fs.writeFileSync "#{gen}/#{page}", renderTemplate(proj, body), 'utf8'
    # build asset folders
    for dir in ['images', 'javascripts', 'stylesheets', 'ico', 'img', 'js', 'css']
      try
        fs.mkdirSync("#{gen}/#{dir}")
        wrench.copyDirSyncRecursive "#{proj}/#{dir}", "#{gen}/#{dir}"
        console.log 'copy assets'
      catch err
        console.log err.message

    for misc in ['404.html', 'robots.txt']
      console.log 'copy misc'
      # change to sync copy...
      fs.copyFileSync "#{proj}/#{misc}", "#{gen}/#{misc}"
      #filed("#{proj}/#{misc}").pipe(filed("#{gen}/#{misc}"))

    console.log 'Generated Static Site in the gen folder...'
    cb null, 'success' if cb?