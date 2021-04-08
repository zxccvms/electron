import { app, BrowserWindow } from "electron";
import path from "path";

// 创建窗口
function ceateWindow(title: string) {
  const win = new BrowserWindow({
    title,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // 允许渲染进程中使用node模块
      contextIsolation: false,
    },
  });

  // 载入页面
  // win.loadURL(`file://${path.resolve(__dirname, "./index.html")}`);
  win.loadURL("http://localhost:8080/");

  // 开启开发者工具
  win.webContents.openDevTools();
}

app.on("ready", () => {
  ceateWindow("main");
});
