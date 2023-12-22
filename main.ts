import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface WriteBetterSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: WriteBetterSettings = {
	mySetting: "default",
};

import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginSpec,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";


export class AnnotationWidget extends WidgetType {
  toDOM(view: EditorView): HTMLElement {
    const div = document.createElement("span");
    div.className = "tooltip";

    return div;
  }
}

class EmojiListPlugin implements PluginValue {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() {}

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();

		for (let { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter(node) {
                    if (!node.type.name.startsWith("tooltip"))
                    {
                        builder.add(node.from, node.to, Decoration.mark({ 
                            class: "annotated",
                        }));
                        // builder.add(node.from, node.to, Decoration.widget({
                        //     widget: new AnnotationWidget(),
                        // }));
                    }
				},
			});
		}

		return builder.finish();
	}
}

const pluginSpec: PluginSpec<EmojiListPlugin> = {
	decorations: (value: EmojiListPlugin) => value.decorations,
};

export const emojiListPlugin = ViewPlugin.fromClass(
	EmojiListPlugin,
	pluginSpec
);

export default class WriteBetter extends Plugin {
	settings: WriteBetterSettings;

	async onload() {
		console.log("Loading plugin...");

		await this.loadSettings();
		this.registerEditorExtension(emojiListPlugin);

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
