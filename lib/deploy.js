var checkexists, fs, s3, wrench;

fs = require('fs');

s3 = require('fortknox');

wrench = require('wrench');

checkexists = function(name, cb) {
  return fs.stat(name, function(err, stat) {
    return cb(err != null ? false : true);
  });
};

module.exports = function(location) {
  var client, s3Info;
  if (location == null) location = 's3';
  checkexists('./s3.json', function(exists) {
    if (!exists) return new Error('s3 json config file required');
  });
  s3Info = JSON.parse(fs.readFileSync('./s3.json'));
  client = s3.createClient(s3Info);
  return client.createBucket(function() {
    return client.createWebSite(function() {
      return client.activatePolicy(function() {
        var destFile, f, files, srcFile, _i, _len, _results;
        var _this = this;
        files = wrench.readdirSyncRecursive('./gen');
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          f = files[_i];
          destFile = f.replace('gen', '');
          srcFile = './' + f;
          console.log('Uploading... ' + destFile);
          _results.push(client.putFile(srcFile, destFile, function(err, resp) {
            if (resp != null) {
              return resp.on('data', function(data) {
                return console.log(data.toString());
              });
            }
          }));
        }
        return _results;
      });
    });
  });
};
