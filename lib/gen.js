// Generated by CoffeeScript 1.3.3
var Page, assets, fs, misc, wrench;

fs = require('fs');

wrench = require('wrench');

assets = require('./util/assets');

misc = require('./util/misc');

Page = require('./util/page');

module.exports = function(proj, cb) {
  var gen,
    _this = this;
  if (proj == null) {
    proj = '.';
  }
  gen = "" + proj + "/gen";
  return fs.exists(gen, function(exists) {
    if (exists) {
      wrench.rmdirSyncRecursive(gen);
    }
    fs.mkdirSync(gen);
    (new Page()).all(gen, proj);
    assets(proj, gen);
    misc(proj, gen);
    console.log('Successfully Generated Static Site in the gen folder...');
    if (cb != null) {
      return cb(null, 'success');
    }
  });
};
