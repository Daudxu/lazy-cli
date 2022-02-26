#!/usr/bin/env node
const program = require('commander')
const path = require('path')
const inquirer = require('inquirer') // 新增引入inquirer
const mvdir = require('mvdir') // 引入模块
const Metalsmith = require('metalsmith') // 引入静态网站生成器
const Handlebars = require('handlebars') // 引入模板引擎
const rm = require('rimraf').sync


program.usage('<project-name>').parse(process.argv)

let projectName = program.args[0]
let rootName = path.basename(process.cwd());
console.log(projectName, rootName);

// 新增命令行交互
inquirer.prompt([
  {
    name: 'projectName', // 参数名称
    message: '项目的名称', // 信息提示
    default: projectName // 默认值
  }, {
    name: 'projectVersion',
    message: '项目的版本号',
    default: '0.0.1'
  }, {
    name: 'projectDescription',
    message: '项目的简介',
    default: `A project named ${projectName}`
  }
]).then(answers => {
  console.log(answers);
  // 使用mvdir复制template文件夹内容到my-project项目的.download-temp文件夹下。.download-temp为临时文件夹，编译模板后会删除。
  mvdir(path.join(__dirname, '../template'), '.download-temp', { copy: true }).then((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('复制成功');
      const src = `${process.cwd()}/.download-temp`;
      Metalsmith(process.cwd())
      .metadata(answers) // 全局元数据
      .clean(false) // 是否删除
      .source(src) // 编译来源路径
      .destination('.') // 编译目标路径
      .use((files, metalsmith, done) => { // 自定义插件
        const meta = metalsmith.metadata()
        Object.keys(files).forEach(fileName => {
          const t = files[fileName].contents.toString()
          files[fileName].contents = Buffer.from(Handlebars.compile(t)(meta))
        })
        done()
      })
      .build(err => {
        rm(src)
        if(err) {
          console.log(err);
        } else {
          console.log('脚手架运行成功');
        }
      })
    }
  });
})