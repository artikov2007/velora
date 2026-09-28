export type CurrencyCode = "KZT" | "UZS" | "KGS" | "TJS" | "USD";

export type Region = {
  code: string;
  label: string;
  city: string;
  currency: CurrencyCode;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceKztMinor: number;
  image: string;
  imageAlt: string;
  swatch: string;
};

const currencies: Record<CurrencyCode, { digits: number; numerator: bigint; denominator: bigint }> = {
  KZT: { digits: 2, numerator: BigInt(1), denominator: BigInt(1) },
  UZS: { digits: 0, numerator: BigInt(27), denominator: BigInt(1) },
  KGS: { digits: 2, numerator: BigInt(19), denominator: BigInt(100) },
  TJS: { digits: 2, numerator: BigInt(53), denominator: BigInt(1000) },
  USD: { digits: 2, numerator: BigInt(22), denominator: BigInt(10000) },
};

export const currencyOptions: { code: CurrencyCode; label: string; digits: number }[] = [
  { code: "KZT", label: "₸ KZT", digits: 0 },
  { code: "UZS", label: "сум UZS", digits: 0 },
  { code: "KGS", label: "сом KGS", digits: 0 },
  { code: "TJS", label: "сомони TJS", digits: 0 },
  { code: "USD", label: "$ USD", digits: 2 },
];

export const regions: Region[] = [
  { code: "KZ", label: "Казахстан", city: "Алматы", currency: "KZT" },
  { code: "UZ", label: "Узбекистан", city: "Ташкент", currency: "UZS" },
  { code: "KG", label: "Кыргызстан", city: "Бишкек", currency: "KGS" },
  { code: "TJ", label: "Таджикистан", city: "Душанбе", currency: "TJS" },
];

export const categories = ["Все товары", "Электроника", "Дом", "Одежда", "Аксессуары"] as const;

export const products: Product[] = [
  { id: "smartphone-pro", name: "Смартфон Pro, 256 ГБ", brand: "Apple", category: "Электроника", priceKztMinor: 72990000, image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=85", imageAlt: "Смартфон с темным экраном", swatch: "#e5e8e7" },
  { id: "wireless-headphones", name: "Беспроводные наушники", brand: "Sony", category: "Электроника", priceKztMinor: 18990000, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", imageAlt: "Накладные наушники на желтом фоне", swatch: "#f1d66a" },
  { id: "ultrabook-14", name: "Ноутбук 14″, 16 ГБ / 512 ГБ", brand: "ASUS", category: "Электроника", priceKztMinor: 48990000, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85", imageAlt: "Открытый ноутбук на столе", swatch: "#d9e4dc" },
  { id: "analog-watch", name: "Часы с металлическим браслетом", brand: "Casio", category: "Аксессуары", priceKztMinor: 8490000, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85", imageAlt: "Наручные часы", swatch: "#e4e1dc" },
  { id: "running-shoes", name: "Кроссовки для города", brand: "Nike", category: "Одежда", priceKztMinor: 12990000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", imageAlt: "Красный спортивный кроссовок", swatch: "#e85745" },
  { id: "mirrorless-camera", name: "Беззеркальная камера", brand: "Canon", category: "Электроника", priceKztMinor: 35990000, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", imageAlt: "Компактная камера", swatch: "#d8d9d6" },
  { id: "table-lamp", name: "Настольная лампа", brand: "Nord Home", category: "Дом", priceKztMinor: 5790000, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85", imageAlt: "Настольная лампа в интерьере", swatch: "#e7ded0" },
  { id: "portable-speaker", name: "Портативная Bluetooth-колонка", brand: "JBL", category: "Электроника", priceKztMinor: 9990000, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85", imageAlt: "Портативная колонка", swatch: "#dce3df" },
];

export const popularSearches = ["iPhone", "ноутбук", "наушники", "кроссовки"];

export function convertPriceKztMinor(priceKztMinor: number, code: CurrencyCode): number {
  const rate = currencies[code];
  const denominator = BigInt(100) * rate.denominator;
  const numerator = BigInt(priceKztMinor) * rate.numerator * BigInt(10) ** BigInt(rate.digits);
  const minorUnits = (numerator + denominator / BigInt(2)) / denominator;
  return Number(minorUnits) / 10 ** rate.digits;
}

export function formatPrice(priceKztMinor: number, code: CurrencyCode): string {
  const amount = convertPriceKztMinor(priceKztMinor, code);
  const displayDigits = currencyOptions.find((item) => item.code === code)?.digits ?? 0;

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: code,
    minimumFractionDigits: displayDigits,
    maximumFractionDigits: displayDigits,
  }).format(amount);
}