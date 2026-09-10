import { contextBridge, ipcRenderer } from "electron";
import { channels } from "./channels.js";

contextBridge.exposeInMainWorld("leb2", {
  scan: () => ipcRenderer.invoke(channels.scan),
  listAssignments: () => ipcRenderer.invoke(channels.assignments),
  listCourses: () => ipcRenderer.invoke(channels.courses),
  toggleAssignmentDone: (id: string, isDone?: boolean) => ipcRenderer.invoke(channels.assignmentsToggleDone, id, isDone),
  toggleCourseDone: (id: string, isDone?: boolean) => ipcRenderer.invoke(channels.coursesToggleDone, id, isDone),
  markCourseAssignmentsDone: (courseId: string, isDone: boolean) => ipcRenderer.invoke(channels.courseAssignmentsToggleDone, courseId, isDone),
  getLastScan: () => ipcRenderer.invoke(channels.getLastScan),
  openExternal: (url: string) => ipcRenderer.invoke(channels.openExternal, url),
  getSetting: (key: string) => ipcRenderer.invoke(channels.getSetting, key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke(channels.setSetting, key, value)
});
