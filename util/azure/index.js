console.log('Using serverless-azure.yml', process.cwd())

const fs = require('fs')
const mock = require('mock-fs')

mock({
  'serverless.yml': mock.file({
      content: ''
    })
  },
  {
    createCwd: false,
    createTmp: false
  }
)

