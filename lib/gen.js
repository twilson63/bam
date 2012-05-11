var checkexists, eco, filed, fs, ghm, renderHtml, renderMarkdown, renderTemplate, wrench;

fs = require('fs');

eco = require('eco');

ghm = require('github-flavored-markdown');

filed = require('filed');

wrench = require('wrench');

renderMarkdown = function(name) {
  var md;
  md = fs.readFileSync("./pages" + name + ".md").toString();
  return ghm.parse(md);
};

renderHtml = function(name) {
  return fs.readFileSync("./pages" + name + ".html").toString();
};

renderTemplate = function(body) {
  var template;
  if (body == null) body = "";
  template = fs.readFileSync("./layout.html", "utf8");
  return eco.render(template, {
    body: body
  });
};

checkexists = function(name, cb) {
  return fs.stat(name, function(err, stat) {
    return cb(err != null ? false : true);
  });
};

module.exports = function(proj) {
  var gen;
  if (proj == null) proj = '.';
  gen = "" + proj + "/gen";
  return checkexists(gen, function(exists) {
    var body, dir, misc, page, pages, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
    if (exists) wrench.rmdirSyncRecursive(gen);
    fs.mkdirSync(gen);
    pages = fs.readdirSync('./pages');
    for (_i = 0, _len = pages.length; _i < _len; _i++) {
      page = pages[_i];
      if (page.split('.')[1] === 'html') {
        body = renderHtml('/' + page.replace('.html', ''));
      } else {
        body = renderMarkdown('/' + page.replace('.md', ''));
      }
      page = page.replace('.md', '.html');
      fs.writeFileSync("" + gen + "/" + page, renderTemplate(body), 'utf8');
    }
    _ref = ['images', 'javascripts', 'stylesheets', 'ico', 'img', 'js', 'css'];
    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
      dir = _ref[_j];
      fs.mkdirSync("" + gen + "/" + dir);
      wrench.copyDirSyncRecursive("./" + dir, "" + gen + "/" + dir);
    }
    _ref2 = ['404.html', 'robots.txt'];
    for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
      misc = _ref2[_k];
      filed("./" + misc).pipe(filed("" + gen + "/" + misc));
    }
    return console.log('Generated Static Site in the gen folder...');
  });
};
