eco = require 'eco'
fs = require 'fs'
log = console.log

renderTemplate = (name, project, data={}) ->
  template = fs.readFileSync __dirname + "/../templates/#{name}.eco", "utf8"
  fs.writeFileSync "./#{project}/#{name}", eco.render(template, data)

copy = (src, dest) ->
  destFile = fs.createWriteStream dest
  fs.createReadStream(src).pipe(destFile)

buildFolders = (proj, cb) ->
  fs.mkdirSync directory, 0755 for directory in [
    "./#{proj}"
    "./#{proj}/pages"
    "./#{proj}/stylesheets"
    "./#{proj}/javascripts"
    "./#{proj}/images"
  ]
  cb()

buildFiles = (proj, cb) ->
  for template in ['layout.html', 'config.json', 'robots.txt', '404.html']
    renderTemplate(template, proj, title: proj)
  cb()

copyAssets = (proj, cb) ->
  for image in ['apple-touch-icon-114x114.png','apple-touch-icon-72x72.png', 'apple-touch-icon.png', 'favicon.ico']
    src = [__dirname, '..','templates','images', image].join('/')
    dest = [proj,'images', image].join('/')
    copy(src, dest)

  for js in ['tabs.js']
    src = [__dirname, '..','templates','javascripts', js].join('/')
    dest = [proj,'javascripts', js].join('/')
    copy(src, dest)

  for css in ['base.css', 'layout.css', 'skeleton.css']
    src = [__dirname, '..','templates','stylesheets', css].join('/')
    dest = [proj,'stylesheets', css].join('/')
    copy(src, dest)

  cb()

module.exports = (proj=null) ->
  return console.log('Project Name Required!') unless proj?
  buildFolders proj, -> log 'Building Folders...'
  buildFiles proj, -> log 'Creating Files...'
  copyAssets proj, -> log 'Creating Assets...'
  log 'Done.'