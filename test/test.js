'use strict';

const assert = require('assert');
const path = require('path');
const read = require('read-all-stream');
const browserify = require('browserify');
const Conjurify = require('../src/');

const b = browserify();
b.add(path.resolve(__dirname, './browserify/main.js'));
read(b.bundle(), (err, src) => {
  if (err) throw err;

  // If `require` function exists, Conjurify can't steal modules.
  assert.notEqual(typeof require, 'function'); // eslint-disable-line no-use-before-define

  const conjurify = new Conjurify();
  conjurify.setTrap();
  eval(src); // eslint-disable-line no-eval
  conjurify.removeTrap();

  const require = conjurify.getRequire();
  assert.equal(require('./foo'), 'foo');
  assert.equal(require('./bar'), 'bar');
  assert.throws(() => { require('./baz'); }, "[conjurify] Cannot find module './baz'");
});
