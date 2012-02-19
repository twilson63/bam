var checkexists, eco, filed, fs, ghm, renderMarkdown, renderTemplate, wrench;

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
    var body, css, dir, image, images, javascripts, js, misc, page, pages, stylesheets, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _m, _n, _ref, _ref2;
    if (exists) wrench.rmdirSyncRecursive(gen);
    fs.mkdirSync(gen);
    pages = fs.readdirSync('./pages');
    for (_i = 0, _len = pages.length; _i < _len; _i++) {
      page = pages[_i];
      body = renderMarkdown('/' + page.replace('.md', ''));
      page = page.replace('.md', '.html');
      fs.writeFileSync("" + gen + "/" + page, renderTemplate(body), 'utf8');
    }
    _ref = ['images', 'javascripts', 'stylesheets'];
    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
      dir = _ref[_j];
      fs.mkdirSync("" + gen + "/" + dir);
    }
    images = fs.readdirSync('./images');
    for (_k = 0, _len3 = images.length; _k < _len3; _k++) {
      image = images[_k];
      filed("./images/" + image).pipe(filed("" + gen + "/images/" + image));
    }
    stylesheets = fs.readdirSync('./stylesheets');
    for (_l = 0, _len4 = stylesheets.length; _l < _len4; _l++) {
      css = stylesheets[_l];
      filed("./stylesheets/" + css).pipe(filed("" + gen + "/stylesheets/" + css));
    }
    javascripts = fs.readdirSync('./javascripts');
    for (_m = 0, _len5 = javascripts.length; _m < _len5; _m++) {
      js = javascripts[_m];
      filed("./javascripts/" + js).pipe(filed("" + gen + "/javascripts/" + js));
    }
    _ref2 = ['404.html', 'robots.txt'];
    for (_n = 0, _len6 = _ref2.length; _n < _len6; _n++) {
      misc = _ref2[_n];
      filed("./" + misc).pipe(filed("" + gen + "/" + misc));
    }
    return console.log('Generated Static Site in the gen folder...');
  });
};
