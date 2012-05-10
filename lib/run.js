var eco, filed, fs, ghm, http, log, renderMarkdown, renderTemplate, url;

http = require('http');

url = require('url');

eco = require('eco');

ghm = require('github-flavored-markdown');

fs = require('fs');

filed = require('filed');

log = console.log;

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

module.exports = function(proj) {
  var server;
  if (proj == null) proj = '.';
  server = http.createServer(function(req, resp) {
    var body, pathname;
    pathname = url.parse(req.url).pathname;
    if (pathname === '/') pathname = '/index.html';
    try {
      if (pathname.match(/(stylesheets|images|javascripts|css|img|js)/)) {
        return filed("." + pathname).pipe(resp);
      } else {
        pathname = pathname.replace('.html', '');
        body = renderMarkdown(pathname);
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
