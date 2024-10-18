import {Notice, Plugin, WorkspaceLeaf} from 'obsidian';
import {SmmlView, VIEW_TYPE_SMML} from "./view"

export default class MindMapPlugin extends Plugin {
  async onload() {
    // 注册视图，读写思维导图文件
    this.registerView(VIEW_TYPE_SMML, (leaf: WorkspaceLeaf) => new SmmlView(leaf));
    // 注册文件扩展名
    this.registerExtensions(["smml"], VIEW_TYPE_SMML);

    // 左侧栏图标
    const ribbonIconEl = this.addRibbonIcon('dice', '示例插件', async (evt: MouseEvent) => {
      await this.createMindMap();
    });
  }

  onunload() {
    // 插件卸载时需要清理视图
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SMML);
  }

  async createMindMap() {
    const baseName = "未命名";
    const extension = ".smml";
    let fileName = `${baseName}${extension}`;
    let counter = 1;

    while (true) {
      try {
        // 创建思维导图
        await this.app.vault.create(`/${fileName}`, "");
        break;
      } catch (error) {
        // 文件名已存在时追加序号
        if (error.message.concat("already exists")) {
          fileName = `${baseName} ${counter}${extension}`;
          counter++;
        } else {
          // 其他错误
          new Notice(`创建思维导图失败：${error.message}`);
          break;
        }
      }
    }
  }
}
