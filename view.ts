import {TextFileView, WorkspaceLeaf} from "obsidian";
import MindMap from "simple-mind-map";

export const VIEW_TYPE_SMML = "smml-view";

export class SmmlView extends TextFileView {

  mindMap: MindMap;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
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

    const dataObj = data ? JSON.parse(data) : {data: {data: {'text': '根节点'}, children: []}};

    // 加载思维导图
    const rootDiv = contentEl.createDiv({});
    rootDiv.outerHTML = `<div id="mindMapContainer" style="width: 100%; height: 100%"></div>`
    // @ts-ignore
    this.mindMap = new MindMap({
      ...{
        el: document.getElementById('mindMapContainer')
      }, ...dataObj
    });

    // 渲染树数据变化，可以监听该方法获取最新数据
    this.mindMap.on('data_change', (data: any) => {
      dataObj.data = data;
      this.data = JSON.stringify(dataObj);
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
