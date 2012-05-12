var buildFiles, buildFolders, buildLayout, checkexists, copy, copyAssets, eco, fs, log, renderTemplate, wrench;

eco = require('eco');

fs = require('fs');

wrench = require('wrench');

log = console.log;

checkexists = function(name, cb) {
  return fs.stat(name, function(err, stat) {
    return cb(err != null ? false : true);
  });
};

renderTemplate = function(name, project, data) {
  var template;
  if (data == null) data = {};
  template = fs.readFileSync(__dirname + ("/../templates/" + name + ".eco"), "utf8");
  return fs.writeFileSync("./" + project + "/" + name, eco.render(template, data));
};

copy = function(src, dest) {
  var destFile;
  destFile = fs.createWriteStream(dest);
  return fs.createReadStream(src).pipe(destFile);
};

buildFolders = function(proj, cb) {
  log('Building Folders...');
  return checkexists("./" + proj, function(exists) {
    var directory, _i, _len, _ref;
    if (exists) wrench.rmdirSyncRecursive("./" + proj);
    _ref = ["./" + proj, "./" + proj + "/pages"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      directory = _ref[_i];
      fs.mkdirSync(directory, 0755);
    }
    return cb();
  });
};

buildFiles = function(proj, cb) {
  var template, _i, _len, _ref;
  log('Creating Files...');
  _ref = ['s3.json', 'server.js', 'package.json', 'robots.txt', '404.html'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    template = _ref[_i];
    renderTemplate(template, proj, {
      title: proj
    });
  }
  return cb();
};

buildLayout = function(proj, tmpl, cb) {
  var template;
  if (tmpl == null) tmpl = "skeleton";
  log('Creating Layout...');
  template = fs.readFileSync(__dirname + ("/../templates/" + tmpl + "/layout.html.eco"), "utf8");
  fs.writeFileSync("./" + proj + "/layout.html", eco.render(template, {
    title: proj
  }));
  return cb();
};

copyAssets = function(proj, tmpl, cb) {
  var dir, _i, _len, _ref;
  if (tmpl == null) tmpl = "skeleton";
  log('Creating Assets...');
  _ref = ['images', 'javascripts', 'stylesheets'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    dir = _ref[_i];
    fs.mkdirSync("./" + proj + "/" + dir);
    wrench.copyDirSyncRecursive("" + __dirname + "/../templates/" + tmpl + "/" + dir, "./" + proj + "/" + dir);
  }
  return cb();
};

module.exports = function(proj, tmpl, cb) {
  if (proj == null) proj = null;
  if (typeof tmpl === 'function') cb = tmpl;
  if (proj == null) return console.log('Project Name Required!');
  return buildFolders(proj, function() {
    return buildFiles(proj, function() {
      return buildLayout(proj, tmpl, function() {
        return cb(null, 'Done');
      });
    });
  });
};
