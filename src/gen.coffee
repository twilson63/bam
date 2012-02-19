fs = require 'fs'
eco = require 'eco'
ghm = require 'github-flavored-markdown'
filed = require 'filed'
wrench = require 'wrench'

renderMarkdown = (name) ->
  md = fs.readFileSync("./pages#{name}.md").toString()
  ghm.parse(md)

renderTemplate = (body="") ->
  template = fs.readFileSync "./layout.html", "utf8"
  eco.render(template, body: body)

checkexists = (name, cb) ->
  fs.stat name, (err, stat) ->
    cb if err? then false else true

module.exports = (proj='.') ->
  gen = "#{proj}/gen"
  # Remove gen directory if exists
  checkexists gen, (exists) -> 
    wrench.rmdirSyncRecursive(gen) if exists 
    # Create gen directory
    fs.mkdirSync(gen)
    # Read Pages Directory
    pages = fs.readdirSync('./pages')
    # for each page render to gen directory as html files
    for page in pages
      body = renderMarkdown '/' + page.replace('.md','')
      page = page.replace '.md', '.html'
      fs.writeFileSync "#{gen}/#{page}", renderTemplate(body), 'utf8'
    # build asset folders
    for dir in ['images', 'javascripts', 'stylesheets']
      fs.mkdirSync("#{gen}/#{dir}")
      wrench.copyDirSyncRecursive "./#{dir}", "#{gen}/#{dir}"

    for misc in ['404.html', 'robots.txt']
      filed("./#{misc}").pipe(filed("#{gen}/#{misc}"))

    console.log 'Generated Static Site in the gen folder...'