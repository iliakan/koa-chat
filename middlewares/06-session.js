// in-memory store by default (use the right module instead)
const session = require('koa-generic-session');
module.exports = session();
