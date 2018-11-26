const { app, globalShortcut, Menu, Tray } = require('electron')
const { Setting, Search } = require('./windows/index.js')
const path = require('path')
const fs = require('fs')
const util = require('util')
const writeFilePromise = util.promisify(fs.writeFile)
const isDev = require('electron-is-dev')
let config = path.join(path.dirname(process.execPath), './config.json')

if (isDev) {
  config = './config.json'
}

// 默认配置
let defaultConfig = {
  searchData: [
    { name: "百度", url: "https://www.baidu.com/baidu?wd=${query}" },
    { name: "谷歌", url: "https://www.google.com/search?q=${query}" },
    { name: "知乎", url: "https://www.zhihu.com/search?q=${query}" },
    { name: "有道翻译", url: "http://www.youdao.com/w/eng/${query}" },
  ]
}


class WSearch {
  constructor() {
  }
  /* 打开设置页面 */
  openSettingWindow() {
    new Setting({ width: 800, height: 800, show: false, backgroundColor: '#21252B' }, 'renderer/setting/setting.html')
  }
  /* 打开搜索页面 */
  openSearchWindow() {
    this.search = new Search({ width: 1000, height: 600, show: false }, 'renderer/search/search.html')
  }
  /* 注册快捷键 */
  setShortcut() {
    /* Alt + s: 打开搜索面板 */
    globalShortcut.register('Alt + s', () => {
      if (!this.search || !this.search.ins) {
        this.openSearchWindow()
      } else {
        this.search.close()
        this.search = null
      }
    })
  }
  /* 创建系统托盘 */
  setTray() {
    this.tray = new Tray(path.join(__dirname, './assets/imgs/qqq.jpg'))
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '设置',
        click: this.openSettingWindow
      },
      {
        label: '退出',
        click: function () {
          app.quit()
        }
      }
    ])
    this.tray.setToolTip('call me')
    this.tray.setContextMenu(contextMenu)
  }
  /* 检查是否有配置文件,如果没有就生成一个 */
  async checkConfigOrInit() {
    let hasConfig = fs.existsSync(config)
    if (!hasConfig) {
      await writeFilePromise(config, JSON.stringify(defaultConfig))
    }
  }
  /* 创建窗口 */
  async createWindow() {
    await this.checkConfigOrInit()
    this.setTray()
    this.setShortcut()
  }
  /* 初始化 */
  init() {

    app.on('ready', () => { this.createWindow() })

    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') {
      }
    })

    app.on('activate', () => {
      if (settingWindow === null) {
        this.createWindow()
      }
    })

  }
}


new WSearch().init()




 