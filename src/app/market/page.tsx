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

// ============================================================
// RICE SACK SVG COMPONENT - NO TEXT/LABELS
// Clean burlap sack with rope, grains, no text labels
// ============================================================
function RiceSackBackground({ className = "", opacity = 0.6 }: { className?: string; opacity?: number }) {
  return (
    <svg
      viewBox="0 0 320 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="sack-body-buy" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F0D88A" />
          <stop offset="12%" stopColor="#DDBB60" />
          <stop offset="48%" stopColor="#C8A040" />
          <stop offset="80%" stopColor="#B08830" />
          <stop offset="100%" stopColor="#8A6418" />
        </linearGradient>
        <linearGradient id="sack-neck-buy" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D8C070" />
          <stop offset="50%" stopColor="#C0A040" />
          <stop offset="100%" stopColor="#8A6818" />
        </linearGradient>
        <linearGradient id="sack-rope-buy" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B89048" />
          <stop offset="40%" stopColor="#8A6828" />
          <stop offset="100%" stopColor="#5A4010" />
        </linearGradient>
        <pattern id="sack-warp-buy" x="0" y="0" width="7" height="2" patternUnits="userSpaceOnUse">
          <line x1="1.5" y1="0" x2="1.5" y2="2" stroke="#9A7020" strokeWidth="1.1" opacity="0.48" />
          <line x1="5" y1="0" x2="5" y2="2" stroke="#836010" strokeWidth="0.8" opacity="0.32" />
        </pattern>
        <pattern id="sack-weft-buy" x="0" y="0" width="2" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="2" y2="2" stroke="#C09838" strokeWidth="1.0" opacity="0.38" />
          <line x1="0" y1="6" x2="2" y2="6" stroke="#AA8228" strokeWidth="0.75" opacity="0.28" />
        </pattern>
      </defs>

      <path
        d="M 72 340 Q 50 320 46 240 Q 42 160 52 110 Q 60 74 78 60 L 242 60 Q 260 74 268 110 Q 278 160 274 240 Q 270 320 248 340 Z"
        fill="url(#sack-body-buy)"
      />
      <path
        d="M 72 340 Q 50 320 46 240 Q 42 160 52 110 Q 60 74 78 60 L 242 60 Q 260 74 268 110 Q 278 160 274 240 Q 270 320 248 340 Z"
        fill="url(#sack-warp-buy)"
        opacity="0.5"
      />
      <path
        d="M 72 340 Q 50 320 46 240 Q 42 160 52 110 Q 60 74 78 60 L 242 60 Q 260 74 268 110 Q 278 160 274 240 Q 270 320 248 340 Z"
        fill="url(#sack-weft-buy)"
        opacity="0.45"
      />
      <path
        d="M 72 340 Q 50 320 46 240 Q 42 160 52 110 Q 60 74 78 60 L 108 60 Q 92 74 86 110 Q 76 160 78 240 Q 79 320 90 340 Z"
        fill="#FDEEB0"
        opacity="0.35"
      />
      <path
        d="M 76 336 Q 110 352 160 354 Q 210 352 244 336 Q 220 345 160 347 Q 100 345 76 336 Z"
        fill="#5A3A08"
        opacity="0.22"
      />
      <path
        d="M 80 62 Q 62 100 56 180 Q 50 250 60 330"
        fill="none"
        stroke="#6A4818"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
        strokeDasharray="6 4"
      />
      <path
        d="M 240 62 Q 258 100 264 180 Q 270 250 260 330"
        fill="none"
        stroke="#6A4818"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
        strokeDasharray="6 4"
      />
      <path
        d="M 78 62 Q 96 40 126 33 Q 144 29 160 28 Q 176 29 194 33 Q 224 40 242 62 Z"
        fill="url(#sack-neck-buy)"
      />
      <path
        d="M 78 62 Q 96 40 126 33 Q 144 29 160 28 Q 176 29 194 33 Q 224 40 242 62 Z"
        fill="url(#sack-warp-buy)"
        opacity="0.6"
      />
      <path
        d="M 110 28 Q 134 18 160 16 Q 186 18 210 28"
        fill="none"
        stroke="url(#sack-rope-buy)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 116 35 Q 138 26 160 24 Q 182 26 204 35"
        fill="none"
        stroke="url(#sack-rope-buy)"
        strokeWidth="5.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <ellipse cx="160" cy="16" rx="24" ry="16" fill="#9A7030" />
      <ellipse cx="160" cy="16" rx="24" ry="16" fill="none" stroke="#4A2C08" strokeWidth="1.5" />
      <path
        d="M 138 16 Q 122 -4 132 -14 Q 142 -22 150 -6 Q 155 6 146 16"
        fill="#9A7030"
        stroke="#4A2C08"
        strokeWidth="1.2"
      />
      <path
        d="M 182 16 Q 198 -4 188 -14 Q 178 -22 170 -6 Q 165 6 174 16"
        fill="#9A7030"
        stroke="#4A2C08"
        strokeWidth="1.2"
      />
      <path d="M 140 22 Q 122 36 114 55 Q 108 70 112 84" fill="none" stroke="#8A6828" strokeWidth="6" strokeLinecap="round" />
      <path d="M 180 22 Q 198 36 206 55 Q 212 70 208 84" fill="none" stroke="#8A6828" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="56" cy="358" rx="8" ry="3.5" fill="#EDE0B0" opacity="0.7" />
      <ellipse cx="40" cy="367" rx="7" ry="3" fill="#E8D8A8" opacity="0.6" />
      <ellipse cx="68" cy="368" rx="7.5" ry="3" fill="#F0E4B8" opacity="0.7" />
      <ellipse cx="264" cy="358" rx="8" ry="3.5" fill="#EDE0B0" opacity="0.7" />
      <ellipse cx="280" cy="367" rx="7" ry="3" fill="#E8D8A8" opacity="0.6" />
      <ellipse cx="250" cy="368" rx="7.5" ry="3" fill="#F0E4B8" opacity="0.7" />
      <ellipse cx="130" cy="362" rx="6.5" ry="2.8" fill="#EDE4B4" opacity="0.6" />
      <ellipse cx="190" cy="362" rx="6.5" ry="2.8" fill="#F0E0B0" opacity="0.6" />
    </svg>
  );
}

// Background rice sacks container - ONLY FOR BUY PRODUCTS SECTION
// Arranged with 2 on left, 2 on right, 1 in middle (no text labels)
function RiceSackBackgroundGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Soft overlay for readability - keeps content visible */}
      <div className="absolute inset-0 bg-[#F6EEDC]/30" />
      
      {/* LEFT SIDE - 2 sacks */}
      <div className="absolute left-[1%] top-[8%] w-48 opacity-45 rotate-[-8deg] hidden lg:block">
        <RiceSackBackground className="w-full h-auto drop-shadow-md" opacity={0.5} />
      </div>
      <div className="absolute left-[2%] bottom-[15%] w-52 opacity-45 rotate-[10deg] hidden lg:block">
        <RiceSackBackground className="w-full h-auto drop-shadow-md" opacity={0.48} />
      </div>
      
      {/* RIGHT SIDE - 2 sacks */}
      <div className="absolute right-[1%] top-[12%] w-48 opacity-45 rotate-[6deg] hidden lg:block">
        <RiceSackBackground className="w-full h-auto drop-shadow-md" opacity={0.5} />
      </div>
      <div className="absolute right-[2%] bottom-[18%] w-52 opacity-45 rotate-[-8deg] hidden lg:block">
        <RiceSackBackground className="w-full h-auto drop-shadow-md" opacity={0.48} />
      </div>
      
      {/* CENTER BACK - 1 subtle sack */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 opacity-20 rotate-0 hidden xl:block">
        <RiceSackBackground className="w-full h-auto drop-shadow-xl" opacity={0.28} />
      </div>
    </div>
  );
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

        {/* Filipino Rice Field Background - ONLY for harvests (unchanged) */}
        {marketMode === "harvests" && (
          <>
            <style>{`
              /* ── Atmosphere ── */
              @keyframes sky-shift {
                0%,100% { opacity: 1; }
                50%      { opacity: 0.82; }
              }
              @keyframes sun-breathe {
                0%,100% { transform: scale(1);   opacity: 0.92; }
                50%      { transform: scale(1.07); opacity: 1; }
              }
              @keyframes ray-spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
              @keyframes sun-corona {
                0%,100% { transform: scale(1);   opacity: 0.18; }
                50%      { transform: scale(1.22); opacity: 0.28; }
              }

              /* ── Clouds ── */
              @keyframes drift-a {
                0%   { transform: translateX(0px); }
                100% { transform: translateX(-420px); }
              }
              @keyframes drift-b {
                0%   { transform: translateX(0px); }
                100% { transform: translateX(-320px); }
              }
              @keyframes drift-c {
                0%   { transform: translateX(180px); }
                100% { transform: translateX(-280px); }
              }
              @keyframes cloud-bob {
                0%,100% { transform: translateY(0); }
                50%      { transform: translateY(-4px); }
              }

              /* ── Rice stalks ── */
              @keyframes sway-left {
                0%,100% { transform-origin: bottom center; transform: rotate(-12deg); }
                50%      { transform-origin: bottom center; transform: rotate(-5deg); }
              }
              @keyframes sway-right {
                0%,100% { transform-origin: bottom center; transform: rotate(8deg); }
                50%      { transform-origin: bottom center; transform: rotate(14deg); }
              }
              @keyframes sway-gentle {
                0%,100% { transform-origin: bottom center; transform: rotate(-4deg); }
                50%      { transform-origin: bottom center; transform: rotate(4deg); }
              }
              @keyframes sway-mid {
                0%,100% { transform-origin: bottom center; transform: rotate(-8deg); }
                50%      { transform-origin: bottom center; transform: rotate(6deg); }
              }

              /* ── Water shimmer ── */
              @keyframes shimmer {
                0%,100% { opacity: 0.22; transform: scaleX(1); }
                50%      { opacity: 0.38; transform: scaleX(1.04); }
              }
              @keyframes shimmer-b {
                0%,100% { opacity: 0.18; transform: scaleX(1.02); }
                50%      { opacity: 0.30; transform: scaleX(0.97); }
              }

              /* ── Paddy lines ── */
              @keyframes paddy-rise {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0); }
              }

              /* ── Haze shimmer ── */
              @keyframes haze-pulse {
                0%,100% { opacity: 0.45; }
                50%      { opacity: 0.62; }
              }

              /* ── Firefly-like light motes ── */
              @keyframes mote-a {
                0%   { transform: translate(0,0);      opacity: 0; }
                20%  { opacity: 0.7; }
                80%  { opacity: 0.5; }
                100% { transform: translate(18px,-24px); opacity: 0; }
              }
              @keyframes mote-b {
                0%   { transform: translate(0,0);       opacity: 0; }
                25%  { opacity: 0.55; }
                75%  { opacity: 0.4; }
                100% { transform: translate(-14px,-20px); opacity: 0; }
              }

              /* Stalk helpers */
              .stalk-l { animation: sway-left  3.4s ease-in-out infinite; }
              .stalk-r { animation: sway-right 3.1s ease-in-out infinite; }
              .stalk-g { animation: sway-gentle 4.2s ease-in-out infinite; }
              .stalk-m { animation: sway-mid  3.8s ease-in-out infinite; }
            `}</style>

            <div className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden">
              {/* ── 1. SKY GRADIENT ── */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to bottom, #FFF3D6 0%, #FFE8A8 18%, #F9D87A 42%, #E8C25A 66%, #D4A93E 84%, #C09232 100%)",
                  animation: "sky-shift 14s ease-in-out infinite",
                }}
              />
              {/* Subtle grain texture */}
              <div
                className="absolute inset-0 opacity-[0.045]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
              />
              {/* ── 2. SUN SYSTEM ── */}
              <div
                className="absolute"
                style={{
                  right: "7%", top: "6%",
                  width: 220, height: 220,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,220,80,0.32) 0%, rgba(255,180,30,0.12) 55%, transparent 75%)",
                  animation: "sun-corona 6s ease-in-out infinite",
                }}
              />
              <div
                className="absolute"
                style={{
                  right: "9.5%", top: "7.5%",
                  width: 160, height: 160,
                  borderRadius: "50%",
                  background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,240,140,0.22) 18deg, transparent 36deg, rgba(255,240,140,0.18) 54deg, transparent 72deg, rgba(255,240,140,0.20) 90deg, transparent 108deg, rgba(255,240,140,0.16) 126deg, transparent 144deg, rgba(255,240,140,0.22) 162deg, transparent 180deg, rgba(255,240,140,0.18) 198deg, transparent 216deg, rgba(255,240,140,0.20) 234deg, transparent 252deg, rgba(255,240,140,0.16) 270deg, transparent 288deg, rgba(255,240,140,0.18) 306deg, transparent 324deg, rgba(255,240,140,0.22) 342deg, transparent 360deg)",
                  filter: "blur(3px)",
                  animation: "ray-spin 28s linear infinite",
                }}
              />
              <div
                className="absolute"
                style={{
                  right: "11%", top: "10%",
                  width: 88, height: 88,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 38% 36%, #FFFBE0 0%, #FFE566 38%, #FFD020 75%, #F5B800 100%)",
                  boxShadow: "0 0 48px 18px rgba(255,210,50,0.45), 0 0 18px 4px rgba(255,240,160,0.7)",
                  animation: "sun-breathe 5s ease-in-out infinite",
                }}
              />
              <div
                className="absolute"
                style={{
                  right: "12.8%", top: "11.8%",
                  width: 36, height: 36,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,220,0.95) 0%, rgba(255,250,200,0.4) 70%, transparent 100%)",
                }}
              />
              <div
                className="absolute"
                style={{
                  right: 0, top: 0,
                  width: "55%", height: "70%",
                  background: "radial-gradient(ellipse at 90% 15%, rgba(255,224,80,0.18) 0%, rgba(255,200,60,0.07) 45%, transparent 70%)",
                  filter: "blur(8px)",
                }}
              />
              {/* ── 3. CLOUDS ── */}
              <div className="absolute" style={{ top: "8%", left: "4%", animation: "drift-a 55s linear infinite, cloud-bob 8s ease-in-out infinite" }}>
                <div style={{ position: "relative", width: 180, height: 52 }}>
                  <div style={{ position: "absolute", bottom: 0, left: 20, width: 140, height: 32, borderRadius: 99, background: "rgba(255,255,255,0.58)", filter: "blur(2px)" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 8,  width: 80,  height: 34, borderRadius: 99, background: "rgba(255,255,255,0.52)", filter: "blur(2px)" }} />
                  <div style={{ position: "absolute", bottom: 14, left: 52, width: 70,  height: 38, borderRadius: 99, background: "rgba(255,255,255,0.48)", filter: "blur(1.5px)" }} />
                  <div style={{ position: "absolute", bottom: 2,  left: 60, width: 60,  height: 24, borderRadius: 99, background: "rgba(255,255,255,0.38)", filter: "blur(1px)" }} />
                </div>
              </div>
              <div className="absolute" style={{ top: "5%", left: "32%", animation: "drift-b 72s linear infinite 8s, cloud-bob 11s ease-in-out infinite 2s" }}>
                <div style={{ position: "relative", width: 120, height: 38 }}>
                  <div style={{ position: "absolute", bottom: 0, left: 10, width: 100, height: 24, borderRadius: 99, background: "rgba(255,255,255,0.44)", filter: "blur(1.5px)" }} />
                  <div style={{ position: "absolute", bottom: 8,  left: 4,  width: 50,  height: 28, borderRadius: 99, background: "rgba(255,255,255,0.40)", filter: "blur(1.5px)" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 36, width: 60,  height: 30, borderRadius: 99, background: "rgba(255,255,255,0.38)", filter: "blur(1px)" }} />
                </div>
              </div>
              <div className="absolute" style={{ top: "14%", right: "28%", animation: "drift-c 80s linear infinite 4s, cloud-bob 9s ease-in-out infinite 5s" }}>
                <div style={{ position: "relative", width: 100, height: 30 }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0,  width: 90,  height: 18, borderRadius: 99, background: "rgba(255,255,240,0.35)", filter: "blur(2px)" }} />
                  <div style={{ position: "absolute", bottom: 6, left: 18, width: 50,  height: 22, borderRadius: 99, background: "rgba(255,255,240,0.30)", filter: "blur(1.5px)" }} />
                </div>
              </div>
              {/* ── 4. DISTANT HAZE ── */}
              <div
                className="absolute"
                style={{
                  bottom: "46%", left: 0, right: 0, height: 40,
                  background: "linear-gradient(to bottom, transparent, rgba(180,200,140,0.22), transparent)",
                  filter: "blur(6px)",
                  animation: "haze-pulse 9s ease-in-out infinite",
                }}
              />
              {/* ── 5. MOUNTAINS ── */}
              <div className="absolute" style={{ bottom: "43%", left: "-5%", width: "30%", height: 110, borderTopRightRadius: 180, background: "linear-gradient(to bottom, #A8BC7C, #7E9958)", opacity: 0.30, filter: "blur(4px)" }} />
              <div className="absolute" style={{ bottom: "44%", left: "14%",  width: "26%", height: 120, borderTopLeftRadius: 160, borderTopRightRadius: 170, background: "linear-gradient(to bottom, #9BB170, #738C50)", opacity: 0.30, filter: "blur(4px)" }} />
              <div className="absolute" style={{ bottom: "43%", right: "16%", width: "24%", height: 108, borderTopLeftRadius: 150, borderTopRightRadius: 140, background: "linear-gradient(to bottom, #A0B876, #779563)", opacity: 0.28, filter: "blur(4px)" }} />
              <div className="absolute" style={{ bottom: "43%", right: "-6%", width: "32%", height: 115, borderTopLeftRadius: 170, background: "linear-gradient(to bottom, #96AC6C, #6E8A4C)", opacity: 0.30, filter: "blur(4px)" }} />
              <div className="absolute" style={{ bottom: "37%", left: "-3%",  width: "36%", height: 100, borderTopRightRadius: 190, background: "linear-gradient(to bottom, #8FA660, #627840)", opacity: 0.55, filter: "blur(1.5px)" }} />
              <div className="absolute" style={{ bottom: "37%", left: "20%",  width: "22%", height: 88,  borderTopLeftRadius: 130, borderTopRightRadius: 120, background: "linear-gradient(to bottom, #82994E, #5C7238)", opacity: 0.52, filter: "blur(1px)" }} />
              <div className="absolute" style={{ bottom: "37%", right: "12%", width: "26%", height: 95,  borderTopLeftRadius: 140, borderTopRightRadius: 145, background: "linear-gradient(to bottom, #879C58, #61783C)", opacity: 0.50, filter: "blur(1px)" }} />
              <div className="absolute" style={{ bottom: "37%", right: "-4%", width: "30%", height: 102, borderTopLeftRadius: 160, background: "linear-gradient(to bottom, #7C9154, #566C36)", opacity: 0.52, filter: "blur(1px)" }} />
              {/* Mountain caps */}
              <div className="absolute" style={{ bottom: "52%", left: "9%",  width: "9%",  height: 18, borderRadius: 99, background: "rgba(255,255,240,0.40)", filter: "blur(3px)" }} />
              <div className="absolute" style={{ bottom: "53%", left: "28%", width: "8%",  height: 16, borderRadius: 99, background: "rgba(255,255,240,0.35)", filter: "blur(3px)" }} />
              <div className="absolute" style={{ bottom: "52%", right: "18%",width: "8%",  height: 16, borderRadius: 99, background: "rgba(255,255,240,0.32)", filter: "blur(3px)" }} />
              {/* ── 6. TREE LINE ── */}
              <div
                className="absolute"
                style={{
                  bottom: "33%", left: 0, right: 0, height: 44,
                  background: "linear-gradient(to right, #506938, #627D45, #547040, #4E6636, #5C7342)",
                  opacity: 0.82,
                }}
              />
              {/* ── 7. PADDY TERRACES ── */}
              <div className="absolute" style={{ bottom: "22%", left: 0, right: 0, height: 52, background: "linear-gradient(to bottom, #ADDA7A, #8DC85A)", opacity: 0.88, animation: "paddy-rise 1.4s ease both 0.3s" }} />
              <div className="absolute" style={{ bottom: "25%", left: "8%", width: "20%", height: 8, borderRadius: 99, background: "rgba(220,238,200,0.55)", filter: "blur(2px)", animation: "shimmer 4s ease-in-out infinite" }} />
              <div className="absolute" style={{ bottom: "24%", left: "34%",width: "16%", height: 7, borderRadius: 99, background: "rgba(224,240,205,0.48)", filter: "blur(2px)", animation: "shimmer-b 5.5s ease-in-out infinite 1.2s" }} />
              <div className="absolute" style={{ bottom: "24%", right: "12%",width: "18%", height: 7, borderRadius: 99, background: "rgba(218,236,198,0.44)", filter: "blur(2px)", animation: "shimmer 6s ease-in-out infinite 2s" }} />
              <div className="absolute" style={{ bottom: "21%", left: 0, right: 0, height: 5, background: "#7A6040", opacity: 0.55 }} />
              <div className="absolute" style={{ bottom: "10%", left: 0, right: 0, height: 58, background: "linear-gradient(to bottom, #98CC60, #76B044)", opacity: 0.92, animation: "paddy-rise 1.4s ease both 0.55s" }} />
              <div className="absolute" style={{ bottom: "14%", left: "12%", width: "24%", height: 9, borderRadius: 99, background: "rgba(200,230,170,0.50)", filter: "blur(2px)", animation: "shimmer-b 5s ease-in-out infinite 0.5s" }} />
              <div className="absolute" style={{ bottom: "13%", right: "18%", width: "20%", height: 8, borderRadius: 99, background: "rgba(205,232,175,0.45)", filter: "blur(2px)", animation: "shimmer 4.8s ease-in-out infinite 1.8s" }} />
              <div className="absolute" style={{ bottom: "9.5%", left: 0, right: 0, height: 5, background: "#6E5530", opacity: 0.50 }} />
              {/* ── 8. CURVED PADDY CONTOUR LINES ── */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none" style={{ opacity: 0.42 }}>
                <ellipse cx="320" cy="340" rx="380" ry="48" fill="none" stroke="#B8DC78" strokeWidth="14" strokeLinecap="round" opacity="0.7"/>
                <ellipse cx="680" cy="310" rx="340" ry="44" fill="none" stroke="#ACCF6E" strokeWidth="13" strokeLinecap="round" opacity="0.65"/>
                <ellipse cx="480" cy="368" rx="460" ry="52" fill="none" stroke="#A2C962" strokeWidth="15" strokeLinecap="round" opacity="0.58"/>
                <ellipse cx="200" cy="290" rx="280" ry="38" fill="none" stroke="#BAE07C" strokeWidth="11" strokeLinecap="round" opacity="0.50"/>
                <ellipse cx="820" cy="280" rx="260" ry="36" fill="none" stroke="#AEDA70" strokeWidth="11" strokeLinecap="round" opacity="0.48"/>
              </svg>
              {/* ── 9. FOREGROUND – BASE SOIL ── */}
              <div className="absolute bottom-0 left-0 right-0 h-[10%]" style={{ background: "linear-gradient(to bottom, #6CB040, #58963A)", opacity: 0.98 }} />
              <div className="absolute bottom-0 left-0 right-0 h-[6%]" style={{ background: "repeating-linear-gradient(90deg, #63AA3C 0px, #63AA3C 76px, #5A9E36 76px, #5A9E36 152px)" }} />
              {/* ── 10. BAHAY KUBO ── */}
              <div className="absolute" style={{ bottom: "29%", right: "17%", opacity: 0.82 }}>
                <svg width="72" height="80" viewBox="0 0 72 80" fill="none">
                  <ellipse cx="36" cy="78" rx="28" ry="5" fill="rgba(60,35,10,0.22)" />
                  <polygon points="36,4 62,28 10,28" fill="#7A4A1C"/>
                  <polygon points="36,16 68,40 4,40" fill="#9A6030"/>
                  <line x1="36" y1="4" x2="36" y2="16" stroke="#6A3E18" strokeWidth="2"/>
                  <rect x="12" y="39" width="48" height="32" fill="#8C5528" rx="2"/>
                  <rect x="30" y="52" width="12" height="19" fill="#6A3E1A" rx="2"/>
                  <rect x="16" y="46" width="10" height="9" fill="#6A3E1A" rx="1"/>
                  <line x1="21" y1="46" x2="21" y2="55" stroke="#8C5528" strokeWidth="1"/>
                  <line x1="16" y1="50.5" x2="26" y2="50.5" stroke="#8C5528" strokeWidth="1"/>
                  <rect x="46" y="46" width="10" height="9" fill="#6A3E1A" rx="1"/>
                  <line x1="51" y1="46" x2="51" y2="55" stroke="#8C5528" strokeWidth="1"/>
                  <line x1="46" y1="50.5" x2="56" y2="50.5" stroke="#8C5528" strokeWidth="1"/>
                  <rect x="16" y="70" width="4" height="8" fill="#5C3416"/>
                  <rect x="52" y="70" width="4" height="8" fill="#5C3416"/>
                  <line x1="24" y1="28" x2="36" y2="16" stroke="rgba(255,200,120,0.18)" strokeWidth="1"/>
                  <line x1="48" y1="28" x2="36" y2="16" stroke="rgba(255,200,120,0.18)" strokeWidth="1"/>
                  <line x1="18" y1="38" x2="36" y2="16" stroke="rgba(255,200,120,0.14)" strokeWidth="1"/>
                  <line x1="54" y1="38" x2="36" y2="16" stroke="rgba(255,200,120,0.14)" strokeWidth="1"/>
                </svg>
              </div>
              {/* ── 11. COCONUT TREES ── */}
              <div className="absolute" style={{ bottom: "28%", left: "9%", opacity: 0.72 }}>
                <svg width="54" height="100" viewBox="0 0 54 100" fill="none">
                  <path d="M28,98 Q26,80 29,60 Q31,42 27,8" stroke="#6E4A22" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
                  <path d="M27,10 Q8,-4 -4,10"  stroke="#4E8D3C" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M27,10 Q14,-8 20,16" stroke="#568F40" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M27,10 Q40,-6 52,8"  stroke="#4C8838" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M27,10 Q36,4 48,18"  stroke="#549040" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <path d="M27,10 Q10,8 2,24"   stroke="#4A8836" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <circle cx="22" cy="14" r="3" fill="#9B6B2A" opacity="0.9"/>
                  <circle cx="29" cy="12" r="2.5" fill="#9B6B2A" opacity="0.8"/>
                </svg>
              </div>
              <div className="absolute" style={{ bottom: "27%", right: "6%", opacity: 0.68 }}>
                <svg width="54" height="112" viewBox="0 0 54 112" fill="none">
                  <path d="M24,110 Q26,90 23,70 Q21,50 25,8" stroke="#694420" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
                  <path d="M25,10 Q6,0 -2,14"   stroke="#4D8C3B" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M25,10 Q12,-6 18,18"  stroke="#558E3E" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M25,10 Q38,-4 50,10"  stroke="#4B8937" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M25,10 Q34,6 46,20"   stroke="#539040" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <path d="M25,10 Q8,10 0,26"    stroke="#4A8836" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <circle cx="21" cy="14" r="3" fill="#9A6828" opacity="0.85"/>
                  <circle cx="27" cy="11" r="2.5" fill="#9A6828" opacity="0.8"/>
                </svg>
              </div>
              {/* ── 12. RICE STALKS ── */}
              <div className="absolute bottom-0 left-0 right-0 h-[14%]">
                {Array.from({ length: 180 }).map((_, i) => {
                  const left = Math.random() * 100;
                  const height = 55 + Math.random() * 55;
                  const cls = ["stalk-l","stalk-r","stalk-g","stalk-m"][Math.floor(Math.random() * 4)];
                  const delay = `${Math.random() * 2}s`;
                  return (
                    <div
                      key={i}
                      className={`absolute ${cls}`}
                      style={{
                        left: `${left}%`,
                        bottom: 0,
                        transform: "translateX(-50%)",
                        animationDelay: delay,
                      }}
                    >
                      <div
                        style={{
                          width: 3,
                          height: height,
                          borderRadius: 99,
                          background: "linear-gradient(to top, #3D6B28, #5AAA3C)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
                          left: -6,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {[0, 1, 2, 3, 4].map((j) => (
                          <div
                            key={j}
                            style={{
                              width: 8,
                              height: 14,
                              borderRadius: "40% 60% 60% 40% / 50% 50% 70% 30%",
                              background: `rgba(${220 - j * 8}, ${185 - j * 5}, ${50 + j * 4}, ${
                                0.88 - j * 0.05
                              })`,
                              transform: `rotate(${22 + j * 3}deg) translateX(${
                                j % 2 === 0 ? 2 : -1
                              }px)`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* ── 13. LIGHT MOTES ── */}
              {[
                { x:"18%", y:"55%", a:"mote-a", d:"0s",   s:"5s"  },
                { x:"32%", y:"62%", a:"mote-b", d:"1.4s",  s:"6.5s" },
                { x:"54%", y:"58%", a:"mote-a", d:"2.8s",  s:"5.8s" },
                { x:"68%", y:"65%", a:"mote-b", d:"0.6s",  s:"7s"  },
                { x:"80%", y:"52%", a:"mote-a", d:"3.5s",  s:"5.2s" },
                { x:"44%", y:"70%", a:"mote-b", d:"1.9s",  s:"6.2s" },
              ].map((m,i) => (
                <div key={i} className="absolute" style={{
                  left: m.x, top: m.y,
                  width: 4, height: 4, borderRadius: "50%",
                  background: "rgba(255,220,80,0.8)",
                  filter: "blur(1px)",
                  animation: `${m.a} ${m.s} ease-in-out infinite ${m.d}`,
                }} />
              ))}
              {/* ── 14. DEPTH VIGNETTE ── */}
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(80,50,10,0.14) 100%)" }} />
              {/* ── 15. READABILITY OVERLAY ── */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to right, rgba(246,238,220,0.97) 0%, rgba(246,238,220,0.92) 28%, rgba(246,238,220,0.55) 62%, rgba(246,238,220,0.72) 100%)",
                }}
              />
            </div>
          </>
        )}

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-10 lg:py-14">
          <div className="max-w-4xl space-y-5">
            <WoodSign>
              {marketMode === "products" ? "Sibol Marketplace" : "Harvest Investment"}
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
        <section className="container mx-auto px-4 py-6 relative">
          {/* RICE SACK BACKGROUND - ONLY FOR BUY PRODUCTS SECTION */}
          {marketMode === "products" && <RiceSackBackgroundGrid />}
          
          <div className="rounded-[28px] border-[2px] border-[#D7C29B] bg-[#FFF8E7] p-4 shadow-sm space-y-4 relative z-10">
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
                      rating={product.rating ?? 4.5}
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