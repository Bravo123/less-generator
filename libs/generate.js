const { writeFileSync } = require('fs');
const { html2json } = require('./html2json');
// TODO 指定的命名格式的class不写进less文件  vscode 配置项
// TODO jsx className不支持
// TODO 内联元素 能不能带进less

const writeLessFile = (json, path) => {
  // * 处理json
  // * 去除首尾的{} 去除双引号 去除冒号 去除逗号
  let a = new RegExp('"', 'g')
  let b = new RegExp(':', 'g')
  let c = new RegExp(',', 'g')
  json = json.slice(1, json.length - 1);
  json = json.replace(a, '').replace(b, '').replace(c, '');
  path = path.split('/');
  let fileName = path.pop().split('.')[0];
  path = path.join('/');
  writeFileSync(path + '/' + fileName + '.less', json, {}, (err) => {
    if (err) throw err;
  });
}

const parseHtml = (html, ignorecamelCased = false) => {
  let path = {};
  try {
    let json = html2json(html);
    json.child.forEach((child) => {
      renderClassStr(child, path, ignorecamelCased);
    });
  } catch (error) {
    console.log(error);
  }
  return path;
}

const renderClassStr = (NODE, obj, ignorecamelCased) => {
  try {
    let { node = "", child = [], tag = "", attr = {} } = NODE,
      classStr = "";
    // * 只处理nodeType为Element的类型 忽略text
    if (node.toLowerCase() == "element") {
      // * 支持className jsx
      attr.class = attr.class || attr.className;
      if (attr.class) {
        if (!Array.isArray(attr.class)) {
          attr.class = [attr.class];
        }
        attr.class.forEach(item => {
          if (ignorecamelCased) {
            if (!/^[a-z]+([A-Z]+[a-z]*)+$/.test(item)) {
              classStr += `.${item}`;
            }
          } else {
            classStr += `.${item}`;
          }
        })
      }
      if (classStr) {
        obj[classStr] = {};
      }
      child.forEach((item) => {
        renderClassStr(item, classStr ? obj[classStr] : obj, ignorecamelCased);
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.writeFile = writeLessFile;

exports.parseHtml = parseHtml;

module.exports = {
  writeLessFile,
  parseHtml,
}