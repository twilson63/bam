cc = require 'zeke'

module.exports = ->
  cc.use require 'zeke-markdown'
  cc.use require 'zeke-bootstrap'
  cc.use require 'zeke-bam'
  cc.use require 'zeke-request'
  cc.init() unless cc.initialized
  cc