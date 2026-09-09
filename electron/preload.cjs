const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("leb2", {
  scan: () => ipcRenderer.invoke("leb2:scan"),
  listAssignments: () => ipcRenderer.invoke("leb2:assignments:list"),
  listCourses: () => ipcRenderer.invoke("leb2:courses:list"),
  getSetting: (key) => ipcRenderer.invoke("leb2:settings:get", key),
  setSetting: (key, value) => ipcRenderer.invoke("leb2:settings:set", key, value)
});
