# Commands
cmdNew = require './new'
cmdRun = require './run'
cmdGen = require './gen'
cmdServe = require './serve'

flatiron = require 'flatiron'
require('pkginfo')(module)
app = flatiron.app

app.version = exports.version

app.use flatiron.plugins.cli,
  dir: __dirname
  usage: [
    "Bam v#{app.version}"
    "Easiest Static Site Generator on the Planet"
    ""
    "bam new [foo]"
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

app.cmd 'version', ->
  console.log 'BAM v' + app.version

app.cmd 'new', cmdNew
app.cmd 'run', cmdRun
app.cmd 'gen', cmdGen
app.cmd 'serve', cmdServe

app.start()