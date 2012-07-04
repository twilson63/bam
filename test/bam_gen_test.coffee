wrench = require 'wrench'
cmdNew = require '../lib/new'
cmdGen = require '../lib/gen'

describe 'bam gen', ->
  it 'should create and gen project', (done) ->
    cmdNew 'foo', ->
      cmdGen 'foo', ->
        wrench.rmdirSyncRecursive('foo')
        done()
