import { notFound } from "next/navigation";
import { ProductDetail } from "@/features/marketplace/product-detail";
import { currencyOptions, products, type CurrencyCode, type Product } from "@/features/marketplace/catalog-data";

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

async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    const apiOrigin = process.env.VELORA_API_INTERNAL_URL ?? "http://127.0.0.1:8000";
    const response = await fetch(`${apiOrigin.replace(/\/$/, "")}/api/v1/catalog/products`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (response.ok) {
      const items = await response.json() as ApiProduct[];
      const item = items.find((entry) => entry.slug === slug && entry.currency_code === "KZT");
      if (item) {
        return {
          id: item.slug,
          name: item.name,
          brand: item.brand,
          category: item.category,
          priceKztMinor: item.price_minor,
          image: item.image_url,
          imageAlt: item.image_alt,
          swatch: "#e7ebe8",
        };
      }
    }
  } catch {
    // The local demo catalog remains available while the API is offline.
  }

  return products.find((product) => product.id === slug);
}

export default async function ProductPage({ params, searchParams }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const { currency: requestedCurrency } = await searchParams;
  const currency: CurrencyCode = currencyOptions.find((item) => item.code === requestedCurrency)?.code ?? "KZT";
  const product = await getProduct(slug);
  if (!product) notFound();

  return <ProductDetail product={product} currency={currency} />;
}