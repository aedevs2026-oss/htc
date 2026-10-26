export type CatalogImage = { src: string; alt?: string; source?: string; view?: string };

export type CatalogCategory = {
  id?: string | number;
  name: string;
  slug: string;
  parent?: string | null;
  count?: number;
  description?: string;
  image?: string | null;
  sourceUrl?: string | null;
};

export type CatalogProduct = {
  id: number | string;
  name: string;
  displayName?: string;
  slug?: string;
  sku?: string;
  price?: number | null;
  regularPrice?: number | null;
  salePrice?: number | null;
  currency?: string;
  category?: string;
  categories?: string[];
  categorySlugs?: string[];
  image?: string | null;
  images?: CatalogImage[];
  description?: string;
  shortDescription?: string;
  brand?: string;
  stockStatus?: string;
  sourceUrl?: string | null;
  isFeatured?: boolean;
  isPublished?: boolean;
};
