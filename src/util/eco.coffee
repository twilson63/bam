eco = require 'eco'
fs = require 'fs'

# ## renderTemplate
#
# method that renders ECO templates
#
# * param name - template-name - string
# * param project - project-folder - string
# * param data - any data to pass to the the template - optional
module.exports = (name, data={}) ->
  tmp = fs.readFileSync __dirname + "/../../templates/#{name}.eco", "utf8"
  eco.render(tmp, data)