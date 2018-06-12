const fs = require('fs')
const css2pre = require('../lib/css2pre')

let css = fs.readFileSync('./style2.css').toString()
let ins = css2pre(css)
debugger

let str = ins.to('scss')
fs.writeFileSync('./style2.conv.less', str)
