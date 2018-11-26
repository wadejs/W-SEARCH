const { remote } = require('electron')
const fs = require('fs')
const util = require('util')
const writeFilePromise = util.promisify(fs.writeFile)
const readFilePromise = util.promisify(fs.readFile)
const $ = require("jquery");
const path = require('path')
const isDev = require('electron-is-dev')
const Sortable = require('sortablejs')
let config = path.join(path.dirname(process.execPath), './config.json')
let settingData = {}
let autoStart = false

if (isDev) {
  config = './config.json'
}

function renderList(searchData) {
  let lists = ''
  searchData.forEach(item => {
    lists += `<li>
                <b class="drag-handle">☰</b>
                <div>
                  按钮名称：<input type="text" class="_name" value="${item.name}">
                </div>
                <div>
                  搜索网址和搜索参数：<input type="text" class="_url" value="${item.url}">
                </div>
                <button class="_del">删除</button>
              </li>`
  })
  $('.search-list').html(lists)
  let el = $('.search-list').get(0);
  Sortable.create(el, {
    handle: '.drag-handle',
    animation: 150
  });
}
function generateJson(settingData) {
  let result = []
  let lists = $('.search-list li')
  lists.each((index, item) => {
    let name = $(item).find('._name').val().trim()
    let url = $(item).find('._url').val().trim()
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
function getAutoStartValue() {
  autoStart = remote.app.getLoginItemSettings().openAtLogin
  if (autoStart) {
    $('.auto-start input').get(0).checked = true
  } else {
    $('.auto-start input').get(0).checked = false
  }
}

async function saveConfig() {
  let json = JSON.stringify(generateJson(settingData))
  let autoStart = $('.auto-start input').get(0).checked
  if (autoStart) {
    remote.app.setLoginItemSettings({
      openAtLogin: true
    })
  } else {
    remote.app.setLoginItemSettings({
      openAtLogin: false
    })
  }
  let err = await writeFilePromise(config, json)
  if (err) {
    console.log(err)
    return
  }
  alert('保存成功')
  location.reload()
}

function eventBinding() {
  /* 保存 */
  $('._save').click(saveConfig)
  /* 添加待填选项 */
  $('._add').click(function () {
    $('.search-list').append(`
    <li>
      <div>
        按钮名称：<input type="text" class="_name">
      </div>
      <div>
        url：<input type="text" class="_url">
      </div>
    </li>
    `)
  })
  /* 删除 */
  $('.search-list').on('click', '._del', function () {
    $(this).parent().remove()
  })
}

async function main() {
  getAutoStartValue()
  let data = await readFilePromise(config)
  settingData = JSON.parse(data.toString())
  let searchData = settingData.searchData
  renderList(searchData)
  eventBinding()
}

main()

