eco = require 'eco'
fs = require 'fs'
wrench = require 'wrench'
log = console.log

checkexists = (name, cb) ->
  fs.stat name, (err, stat) ->
    cb if err? then false else true

renderTemplate = (name, project, data={}) ->
  template = fs.readFileSync __dirname + "/../templates/#{name}.eco", "utf8"
  fs.writeFileSync "./#{project}/#{name}", eco.render(template, data)

copy = (src, dest) ->
  destFile = fs.createWriteStream dest
  fs.createReadStream(src).pipe(destFile)

buildFolders = (proj, cb) ->
  log 'Building Folders...'
  # Remove gen directory if exists
  checkexists "./#{proj}", (exists) -> 
    wrench.rmdirSyncRecursive("./#{proj}") if exists 
    fs.mkdirSync directory, 0755 for directory in [
      "./#{proj}"
      "./#{proj}/pages"
    ]
    cb()

buildFiles = (proj, cb) ->
  log 'Creating Files...'
  for template in ['s3.json', 'server.js', 'package.json', 'robots.txt', '404.html']
    renderTemplate(template, proj, title: proj)
  cb()

buildLayout = (proj, tmpl="skeleton", cb) ->
  log 'Creating Layout...'
  template = fs.readFileSync __dirname + "/../templates/#{tmpl}/layout.html.eco", "utf8"
  fs.writeFileSync "./#{proj}/layout.html", eco.render(template, title: proj)
  cb()
  
copyAssets = (proj, tmpl="skeleton", cb) ->
  log 'Creating Assets...'
  for dir in ['images', 'javascripts', 'stylesheets']
    fs.mkdirSync("./#{proj}/#{dir}")
    wrench.copyDirSyncRecursive "#{__dirname}/../templates/#{tmpl}/#{dir}", "./#{proj}/#{dir}"
  cb()

module.exports = (proj=null,tmpl,cb) ->
  if typeof tmpl is 'function' then cb = tmpl
  return console.log('Project Name Required!') unless proj?
  buildFolders proj, -> buildFiles proj, -> 
    buildLayout proj, tmpl, -> copyAssets proj, tmpl, -> cb(null, 'Done')