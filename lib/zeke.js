var cc;

cc = require('zeke');

module.exports = function() {
  cc.use(require('zeke-markdown'));
  cc.use(require('zeke-bootstrap'));
  if (!cc.initialized) cc.init();
  return cc;
};
