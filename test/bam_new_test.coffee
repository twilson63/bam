wrench = require 'wrench'
cmdNew = require '../lib/new'
describe 'bam new', ->
  it 'should create new project', (done) ->
    cmdNew 'foo', ->
      wrench.rmdirSyncRecursive('foo')
      done()
  it 'should create new bootsrap project', (done) ->
    cmdNew 'foo', 'bootstrap', ->
      wrench.rmdirSyncRecursive('foo')
      done()
  it 'should create new pagedown project', (done) ->
    cmdNew 'foo', 'pagedown', ->
      wrench.rmdirSyncRecursive('foo')
      done()