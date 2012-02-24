fs = require 'fs'
s3 = require 'fortknox'
wrench = require 'wrench'
checkexists = (name, cb) ->
  fs.stat name, (err, stat) ->
    cb if err? then false else true

module.exports = (location='s3') ->
  checkexists './s3.json', (exists) ->
    new Error('s3 json config file required') unless exists
  s3Info = JSON.parse(fs.readFileSync('./s3.json'))
  client = s3.createClient s3Info
  client.createBucket -> client.createWebSite -> client.activatePolicy ->
    files = wrench.readdirSyncRecursive('./gen')
    # copy files from gen to bucket
    for f in files
      destFile = f.replace('gen/', '')
      srcFile = './' + f
      console.log 'Uploading... ' + destFile
      client.putFile destFile, srcFile, (err, resp) =>
        console.log err if err?
        if resp?
          resp.on 'data', (data) -> console.log data.toString()