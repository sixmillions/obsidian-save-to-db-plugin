import { App, Plugin, PluginSettingTab, Setting, setIcon } from "obsidian";

// Remember to rename these classes and interfaces!

export interface Post {
	sync: boolean;
	path: string;
}

interface MyData {
	mySetting: string;
	posts: Record<string, Post>;
}

const DEFAULT_DATA: MyData = {
	mySetting: "postgresql://postgres:123456@127.0.0.1:5432/postgres",
	posts: { "test.md": { sync: true, path: "test.md" } },
};

export default class MyPlugin extends Plugin {
	mydata: MyData;

	async onload() {
		await this.loadMydata();
		// await this.saveData(DEFAULT_DATA);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"database-backup",
			"Save To DB",
			async (evt: MouseEvent) => {
				// 获取全部MD文档
				const files = this.app.vault.getMarkdownFiles();
				for (let i = 0; i < files.length; i++) {
					const path = files[i].path;
					console.log(path, this.mydata.posts[path]?.sync);
					if (this.mydata.posts[path]?.sync) {
						continue;
					}
					// TODO: 请求api
					console.log("need sync", path);
					// 同步后设置为“已同步”
					this.mydata.posts[path] = { sync: true, path: path };
				}
				// 保存数据
				await this.saveMyData();
				// await navigator.clipboard.writeText('hello world');
				// 已同步图标
				setIcon(statusBarItemEl, "check-circle");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		/**
		 * 打开文件的时候显示同步状态
		 */
		this.app.workspace.on("file-open", async () => {
			const file = this.app.workspace.getActiveFile();
			if (file) {
				if (this.mydata.posts[file.path]?.sync) {
					// 有抗: 有的图标没有
					// 已同步
					setIcon(statusBarItemEl, "check-circle");
				} else {
					// 未同步
					setIcon(statusBarItemEl, "x-circle");
				}
			}
		});

		/**
		 * 内容变化则，则设置为“未同步”
		 */
		this.app.workspace.on("editor-change", async (editor) => {
			const file = this.app.workspace.getActiveFile();
			if (file) {
				const post = this.mydata.posts[file.path];
				if (post) {
					post.sync = false;
				} else {
					this.mydata.posts[file.path] = {
						sync: false,
						path: file.path,
					};
				}
			}
			// 保存数据
			await this.saveMyData();
			// 已同步图标
			setIcon(statusBarItemEl, "x-circle");
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadMydata() {
		const data = await this.loadData();
		console.log("mydata", data);
		this.mydata = Object.assign({}, DEFAULT_DATA, data);
	}

	async saveMyData() {
		await this.saveData(this.mydata);
		// await this.saveData(DEFAULT_DATA);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("DB Connection")
			.setDesc(
				"Example: postgresql://username:password@host:port/database"
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your DB Connection")
					.setValue(this.plugin.mydata.mySetting)
					.onChange(async (value) => {
						this.plugin.mydata.mySetting = value;
						await this.plugin.saveMyData();
					})
			);
	}
}
