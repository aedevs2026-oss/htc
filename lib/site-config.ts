import fs from "node:fs/promises";
import path from "node:path";

export type SiteConfig = {
  heroStats: { brands: string; designs: string; dealers: string };
  featuredProductIds: number[];
  spotlightCategorySlugs: string[];
  collectionSlugs: string[];
};

const CONFIG_PATH = path.join(process.cwd(), "data/site.json");

export const defaultSiteConfig: SiteConfig = {
  heroStats: { brands: "10+", designs: "510+", dealers: "25+" },
  featuredProductIds: [],
  spotlightCategorySlugs: ["sofa", "bedroom", "dining", "office-furniture", "coffee-table", "wardrobe"],
  collectionSlugs: ["sofa", "bedroom", "dining", "new"],
};

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return { ...defaultSiteConfig, ...JSON.parse(raw) };
  } catch {
    return defaultSiteConfig;
  }
}

export async function saveSiteConfig(config: SiteConfig) {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}
