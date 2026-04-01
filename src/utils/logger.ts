import { writeFileSync, appendFileSync, existsSync } from "fs";

let logEnabled = false;
let logPath = "debug.log";

export function enableLogging(path?: string): void {
  logEnabled = true;
  if (path) logPath = path;
  if (existsSync(logPath)) {
    writeFileSync(logPath, "");
  }
}

export function disableLogging(): void {
  logEnabled = false;
}

function write(level: string, message: string, data?: unknown): void {
  if (!logEnabled) return;
  const timestamp = new Date().toISOString();
  let line = `[${timestamp}] [${level}] ${message}`;
  if (data !== undefined) {
    line += ` ${JSON.stringify(data)}`;
  }
  appendFileSync(logPath, line + "\n");
}

export const logger = {
  debug(message: string, data?: unknown): void {
    write("DEBUG", message, data);
  },
  info(message: string, data?: unknown): void {
    write("INFO", message, data);
  },
  warn(message: string, data?: unknown): void {
    write("WARN", message, data);
  },
  error(message: string, data?: unknown): void {
    write("ERROR", message, data);
  },
};
