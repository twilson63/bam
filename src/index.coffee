# Commands
cmdNew = require './new'
cmdRun = require './run'
cmdGen = require './gen'

flatiron = require 'flatiron'
require('pkginfo')(module)
app = flatiron.app

app.version = exports.version

app.use flatiron.plugins.cli,
  dir: __dirname
  usage: [
    "Bam 0.0.1"
    "Easiest Static Site Generator on the Planet"
    ""
    "bam new [foo]"
    "cd [foo]"
    "bam run foo"
    "bam gen foo"
  ]
  version: true

app.cmd 'version', ->
  console.log 'BAM v' + app.version

app.cmd 'new', cmdNew
app.cmd 'run', cmdRun
app.cmd 'gen', -> cmdGen()

app.start()