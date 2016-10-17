/* global describe, context, it */

const request = require('request-promise');
require('..'); // run server

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('server', () => {

  describe('POST /publish', () => {

    it('sends a message to all subscribers', function* () {

      const message = 'text';

      const subscribers = Promise.all([
        request({
          method: 'GET',
          url: 'http://127.0.0.1:3000/subscribe',
          timeout: 200
        }),
        request({
          method: 'GET',
          url: 'http://127.0.0.1:3000/subscribe',
          timeout: 200
        })
      ]);

      yield sleep(20);
      // postpone invoke of POST request cause
      // POST requests are skipped by koa-static which made and async call to fs
      // and in our case post request will handle before GET requests in the same thread
      const publisher = yield request({
        method: 'POST',
        url: 'http://127.0.0.1:3000/publish',
        json: true,
        body: {
          message
        }
      });

      const messages = yield subscribers;

      messages.forEach(msg => {
        msg.should.eql(message);
      });

      publisher.should.eql('ok');

    });

    context('when body is too big', () => {

      it('returns 413', function* () {
        const response = yield request({
          method: 'POST',
          uri: 'http://127.0.0.1:3000/publish',
          body: {
            message: '*'.repeat(1e6)
          },
          json: true,
          simple: false,
          resolveWithFullResponse: true
        });

        response.statusCode.should.eql(413);
      });

      it('message is ignored', function* () {
        const subscriber = request({
          method: 'GET',
          url: 'http://127.0.0.1:3000/subscribe',
          timeout: 100,
          simple: false,
          resolveWithFullResponse: true
        });

        yield sleep(20);

        yield request({ // will die with 413, but we tested it before
          method: 'POST',
          url: 'http://127.0.0.1:3000/publish',
          json: true,
          simple: false,
          resolveWithFullResponse: true,
          body: {
            message: '*'.repeat(1e6)
          },
        });

        try {
          yield subscriber;
          throw new Error("Should not reach here, but die with ETIMEDOUT");
        } catch(err) {
          if (err.name == 'RequestError') {
            err.cause.code.should.eql('ETIMEDOUT');
          } else {
            throw err;
          }
        }

      });


    });

  });

});
