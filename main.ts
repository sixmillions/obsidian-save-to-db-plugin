import { App, Plugin, PluginSettingTab, Setting, setIcon } from 'obsidian'
import { MyData } from './src/model'
import { savePost } from 'src/post'
import { DB_INIT_SQL } from 'src/constant'

// Remember to rename these classes and interfaces!

const DEFAULT_DATA: MyData = {
  mySetting: {
    db: {
      host: '127.0.0.1',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'postgres',
    },
  },
  posts: { 'test-6000000.md': { sync: true, id: 0 } },
}

export default class MyPlugin extends Plugin {
  mydata: MyData

  async onload() {
    await this.loadMydata()
    // await this.saveData(DEFAULT_DATA);

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon(
      'database-backup', // 插件图标
      'Save To DB', // 插件显示
      async (evt: MouseEvent) => {
        await savePost(this.app.vault, this.mydata)
        // 保存obsidian本地数据
        await this.saveMyData()
        // 复制到剪切板
        // await navigator.clipboard.writeText('hello world');
        // 已同步图标
        setIcon(statusBarItemEl, 'check-circle')
      },
    )
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('my-plugin-ribbon-class')

    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    const statusBarItemEl = this.addStatusBarItem()
    // statusBarItemEl.setText('Status Bar Text');

    /**
     * 打开文件的时候判断同步状态
     */
    this.app.workspace.on('file-open', async () => {
      const file = this.app.workspace.getActiveFile()
      if (file) {
        if (this.mydata.posts[file.path]?.sync) {
          // 有坑: 有的图标没有
          // 已同步
          setIcon(statusBarItemEl, 'check-circle')
        } else {
          // 未同步
          setIcon(statusBarItemEl, 'x-circle')
        }
      }
    })

    /**
     * 内容变化，状态则设置为“未同步”
     */
    this.app.workspace.on('editor-change', async (editor) => {
      const file = this.app.workspace.getActiveFile()
      if (file) {
        const post = this.mydata.posts[file.path]
        if (post) {
          post.sync = false
        } else {
          this.mydata.posts[file.path] = { sync: false, id: 0 }
        }
      }
      // 保存数据
      await this.saveMyData()
      // 未同步图标
      setIcon(statusBarItemEl, 'x-circle')
    })

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this))

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000))
  }

  onunload() {}

  /**
   * 加载插件数据
   */
  async loadMydata() {
    const data = await this.loadData()
    console.log('mydata', data)
    this.mydata = Object.assign({}, DEFAULT_DATA, data)
  }

  /**
   * 保存插件数据
   */
  async saveMyData() {
    const mydate = this.mydata
    // console.log("save-to-db-plugin", mydate);
    await this.saveData(mydate)
  }
}

/**
 * 插件配置页面
 */
class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl.createDiv())
      .setName('DB Host')
      .setDesc('127.0.0.1')
      .addText((text) =>
        text
          .setPlaceholder('Enter your DB Host')
          .setValue(this.plugin.mydata.mySetting.db.host)
          .onChange(async (value) => {
            this.plugin.mydata.mySetting.db.host = value
            await this.plugin.saveMyData()
          }),
      )

    new Setting(containerEl.createDiv())
      .setName('DB Port')
      .setDesc('5432')
      .addText((text) =>
        text
          .setPlaceholder('Enter your DB Port')
          .setValue(this.plugin.mydata.mySetting.db.port.toString())
          .onChange(async (value) => {
            this.plugin.mydata.mySetting.db.port = parseInt(value.trim())
            await this.plugin.saveMyData()
          }),
      )

    new Setting(containerEl.createDiv())
      .setName('Database')
      .setDesc('mydb')
      .addText((text) =>
        text
          .setPlaceholder('Enter your Database')
          .setValue(this.plugin.mydata.mySetting.db.database)
          .onChange(async (value) => {
            this.plugin.mydata.mySetting.db.database = value
            await this.plugin.saveMyData()
          }),
      )

    new Setting(containerEl.createDiv())
      .setName('DB User')
      .setDesc('postgres')
      .addText((text) =>
        text
          .setPlaceholder('Enter your DB User')
          .setValue(this.plugin.mydata.mySetting.db.user)
          .onChange(async (value) => {
            this.plugin.mydata.mySetting.db.user = value
            await this.plugin.saveMyData()
          }),
      )

    new Setting(containerEl.createDiv())
      .setName('DB Password')
      .setDesc('password')
      .addText((text) =>
        text
          .setPlaceholder('Enter your DB Password')
          .setValue(this.plugin.mydata.mySetting.db.password)
          .onChange(async (value) => {
            this.plugin.mydata.mySetting.db.password = value
            await this.plugin.saveMyData()
          }),
      )

	containerEl.createDiv().setText('DB Init Script')
    const sqlEl = containerEl.createEl('textarea')
    sqlEl.setAttr('cols', '100')
    sqlEl.setAttr('rows', '11')
    sqlEl.setText(DB_INIT_SQL)
  }
}
