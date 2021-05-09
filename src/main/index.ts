import { app, BrowserWindow } from "electron";
import path from "path";
import "./services";
import { useService } from "src/base/service-manager";
import { MAIN_PROCESS } from "src/base/const";
import { EWindowName } from "src/base/const/type.d";

// 创建窗口
function ceateWindow(title: string) {
  const win = new BrowserWindow({
    title,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // 允许渲染进程中使用node模块
      contextIsolation: false,
      enableRemoteModule: true, // 允许渲染进程中使用remote模块
    },
  });

  // 载入页面
  // win.loadURL(`file://${path.resolve(__dirname, "./index.html")}`);
  win.loadURL("http://localhost:8080/index.html");

  // 开启开发者工具
  win.webContents.openDevTools();
}

app.on("ready", () => {
  useService("WindowGeneratorService", MAIN_PROCESS, false);
  // useService("BabelService");
  ceateWindow(EWindowName.Main);
});
