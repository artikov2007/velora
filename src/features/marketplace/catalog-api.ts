import type { Product } from "./catalog-data";

type ApiProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price_minor: number;
  currency_code: string;
  image_url: string;
  image_alt: string;
};

export async function loadCatalog(signal: AbortSignal): Promise<Product[]> {
  const response = await fetch("/api/v1/catalog/products", {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);

  const items = (await response.json()) as ApiProduct[];
  if (items.some((item) => item.currency_code !== "KZT")) {
    throw new Error("The preview catalog currently expects KZT source prices.");
  }

  return items.map((item) => ({
    id: item.slug,
    name: item.name,
    brand: item.brand,
    category: item.category,
    priceKztMinor: item.price_minor,
    image: item.image_url,
    imageAlt: item.image_alt,
    swatch: "#e7ebe8",
  }));
}