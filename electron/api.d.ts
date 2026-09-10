import type { ScanResult } from "../playwright/types.js";

declare global {
  interface Window {
    leb2: {
      scan: () => Promise<ScanResult>;
      listAssignments: () => Promise<unknown[]>;
      listCourses: () => Promise<unknown[]>;
      toggleAssignmentDone: (id: string, isDone?: boolean) => Promise<boolean>;
      toggleCourseDone: (id: string, isDone?: boolean) => Promise<boolean>;
      markCourseAssignmentsDone: (courseId: string, isDone: boolean) => Promise<boolean>;
      getLastScan: () => Promise<unknown>;
      openExternal: (url: string) => Promise<boolean>;
      getSetting: (key: string) => Promise<string | null>;
      setSetting: (key: string, value: string) => Promise<boolean>;
    };
  }
}

export {};
