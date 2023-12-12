import {
	App,
	Editor,
	MarkdownView,
	Menu,
	MenuItem,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";


interface WriteBetterSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: WriteBetterSettings = {
	mySetting: "default",
};

export default class WriteBetter extends Plugin {
	settings: WriteBetterSettings;

	async onload() {
		console.log("Loading plugin...");

		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"pencil",
			"View Write Better stats",
			(evt: MouseEvent) => {
				new WriteBetterModal(this.app).open();
			}
		);

		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		var warningCount = 0;
		const warningCounter = this.addStatusBarItem();
		warningCounter.setText("⚠ " + warningCount.toString());
		warningCounter.addClass("warning-count");
		warningCounter.onClickEvent((evt) => {
			warningCount++;
			warningCounter.setText("⚠ " + warningCount.toString());
		});

		// COMMANDS

		this.addCommand({
			id: "write-better-fix-selection",
			name: "Fix selection",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});

		this.addCommand({
			id: "write-better-fix-all",
			name: "Fix all (may take a while)",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});

		this.addCommand({
			id: "write-better-modal",
			name: "Display Write Better Modal",
			callback: () => {
				new WriteBetterModal(this.app).open();
			},
		});

		// SETTINGS

		this.addSettingTab(new WriteBetterSettingsTab(this.app, this));
	}

	onunload() {
		console.log("Unloading plugin...");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class WriteBetterModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Under construction...");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class WriteBetterSettingsTab extends PluginSettingTab {
	plugin: WriteBetter;

	constructor(app: App, plugin: WriteBetter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
