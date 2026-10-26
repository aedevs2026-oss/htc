import fs from "node:fs/promises";
import path from "node:path";

export type SyncReport = {
  source: string;
  syncedAt: string;
  products: number;
  categories: number;
  withPrice: number;
  downloadedProductImages: number;
  downloadedCategoryImages: number;
  note: string;
};

export async function getSyncReport(): Promise<SyncReport | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "data/sync-report.json"), "utf8");
    return JSON.parse(raw) as SyncReport;
  } catch {
    return null;
  }
}
