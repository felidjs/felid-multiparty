const fs = require('fs')
const path = require('path')
const Felid = require('felid')
const formAutoContent = require('form-auto-content')
const injectar = require('injectar')
const multiparty = require('../src')

const FIELD = 'file'
const ORIGIN_FILE_NAMES = ['test.svg', 'test.png']
const FILE_CONTENTS = ORIGIN_FILE_NAMES.map(fileName => fs.readFileSync(path.resolve(__dirname, fileName)).toString('utf8'))

const uploadFiles = []

afterAll(() => {
  return clearUploadFiles()
})

describe('upload files', () => {
  test('Should upload single file', (done) => {
    const instance = new Felid()
    instance.plugin(multiparty)
    instance.post('/upload', async (req, res) => {
      const { files } = await req.upload()
      const file = files[FIELD][0]
      uploadFiles.push(file.path)
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
      const paths = files[FIELD].map(file => file.path)
      uploadFiles.push(...paths)
      res.send({
        originalFilenames: files[FIELD].map(file => file.originalFilename),
        paths
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

  test('Should handle form fields correctly', (done) => {
    const instance = new Felid()
    instance.plugin(multiparty)
    instance.post('/upload', async (req, res) => {
      const { fields, files } = await req.upload()
      uploadFiles.push(files[FIELD][0].path)
      res.send(fields.foo[0])
    })

    injectar(instance.lookup(), formAutoContent({
      [FIELD]: fs.createReadStream(path.resolve(__dirname, ORIGIN_FILE_NAMES[0])),
      foo: 'bar'
    }))
      .post('/upload')
      .end((err, res) => {
        expect(err).toBe(null)
        expect(res.payload).toBe('bar')
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
      const newPath = path.resolve(__dirname, 'upload', file.originalFilename)
      fs.renameSync(file.path, newPath)
      uploadFiles.push(newPath)
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
      uploadFiles.push(file.path)
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

function clearUploadFiles () {
  uploadFiles.forEach(file => fs.unlinkSync(file))
}
