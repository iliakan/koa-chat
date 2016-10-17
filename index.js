'use strict';

if (process.env.TRACE) {
  require('./libs/trace');
}

const koa = require('koa');
const app = koa();

const config = require('config');

// keys for in-koa KeyGrip cookie signing (used in session, maybe other modules)
app.keys = [config.secret];

const path = require('path');
const fs = require('fs');
const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();

middlewares.forEach(function(middleware) {
  app.use(require('./middlewares/' + middleware));
});

// ---------------------------------------

const Router = require('koa-router');

const router = new Router();

let clients = [];

router.get('/subscribe', function*() {

  this.set('Cache-Control', 'no-cache,must-revalidate');
  const promise = new Promise((resolve, reject) => {
    clients.push(resolve);

    this.res.on('close', function() {
      clients.splice(clients.indexOf(resolve), 1);
      const error = new Error('Connection closed');
      error.code = 'ECONNRESET';
      reject(error);
    });

  });

  let message;

  try {
    message = yield promise;
  } catch(err) {
    if (err.code === 'ECONNRESET') return;
    throw err;
  }

  // console.log('DONE', message);
  this.body = message;

});

router.post('/publish', function* () {
  const message = this.request.body.message;

  if (!message) {
    this.throw(400);
  }

  clients.forEach(function(resolve) {
    resolve(String(message));
  });

  clients = [];

  this.body = 'ok';

});

app.use(router.routes());

app.listen(process.env.PORT || 3000);
