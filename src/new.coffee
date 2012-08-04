eco = require 'eco'
fs = require 'fs'
wrench = require 'wrench'
log = console.log

coreFiles = ['server.js', 'package.json', 'robots.txt', '404.html']
project = null
template = null

# bam new [site] [template]
#
# This module creates a new project folder
# then copies a template based on the name
# of the requested template.
module.exports = (proj=null,tmpl,cb) ->
  if typeof tmpl is 'function' then cb = tmpl; tmpl = null
  return console.log('Project Name Required!') unless proj?
  [project, template] = [proj, tmpl || "skeleton"]
  log 'Building Project Folder...' if process.env.NODE_ENV == 'debug'
  buildProjectFolder -> 
    log 'Building Files...' if process.env.NODE_ENV == 'debug'
    buildFiles -> 
      log 'Copying Assests...' if process.env.NODE_ENV == 'debug'
      copyAssets -> 
        log 'Building Layout...' if process.env.NODE_ENV == 'debug'
        buildLayout -> 
          log 'Done....'
          cb(null, 'Done')

# ## buildProjectFolder
#
# * param cb
buildProjectFolder = (cb) ->
  fs.exists "./#{project}", (exists) -> 
    # Remove gen directory if exists
    wrench.rmdirSyncRecursive("./#{project}") if exists 
    fs.mkdirSync project, 0o0755
    cb null

# ## buildFiles
#
# build core files
# 
# * param cb - callback
buildFiles = (cb) ->
  renderTemplate(tmp, project, title: project) for tmp in coreFiles
  cb(null)

# ## buildLayout
#
# build layout
#
# * param cb - callback
buildLayout = (cb) ->
  tmp = fs.readFileSync __dirname + "/../templates/#{template}/layout.html.eco", "utf8"
  fs.writeFileSync "./#{project}/layout.html", eco.render(tmp, title: project)
  cb(null)

# ## copyAssets
#
# copy assets (js, img, css)
#
# * param cb - callback
copyAssets = (cb) ->
  copy = (dir) ->
    fs.exists "#{__dirname}/../templates/#{template}/#{dir}", (exists) ->
      try
        fs.mkdirSync("./#{project}/#{dir}")
        wrench.copyDirSyncRecursive "#{__dirname}/../templates/#{template}/#{dir}", "./#{project}/#{dir}"
      catch err
        console.log err.message if process.env.NODE_ENV == 'debug'
  copy(dir) for dir in ['images', 'javascripts', 'stylesheets', 'ico', 'img', 'js', 'css','pages']
  cb(null)

# ## renderTemplate
#
# method that renders ECO templates
#
# * param name - template-name - string
# * param project - project-folder - string
# * param data - any data to pass to the the template - optional
renderTemplate = (name, data={}) ->
  tmp = fs.readFileSync __dirname + "/../templates/#{name}.eco", "utf8"
  fs.writeFileSync "./#{project}/#{name}", eco.render(tmp, data)
  true

# ## copy
# 
# copies src file to dest location using streams
#
# * param src - name of the file to copy
# * param dest - name of the dest file
copy = (src, dest) ->
  destFile = fs.createWriteStream dest
  fs.createReadStream(src).pipe(destFile)
  true