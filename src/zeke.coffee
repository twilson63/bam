cc = require 'zeke'

module.exports = ->
  cc.use require 'zeke-markdown'
  cc.use {
    attach: ->
      @addModule 'fs', 'fs'
      @helpers['get'] = (s) -> data.fs.readFileSync(s)
      @helpers['escape'] = (html) -> html.replace(/</g, '&lt;').replace(/>/, '&gt;')
      @helpers['jpg2'] = (name) -> img src: "http://#{name}.jpg.to", style: 'max-height: 90%;max-width:90%'
  }
  cc.init() unless cc.initialized
  cc