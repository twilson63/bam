cc = require 'zeke'

module.exports = ->
  cc.use require 'zeke-markdown'
  cc.use require 'zeke-bootstrap'
  cc.init() unless cc.initialized
  cc
  