# felid-multiparty

[![npm version](https://img.shields.io/npm/v/felid-multiparty.svg)](https://www.npmjs.com/package/felid-multiparty)
![Node.js CI](https://github.com/felidjs/felid-multiparty/workflows/Node.js%20CI/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![codecov](https://codecov.io/gh/felidjs/felid-multiparty/branch/master/graph/badge.svg)](https://codecov.io/gh/felidjs/felid-multiparty)

Multiparty plugin for [Felid](https://github.com/felidjs/felid). Upload files without caring.

## Install

```bash
npm install felid-multiparty
```

or

```bash
yarn add felid-multiparty
```

## Usage

```javascript
const Felid = require('felid')
const multiparty = require('felid-multiparty')

const app = new Felid()
app.plugin(multiparty, options)

app.post('/upload', async (req, res) => {
  const { files } = await req.upload()
  // Supposed you uploaded the file as in a field named 'file'
  const file = files.file[0]
  res.send({
    originalFilename: file.originalFilename,
    path: file.path
  })
})
```

## Options

- **decorator** *Object*: Customize the decorator names. Default is:
```js
{
  upload: 'upload'
}
```

## API

- **request.upload(options?: Object) => Promise**: Handle the multipart payload. See [document of multiparty](https://github.com/pillarjs/multiparty) for more options.

## License

[MIT](./LICENSE)
