const multiparty = require('multiparty')

const defaultDecoratorKeys = {
  upload: 'upload'
}

function plugin (felid, options = {}) {
  const rootOptions = {
    ...options
  }
  const decoratorKeys = {
    ...defaultDecoratorKeys,
    ...options.decorator
  }
  felid.addParser('multipart', req => false)
  felid.decorateRequest(decoratorKeys.upload, upload)

  function upload (opt) {
    const rawRequest = this.req
    const form = new multiparty.Form({
      ...rootOptions,
      ...opt
    })
    return new Promise((resolve, reject) => {
      form.parse(rawRequest, (err, fields, files) => {
        if (err) {
          reject(err)
          return
        }
        resolve({
          fields,
          files
        })
      })
    })
  }
}

module.exports = plugin
