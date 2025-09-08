/// <reference types="vite/client" />

declare const __APP_ID__: string;

type ShowOption =
  | "!anon"
  | "!autopatrolled"
  | "!bot"
  | "!minor"
  | "!patrolled"
  | "!redirect"
  | "anon"
  | "autopatrolled"
  | "bot"
  | "minor"
  | "patrolled"
  | "redirect"
  | "unpatrolled";

interface Options {
  limit: number;
  my_name: string;
  show: ShowOption[];
  reviewed: number[];
}

type ChangeType = "edit" | "new" | "log" | "categorize" | "external";

interface RecentChange {
  rcid: number;
  type: ChangeType;
  title: string;
  timestamp: string;
  user: string;
  parsedcomment: string;
  minor?: boolean;
  bot?: boolean;
  newlen?: number;
  oldlen?: number;
  revid?: number;
  old_revid?: number;
  logtype?: string;
}
