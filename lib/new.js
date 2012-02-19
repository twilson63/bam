var buildFiles, buildFolders, copy, copyAssets, eco, fs, log, renderTemplate;

eco = require('eco');

fs = require('fs');

log = console.log;

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
  var directory, _i, _len, _ref;
  _ref = ["./" + proj, "./" + proj + "/pages", "./" + proj + "/stylesheets", "./" + proj + "/javascripts", "./" + proj + "/images"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    directory = _ref[_i];
    fs.mkdirSync(directory, 0755);
  }
  return cb();
};

buildFiles = function(proj, cb) {
  var template, _i, _len, _ref;
  _ref = ['server.js', 'layout.html', 'package.json', 'robots.txt', '404.html'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    template = _ref[_i];
    renderTemplate(template, proj, {
      title: proj
    });
  }
  return cb();
};

copyAssets = function(proj, cb) {
  var css, dest, image, js, src, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
  _ref = ['apple-touch-icon-114x114.png', 'apple-touch-icon-72x72.png', 'apple-touch-icon.png', 'favicon.ico'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    image = _ref[_i];
    src = [__dirname, '..', 'templates', 'images', image].join('/');
    dest = [proj, 'images', image].join('/');
    copy(src, dest);
  }
  _ref2 = ['tabs.js'];
  for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
    js = _ref2[_j];
    src = [__dirname, '..', 'templates', 'javascripts', js].join('/');
    dest = [proj, 'javascripts', js].join('/');
    copy(src, dest);
  }
  _ref3 = ['base.css', 'layout.css', 'skeleton.css'];
  for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
    css = _ref3[_k];
    src = [__dirname, '..', 'templates', 'stylesheets', css].join('/');
    dest = [proj, 'stylesheets', css].join('/');
    copy(src, dest);
  }
  return cb();
};

module.exports = function(proj) {
  if (proj == null) proj = null;
  if (proj == null) return console.log('Project Name Required!');
  buildFolders(proj, function() {
    return log('Building Folders...');
  });
  buildFiles(proj, function() {
    return log('Creating Files...');
  });
  copyAssets(proj, function() {
    return log('Creating Assets...');
  });
  return log('Done.');
};
