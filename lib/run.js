var eco, filed, fs, ghm, http, log, pages, renderHtml, renderMarkdown, renderTemplate, url, wrench;

http = require('http');

url = require('url');

eco = require('eco');

ghm = require('github-flavored-markdown');

fs = require('fs');

filed = require('filed');

log = console.log;

wrench = require('wrench');

pages = wrench.readdirSyncRecursive('pages');

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

module.exports = function(proj) {
  var server;
  if (proj == null) proj = '.';
  server = http.createServer(function(req, resp) {
    var body, ext, page, pathname, _ref;
    pathname = url.parse(req.url).pathname;
    if (pathname === '/') pathname = '/index.html';
    try {
      if (pathname.match(/(stylesheets|images|javascripts|css|img|js)/)) {
        return filed("." + pathname).pipe(resp);
      } else {
        pathname = pathname.replace('.html', '');
        ext = (_ref = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = pages.length; _i < _len; _i++) {
            page = pages[_i];
            if (page.split('.')[0] === pathname.split('/')[1].split('.')[0]) {
              _results.push(page);
            }
          }
          return _results;
        })()) != null ? _ref[0].split('.')[1] : void 0;
        if (ext === 'html') {
          body = renderHtml(pathname);
        } else {
          body = renderMarkdown(pathname);
        }
        resp.writeHead(200, 'Content-Type: text/html');
        return resp.end(renderTemplate(body));
      }
    } catch (err) {
      console.log(err);
      return filed('./404.html').pipe(resp);
    }
  });
  return server.listen(3000, function() {
    log('Listening on 3000...');
    return log('CTRL-C to exit..');
  });
};
