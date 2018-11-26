const { BrowserWindow, Menu} = require('electron')

/* 主窗口 */
class MainWindow {
  constructor(option, path) {
    this.window = new BrowserWindow(option)
    this.window.loadFile(path)
    this.setTopMenu()
  }
  /* 设置顶部菜单 */
  setTopMenu() {
    let menu = Menu.buildFromTemplate([
      {
        label: '开发者工具',
        click: () => {
          this.window && this.window.webContents.openDevTools()
        }
      }
    ])
    Menu.setApplicationMenu(menu)
  }
}


/* 设置页面 */
class Setting extends MainWindow {
  constructor(option, path) {
    super(option, path)
    /* 窗口关闭事件 */
    this.window.on('closed', () => {
      this.window = null
    })
    this.window.once('ready-to-show', () => {
      this.window.show()
    })
  }
}


/* 搜索页面 */
class Search extends MainWindow {
  constructor(option, path) {
    super(option, path)
    this.ins = true
    this.window.once('ready-to-show', () => {
      this.window.show()
    })
    /* 窗口关闭事件 */
    this.window.on('closed', () => {
      this.close()
      this.ins = false
    })
    /* 失去焦点自动关闭 */
    this.window.on('blur', () => {
      this.close()
      this.ins = false
    })
  }

  close() {
    this.window.destroy()
    this.window = null
  }
}

module.exports = {
  Setting,
  Search
}