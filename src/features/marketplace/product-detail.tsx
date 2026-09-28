"use client";

import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice, type CurrencyCode, type Product } from "./catalog-data";

const cartKey = "velora-preview-cart";

export function ProductDetail({ product, currency }: { product: Product; currency: CurrencyCode }) {
  const [toast, setToast] = useState("");

  function addToDemoCart() {
    try {
      const saved = localStorage.getItem(cartKey);
      const cart = saved ? JSON.parse(saved) as Record<string, number> : {};
      const quantity = cart[product.id];
      cart[product.id] = Number.isInteger(quantity) && quantity > 0 ? quantity + 1 : 1;
      localStorage.setItem(cartKey, JSON.stringify(cart));
      setToast("Товар добавлен в демо-корзину");
    } catch {
      localStorage.setItem(cartKey, JSON.stringify({ [product.id]: 1 }));
      setToast("Товар добавлен в демо-корзину");
    }
    window.setTimeout(() => setToast(""), 2200);
  }

  return (
    <main className="marketplace-shell product-page-shell">
      <header className="product-page-header">
        <div className="page-width product-page-header-inner">
          <Link className="brand" href="/" aria-label="VELORA, главная"><span className="brand-symbol"><i /></span><span>VELORA</span></Link>
          <Link className="product-back-link" href="/#catalog"><ArrowLeft size={16} /> Вернуться в каталог</Link>
        </div>
      </header>
      <nav className="page-width product-breadcrumbs" aria-label="Навигационная цепочка">
        <ol><li><Link href="/">Главная</Link></li><li><Link href="/#catalog">Каталог</Link></li><li aria-current="page">{product.name}</li></ol>
      </nav>
      <section className="page-width product-detail-layout" aria-labelledby="product-title">
        <div className="product-detail-media" style={{ backgroundColor: product.swatch }}>
          <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 900px) calc(100vw - 32px), 52vw" priority />
          <span className="demo-product-tag">DEMO</span>
        </div>
        <div className="product-detail-copy">
          <span className="eyebrow"><i />{product.brand} · КАТАЛОГ VELORA</span>
          <h1 id="product-title">{product.name}</h1>
          <p className="product-detail-category">{product.category}</p>
          <p className="product-detail-price">{formatPrice(product.priceKztMinor, currency)}</p>
          <div className="product-preview-note" role="note"><strong>Предварительная версия</strong><span>Цена и карточка демонстрационные. Заказ, наличие и условия продажи не подтверждены.</span></div>
          <button className="primary-button product-detail-add" type="button" onClick={addToDemoCart}><ShoppingBag size={17} /> Добавить в демо-корзину</button>
          <section className="product-detail-facts" aria-labelledby="product-facts-title">
            <h2 id="product-facts-title">Данные каталога</h2>
            <dl><div><dt>Бренд</dt><dd>{product.brand}</dd></div><div><dt>Категория</dt><dd>{product.category}</dd></div><div><dt>Артикул</dt><dd>{product.id}</dd></div></dl>
            <p>Подробное описание и подтверждённые характеристики пока не предоставлены.</p>
          </section>
        </div>
      </section>
      <footer className="page-width site-footer product-page-footer"><Link className="brand footer-brand" href="/"><span className="brand-symbol"><i /></span>VELORA</Link><p>Региональный marketplace Центральной Азии · Создатель: Artikov</p><span className="footer-demo">PREVIEW BUILD · 2026</span></footer>
      {toast && <div className="toast-message" role="status"><Check size={17} />{toast}</div>}
    </main>
  );
}