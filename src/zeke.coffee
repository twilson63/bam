cc = require 'zeke'

module.exports = ->
  cc.use require 'zeke-markdown'
  cc.use require 'zeke-bootstrap'
  cc.use require 'zeke-bam'
  cc.use {
    attach: ->
      @addModule 'fs', 'fs'
      @helpers['get'] = (s) -> data.fs.readFileSync(s)
  }
  cc.init() unless cc.initialized
  cc