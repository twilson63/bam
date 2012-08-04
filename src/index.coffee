# Commands
cmdNew = require './new'
cmdRun = require './run'
cmdGen = require './gen'
cmdServe = require './serve'
cmdDeploy = require './deploy'

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
    # "# create new page"
    # "bam page [mypage].(html|md|coffee)"
    # ""
    "# generate site"
    "bam gen"
    ""
    "# test gen site"
    "bam serve"
    ""
    "# deploy gen site to s3"
    "bam deploy s3"
  ]
  version: true

# support verson command
app.cmd 'version', ->
  console.log 'BAM v' + app.version

# bam new [site] [template]
app.cmd 'new', cmdNew
# bam run 
app.cmd 'run', cmdRun
# bam gen
app.cmd 'gen', cmdGen
# bam serve
app.cmd 'serve', cmdServe

# app start
app.start()