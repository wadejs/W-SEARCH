const { shell } = require('electron')
const fs = require('fs')
const util = require('util')
const $ = require("jquery")
const readFilePromise = util.promisify(fs.readFile)
const writeFilePromise = util.promisify(fs.writeFile)
const path = require('path')
const isDev = require('electron-is-dev')
const Sortable = require('sortablejs')
let config = path.join(path.dirname(process.execPath), './config.json')
let settingData
if (isDev) {
  config = './config.json'
}

/* 生成按钮的json数据 */
function generateJson(settingData) {
  let result = []
  let btns = $('.button-group button')
  btns.each((index, item) => {
    let name = $(item).html()
    let url = $(item).data('url')
    if (name && url) {
      result.push({
        name,
        url
      })
    }
  })
  settingData.searchData = result
  return settingData
}

function renderButtons(searchData) {
  let btns = ''
  searchData.forEach(item => {
    btns += `<button data-url="${item.url}">${item.name}</button>`
  })
  $('.button-group').html(btns)
  let el = $('.button-group').get(0)
  Sortable.create(el, {
    onEnd: async function (evt) {
      let json = JSON.stringify(generateJson(settingData))
      await writeFilePromise(config, json)
    }
  });
}

function eventBinding() {
  // 自动获取焦点
  $('input').focus()
  $('.button-group').on('click', 'button', function() {
    let url = $(this).data('url')
    let query = $('input').val()
    url = url.replace('${query}', query)
    shell.openExternal(url)
  })
  $('input').on('keydown', function(e) {
    if (e.keyCode === 13) {
      let url = document.querySelectorAll('.button-group button')[0].getAttribute('data-url')
      let query = document.querySelector('input').value
      url = url.replace('${query}', query)
      shell.openExternal(url)
    }
  })
}

async function main() {
  let data = await readFilePromise(config)
  settingData = JSON.parse(data.toString())
  let searchData = settingData.searchData
  renderButtons(searchData)
  eventBinding()
}

main()

