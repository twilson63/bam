fs = require 'fs'
wrench = require 'wrench'
log = console.log
eco = require './util/eco'

DEBUG = process.env.NODE_ENV == 'debug'
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
  done = ->
    log 'Done....'
    cb(null, 'Done')

  buildProjectFolder -> buildFiles -> copyAssets -> buildLayout -> done()

# ## buildProjectFolder
#
# * param cb
buildProjectFolder = (cb) ->
  log 'Building Project Folder...' if DEBUG
  fs.exists "./#{project}", (exists) => 
    # Remove gen directory if exists
    wrench.rmdirSyncRecursive("./#{project}") if exists 
    fs.mkdirSync project, 0o0755
    cb(null) if cb?

# ## buildFiles
#
# build core files
# 
# * param cb - callback
buildFiles = (cb) ->
  log 'Building Files...' if DEBUG
  for tmp in coreFiles
    html = eco(tmp, title: project) 
    fs.writeFileSync "./#{project}/#{tmp}", html, 'utf8'
  cb() if cb?
# ## buildLayout
#
# build layout
#
# * param cb - callback
buildLayout = (cb) ->
  log 'Building Layout...' if DEBUG
  html = eco("#{template}/layout.html", title: project)
  fs.writeFileSync "./#{project}/layout.html", html
  cb null

# ## copyAssets
#
# copy assets (js, img, css)
#
# * param cb - callback
copyAssets = (cb) ->
  log 'Copying Assests...' if DEBUG
  copy = (dir) ->
    fs.exists "#{__dirname}/../templates/#{template}/#{dir}", (exists) ->
      try
        fs.mkdirSync("./#{project}/#{dir}")
        wrench.copyDirSyncRecursive "#{__dirname}/../templates/#{template}/#{dir}", "./#{project}/#{dir}"
      catch err
        console.log err.message if DEBUG
  copy(dir) for dir in ['images', 'javascripts', 'stylesheets', 'ico', 'img', 'js', 'css','pages']
  cb null

