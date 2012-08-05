fs = require 'fs'
wrench = require 'wrench'

module.exports = (proj, gen) ->
  for dir in ['images', 'javascripts', 'stylesheets', 'ico', 'img', 'js', 'css']
    try
      dest = "#{gen}/#{dir}"
      fs.mkdirSync(dest)
      wrench.copyDirSyncRecursive "#{proj}/#{dir}", dest
      console.log 'copied' + dest
    catch err
  