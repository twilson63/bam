flatiron = require 'flatiron'
require('pkginfo')(module)
app = flatiron.app

app.version = exports.version

# setup flatiron cli plugin
app.use flatiron.plugins.cli,
  dir: __dirname
  usage: [
    "Bam v#{app.version}"
    "Easiest Static Site Generator on the Planet"
    ""
    "bam new [foo] [template]"
    "cd [foo]"
    ""
    "# run in dev mode"
    "bam run"
    ""
    "# generate site"
    "bam gen"
    ""
    "# test gen site"
    "bam serve"
  ]
  version: true

# support verson command
app.cmd 'version', ->
  console.log 'BAM v' + app.version

# bam new [site] [template]
app.cmd 'new', require './new'
# bam run 
app.cmd 'run', require './run'
# bam gen
app.cmd 'gen', require './gen'
# bam serve
app.cmd 'serve', require './serve'

# app start
app.start()