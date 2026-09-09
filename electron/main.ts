import { app, BrowserWindow } from "electron";
import { join } from "node:path";
import { registerIpc } from "./ipc.js";

let window: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(app.getAppPath(), "dist-electron/electron/preload.cjs")
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    await window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await window.loadFile(join(app.getAppPath(), "dist/index.html"));
  }
  window.on("closed", () => { window = null; });
}

app.whenReady().then(async () => {
  const databasePath = join(app.getPath("userData"), "leb2.sqlite");
  registerIpc(databasePath);
  await createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow(); });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
