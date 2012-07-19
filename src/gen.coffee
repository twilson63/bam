fs = require 'fs'
wrench = require 'wrench'

assets = require './assets'
misc = require './misc'
Page = require './page'

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
    # copy pages
    (new Page()).all gen, proj
    # copy assets
    assets(proj, gen)
    # copy misc
    misc(proj,gen)

    console.log 'Successfully Generated Static Site in the gen folder...'
    cb null, 'success' if cb?