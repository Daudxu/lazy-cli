#!/usr/bin/env node
const program = require('commander'); // npm i commander -S

program.version('0.0.1')
    .usage('<command> [项目名称]')
    .command('init', 'init')
    .parse(process.argv)