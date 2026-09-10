export const channels = {
  scan: "leb2:scan",
  assignments: "leb2:assignments:list",
  courses: "leb2:courses:list",
  assignmentsToggleDone: "leb2:assignments:toggleDone",
  coursesToggleDone: "leb2:courses:toggleDone",
  courseAssignmentsToggleDone: "leb2:courses:markAllDone",
  getLastScan: "leb2:scans:last",
  openExternal: "leb2:openExternal",
  getSetting: "leb2:settings:get",
  setSetting: "leb2:settings:set"
} as const;