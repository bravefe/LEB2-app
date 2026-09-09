import type { ScanResult } from "../playwright/types.js";

declare global {
  interface Window {
    leb2: {
      scan: () => Promise<ScanResult>;
      listAssignments: () => Promise<unknown[]>;
      listCourses: () => Promise<unknown[]>;
      getSetting: (key: string) => Promise<string | null>;
      setSetting: (key: string, value: string) => Promise<boolean>;
    };
  }
}

export {};
