"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  SlidersHorizontal,
  Package,
  X,
  ShieldCheck,
  Sprout,
  MapPin,
  Store,
} from "lucide-react";

const riceImageCollection = {
  polished: [
    "/images/rice/polished-1.jpg",
    "/images/rice/polished-2.jpg",
    "/images/rice/polished-3.jpg",
  ],
  unpolished: [
    "/images/rice/brown-1.jpg",
    "/images/rice/brown-2.jpg",
    "/images/rice/brown-3.jpg",
  ],
  seeds: [
    "/images/rice/seeds-1.jpg",
    "/images/rice/seeds-2.jpg",
    "/images/rice/seeds-3.jpg",
  ],
};

function getImageByCategory(category: string, index: number) {
  const images =
    riceImageCollection[category as keyof typeof riceImageCollection] ||
    riceImageCollection.polished;

  return images[index % images.length];
}

const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Dinorado Rice Premium",
    price: 38,
    quantity: 500,
    location: "Bayan, Nueva Ecija",
    harvestDate: "Feb 2026",
    rating: 4.8,
    imageUrl: getImageByCategory("polished", 0),
    isPooled: true,
    category: "polished",
    verified: true,
  },
  {
    id: "2",
    name: "Jasmine White Rice",
    price: 42,
    quantity: 1200,
    location: "Isabela",
    harvestDate: "Jan 2026",
    rating: 4.5,
    imageUrl: getImageByCategory("polished", 1),
    isPooled: false,
    category: "polished",
    verified: true,
  },
  {
    id: "3",
    name: "Angelica Special Variety",
    price: 36,
    quantity: 250,
    location: "Tarlac",
    harvestDate: "Mar 2026",
    rating: 4.9,
    imageUrl: getImageByCategory("seeds", 0),
    isPooled: true,
    category: "seeds",
    verified: false,
  },
  {
    id: "4",
    name: "Organic Brown Rice",
    price: 55,
    quantity: 100,
    location: "Benguet",
    harvestDate: "Dec 2025",
    rating: 4.7,
    imageUrl: getImageByCategory("unpolished", 0),
    isPooled: false,
    category: "unpolished",
    verified: true,
  },
];

const CATEGORY_OPTIONS = [
  { label: "Lahat ng Uri", value: "all" },
  { label: "Polished Rice", value: "polished" },
  { label: "Unpolished Rice", value: "unpolished" },
  { label: "Seeds & Seedlings", value: "seeds" },
];

const PRICE_OPTIONS = [
  { label: "Lahat ng Presyo", value: "all" },
  { label: "Mas mababa sa ₱40", value: "under40" },
  { label: "₱40–₱50", value: "40to50" },
  { label: "Higit sa ₱50", value: "above50" },
];

function WoodSign({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative inline-block pt-4 ${className}`}>
      <div className="absolute left-6 top-0 h-4 w-0.5 bg-[#6F4724]" />
      <div className="absolute right-6 top-0 h-4 w-0.5 bg-[#6F4724]" />

      <div className="relative rotate-[-1deg] rounded-2xl border-[3px] border-[#6F4724] bg-[#9A6938] px-8 py-3 shadow-md">
        <div className="absolute inset-x-2 top-1 h-2 rounded-full bg-[#C08A52]/35" />
        <div className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#6F4724]" />
        <div className="absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#6F4724]" />

        <span className="relative text-sm font-black uppercase tracking-[0.18em] text-[#FFF4D6]">
          {children}
        </span>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const filteredProducts = useMemo(() => {
    let products = [...SAMPLE_PRODUCTS];

    products = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "pooled" && product.isPooled) ||
        (activeTab === "direct" && !product.isPooled);

      const matchesCategory =
        category === "all" || product.category === category;

      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "under40" && product.price < 40) ||
        (priceRange === "40to50" && product.price >= 40 && product.price <= 50) ||
        (priceRange === "above50" && product.price > 50);

      return matchesSearch && matchesTab && matchesCategory && matchesPrice;
    });

    switch (sortBy) {
      case "priceAsc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "quantity":
        products.sort((a, b) => b.quantity - a.quantity);
        break;
      default:
        break;
    }

    return products;
  }, [searchTerm, activeTab, category, priceRange, sortBy]);

  const hasActiveFilters =
    searchTerm || activeTab !== "all" || category !== "all" || priceRange !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
    setCategory("all");
    setPriceRange("all");
    setSortBy("latest");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6EEDC] text-[#3B2817]">
      <Navbar />

      <header className="relative overflow-hidden border-b border-[#D9C6A0] bg-[#F6EEDC]">
        <div className="h-10 bg-[repeating-linear-gradient(90deg,#2E6C3C_0px,#2E6C3C_28px,#F7EED8_28px,#F7EED8_56px)] border-b-[3px] border-[#8A5A2B]" />

        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="max-w-4xl space-y-5">
            <WoodSign>Sibol Marketplace</WoodSign>

            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-[#2F1F10]">
                Direktang bili mula sa kooperatiba at magsasaka
              </h1>

              <p className="max-w-2xl text-[#694F33] text-sm sm:text-base leading-relaxed">
                Mamili ng bigas at iba pang produktong agrikultural na may malinaw
                na presyo, pinagmulan, at mas direktang bentahan mula bukid hanggang buyer.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B8D6B3] bg-[#E9F6E5] px-3 py-2 font-medium text-[#2E6C3C] shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Verified cooperative listings
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5C97B] bg-[#FFF0BF] px-3 py-2 font-medium text-[#7A5618] shadow-sm">
                <MapPin className="h-4 w-4" />
                Kita ang pinagmulan
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C7A0] bg-[#FFF8E7] px-3 py-2 font-medium text-[#694F33] shadow-sm">
                <Store className="h-4 w-4" />
                Direkta at pinagsamang order
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-6">
          <div className="rounded-[28px] border-[2px] border-[#D7C29B] bg-[#FFF8E7] p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF0BF] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#7A5618]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Salain ang Paninda
              </div>

              <div className="rounded-full border border-[#D7C29B] bg-[#FFFCF3] px-3 py-1 text-sm text-[#694F33]">
                <span className="font-bold text-[#2F1F10]">{filteredProducts.length}</span> listing
                {filteredProducts.length !== 1 ? "s" : ""} found
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B6A45]" />
                <Input
                  placeholder="Hanapin ang produkto o lokasyon..."
                  className="pl-10 h-11 border-[#D7C29B] bg-[#FFFCF3] text-[#3B2817] placeholder:text-[#8B6A45]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 rounded-xl border-2 border-[#D7C29B] bg-[#FFFCF3] px-3 text-sm text-[#3B2817]"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="h-11 rounded-xl border-2 border-[#D7C29B] bg-[#FFFCF3] px-3 text-sm text-[#3B2817]"
                >
                  {PRICE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 rounded-xl border-2 border-[#D7C29B] bg-[#FFFCF3] px-3 text-sm text-[#3B2817]"
                >
                  <option value="latest">Pinakabago</option>
                  <option value="priceAsc">Pinakamurang Presyo</option>
                  <option value="priceDesc">Pinakamataas na Presyo</option>
                  <option value="rating">Pinakamataas ang Rating</option>
                  <option value="quantity">Pinakamaraming Stock</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-[#F1E6CF] border border-[#D7C29B] p-1 rounded-2xl">
                  <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]">
                    Lahat
                  </TabsTrigger>
                  <TabsTrigger value="pooled" className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]">
                    Pinagsama
                  </TabsTrigger>
                  <TabsTrigger value="direct" className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]">
                    Direkta
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="text-sm text-[#694F33]">
                Pumili batay sa uri, presyo, at paraan ng order
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {searchTerm && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#D7C29B] bg-[#FFFCF3] px-3 py-1 text-sm text-[#3B2817]">
                    Search: {searchTerm}
                  </span>
                )}
                {activeTab !== "all" && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#B8D6B3] bg-[#E9F6E5] px-3 py-1 text-sm capitalize text-[#2E6C3C]">
                    {activeTab}
                  </span>
                )}
                {category !== "all" && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#E5C97B] bg-[#FFF0BF] px-3 py-1 text-sm capitalize text-[#7A5618]">
                    {category}
                  </span>
                )}
                {priceRange !== "all" && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#D7C29B] bg-[#FFF8E7] px-3 py-1 text-sm text-[#694F33]">
                    {PRICE_OPTIONS.find((p) => p.value === priceRange)?.label}
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2 text-sm text-[#7A5618] hover:bg-[#FFF0BF]"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-10">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="space-y-2">
                  <ProductCard {...product} />
                  <div className="flex flex-wrap gap-2 px-1">
                    {product.verified && (
                      <span className="inline-flex items-center rounded-full border border-[#B8D6B3] bg-[#E9F6E5] px-2.5 py-1 text-xs font-medium text-[#2E6C3C]">
                        Verified Cooperative
                      </span>
                    )}
                    {product.isPooled && (
                      <span className="inline-flex items-center rounded-full border border-[#E9CB84] bg-[#FFF4D3] px-2.5 py-1 text-xs font-medium text-[#7A5618]">
                        Pinagsamang Order
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[28px] border-[2px] border-[#D7C29B] bg-[#FFF8E7] py-20 text-center shadow-sm">
              <div className="mb-4 rounded-full bg-[#F1E6CF] p-4">
                <Package className="h-10 w-10 text-[#8B6A45]" />
              </div>
              <h3 className="text-xl font-black text-[#2F1F10]">Walang nahanap na produkto</h3>
              <p className="mt-2 max-w-md text-sm text-[#694F33]">
                Subukang baguhin ang search, category, price range, o listing type.
              </p>
              <Button
                variant="outline"
                className="mt-5 border-[#D7C29B] bg-[#FFFCF3] hover:bg-[#FFF0BF]"
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}