const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("leb2", {
  scan: () => ipcRenderer.invoke("leb2:scan"),
  listAssignments: () => ipcRenderer.invoke("leb2:assignments:list"),
  listCourses: () => ipcRenderer.invoke("leb2:courses:list"),
  toggleAssignmentDone: (id, isDone) => ipcRenderer.invoke("leb2:assignments:toggleDone", id, isDone),
  toggleCourseDone: (id, isDone) => ipcRenderer.invoke("leb2:courses:toggleDone", id, isDone),
  markCourseAssignmentsDone: (courseId, isDone) => ipcRenderer.invoke("leb2:courses:markAllDone", courseId, isDone),
  getLastScan: () => ipcRenderer.invoke("leb2:scans:last"),
  openExternal: (url) => ipcRenderer.invoke("leb2:openExternal", url),
  getSetting: (key) => ipcRenderer.invoke("leb2:settings:get", key),
  setSetting: (key, value) => ipcRenderer.invoke("leb2:settings:set", key, value)
});
