console.log('run-test')
var path = require('path')
process.env.CODE_TESTS_PATH = path.resolve(__dirname, './dist/test')
process.env.CODE_TESTS_WORKSPACE = path.resolve(__dirname, './test/cases')
console.log('require')
require('vscode/bin/test')
console.log('require done')
