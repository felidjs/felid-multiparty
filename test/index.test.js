const fs = require('fs')
const path = require('path')
const Felid = require('felid')
const formAutoContent = require('form-auto-content')
const injectar = require('injectar')
const multiparty = require('../src')

const FIELD = 'file'
const ORIGIN_FILE_NAMES = ['test.svg', 'test.png']
const FILE_CONTENTS = ORIGIN_FILE_NAMES.map(fileName => fs.readFileSync(path.resolve(__dirname, fileName)).toString('utf8'))

describe('upload files', () => {
  test('Should upload single file', (done) => {
    const instance = new Felid()
    instance.plugin(multiparty)
    instance.post('/upload', async (req, res) => {
      const { files } = await req.upload()
      const file = files[FIELD][0]
      res.send({
        originalFilename: file.originalFilename,
        path: file.path
      })
    })

    injectar(instance.lookup(), formAutoContent({
      [FIELD]: fs.createReadStream(path.resolve(__dirname, ORIGIN_FILE_NAMES[0]))
    }))
      .post('/upload')
      .end((err, res) => {
        const payload = JSON.parse(res.payload)
        expect(err).toBe(null)
        expect(payload.originalFilename).toBe(ORIGIN_FILE_NAMES[0])
        expect(fs.readFileSync(payload.path).toString('utf8')).toBe(FILE_CONTENTS[0])
        done()
      })
  })

  test('Should upload multiple files', (done) => {
    const instance = new Felid()
    instance.plugin(multiparty)
    instance.post('/upload', async (req, res) => {
      const { files } = await req.upload()
      res.send({
        originalFilenames: files[FIELD].map(file => file.originalFilename),
        paths: files[FIELD].map(file => file.path)
      })
    })

    injectar(instance.lookup(), formAutoContent({
      [FIELD]: ORIGIN_FILE_NAMES.map(file => fs.createReadStream(path.resolve(__dirname, file)))
    }))
      .post('/upload')
      .end((err, res) => {
        const payload = JSON.parse(res.payload)
        expect(err).toBe(null)
        expect(payload.originalFilenames).toEqual(ORIGIN_FILE_NAMES)
        expect(payload.paths.map(path => fs.readFileSync(path).toString('utf8'))).toEqual(FILE_CONTENTS)
        done()
      })
  })
})

describe('options', () => {
  test('Should set correct options', (done) => {
    const instance = new Felid()
    instance.plugin(multiparty, {
      uploadDir: path.resolve(__dirname, 'upload')
    })
    instance.post('/upload', async (req, res) => {
      const { files } = await req.upload()
      const file = files[FIELD][0]
      fs.renameSync(file.path, path.resolve(__dirname, 'upload', file.originalFilename))
      res.send(file.originalFilename)
    })

    injectar(instance.lookup(), formAutoContent({
      [FIELD]: fs.createReadStream(path.resolve(__dirname, ORIGIN_FILE_NAMES[0]))
    }))
      .post('/upload')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(fs.readFileSync(path.resolve(__dirname, 'upload', res.payload)).toString('utf8')).toBe(FILE_CONTENTS[0])
        done()
      })
  })

  test('Should set custom decorator property name', (done) => {
    const instance = new Felid()
    instance.plugin(multiparty, {
      decorator: {
        upload: 'multiparty'
      }
    })
    instance.post('/upload', async (req, res) => {
      const { files } = await req.multiparty()
      const file = files[FIELD][0]
      res.send({
        originalFilename: file.originalFilename,
        path: file.path
      })
    })

    injectar(instance.lookup(), formAutoContent({
      [FIELD]: fs.createReadStream(path.resolve(__dirname, ORIGIN_FILE_NAMES[0]))
    }))
      .post('/upload')
      .end((err, res) => {
        const payload = JSON.parse(res.payload)
        expect(err).toBe(null)
        expect(payload.originalFilename).toBe(ORIGIN_FILE_NAMES[0])
        expect(fs.readFileSync(payload.path).toString('utf8')).toBe(FILE_CONTENTS[0])
        done()
      })
  })
})
