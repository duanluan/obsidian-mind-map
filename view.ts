import {TextFileView, WorkspaceLeaf} from "obsidian";
import MindMap from "simple-mind-map";

export const VIEW_TYPE_SMML = "smml-view";

export class SmmlView extends TextFileView {

  statusBarItemEl: HTMLElement;
  mindMap: MindMap;

  constructor(leaf: WorkspaceLeaf, statusBarItemEl: HTMLElement) {
    super(leaf);
    this.statusBarItemEl = statusBarItemEl;
  }

  getViewType() {
    return VIEW_TYPE_SMML;
  }

  getViewData() {
    return this.data;
  }

  setViewData(data: string, clear: boolean) {
    let {contentEl} = this;
    // 清空内容，否则打开同类型文件时旧内容仍存在
    contentEl.setText('');

    const dataObj = data ? JSON.parse(data) : {data: {data: {'text': '根节点'}, children: []}}

    /**
     * 设置状态栏文本：节点数
     */
    const setStatusBarItemText = () => {
      // 遍历节点计算节点数
      let nodeCount = 0;
      const walk = (data: any) => {
        if (!data) return;
        nodeCount++;
        if (data.children && data.children.length > 0) {
          data.children.forEach((child: any) => {
            walk(child);
          })
        }
      }
      console.log(dataObj.data);
      walk(dataObj.data);
      this.statusBarItemEl.setText(`节点数：${nodeCount}`);
    }
    setStatusBarItemText();

    // 加载思维导图
    const rootDiv = contentEl.createDiv({});
    rootDiv.outerHTML = `<div id="mindMapContainer" style="width: 100%; height: 100%"></div>`
    // @ts-ignore
    this.mindMap = new MindMap({
      ...{
        el: document.getElementById('mindMapContainer')
      }, ...dataObj
    });

    let dataChangePromise: Promise<void> | null = null;
    // 渲染树数据变化，可以监听该方法获取最新数据
    this.mindMap.on('data_change', (data: any) => {
      dataChangePromise = new Promise((resolve) => {
        dataObj.data = data;
        this.data = JSON.stringify(dataObj);

        resolve();
      });
    })
    // 渲染树数据变化的明细
    this.mindMap.on('data_change_detail', async (arr: Array<any>) => {
      for (const item of arr) {
        // 创建或删除节点时
        if (item.action === 'create' || item.action === 'delete') {
          // 确保 data_change 给 dataObj 赋值后再计算节点数，否则节点数不准确
          if (dataChangePromise) {
            await dataChangePromise;
          }
          setStatusBarItemText();
          break;
        }
      }
    })
    // 视图变化数据，比如拖动或缩放时会触发
    this.mindMap.on('view_data_change', (viewData: any) => {
      dataObj.viewData = viewData;
      this.data = JSON.stringify(dataObj);
    })
  }

  clear() {
    this.data = "";
  }
}
