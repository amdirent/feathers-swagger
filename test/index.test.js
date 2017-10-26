/* eslint-disable no-unused-expressions */

import {
  expect
} from 'chai';
import feathers from 'feathers';
import rest from 'feathers-rest';
import memory from 'feathers-memory';
import rp from 'request-promise';
import swagger from '../src';
import lib from '../lib';

describe('feathers-swagger', () => {
  it('is CommonJS compatible', () => {
    expect(typeof lib).to.equal('function');
  });

  describe('multiple docs', () => {
    let server;

    before(done => {
      const app = feathers()
        .configure(rest())
        .configure(swagger({
          docsPath: '/docs',
          ignore: {
            paths: /one/
          },
          info: {
            'title': 'A test',
            'description': 'A description'
          }
        }))
        .configure(swagger({
          docsPath: '/one/docs',
          strip: 'one/',
          match: {
            paths: /one/
          },
          info: {
            'title': 'A test',
            'description': 'A description'
          }
        }))
        .use('/messages', memory())
        .use('/one/:id/hello', memory());

      server = app.listen(6777, () => done());
    })

    after(done => server.close(done));

    it('supports basic functionality on both docs paths', () => {
      return rp({
        url: 'http://localhost:6777/docs',
        json: true
      }).then(docs => {
        expect(docs.paths['/messages']).to.exist;
      }).then(() => rp({
          url: 'http://localhost:6777/one/docs',
          json: true
        })
      ).then(docs => {
        expect(docs.paths['/{id}/hello']).to.exist;
      });
    });
  });

  describe('basic functionality', () => {
    let server;

    before(done => {
      const app = feathers()
        .configure(rest())
        .configure(swagger({
          docsPath: '/docs',
          info: {
            'title': 'A test',
            'description': 'A description'
          }
        }))
        .use('/messages', memory());

      server = app.listen(6776, () => done());
    });

    after(done => server.close(done));

    it('supports basic functionality with a simple app', () => {
      return rp({
        url: 'http://localhost:6776/docs',
        json: true
      }).then(docs => {
        expect(docs.info.title).to.equal('A test');
        expect(docs.info.description).to.equal('A description');
        expect(docs.paths['/messages']).to.exist;
      });
    });
  });
});
