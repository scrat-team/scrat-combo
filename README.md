# scrat-combo
Scrat combo request server-side middleware

## Install

```npm
npm install scrat-combo
```

## Usage

```js
var scratCombo = require('scrat-combo')
app.get('/co', scratCombo({
    name: 'demo', // Project name
    version: '1.0.0', // Project version
    dir: 'test/public', // Public directory, default is "public"
    dest: 'c' // urlPattern prefix in "fis-config.js", default is "c"
}))
```

## Test

**Step 1:** 
Run test server

```bash
npm test
```

**Step 2:**
Request combo resource

```url
http://localhost:1010/co??demo/1.0.0/index/index.css,demo/1.0.0/index/index.js
```


