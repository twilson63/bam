cc = require 'zeke'

module.exports = ->
  cc.use require 'zeke-markdown'
  cc.use require 'zeke-bootstrap'
  cc.use require 'zeke-bam'
  cc.init() unless cc.initialized
  cc