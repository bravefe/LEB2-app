import { contextBridge, ipcRenderer } from "electron";
import { channels } from "./channels.js";

contextBridge.exposeInMainWorld("leb2", {
  scan: () => ipcRenderer.invoke(channels.scan),
  listAssignments: () => ipcRenderer.invoke(channels.assignments),
  listCourses: () => ipcRenderer.invoke(channels.courses),
  getSetting: (key: string) => ipcRenderer.invoke(channels.getSetting, key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke(channels.setSetting, key, value)
});
