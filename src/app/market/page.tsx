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
  Sprout,
  TrendingUp,
  Wallet,
  CalendarDays,
} from "lucide-react";
import {
  investInHarvest,
  getCurrentUser,
  type HarvestCampaign,
} from "@/lib/investment-utils";
import { ethers } from "ethers";

const PRODUCTS_STORAGE_KEY = "sibol_products";
const HARVESTS_STORAGE_KEY = "sibol_harvests";
const CURRENT_USER_KEY = "sibol_current_user";

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

type HarvestStatus = "funding" | "growing" | "harvested" | "sold" | "cancelled";

type HarvestInvestor = {
  userId: string;
  userName: string;
  amount: number;
};

type Harvest = {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerWallet?: string;
  title: string;
  cropType: string;
  location: string;
  description: string;
  fundingGoal: number;
  fundedAmount: number;
  estimatedYieldKg: number;
  targetSellPricePerKg: number;
  estimatedProductionCost: number;
  expectedHarvestDate: string;
  profitShareFarmer: number;
  profitShareInvestors: number;
  minimumInvestment: number;
  status: HarvestStatus;
  investors: HarvestInvestor[];
  createdAt: string;
  coverImage: string;
  verified?: boolean;
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
    imageUrl: product.imageUrl || getImageByCategory(normalizedCategory, index),
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

function normalizeHarvest(harvest: Partial<Harvest>, index: number): Harvest {
  return {
    id: String(harvest.id || `harvest-${Date.now()}-${index}`),
    farmerId: String(harvest.farmerId || `farmer-${index + 1}`),
    farmerName: harvest.farmerName || "Farmer Cooperative",
    farmerWallet: harvest.farmerWallet,
    title: harvest.title || "Untitled Harvest Campaign",
    cropType: harvest.cropType || "Rice",
    location: harvest.location || "Unknown location",
    description:
      harvest.description ||
      "Funding support for seeds, fertilizer, labor, and logistics.",
    fundingGoal: Number(harvest.fundingGoal || 0),
    fundedAmount: Number(harvest.fundedAmount || 0),
    estimatedYieldKg: Number(harvest.estimatedYieldKg || 0),
    targetSellPricePerKg: Number(harvest.targetSellPricePerKg || 0),
    estimatedProductionCost: Number(harvest.estimatedProductionCost || 0),
    expectedHarvestDate: harvest.expectedHarvestDate || "No date",
    profitShareFarmer: Number(harvest.profitShareFarmer ?? 60),
    profitShareInvestors: Number(harvest.profitShareInvestors ?? 40),
    minimumInvestment: Number(harvest.minimumInvestment ?? 500),
    status: (harvest.status as HarvestStatus) || "funding",
    investors: Array.isArray(harvest.investors) ? harvest.investors : [],
    createdAt: harvest.createdAt || new Date().toISOString(),
    coverImage: harvest.coverImage || getImageByCategory("polished", index),
    verified: typeof harvest.verified === "boolean" ? harvest.verified : true,
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

const SAMPLE_HARVESTS: Harvest[] = [
  {
    id: "harvest-1",
    farmerId: "farmer-001",
    farmerName: "Nueva Ecija Farmers Cooperative",
    title: "Dinorado Rice Harvest Batch 01",
    cropType: "Rice",
    location: "Nueva Ecija",
    description:
      "Funding support for seeds, fertilizer, labor, drying, and transport before harvest sale.",
    fundingGoal: 50000,
    fundedAmount: 18500,
    estimatedYieldKg: 1200,
    targetSellPricePerKg: 45,
    estimatedProductionCost: 50000,
    expectedHarvestDate: "2026-06-15",
    profitShareFarmer: 60,
    profitShareInvestors: 40,
    minimumInvestment: 500,
    status: "funding",
    investors: [],
    createdAt: "2026-03-12T00:00:00.000Z",
    coverImage: getImageByCategory("polished", 0),
    verified: true,
  },
  {
    id: "harvest-2",
    farmerId: "farmer-002",
    farmerName: "Isabela Grain Growers",
    title: "Jasmine Rice Expansion Plot",
    cropType: "Rice",
    location: "Isabela",
    description:
      "Community-backed harvest funding for an expanded Jasmine rice production cycle.",
    fundingGoal: 75000,
    fundedAmount: 75000,
    estimatedYieldKg: 1700,
    targetSellPricePerKg: 47,
    estimatedProductionCost: 75000,
    expectedHarvestDate: "2026-07-05",
    profitShareFarmer: 60,
    profitShareInvestors: 40,
    minimumInvestment: 500,
    status: "growing",
    investors: [],
    createdAt: "2026-03-08T00:00:00.000Z",
    coverImage: getImageByCategory("polished", 1),
    verified: true,
  },
  {
    id: "harvest-3",
    farmerId: "farmer-003",
    farmerName: "Tarlac Seed Producers Union",
    title: "Certified Rice Seed Production Cycle",
    cropType: "Seed Rice",
    location: "Tarlac",
    description:
      "Short-cycle funding for certified rice seed production with transparent profit sharing after sale.",
    fundingGoal: 30000,
    fundedAmount: 9000,
    estimatedYieldKg: 600,
    targetSellPricePerKg: 58,
    estimatedProductionCost: 30000,
    expectedHarvestDate: "2026-05-28",
    profitShareFarmer: 60,
    profitShareInvestors: 40,
    minimumInvestment: 500,
    status: "funding",
    investors: [],
    createdAt: "2026-03-15T00:00:00.000Z",
    coverImage: getImageByCategory("seeds", 0),
    verified: false,
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

const HARVEST_STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Funding", value: "funding" },
  { label: "Growing", value: "growing" },
  { label: "Harvested", value: "harvested" },
  { label: "Sold", value: "sold" },
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

function getFundingPercent(harvest: Harvest) {
  if (!harvest.fundingGoal) return 0;
  return Math.min((harvest.fundedAmount / harvest.fundingGoal) * 100, 100);
}

function getEstimatedRevenue(harvest: Harvest) {
  return harvest.estimatedYieldKg * harvest.targetSellPricePerKg;
}

function getEstimatedNetProfit(harvest: Harvest) {
  return Math.max(
    getEstimatedRevenue(harvest) - harvest.estimatedProductionCost,
    0
  );
}

function getUserInvestedAmount(harvest: Harvest, userId?: string) {
  if (!userId) return 0;

  return harvest.investors
    .filter((investor) => investor.userId === userId)
    .reduce((sum, investor) => sum + investor.amount, 0);
}

function getEstimatedInvestorReturn(
  harvest: Harvest,
  investedAmount: number
) {
  if (!investedAmount || !harvest.fundingGoal) {
    return {
      estimatedProfit: 0,
      estimatedPayout: 0,
      estimatedRoiPercent: 0,
    };
  }

  const estimatedRevenue =
    harvest.estimatedYieldKg * harvest.targetSellPricePerKg;

  const estimatedNetProfit = Math.max(
    estimatedRevenue - harvest.estimatedProductionCost,
    0
  );

  const investorPool =
    estimatedNetProfit * (harvest.profitShareInvestors / 100);

  const shareRatio = investedAmount / harvest.fundingGoal;
  const estimatedProfit = investorPool * shareRatio;
  const estimatedPayout = investedAmount + estimatedProfit;
  const estimatedRoiPercent =
    investedAmount > 0 ? (estimatedProfit / investedAmount) * 100 : 0;

  return {
    estimatedProfit,
    estimatedPayout,
    estimatedRoiPercent,
  };
}

function getRiskLevel(harvest: Harvest) {
  const margin =
    harvest.estimatedYieldKg * harvest.targetSellPricePerKg -
    harvest.estimatedProductionCost;

  if (margin >= harvest.estimatedProductionCost * 0.3) return "Low Risk";
  if (margin >= 0) return "Medium Risk";
  return "High Risk";
}

export default function MarketplacePage() {
  const [marketMode, setMarketMode] = useState<"products" | "harvests">(
    "products"
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [marketplaceProducts, setMarketplaceProducts] = useState<Product[]>([]);
  const [harvestCampaigns, setHarvestCampaigns] = useState<Harvest[]>([]);
  const [harvestInvestments, setHarvestInvestments] = useState<Record<string, string>>(
    {}
  );

  const currentUser = useMemo(() => getCurrentUser(), []);

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

      setMarketplaceProducts([...localProducts, ...sampleProductsNormalized]);
    };

    const loadHarvests = () => {
      const localHarvestsRaw =
        typeof window !== "undefined"
          ? localStorage.getItem(HARVESTS_STORAGE_KEY)
          : null;

      let localHarvests: Harvest[] = [];

      try {
        const parsed = localHarvestsRaw ? JSON.parse(localHarvestsRaw) : [];
        localHarvests = Array.isArray(parsed)
          ? parsed.map((harvest, index) => normalizeHarvest(harvest, index))
          : [];
      } catch {
        localHarvests = [];
      }

      const sampleHarvestsNormalized = SAMPLE_HARVESTS.map((harvest, index) =>
        normalizeHarvest(harvest, index)
      );

      setHarvestCampaigns([...localHarvests, ...sampleHarvestsNormalized]);
    };

    loadProducts();
    loadHarvests();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === PRODUCTS_STORAGE_KEY) {
        loadProducts();
      }

      if (e.key === HARVESTS_STORAGE_KEY) {
        loadHarvests();
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

      const isVisible =
        product.status !== "paused" && product.status !== "sold_out";
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
        (priceRange === "40to50" &&
          product.price >= 40 &&
          product.price <= 50) ||
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

  const filteredHarvests = useMemo(() => {
    let harvests = [...harvestCampaigns];

    harvests = harvests.filter((harvest) => {
      // Skip cancelled campaigns completely
      if (harvest.status === "cancelled") {
        return false;
      }

      const matchesSearch =
        harvest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        harvest.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        harvest.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        harvest.cropType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        activeTab === "all" || harvest.status === activeTab;

      return matchesSearch && matchesStatus;
    });

    switch (sortBy) {
      case "priceAsc":
        harvests.sort((a, b) => a.minimumInvestment - b.minimumInvestment);
        break;
      case "priceDesc":
        harvests.sort((a, b) => b.minimumInvestment - a.minimumInvestment);
        break;
      case "quantity":
        harvests.sort((a, b) => b.estimatedYieldKg - a.estimatedYieldKg);
        break;
      case "latest":
      default:
        harvests.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
    }

    return harvests;
  }, [harvestCampaigns, searchTerm, activeTab, sortBy]);

  const hasActiveFilters =
    searchTerm ||
    activeTab !== "all" ||
    (marketMode === "products" && category !== "all") ||
    (marketMode === "products" && priceRange !== "all");

  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
    setCategory("all");
    setPriceRange("all");
    setSortBy("latest");
  };

  const handleInvestmentInputChange = (harvestId: string, value: string) => {
    setHarvestInvestments((prev) => ({
      ...prev,
      [harvestId]: value,
    }));
  };

  const handleInvest = async (harvestId: string) => {
    const harvest = harvestCampaigns.find((item) => item.id === harvestId);
    if (!harvest) return;

    const rawAmount =
      harvestInvestments[harvestId] ?? String(harvest.minimumInvestment);
    const amount = Number(rawAmount);

    if (!amount || Number.isNaN(amount)) {
      alert("Please enter a valid investment amount.");
      return;
    }

    try {
      if (!window.ethereum) {
        alert("Wallet not connected.");
        return;
      }

      const recipient = harvest.farmerWallet?.trim();

      if (!recipient) {
        alert("This harvest has no farmer wallet address yet.");
        return;
      }

      if (!ethers.isAddress(recipient)) {
        alert("Invalid farmer wallet address.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const sender = await signer.getAddress();

      let txHash = "";

      if (sender.toLowerCase() !== recipient.toLowerCase()) {
        const tx = await signer.sendTransaction({
          to: recipient,
          value: ethers.parseEther("0.000001"),
        });

        await tx.wait();
        txHash = tx.hash;
      } else {
        console.log("Demo mode: sender and recipient are the same, skipping on-chain transfer.");
      }

      const result = investInHarvest(harvestId, amount);

      const updatedCampaign = result.campaign;
      const nextFundedAmount = updatedCampaign.fundedAmount;

      const nextStatus =
        nextFundedAmount >= updatedCampaign.fundingGoal
          ? "growing"
          : "funding";

      const finalCampaign = {
        ...updatedCampaign,
        fundedAmount: Math.min(nextFundedAmount, updatedCampaign.fundingGoal),
        status: nextStatus,
      };

      const updatedCampaigns = harvestCampaigns.map((item) =>
        item.id === harvestId ? finalCampaign : item
      );

      setHarvestCampaigns(updatedCampaigns);

      localStorage.setItem(
        HARVESTS_STORAGE_KEY,
        JSON.stringify(updatedCampaigns)
      );

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: HARVESTS_STORAGE_KEY,
          newValue: JSON.stringify(updatedCampaigns),
        })
      );

      setHarvestInvestments((prev) => ({
        ...prev,
        [harvestId]: "",
      }));

      alert(
        txHash
          ? `Investment successful. Tx: ${txHash}`
          : "Investment recorded successfully. Campaign funding has been updated."
      );
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Investment failed.";
      alert(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6EEDC] text-[#3B2817]">
      <Navbar />

      <header className="relative overflow-hidden border-b border-[#D9C6A0] bg-[#F6EEDC]">
  {/* Top stripe */}
  <div className="h-10 bg-[repeating-linear-gradient(90deg,#2E6C3C_0px,#2E6C3C_28px,#F7EED8_28px,#F7EED8_56px)] border-b-[3px] border-[#8A5A2B]" />

  {/* Filipino Rice Field Background - only for harvests */}
  {marketMode === "harvests" && (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base sky */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#FFF8E6_0%,#FBE8BF_22%,#F3D897_48%,#DDC076_72%,#CFAA5F_100%)]" />

      {/* Grainy warm overlay */}
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_20%,#ffffff_0.8px,transparent_1px)] bg-[length:16px_16px]" />

      {/* Sun glow */}
      <div className="absolute right-[6%] top-8 h-52 w-52 rounded-full bg-[#FFD76A]/30 blur-3xl" />
      <div className="absolute right-[10%] top-14 h-28 w-28 rounded-full bg-[#FFE9A5]/90" />
      <div className="absolute right-[12%] top-16 h-20 w-20 rounded-full bg-[#FFF4CA]/90" />

      {/* Light rays */}
      <div className="absolute right-[2%] top-6 h-72 w-72 rounded-full bg-[conic-gradient(from_210deg_at_50%_50%,rgba(255,255,255,0.0),rgba(255,240,180,0.18),rgba(255,255,255,0.0),rgba(255,240,180,0.14),rgba(255,255,255,0.0))] blur-2xl" />

      {/* Clouds */}
      <div className="absolute left-[6%] top-12 h-12 w-36 rounded-full bg-white/35 blur-sm" />
      <div className="absolute left-[11%] top-10 h-14 w-20 rounded-full bg-white/28 blur-sm" />
      <div className="absolute left-[26%] top-20 h-9 w-24 rounded-full bg-white/20 blur-sm" />
      <div className="absolute right-[32%] top-24 h-10 w-28 rounded-full bg-white/18 blur-sm" />
      <div className="absolute right-[38%] top-19 h-8 w-16 rounded-full bg-white/16 blur-sm" />

      {/* Distant blue-green haze */}
      <div className="absolute bottom-44 left-0 h-16 w-full bg-[linear-gradient(to_bottom,rgba(133,153,114,0.12),rgba(133,153,114,0.28))] blur-md" />

      {/* Mountains back */}
      <div className="absolute bottom-44 left-[-6%] h-24 w-[32%] rounded-tr-[150px] bg-[#97A86D]/35" />
      <div className="absolute bottom-46 left-[15%] h-28 w-[28%] rounded-t-[160px] bg-[#889A60]/35" />
      <div className="absolute bottom-45 right-[18%] h-24 w-[26%] rounded-t-[130px] bg-[#8CA064]/32" />
      <div className="absolute bottom-45 right-[-8%] h-28 w-[34%] rounded-tl-[160px] bg-[#7C9259]/35" />

      {/* Mountains front */}
      <div className="absolute bottom-38 left-[-4%] h-24 w-[38%] rounded-tr-[170px] bg-[#7E9155]/45" />
      <div className="absolute bottom-38 left-[22%] h-20 w-[22%] rounded-t-[120px] bg-[#6F824A]/45" />
      <div className="absolute bottom-38 right-[14%] h-22 w-[24%] rounded-t-[130px] bg-[#73884E]/42" />
      <div className="absolute bottom-38 right-[-5%] h-24 w-[30%] rounded-tl-[150px] bg-[#6A7D46]/42" />

      {/* Tree line */}
      <div className="absolute bottom-34 left-0 h-10 w-full bg-[linear-gradient(to_right,#5F7442,#73874D,#617746)] opacity-70" />
      <div className="absolute bottom-33 left-0 h-3 w-full bg-[repeating-linear-gradient(90deg,#4E6135_0px,#4E6135_10px,#647A43_10px,#647A43_18px)] opacity-40" />

      {/* Far field */}
      <div className="absolute bottom-24 left-0 h-24 w-full bg-[linear-gradient(to_bottom,#C8DE86,#98C85D)]" />

      {/* Water strips in distance */}
      <div className="absolute bottom-28 left-[6%] h-3 w-[14%] rounded-full bg-[#E7F1DA]/35 blur-[1px]" />
      <div className="absolute bottom-26 left-[28%] h-3 w-[12%] rounded-full bg-[#EAF3DD]/30 blur-[1px]" />
      <div className="absolute bottom-27 right-[18%] h-3 w-[16%] rounded-full bg-[#EEF6E5]/28 blur-[1px]" />

      {/* Curved paddy lines */}
      <div className="absolute bottom-20 left-[-10%] h-24 w-[52%] rounded-[100%] border-t-[14px] border-[#C3DE79]/75" />
      <div className="absolute bottom-12 left-[4%] h-28 w-[56%] rounded-[100%] border-t-[16px] border-[#A8D863]/70" />
      <div className="absolute bottom-16 right-[-8%] h-28 w-[56%] rounded-[100%] border-t-[16px] border-[#B8DE72]/68" />
      <div className="absolute bottom-6 right-[7%] h-28 w-[46%] rounded-[100%] border-t-[13px] border-[#93CE53]/58" />

      {/* Mid field fills */}
      <div className="absolute bottom-0 left-0 h-36 w-full bg-[linear-gradient(to_bottom,#7CC04F_0%,#6CB047_42%,#5A963C_100%)]" />
      <div className="absolute bottom-0 left-0 h-24 w-full opacity-70 bg-[repeating-linear-gradient(90deg,#73BA49_0px,#73BA49_78px,#67AE43_78px,#67AE43_156px)]" />

      {/* Pilapil */}
      

      {/* Water reflection patches */}
      <div className="absolute bottom-18 left-[7%] h-5 w-[22%] rounded-full bg-[#E8F3D9]/28 blur-[1px]" />
      <div className="absolute bottom-12 left-[34%] h-5 w-[18%] rounded-full bg-[#EDF6E3]/24 blur-[1px]" />
      <div className="absolute bottom-14 right-[10%] h-5 w-[20%] rounded-full bg-[#E7F1D8]/24 blur-[1px]" />

      {/* Bahay kubo */}
      <div className="absolute bottom-28 right-[18%] opacity-75">
        <div className="relative h-24 w-28">
          <div className="absolute left-5 top-2 h-0 w-0 border-l-[22px] border-r-[22px] border-b-[18px] border-l-transparent border-r-transparent border-b-[#70461F]" />
          <div className="absolute left-2 top-[17px] h-0 w-0 border-l-[30px] border-r-[30px] border-b-[20px] border-l-transparent border-r-transparent border-b-[#8B5A2B]" />
          <div className="absolute left-4 top-9 h-10 w-16 rounded-[2px] bg-[#84552D]" />
          <div className="absolute left-7 top-12 h-7 w-4 bg-[#6A4424]" />
          <div className="absolute left-6 top-[50px] h-[34px] w-[2px] bg-[#593A1E]" />
          <div className="absolute left-18 top-[50px] h-[34px] w-[2px] bg-[#593A1E]" />
          <div className="absolute left-3 top-[40px] h-[2px] w-[18px] bg-[#A87847]/70" />
          <div className="absolute right-2 top-[40px] h-[2px] w-[18px] bg-[#A87847]/70" />
        </div>
      </div>

      {/* Left coconut tree */}
      <div className="absolute bottom-30 left-[10%] opacity-65">
        <div className="relative h-28 w-20">
          <div className="absolute bottom-0 left-9 h-24 w-[4px] rotate-[9deg] rounded-full bg-[#6D4826]" />
          <div className="absolute left-1 top-4 h-12 w-16 rounded-full border-t-[12px] border-[#4E8D3F] rotate-[-34deg]" />
          <div className="absolute left-5 top-0 h-12 w-16 rounded-full border-t-[12px] border-[#4B893B] rotate-[3deg]" />
          <div className="absolute left-8 top-5 h-12 w-16 rounded-full border-t-[12px] border-[#579845] rotate-[36deg]" />
          <div className="absolute left-2 top-8 h-12 w-16 rounded-full border-t-[10px] border-[#5C9D48] rotate-[-8deg]" />
        </div>
      </div>

      {/* Right coconut tree */}
      <div className="absolute bottom-28 right-[7%] opacity-60">
        <div className="relative h-32 w-20">
          <div className="absolute bottom-0 left-9 h-28 w-[4px] -rotate-[10deg] rounded-full bg-[#694624]" />
          <div className="absolute left-0 top-6 h-12 w-16 rounded-full border-t-[12px] border-[#4D8B3E] rotate-[-38deg]" />
          <div className="absolute left-4 top-2 h-12 w-16 rounded-full border-t-[12px] border-[#4B893A] rotate-[0deg]" />
          <div className="absolute left-8 top-7 h-12 w-16 rounded-full border-t-[12px] border-[#599746] rotate-[35deg]" />
          <div className="absolute left-3 top-10 h-12 w-16 rounded-full border-t-[10px] border-[#62A14D] rotate-[-6deg]" />
        </div>
      </div>

      {/* Banana leaf silhouette near kubo */}
      <div className="absolute bottom-24 right-[29%] opacity-45">
        <div className="relative h-20 w-20">
          <div className="absolute bottom-0 left-9 h-12 w-[2px] bg-[#5B7E3F]" />
          <div className="absolute left-1 top-3 h-10 w-12 rounded-full border-t-[12px] border-[#6FA553] rotate-[-28deg]" />
          <div className="absolute left-7 top-0 h-10 w-12 rounded-full border-t-[12px] border-[#629B49] rotate-[18deg]" />
        </div>
      </div>

      {/* Left foreground rice */}
      <div className="absolute bottom-6 left-[1.5%] flex items-end gap-[4px] opacity-95">
        {Array.from({ length: 22 }).map((_, i) => (
          <div
            key={`left-rice-${i}`}
            className="relative"
            style={{ transform: `rotate(${i % 2 === 0 ? -13 : 9}deg)` }}
          >
            <span
              className="block w-[3px] rounded-full bg-[#3D7B2E]"
              style={{ height: `${48 + (i % 6) * 8}px` }}
            />
            <span className="absolute right-[-7px] top-[8px] h-4 w-2 rounded-full bg-[#E8CB63]/90 rotate-[26deg]" />
            <span className="absolute right-[-9px] top-[15px] h-4 w-2 rounded-full bg-[#E2C24D]/85 rotate-[30deg]" />
            <span className="absolute right-[-8px] top-[22px] h-4 w-2 rounded-full bg-[#E7CD69]/80 rotate-[24deg]" />
            <span className="absolute right-[-7px] top-[29px] h-4 w-2 rounded-full bg-[#DDBB43]/75 rotate-[20deg]" />
            <span className="absolute right-[-6px] top-[36px] h-4 w-2 rounded-full bg-[#E7CB61]/70 rotate-[16deg]" />
          </div>
        ))}
      </div>

      {/* Right foreground rice */}
      <div className="absolute bottom-6 right-[1.5%] flex items-end gap-[4px] opacity-95">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={`right-rice-${i}`}
            className="relative"
            style={{ transform: `rotate(${i % 2 === 0 ? 12 : -9}deg)` }}
          >
            <span
              className="block w-[3px] rounded-full bg-[#3F7A2D]"
              style={{ height: `${50 + (i % 5) * 9}px` }}
            />
            <span className="absolute left-[-8px] top-[8px] h-4 w-2 rounded-full bg-[#E8CC62]/90 -rotate-[24deg]" />
            <span className="absolute left-[-10px] top-[16px] h-4 w-2 rounded-full bg-[#E0C04A]/85 -rotate-[28deg]" />
            <span className="absolute left-[-9px] top-[24px] h-4 w-2 rounded-full bg-[#E9D172]/80 -rotate-[20deg]" />
            <span className="absolute left-[-8px] top-[32px] h-4 w-2 rounded-full bg-[#DDBD47]/75 -rotate-[18deg]" />
            <span className="absolute left-[-7px] top-[40px] h-4 w-2 rounded-full bg-[#E8CC63]/68 -rotate-[14deg]" />
          </div>
        ))}
      </div>

      {/* Mid foreground depth grass */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-end gap-[3px] opacity-60">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={`mid-depth-${i}`}
            className="block w-[2px] rounded-full bg-[#4E8C39]"
            style={{
              height: `${14 + (i % 6) * 5}px`,
              transform: `rotate(${i % 2 === 0 ? -8 : 8}deg)`,
            }}
          />
        ))}
      </div>

      {/* Decorative vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(94,68,28,0.10)_100%)]" />

      {/* Readability overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(246,238,220,0.96)_0%,rgba(246,238,220,0.9)_32%,rgba(246,238,220,0.62)_68%,rgba(246,238,220,0.76)_100%)]" />
    </div>
  )}

  {/* Content */}
  <div className="container relative z-10 mx-auto px-4 py-10 lg:py-14">
    <div className="max-w-4xl space-y-5">
      <WoodSign>
        {marketMode === "products" ? "Sibol Marketplace" : "Harvest Invesment"}
      </WoodSign>

      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-[#2F1F10]">
          {marketMode === "products"
            ? "Direct buying from cooperatives and farmers"
            : "Fund real harvests and earn from net profit"}
        </h1>

        <p className="max-w-2xl text-[#694F33] text-sm sm:text-base leading-relaxed">
          {marketMode === "products"
            ? "Browse rice and other agricultural products with clearer pricing, visible origin, and a more direct farm-to-buyer flow."
            : "Support harvest campaigns with small investments. Returns come from actual net profit after the harvest is sold — not fixed guaranteed ROI."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-2 text-sm">
        {marketMode === "products" ? (
          <>
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
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B8D6B3] bg-[#E9F6E5] px-3 py-2 font-medium text-[#2E6C3C] shadow-sm">
              <Sprout className="h-4 w-4" />
              Farm funding from ₱500
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5C97B] bg-[#FFF0BF] px-3 py-2 font-medium text-[#7A5618] shadow-sm">
              <TrendingUp className="h-4 w-4" />
              Profit-sharing model
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C7A0] bg-[#FFF8E7] px-3 py-2 font-medium text-[#694F33] shadow-sm">
              <Wallet className="h-4 w-4" />
              No fixed guaranteed payout
            </div>
          </>
        )}
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
                <span className="font-bold text-[#2F1F10]">
                  {marketMode === "products"
                    ? filteredProducts.length
                    : filteredHarvests.length}
                </span>{" "}
                listing
                {(marketMode === "products"
                  ? filteredProducts.length
                  : filteredHarvests.length) !== 1
                  ? "s"
                  : ""}{" "}
                found
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Tabs
                value={marketMode}
                onValueChange={(value) =>
                  setMarketMode(value as "products" | "harvests")
                }
                className="w-auto"
              >
                <TabsList className="bg-[#F1E6CF] border border-[#D7C29B] p-1 rounded-2xl">
                  <TabsTrigger
                    value="products"
                    className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]"
                  >
                    Buy Products
                  </TabsTrigger>
                  <TabsTrigger
                    value="harvests"
                    className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]"
                  >
                    Invest in Harvests
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B6A45]" />
                  <Input
                    placeholder={
                      marketMode === "products"
                        ? "Search product, location, or farmer..."
                        : "Search harvest, location, crop, or farmer..."
                    }
                    className="pl-10 h-11 border-[#D7C29B] bg-[#FFFCF3] text-[#3B2817] placeholder:text-[#8B6A45]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3">
                  {marketMode === "products" ? (
                    <>
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
                    </>
                  ) : (
                    <select
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value)}
                      className="h-11 rounded-xl border-2 border-[#D7C29B] bg-[#FFFCF3] px-3 text-sm text-[#3B2817]"
                    >
                      {HARVEST_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-11 rounded-xl border-2 border-[#D7C29B] bg-[#FFFCF3] px-3 text-sm text-[#3B2817]"
                  >
                    <option value="latest">Latest</option>
                    {marketMode === "products" ? (
                      <>
                        <option value="priceAsc">Lowest Price</option>
                        <option value="priceDesc">Highest Price</option>
                        <option value="rating">Highest Rating</option>
                        <option value="quantity">Most Stock</option>
                      </>
                    ) : (
                      <>
                        <option value="priceAsc">Lowest Minimum Investment</option>
                        <option value="priceDesc">Highest Minimum Investment</option>
                        <option value="quantity">Highest Estimated Yield</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {marketMode === "products" && (
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-[#F1E6CF] border border-[#D7C29B] p-1 rounded-2xl">
                    <TabsTrigger
                      value="all"
                      className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="pooled"
                      className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]"
                    >
                      Pooled
                    </TabsTrigger>
                    <TabsTrigger
                      value="direct"
                      className="rounded-xl data-[state=active]:bg-[#FFF8E7] data-[state=active]:text-[#2E6C3C]"
                    >
                      Direct
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="text-sm text-[#694F33]">
                  Choose by type, price, and order method
                </div>
              </div>
            )}

            {marketMode === "harvests" && (
              <div className="text-sm text-[#694F33]">
                Support a harvest while farmers keep the majority share of net profit
              </div>
            )}

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

                {marketMode === "products" && category !== "all" && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#E5C97B] bg-[#FFF0BF] px-3 py-1 text-sm capitalize text-[#7A5618]">
                    {category}
                  </span>
                )}

                {marketMode === "products" && priceRange !== "all" && (
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
          {marketMode === "products" ? (
            filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="space-y-2">
                    <ProductCard 
                      {...product} 
                      rating={product.rating ?? 4.5}  // Provide default rating if undefined
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
            )
          ) : filteredHarvests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredHarvests.map((harvest) => {
              const fundingPercent = getFundingPercent(harvest);
              const estimatedRevenue = getEstimatedRevenue(harvest);
              const estimatedNetProfit = getEstimatedNetProfit(harvest);
              const remainingFunding = harvest.fundingGoal - harvest.fundedAmount;

              const userInvestedAmount = getUserInvestedAmount(
                harvest,
                currentUser?.id
              );

              const {
                estimatedProfit: userEstimatedProfit,
                estimatedPayout: userEstimatedPayout,
                estimatedRoiPercent: userEstimatedRoiPercent,
              } = getEstimatedInvestorReturn(harvest, userInvestedAmount);

              const previewInvestment = harvest.minimumInvestment;
              const {
                estimatedProfit: previewProfit,
                estimatedPayout: previewPayout,
                estimatedRoiPercent: previewRoiPercent,
              } = getEstimatedInvestorReturn(harvest, previewInvestment);

              const investorCount = harvest.investors.length;
              const riskLevel = getRiskLevel(harvest);

                return (
                  <div
                    key={harvest.id}
                    className="overflow-hidden rounded-[28px] border-[2px] border-[#D7C29B] bg-[#FFF8E7] shadow-sm"
                  >
                    <div className="h-52 overflow-hidden bg-[#EAD9B8]">
                      <img
                        src={harvest.coverImage}
                        alt={harvest.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-[#B8D6B3] bg-[#E9F6E5] px-2.5 py-1 text-xs font-medium text-[#2E6C3C]">
                              {harvest.cropType}
                            </span>

                            <span className="inline-flex items-center rounded-full border border-[#E9CB84] bg-[#FFF4D3] px-2.5 py-1 text-xs font-medium uppercase text-[#7A5618]">
                              {harvest.status}
                            </span>

                            {harvest.verified && (
                              <span className="inline-flex items-center rounded-full border border-[#B8D6B3] bg-[#E9F6E5] px-2.5 py-1 text-xs font-medium text-[#2E6C3C]">
                                Verified
                              </span>
                            )}

                            <span className="inline-flex items-center rounded-full border border-[#D7C29B] bg-[#FFFCF3] px-2.5 py-1 text-xs font-medium text-[#694F33]">
                              {investorCount} investor{investorCount !== 1 ? "s" : ""}
                            </span>

                            <span className="inline-flex items-center rounded-full border border-[#E2D0AC] bg-[#FFF8E7] px-2.5 py-1 text-xs font-medium text-[#7A5618]">
                              {riskLevel}
                            </span>
                          </div>

                          <h3 className="text-xl font-black leading-tight text-[#2F1F10]">
                            {harvest.title}
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm leading-relaxed text-[#694F33]">
                          {harvest.description}
                        </p>

                        {userInvestedAmount > 0 ? (
                          <div className="rounded-2xl border border-[#B8D6B3] bg-[#E9F6E5] p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#4F7B52]">
                                  Your Investment
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#1F4D2B]">
                                  {formatCurrency(userInvestedAmount)}
                                </p>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#4F7B52]">
                                  Est. ROI
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#1F4D2B]">
                                  {userEstimatedRoiPercent.toFixed(2)}%
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-2xl bg-white/70 px-3 py-3">
                                <p className="text-[11px] text-[#4F7B52]">Est. Profit</p>
                                <p className="mt-1 font-semibold text-[#1F4D2B]">
                                  {formatCurrency(userEstimatedProfit)}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-white/70 px-3 py-3">
                                <p className="text-[11px] text-[#4F7B52]">Est. Payout</p>
                                <p className="mt-1 font-semibold text-[#1F4D2B]">
                                  {formatCurrency(userEstimatedPayout)}
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 text-xs text-[#4F7B52]">
                              You already joined this campaign.
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-[#EADFB0] bg-[#FFF8DA] p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5618]">
                                  Minimum Investment Preview
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#5C410F]">
                                  {formatCurrency(previewInvestment)}
                                </p>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5618]">
                                  Est. ROI
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#5C410F]">
                                  {previewRoiPercent.toFixed(2)}%
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-2xl bg-white/70 px-3 py-3">
                                <p className="text-[11px] text-[#7A5618]">Est. Profit</p>
                                <p className="mt-1 font-semibold text-[#5C410F]">
                                  {formatCurrency(previewProfit)}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-white/70 px-3 py-3">
                                <p className="text-[11px] text-[#7A5618]">Est. Payout</p>
                                <p className="mt-1 font-semibold text-[#5C410F]">
                                  {formatCurrency(previewPayout)}
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 text-xs text-[#7A5618]">
                              Preview based on the minimum investment and current campaign estimates.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-[#E2D0AC] bg-[#FFFCF3] p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#8B6A45]">
                            Farmer
                          </div>
                          <div className="mt-1 font-semibold text-[#2F1F10]">
                            {harvest.farmerName}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#E2D0AC] bg-[#FFFCF3] p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#8B6A45]">
                            Location
                          </div>
                          <div className="mt-1 font-semibold text-[#2F1F10]">
                            {harvest.location}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#E2D0AC] bg-[#FFFCF3] p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#8B6A45]">
                            Harvest Date
                          </div>
                          <div className="mt-1 font-semibold text-[#2F1F10]">
                            {harvest.expectedHarvestDate}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#E2D0AC] bg-[#FFFCF3] p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#8B6A45]">
                            Minimum
                          </div>
                          <div className="mt-1 font-semibold text-[#2F1F10]">
                            {formatCurrency(harvest.minimumInvestment)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-2xl border border-[#E2D0AC] bg-[#FFFCF3] p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-[#694F33]">Funding Progress</span>
                          <span className="font-bold text-[#2F1F10]">
                            {fundingPercent.toFixed(0)}%
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-[#E9DFC8]">
                          <div
                            className="h-full rounded-full bg-[#2E6C3C] transition-all"
                            style={{ width: `${fundingPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-sm text-[#694F33]">
                          <span>{formatCurrency(harvest.fundedAmount)} funded</span>
                          <span>{formatCurrency(harvest.fundingGoal)} goal</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-[#D7E6D2] bg-[#F4FBF1] p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#4F7B52]">
                            Profit Split
                          </div>
                          <div className="mt-1 font-semibold text-[#1F4D2B]">
                            {harvest.profitShareFarmer}% Farmer /{" "}
                            {harvest.profitShareInvestors}% Investors
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#EADFB0] bg-[#FFF8DA] p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#7A5618]">
                            Est. Net Profit
                          </div>
                          <div className="mt-1 font-semibold text-[#5C410F]">
                            {formatCurrency(estimatedNetProfit)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-[#E2D0AC] bg-[#FFFCF3] p-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B6A45]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Estimated Yield
                          </div>
                          <div className="mt-1 font-semibold text-[#2F1F10]">
                            {harvest.estimatedYieldKg.toLocaleString()} kg
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#E2D0AC] bg-[#FFFCF3] p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#8B6A45]">
                            Target Revenue
                          </div>
                          <div className="mt-1 font-semibold text-[#2F1F10]">
                            {formatCurrency(estimatedRevenue)}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#D7C29B] bg-[#FFFCF3] p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-[#2F1F10]">
                              Invest in this harvest
                            </div>
                            <div className="text-xs text-[#694F33]">
                              Remaining need: {formatCurrency(remainingFunding)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Input
                            type="number"
                            min={harvest.minimumInvestment}
                            max={remainingFunding}
                            step="100"
                            value={
                              harvestInvestments[harvest.id] ??
                              String(harvest.minimumInvestment)
                            }
                            onChange={(e) =>
                              handleInvestmentInputChange(harvest.id, e.target.value)
                            }
                            className="h-11 border-[#D7C29B] bg-white"
                            placeholder="Enter amount"
                            disabled={harvest.status !== "funding"}
                          />

                          <Button
                            onClick={() => handleInvest(harvest.id)}
                            className="h-11 bg-[#2E6C3C] text-white hover:bg-[#245730]"
                            disabled={harvest.status !== "funding" || remainingFunding <= 0}
                          >
                            Invest Now
                          </Button>
                        </div>

                        <div className="mt-3 space-y-2 text-xs leading-relaxed text-[#7A5B38]">
                          <p>
                            Investors share {harvest.profitShareInvestors}% of final net
                            profit proportionally. Farmers keep {harvest.profitShareFarmer}%
                            of net profit. This is a profit-sharing model, not fixed
                            guaranteed ROI.
                          </p>
                          <p className="font-medium">
                            Stage: Funding → Growing → Harvested → Sold
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[28px] border-[2px] border-[#D7C29B] bg-[#FFF8E7] py-20 text-center shadow-sm">
              <div className="mb-4 rounded-full bg-[#F1E6CF] p-4">
                <Sprout className="h-10 w-10 text-[#8B6A45]" />
              </div>
              <h3 className="text-xl font-black text-[#2F1F10]">No harvest campaigns found</h3>
              <p className="mt-2 max-w-md text-sm text-[#694F33]">
                Try changing the search or funding status filters.
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