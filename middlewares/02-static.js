
// Usually served by Nginx
const serve = require('koa-static');
module.exports = serve('public');
