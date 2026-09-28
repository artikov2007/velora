"use client";

import { ArrowRight, Check, ChevronDown, Heart, History, MapPin, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { loadCatalog } from "./catalog-api";
import { categories, convertPriceKztMinor, currencyOptions, formatPrice, popularSearches, products, regions, type CurrencyCode, type Product } from "./catalog-data";

type Cart = Record<string, number>;
const cartKey = "velora-preview-cart";
const favoritesKey = "velora-preview-favorites";
const currencyKey = "velora-preview-currency";
const recentSearchesKey = "velora-preview-recent-searches";

function persistCurrency(code: CurrencyCode) {
  try {
    localStorage.setItem(currencyKey, code);
  } catch {}
}

export function MarketplaceHome() {
  const [regionCode, setRegionCode] = useState(regions[0].code);
  const [currency, setCurrency] = useState<CurrencyCode>(regions[0].currency);
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [category, setCategory] = useState<string>(categories[0]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [catalog, setCatalog] = useState(products);
  const [apiConnected, setApiConnected] = useState(false);
  const [cart, setCart] = useState<Cart>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [detail, setDetail] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const cartDialogRef = useRef<HTMLElement | null>(null);
  const filterDialogRef = useRef<HTMLElement | null>(null);
  const productDialogRef = useRef<HTMLElement | null>(null);
  const query = useDeferredValue(search.trim().toLocaleLowerCase("ru"));
  const region = regions.find((item) => item.code === regionCode) ?? regions[0];

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const savedCart = localStorage.getItem(cartKey);
        const savedFavorites = localStorage.getItem(favoritesKey);
        const savedCurrency = localStorage.getItem(currencyKey);
        const savedRecentSearches = localStorage.getItem(recentSearchesKey);
        if (savedCart) setCart(JSON.parse(savedCart) as Cart);
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites) as string[]);
        if (savedRecentSearches) {
          const parsedSearches: unknown = JSON.parse(savedRecentSearches);
          if (Array.isArray(parsedSearches)) {
            setRecentSearches(parsedSearches.filter((term): term is string => typeof term === "string").slice(0, 5));
          }
        }
        const savedCurrencyOption = currencyOptions.find((item) => item.code === savedCurrency);
        if (savedCurrencyOption) setCurrency(savedCurrencyOption.code);
      } catch {
        localStorage.removeItem(cartKey);
        localStorage.removeItem(favoritesKey);
        localStorage.removeItem(recentSearchesKey);
      }
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    loadCatalog(controller.signal).then((items) => {
      if (!controller.signal.aborted && items.length > 0) {
        setCatalog(items);
        setApiConnected(true);
      }
    }).catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => localStorage.setItem(cartKey, JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem(favoritesKey, JSON.stringify(favorites)), [favorites]);
  useEffect(() => {
    const dialog = showCart ? cartDialogRef.current : detail ? productDialogRef.current : showFilters ? filterDialogRef.current : null;
    if (!dialog) return;
    const activeDialog = dialog;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const getFocusable = () => Array.from(activeDialog.querySelectorAll<HTMLElement>(focusableSelector));
    getFocusable()[0]?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (showCart) setShowCart(false);
        else if (detail) setDetail(null);
        else setShowFilters(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        activeDialog.focus();
      } else if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [detail, showCart, showFilters]);

  const brandOptions = [...new Set(catalog.map((product) => product.brand))].sort((left, right) => left.localeCompare(right, "ru"));
  const minimumPriceValue = minimumPrice === "" ? null : Number(minimumPrice);
  const maximumPriceValue = maximumPrice === "" ? null : Number(maximumPrice);
  const visibleProducts = useMemo(() => catalog.filter((product) => {
    const matchesCategory = category === categories[0] || product.category === category;
    const matchesSearch = !query || `${product.name} ${product.brand} ${product.category}`.toLocaleLowerCase("ru").includes(query);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const displayPrice = convertPriceKztMinor(product.priceKztMinor, currency);
    const matchesMinimum = minimumPriceValue === null || !Number.isFinite(minimumPriceValue) || displayPrice >= minimumPriceValue;
    const matchesMaximum = maximumPriceValue === null || !Number.isFinite(maximumPriceValue) || displayPrice <= maximumPriceValue;
    return matchesCategory && matchesSearch && matchesBrand && matchesMinimum && matchesMaximum && (!showFavorites || favorites.includes(product.id));
  }), [catalog, category, currency, favorites, maximumPriceValue, minimumPriceValue, query, selectedBrands, showFavorites]);
  const suggestions = catalog.filter((product) => `${product.name} ${product.brand}`.toLocaleLowerCase("ru").includes(search.trim().toLocaleLowerCase("ru"))).slice(0, 4);
  const idleSearches = [
    ...recentSearches.map((term) => ({ term, source: "recent" as const })),
    ...popularSearches.filter((term) => !recentSearches.some((recent) => recent.toLocaleLowerCase("ru") === term.toLocaleLowerCase("ru"))).map((term) => ({ term, source: "popular" as const })),
  ];
  const searchOptionCount = search.trim() ? suggestions.length : idleSearches.length;
  const cartProducts = catalog.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce((sum, amount) => sum + amount, 0);
  const cartTotal = cartProducts.reduce((sum, product) => sum + product.priceKztMinor * cart[product.id], 0);
  const activeFilterCount = Number(category !== categories[0]) + selectedBrands.length + Number(minimumPrice !== "") + Number(maximumPrice !== "");

  function add(product: Product) {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
    setToast(`${product.brand} добавлен в корзину`);
    window.setTimeout(() => setToast(""), 2200);
  }
  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  function changeQuantity(id: string, delta: number) {
    setCart((current) => {
      const quantity = (current[id] ?? 0) + delta;
      if (quantity <= 0) { const next = { ...current }; delete next[id]; return next; }
      return { ...current, [id]: quantity };
    });
  }
  function pickRegion(code: string) {
    setRegionCode(code);
    const selected = regions.find((item) => item.code === code);
    if (selected) {
      setCurrency(selected.currency);
      persistCurrency(selected.currency);
      setMinimumPrice("");
      setMaximumPrice("");
    }
  }
  function recordSearch(term: string) {
    const normalizedTerm = term.trim();
    if (!normalizedTerm) return;
    const nextSearches = [normalizedTerm, ...recentSearches.filter((item) => item.toLocaleLowerCase("ru") !== normalizedTerm.toLocaleLowerCase("ru"))].slice(0, 5);
    setRecentSearches(nextSearches);
    try {
      localStorage.setItem(recentSearchesKey, JSON.stringify(nextSearches));
    } catch {
      return;
    }
  }
  function chooseSearch(term: string) {
    setSearch(term);
    recordSearch(term);
    setShowSearch(false);
    setActiveSuggestion(-1);
  }
  function toggleBrand(brand: string) {
    setSelectedBrands((current) => current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]);
  }
  function clearFilters() {
    setCategory(categories[0]);
    setSelectedBrands([]);
    setMinimumPrice("");
    setMaximumPrice("");
  }

  const priceStep = currencyOptions.find((item) => item.code === currency)?.digits === 0 ? "1" : "0.01";
  const invalidPriceRange = minimumPriceValue !== null && maximumPriceValue !== null && Number.isFinite(minimumPriceValue) && Number.isFinite(maximumPriceValue) && minimumPriceValue > maximumPriceValue;
  const filterControls = (
    <>
      <fieldset className="filter-group">
        <legend>Категория</legend>
        <label className="filter-select-label"><span className="sr-only">Категория</span><select className="filter-select" value={category} onChange={(event) => { setCategory(event.target.value); setShowFavorites(false); }}>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </fieldset>
      <fieldset className="filter-group">
        <legend>Цена, {currency}</legend>
        <div className="price-range-fields">
          <label className="price-range-label"><span>От</span><input type="number" min="0" step={priceStep} inputMode="decimal" value={minimumPrice} onChange={(event) => setMinimumPrice(event.target.value)} /></label>
          <label className="price-range-label"><span>До</span><input type="number" min="0" step={priceStep} inputMode="decimal" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} /></label>
        </div>
        {invalidPriceRange && <p className="filter-error" role="alert">Минимальная цена выше максимальной.</p>}
      </fieldset>
      <fieldset className="filter-group">
        <legend>Бренд</legend>
        <div className="brand-filter-list">{brandOptions.map((brand) => <label className="brand-filter-option" key={brand}><input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} /><span>{brand}</span></label>)}</div>
      </fieldset>
    </>
  );

  return (
    <main className="marketplace-shell" id="top">
      <div className="utility-bar"><div className="page-width utility-inner">
        <span className="demo-label"><i /> DEMO-КАТАЛОГ{apiConnected ? " · API" : ""}</span>
        <div className="utility-controls">
          <label className="select-wrap"><MapPin size={14} /><span className="sr-only">Город доставки</span>
            <select value={regionCode} onChange={(event) => pickRegion(event.target.value)}>{regions.map((item) => <option key={item.code} value={item.code}>{item.city}, {item.label}</option>)}</select><ChevronDown size={13} />
          </label>
            <label className="select-wrap currency-select"><span className="sr-only">Валюта</span>
            <select value={currency} onChange={(event) => { const code = event.target.value as CurrencyCode; setCurrency(code); persistCurrency(code); setMinimumPrice(""); setMaximumPrice(""); }}>{currencyOptions.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select><ChevronDown size={13} />
          </label>
          <a className="utility-link" href="#seller">Стать продавцом <ArrowRight size={13} /></a>
        </div>
      </div></div>

      <header className="site-header"><div className="page-width header-main">
        <a className="brand" href="#top" aria-label="VELORA, главная"><span className="brand-symbol"><i /></span><span>VELORA</span></a>
        <div className="search-area"><form className="search-form" role="search" onSubmit={(event) => { event.preventDefault(); recordSearch(search); setShowSearch(false); setActiveSuggestion(-1); }}>
          <Search size={19} /><input aria-label="Поиск товаров и брендов" role="combobox" aria-autocomplete="list" aria-expanded={showSearch} aria-controls="search-suggestions" aria-activedescendant={activeSuggestion >= 0 ? `search-option-${activeSuggestion}` : undefined} placeholder="Найти товары, бренды и магазины" value={search} onChange={(event) => { setSearch(event.target.value); setShowSearch(true); setActiveSuggestion(-1); }} onFocus={() => setShowSearch(true)} onKeyDown={(event) => {
            if (event.key === "Escape") { setShowSearch(false); setActiveSuggestion(-1); }
            if (event.key === "ArrowDown" && searchOptionCount > 0) { event.preventDefault(); setShowSearch(true); setActiveSuggestion((index) => (index + 1) % searchOptionCount); }
            if (event.key === "ArrowUp" && searchOptionCount > 0) { event.preventDefault(); setShowSearch(true); setActiveSuggestion((index) => (index <= 0 ? searchOptionCount - 1 : index - 1)); }
            if (event.key === "Enter" && showSearch && activeSuggestion >= 0) {
              event.preventDefault();
              if (search.trim()) {
                const product = suggestions[activeSuggestion];
                if (product) { setSearch(product.name); setCategory(product.category); recordSearch(product.name); }
              } else {
                const term = idleSearches[activeSuggestion]?.term;
                if (term) chooseSearch(term);
              }
              setShowSearch(false);
              setActiveSuggestion(-1);
            }
          }} />
          {search && <button className="icon-button search-clear" type="button" aria-label="Очистить поиск" onClick={() => setSearch("")}><X size={16} /></button>}
          <button className="search-submit" type="submit" aria-label="Найти"><Search size={17} /><span>Найти</span></button>
        </form>{showSearch && <div className="search-popover">
          <p className="popover-eyebrow">{search.trim() ? "Подходящие товары" : recentSearches.length ? "Недавние и популярные запросы" : "Популярные запросы"}</p>
          <div id="search-suggestions" role="listbox" aria-label={search.trim() ? "Подходящие товары" : "Недавние и популярные запросы"}>
            {search.trim() ? suggestions.map((product, index) => <div className={`suggestion-row ${activeSuggestion === index ? "is-active" : ""}`} id={`search-option-${index}`} role="option" aria-selected={activeSuggestion === index} key={product.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { setSearch(product.name); setCategory(product.category); recordSearch(product.name); setShowSearch(false); setActiveSuggestion(-1); }}><Search size={15} /><span>{product.name}</span><small>{product.brand}</small></div>) : idleSearches.map(({ term, source }, index) => <div className={`suggestion-row ${activeSuggestion === index ? "is-active" : ""}`} id={`search-option-${index}`} role="option" aria-selected={activeSuggestion === index} key={`${source}-${term}`} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSearch(term)}>{source === "recent" ? <History size={15} /> : <Search size={15} />}<span>{term}</span><ArrowRight size={14} /></div>)}
          </div>
          {search.trim() && suggestions.length === 0 && <p className="suggestion-empty">Ничего не найдено. Попробуйте изменить запрос.</p>}
        </div>}</div>
        <div className="header-actions">
          <button className={`header-action ${showFavorites ? "is-active" : ""}`} type="button" aria-pressed={showFavorites} onClick={() => setShowFavorites((value) => !value)}><span className="action-icon"><Heart size={20} /></span><span>Избранное</span>{favorites.length > 0 && <b className="action-count">{favorites.length}</b>}</button>
          <button className="header-action" type="button" aria-label={`Корзина, товаров: ${cartCount}`} onClick={() => setShowCart(true)}><span className="action-icon"><ShoppingBag size={20} />{cartCount > 0 && <b className="cart-count">{cartCount}</b>}</span><span>Корзина</span></button>
        </div>
      </div><nav className="page-width category-nav" aria-label="Категории товаров">
        {categories.map((item, index) => <button key={item} className={`category-link ${category === item && !showFavorites ? "is-active" : ""}`} type="button" onClick={() => { setCategory(item); setShowFavorites(false); setSearch(""); }}>{index === 0 && <Sparkles size={14} />}{item}</button>)}
        <a className="category-link category-trending" href="#catalog">Тренды <ArrowRight size={14} /></a>
      </nav></header>

      <div className="page-width demo-notice" role="note"><span><Check size={13} /> Среда предварительного просмотра</span><p>Цены и валютные курсы демонстрационные. Заказ товаров пока недоступен.</p></div>

      <section className="page-width campaign" aria-labelledby="campaign-title">
        <div className="campaign-copy"><h1 id="campaign-title">Ближе,<br />чем кажется<span>.</span></h1><p>Товары и продавцы Центральной Азии — в одном месте. Начните с того, что давно искали.</p>
          <a className="primary-button" href="#catalog">Смотреть каталог <ArrowRight size={17} /></a><div className="campaign-meta"><i />{region.city} · {region.label}</div>
        </div>
        <div className="campaign-visual" role="img" aria-label="Наушники на ярком фоне"><Image className="campaign-image" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1500&q=90" alt="" fill sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 900px) 50vw, 640px" preload /></div>
        <div className="campaign-edge-note">KAZAKHSTAN&nbsp; / &nbsp;UZBEKISTAN&nbsp; / &nbsp;KYRGYZSTAN&nbsp; / &nbsp;TAJIKISTAN</div>
      </section>

      <section className="page-width benefit-strip" aria-label="Принципы VELORA">
        <div className="benefit-item"><MapPin size={18} /><span><strong>Ваш регион</strong><small>Город и валюта рядом</small></span></div>
        <div className="benefit-item"><ShoppingBag size={18} /><span><strong>Местные продавцы</strong><small>Единый каталог региона</small></span></div>
        <div className="benefit-item"><Truck size={18} /><span><strong>Понятная доставка</strong><small>Условия до оформления</small></span></div>
      </section>

      <section className="page-width catalog-section" id="catalog" aria-labelledby="catalog-title">
        <div className="section-heading"><div><span className="eyebrow"><i />КАТАЛОГ · ДЕМО-ДАННЫЕ</span><h2 id="catalog-title">{showFavorites ? "Избранное" : category === categories[0] ? "Выбрано для вас" : category}<span>.</span></h2></div><div className="catalog-context">{visibleProducts.length} товаров <i /> Доставка в {region.city}</div></div>
        <div className="mobile-catalog-toolbar">
          <div className="mobile-category-scroll">{categories.map((item) => <button key={item} className={`mobile-category ${category === item && !showFavorites ? "is-active" : ""}`} type="button" onClick={() => { setCategory(item); setShowFavorites(false); }}>{item}</button>)}</div>
          <button className="mobile-filter-button" type="button" onClick={() => setShowFilters(true)} aria-haspopup="dialog"><SlidersHorizontal size={16} />Фильтры{activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}</button>
        </div>
        {activeFilterCount > 0 && <div className="selected-filter-list" aria-label="Выбранные фильтры">
          {category !== categories[0] && <button className="filter-chip" type="button" onClick={() => setCategory(categories[0])}>{category}<X size={13} /><span className="sr-only">Снять фильтр категории</span></button>}
          {selectedBrands.map((brand) => <button className="filter-chip" type="button" key={brand} onClick={() => toggleBrand(brand)}>{brand}<X size={13} /><span className="sr-only">Снять фильтр бренда {brand}</span></button>)}
          {minimumPrice && <button className="filter-chip" type="button" onClick={() => setMinimumPrice("")}>От {minimumPrice} {currency}<X size={13} /><span className="sr-only">Снять минимальную цену</span></button>}
          {maximumPrice && <button className="filter-chip" type="button" onClick={() => setMaximumPrice("")}>До {maximumPrice} {currency}<X size={13} /><span className="sr-only">Снять максимальную цену</span></button>}
          <button className="filter-reset-link" type="button" onClick={clearFilters}>Сбросить всё</button>
        </div>}
        <div className="catalog-layout">
          <aside className="desktop-filter-panel" aria-label="Фильтры каталога">
            <div className="desktop-filter-heading"><h3>Фильтры</h3>{activeFilterCount > 0 && <button className="filter-reset-link" type="button" onClick={clearFilters}>Сбросить</button>}</div>
            {filterControls}
          </aside>
          <div className="catalog-results">
            <div className="product-grid">{visibleProducts.map((product, index) => <article className="product-card" key={product.id} style={{ animationDelay: `${index * 12}ms` }}>
          <div className="product-image-wrap" style={{ backgroundColor: product.swatch }}><Image className="product-image" src={product.image} alt={product.imageAlt} fill sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw" /><span className="demo-product-tag">DEMO</span>
            <button className={`favorite-button icon-button ${favorites.includes(product.id) ? "is-favorite" : ""}`} type="button" aria-label={favorites.includes(product.id) ? "Убрать из избранного" : "В избранное"} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><Heart size={18} fill={favorites.includes(product.id) ? "currentColor" : "none"} /></button>
            <button className="quick-view-button" type="button" onClick={() => setDetail(product)}>Быстрый просмотр <ArrowRight size={14} /></button>
          </div><div className="product-copy"><div className="product-brand-row"><span>{product.brand}</span><span className="product-category-label">{product.category}</span></div>
            <Link className="product-title" href={`/product/${product.id}?currency=${currency}`}>{product.name}</Link><div className="product-bottom-row"><strong className="product-price">{formatPrice(product.priceKztMinor, currency)}</strong><button className="add-button icon-button" type="button" aria-label={`Добавить ${product.name} в корзину`} onClick={() => add(product)}><Plus size={18} /></button></div><small className="seller-disclaimer">Пример цены · не для заказа</small>
          </div></article>)}</div>
            {visibleProducts.length === 0 && <div className="empty-state"><Search size={22} /><h3>{showFavorites ? "Здесь пока пусто" : "Ничего не найдено"}</h3><p>{showFavorites ? "Добавляйте товары в избранное, нажав на сердечко." : "Попробуйте изменить условия фильтрации или запрос."}</p><button className="text-button" type="button" onClick={() => { setSearch(""); clearFilters(); setShowFavorites(false); }}>Показать весь каталог <ArrowRight size={15} /></button></div>}
          </div>
        </div>
      </section>

      {showFilters && <div className="overlay filter-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowFilters(false); }}><section ref={filterDialogRef} className="filter-sheet" role="dialog" aria-modal="true" aria-labelledby="filter-sheet-title" tabIndex={-1}>
        <div className="filter-sheet-heading"><h2 id="filter-sheet-title">Фильтры</h2><button className="icon-button close-button" type="button" aria-label="Закрыть фильтры" onClick={() => setShowFilters(false)}><X size={20} /></button></div>
        <div className="filter-sheet-content">{filterControls}</div>
        <button className="primary-button filter-apply-button" type="button" onClick={() => setShowFilters(false)}>Показать {visibleProducts.length} товаров</button>
      </section></div>}

      <section className="page-width seller-callout" id="seller"><span className="seller-mark">V</span><div><span className="eyebrow">ДЛЯ ПРОДАВЦОВ</span><h2>Ваш магазин — на всю Центральную Азию.</h2></div><button className="secondary-button" type="button" onClick={() => setToast("Кабинет продавца появится в следующем этапе MVP")}>Узнать о запуске <ArrowRight size={16} /></button></section>
      <footer className="page-width site-footer"><a className="brand footer-brand" href="#top"><span className="brand-symbol"><i /></span>VELORA</a><p>Региональный marketplace Центральной Азии · Создатель: Artikov</p><span className="footer-demo">PREVIEW BUILD · 2026</span></footer>
      <nav className="mobile-bottom-nav" aria-label="Основная навигация"><a href="#top"><Sparkles size={19} /><span>Главная</span></a><a href="#catalog"><Search size={19} /><span>Каталог</span></a><button type="button" onClick={() => setShowCart(true)}><ShoppingBag size={19} /><span>Корзина{cartCount > 0 ? ` · ${cartCount}` : ""}</span></button><button type="button" onClick={() => setShowFavorites((value) => !value)}><Heart size={19} /><span>Избранное</span></button></nav>

      {showCart && <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCart(false); }}><section ref={cartDialogRef} className="side-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabIndex={-1}>
        <div className="panel-header"><div><span className="eyebrow">ВАШ ВЫБОР</span><h2 id="cart-title">Корзина <small>({cartCount})</small></h2></div><button className="icon-button close-button" type="button" aria-label="Закрыть корзину" onClick={() => setShowCart(false)}><X size={20} /></button></div>
        {cartProducts.length ? <><div className="cart-items">{cartProducts.map((product) => <div className="cart-item" key={product.id}><div className="cart-item-image" style={{ backgroundColor: product.swatch }}><Image className="cart-item-photo" src={product.image} alt={product.imageAlt} fill sizes="82px" /></div><div className="cart-item-copy"><small>{product.brand}</small><strong>{product.name}</strong><span>{formatPrice(product.priceKztMinor, currency)}</span><div className="quantity-control"><button type="button" aria-label="Уменьшить количество" onClick={() => changeQuantity(product.id, -1)}><Minus size={13} /></button><span>{cart[product.id]}</span><button type="button" aria-label="Увеличить количество" onClick={() => changeQuantity(product.id, 1)}><Plus size={13} /></button></div></div></div>)}</div><div className="cart-summary"><div><span>Примерная сумма</span><strong>{formatPrice(cartTotal, currency)}</strong></div><p>Демо-данные. Оформление заказа ещё не подключено.</p><button className="primary-button" type="button" disabled>Оформление скоро появится <ArrowRight size={16} /></button></div></> : <div className="cart-empty"><ShoppingBag size={25} /><h3>Корзина пока пуста</h3><p>Добавьте товары из каталога, чтобы собрать свою подборку.</p><button className="text-button" type="button" onClick={() => setShowCart(false)}>Вернуться к покупкам <ArrowRight size={15} /></button></div>}
      </section></div>}

      {detail && <div className="overlay modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}><section ref={productDialogRef} className="product-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" tabIndex={-1}>
        <button className="icon-button close-button modal-close" type="button" aria-label="Закрыть" onClick={() => setDetail(null)}><X size={20} /></button><div className="modal-image" style={{ backgroundColor: detail.swatch }}><Image className="modal-photo" src={detail.image} alt={detail.imageAlt} fill sizes="(max-width: 600px) calc(100vw - 24px), 395px" /></div><div className="modal-copy"><span className="eyebrow">{detail.brand} · ДЕМО-КАТАЛОГ</span><h2 id="detail-title">{detail.name}</h2><p>{detail.category}</p><strong>{formatPrice(detail.priceKztMinor, currency)}</strong><p className="modal-disclaimer">Пример цены для демонстрации интерфейса. Наличие и условия продавца не подтверждены.</p><button className="primary-button" type="button" onClick={() => { add(detail); setDetail(null); }}>Добавить в демо-корзину <Plus size={17} /></button></div>
      </section></div>}
      {toast && <div className="toast-message" role="status"><Check size={17} />{toast}</div>}
    </main>
  );
}