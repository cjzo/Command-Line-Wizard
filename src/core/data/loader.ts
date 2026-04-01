import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger.js";

export function loadJsonFile<T>(filePath: string, schema: z.ZodType<T>): T {
  if (!existsSync(filePath)) {
    throw new Error(`Data file not found: ${filePath}`);
  }

  const raw = readFileSync(filePath, "utf-8");
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in ${filePath}`);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Schema validation failed for ${filePath}:\n${errors}`);
  }

  logger.debug(`Loaded data file: ${filePath}`);
  return result.data;
}

export function loadJsonDirectory<T>(dirPath: string, schema: z.ZodType<T>): T[] {
  if (!existsSync(dirPath)) {
    logger.warn(`Data directory not found: ${dirPath}`);
    return [];
  }

  const files = readdirSync(dirPath).filter((f) => f.endsWith(".json"));
  return files.map((file) => loadJsonFile(join(dirPath, file), schema));
}
