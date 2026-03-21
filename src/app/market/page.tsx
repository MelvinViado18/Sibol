"use client";

import { useEffect, useMemo, useState } from "react";
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
  MapPin,
  Store,
} from "lucide-react";

const PRODUCTS_STORAGE_KEY = "sibol_products";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  availableQuantity?: number;
  sold?: number;
  reservedQuantity?: number;
  location: string;
  harvestDate: string;
  rating?: number;
  reviews?: number;
  imageUrl: string;
  images?: string[];
  isPooled?: boolean;
  category?: string;
  verified?: boolean;
  farmer?: string;
  farmerName?: string;
  farmerId?: string;
  farmerWallet?: string;
  farmerRating?: number;
  description?: string;
  paymentMethod?: string;
  payoutStatus?: string;
  blockchainNetwork?: string;
  status?: string;
  createdAt?: string;
};

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

function normalizeCategory(category?: string) {
  if (!category) return "polished";

  if (["polished", "unpolished", "seeds"].includes(category)) {
    return category;
  }

  if (category === "premium" || category === "value") {
    return "polished";
  }

  return "polished";
}

function normalizeProduct(product: Partial<Product>, index: number): Product {
  const normalizedCategory = normalizeCategory(product.category);
  const availableQty =
    typeof product.availableQuantity === "number"
      ? product.availableQuantity
      : Number(product.quantity || 0);

  return {
    id: String(product.id || Date.now() + index),
    name: product.name || "Unnamed Product",
    price: Number(product.price || 0),
    originalPrice: product.originalPrice,
    quantity: Number(product.quantity || 0),
    availableQuantity: availableQty,
    sold: Number(product.sold || 0),
    reservedQuantity: Number(product.reservedQuantity || 0),
    location: product.location || "Unknown location",
    harvestDate: product.harvestDate || "No date",
    rating: Number(product.rating ?? 4.5),
    reviews: Number(product.reviews ?? 0),
    imageUrl:
      product.imageUrl ||
      getImageByCategory(normalizedCategory, index),
    images: product.images || [],
    isPooled:
      typeof product.isPooled === "boolean"
        ? product.isPooled
        : availableQty >= 100,
    category: normalizedCategory,
    verified: typeof product.verified === "boolean" ? product.verified : true,
    farmer: product.farmer,
    farmerName: product.farmerName,
    farmerId: product.farmerId,
    farmerWallet: product.farmerWallet,
    farmerRating: product.farmerRating,
    description: product.description,
    paymentMethod: product.paymentMethod,
    payoutStatus: product.payoutStatus,
    blockchainNetwork: product.blockchainNetwork,
    status: product.status || "active",
    createdAt: product.createdAt,
  };
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Dinorado Rice Premium",
    price: 38,
    quantity: 500,
    availableQuantity: 500,
    location: "Bayan, Nueva Ecija",
    harvestDate: "Feb 2026",
    rating: 4.8,
    imageUrl: getImageByCategory("polished", 0),
    isPooled: true,
    category: "polished",
    verified: true,
    status: "active",
    createdAt: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Jasmine White Rice",
    price: 42,
    quantity: 1200,
    availableQuantity: 1200,
    location: "Isabela",
    harvestDate: "Jan 2026",
    rating: 4.5,
    imageUrl: getImageByCategory("polished", 1),
    isPooled: false,
    category: "polished",
    verified: true,
    status: "active",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Angelica Special Variety",
    price: 36,
    quantity: 250,
    availableQuantity: 250,
    location: "Tarlac",
    harvestDate: "Mar 2026",
    rating: 4.9,
    imageUrl: getImageByCategory("seeds", 0),
    isPooled: true,
    category: "seeds",
    verified: false,
    status: "active",
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "Organic Brown Rice",
    price: 55,
    quantity: 100,
    availableQuantity: 100,
    location: "Benguet",
    harvestDate: "Dec 2025",
    rating: 4.7,
    imageUrl: getImageByCategory("unpolished", 0),
    isPooled: false,
    category: "unpolished",
    verified: true,
    status: "active",
    createdAt: "2025-12-20T00:00:00.000Z",
  },
];

const CATEGORY_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Polished Rice", value: "polished" },
  { label: "Unpolished Rice", value: "unpolished" },
  { label: "Seeds & Seedlings", value: "seeds" },
];

const PRICE_OPTIONS = [
  { label: "All Prices", value: "all" },
  { label: "Below ₱40", value: "under40" },
  { label: "₱40–₱50", value: "40to50" },
  { label: "Above ₱50", value: "above50" },
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
  const [marketplaceProducts, setMarketplaceProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = () => {
      const localProductsRaw =
        typeof window !== "undefined"
          ? localStorage.getItem(PRODUCTS_STORAGE_KEY)
          : null;

      let localProducts: Product[] = [];

      try {
        const parsed = localProductsRaw ? JSON.parse(localProductsRaw) : [];
        localProducts = Array.isArray(parsed)
          ? parsed.map((product, index) => normalizeProduct(product, index))
          : [];
      } catch {
        localProducts = [];
      }

      const sampleProductsNormalized = SAMPLE_PRODUCTS.map((product, index) =>
        normalizeProduct(product, index)
      );

      const mergedProducts = [...localProducts, ...sampleProductsNormalized];

      setMarketplaceProducts(mergedProducts);
    };

    loadProducts();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === PRODUCTS_STORAGE_KEY) {
        loadProducts();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let products = [...marketplaceProducts];

    products = products.filter((product) => {
      const availableQty =
        typeof product.availableQuantity === "number"
          ? product.availableQuantity
          : product.quantity;

      const isVisible = product.status !== "paused" && product.status !== "sold_out";
      const hasStock = availableQty > 0;

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.farmerName || product.farmer || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

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

      return (
        isVisible &&
        hasStock &&
        matchesSearch &&
        matchesTab &&
        matchesCategory &&
        matchesPrice
      );
    });

    switch (sortBy) {
      case "priceAsc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "quantity":
        products.sort(
          (a, b) =>
            (b.availableQuantity ?? b.quantity ?? 0) -
            (a.availableQuantity ?? a.quantity ?? 0)
        );
        break;
      case "latest":
      default:
        products.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
    }

    return products;
  }, [marketplaceProducts, searchTerm, activeTab, category, priceRange, sortBy]);

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
                Direct buying from cooperatives and farmers
              </h1>

              <p className="max-w-2xl text-[#694F33] text-sm sm:text-base leading-relaxed">
                Browse rice and other agricultural products with clearer pricing,
                visible origin, and a more direct farm-to-buyer flow.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B8D6B3] bg-[#E9F6E5] px-3 py-2 font-medium text-[#2E6C3C] shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Verified cooperative listings
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5C97B] bg-[#FFF0BF] px-3 py-2 font-medium text-[#7A5618] shadow-sm">
                <MapPin className="h-4 w-4" />
                Visible source location
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C7A0] bg-[#FFF8E7] px-3 py-2 font-medium text-[#694F33] shadow-sm">
                <Store className="h-4 w-4" />
                Direct and pooled orders
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
                Filter Listings
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
                  placeholder="Search product, location, or farmer..."
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
                  <option value="latest">Latest</option>
                  <option value="priceAsc">Lowest Price</option>
                  <option value="priceDesc">Highest Price</option>
                  <option value="rating">Highest Rating</option>
                  <option value="quantity">Most Stock</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-[#F1E6CF] border border-[#D7C29B] p-1 rounded-2xl">
                  <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pooled" className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]">
                    Pooled
                  </TabsTrigger>
                  <TabsTrigger value="direct" className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]">
                    Direct
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="text-sm text-[#694F33]">
                Choose by type, price, and order method
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
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    quantity={product.quantity}
                    location={product.location}
                    harvestDate={product.harvestDate}
                    rating={product.rating ?? 4.5}
                    imageUrl={product.imageUrl}
                    isPooled={product.isPooled}
                  />
                  <div className="flex flex-wrap gap-2 px-1">
                    {product.verified && (
                      <span className="inline-flex items-center rounded-full border border-[#B8D6B3] bg-[#E9F6E5] px-2.5 py-1 text-xs font-medium text-[#2E6C3C]">
                        Verified Cooperative
                      </span>
                    )}
                    {product.isPooled && (
                      <span className="inline-flex items-center rounded-full border border-[#E9CB84] bg-[#FFF4D3] px-2.5 py-1 text-xs font-medium text-[#7A5618]">
                        Pooled Order
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
              <h3 className="text-xl font-black text-[#2F1F10]">No products found</h3>
              <p className="mt-2 max-w-md text-sm text-[#694F33]">
                Try changing the search, category, price range, or listing type.
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