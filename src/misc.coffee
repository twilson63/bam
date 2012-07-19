filed = require 'filed'

module.exports = (proj, gen) ->
  for misc in ['404.html', 'robots.txt']
    filed("#{proj}/#{misc}").pipe(filed("#{gen}/#{misc}"))
    console.log 'copied' + "#{gen}/#{misc}"

  