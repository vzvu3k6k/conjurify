# conjurify

Userscripts can't access modules linked by Browserify as they are isolates by default.

Conjurify enables you to peek these modules.

## Synopsis

``` javascript
// ==UserScript==
// @grant          none
// @run-at         document-end
// ==/UserScript==

var Conjurify = require('@vzvu3k6k/conjurify');
var conjurify = new Conjurify(window);
conjurify.setTrap();

window.addEventListener('load', () => {
  conjurify.removeTrap();
  var require = conjurify.getRequire();
  var foo = require('./foo');
});
```
