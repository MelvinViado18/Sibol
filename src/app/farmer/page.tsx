"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PriceSuggester } from "@/components/farmer/PriceSuggester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Package,
  History,
  TrendingUp,
  Settings,
  Upload,
  X,
  Image as ImageIcon,
  Leaf,
  CheckCircle,
  Wallet,
  Copy,
  RefreshCw,
  Truck,
  Clock,
  BadgeCheck,
  PhilippinePeso,
  Pencil,
  PauseCircle,
  PlayCircle,
  Trash2,
  MapPin,
  Boxes,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  CircleDollarSign,
  ShoppingCart,
  Archive,
  ShieldCheck,
  Sprout,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { updateWalletBalance } from "@/lib/wallet-utils";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const PRODUCTS_STORAGE_KEY = "sibol_products";
const ORDERS_STORAGE_KEY = "sibol_orders";
const FARMER_WALLET_KEY = "sibol_farmer_wallet";
const HARVESTS_STORAGE_KEY = "sibol_harvests";

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

type Order = {
  id: string;
  productId: string;
  productName?: string;
  imageUrl?: string;
  farmer?: string;
  farmerName?: string;
  farmerWallet?: string;
  buyerName?: string;
  buyerWallet?: string;
  quantity: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  payoutStatus?: string;
  escrowStatus?: string;
  orderStatus?: string;
  createdAt?: string;
};

type HarvestStatus =
  | "funding"
  | "growing"
  | "harvested"
  | "sold"
  | "cancelled";

type HarvestInvestor = {
  userId: string;
  userName: string;
  amount: number;
};

type HarvestCampaign = {
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
  coverImage: string;
  createdAt: string;
  verified?: boolean;

  linkedProductId?: string;
  listingCreatedAt?: string;

  actualYieldKg?: number;
  actualSellPricePerKg?: number;
  actualProductionCost?: number;
  totalRevenue?: number;
  netProfit?: number;
  investorProfitPool?: number;
  farmerProfit?: number;
  settledAt?: string;
};
type ActiveSection =
  | "create"
  | "harvests"
  | "funding"
  | "orders"
  | "analytics";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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


export default function FarmerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<ActiveSection>("create");
  const [createMode, setCreateMode] = useState<"product" | "funding">("product");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    location: "Nueva Ecija",
    description: "",
    harvestDate: new Date().toISOString().split("T")[0],
    category: "polished",
  });

  const [fundingForm, setFundingForm] = useState({
    title: "",
    cropType: "Rice",
    location: "Nueva Ecija",
    description: "",
    fundingGoal: "",
    estimatedYieldKg: "",
    targetSellPricePerKg: "",
    estimatedProductionCost: "",
    expectedHarvestDate: new Date().toISOString().split("T")[0],
    minimumInvestment: "500",
  });

  const createProductFromCampaign = () => {
  if (!harvestingCampaign) return;

  const campaign = harvestingCampaign;
  const actualYieldKg = Number(settlementForm.actualYieldKg);
  const actualSellPricePerKg = Number(settlementForm.actualSellPricePerKg);
  const actualProductionCost = Number(settlementForm.actualProductionCost);

  if (actualYieldKg <= 0 || actualSellPricePerKg <= 0 || actualProductionCost <= 0) {
    toast({
      title: "Invalid harvest values",
      description: "Enter a valid harvested quantity, selling price, and production cost.",
      variant: "destructive",
    });
    return;
  }

  if (campaign.linkedProductId) {
    toast({
      title: "Listing already created",
      description: "This campaign already has a linked harvest listing.",
      variant: "destructive",
    });
    return;
  }

  const newProduct: Product = {
    id: crypto.randomUUID(),
    name: `${campaign.title} Harvest`,
    price: actualSellPricePerKg,
    originalPrice: actualSellPricePerKg,
    quantity: actualYieldKg,
    availableQuantity: actualYieldKg,
    sold: 0,
    reservedQuantity: 0,
    location: campaign.location,
    harvestDate: new Date().toISOString().split("T")[0],
    rating: 0,
    reviews: 0,
    imageUrl: campaign.coverImage || "https://picsum.photos/seed/rice-harvest/400/300",
    images: campaign.coverImage ? [campaign.coverImage] : [],
    isPooled: actualYieldKg >= 100,
    category: "polished",
    farmer: campaign.farmerName,
    farmerName: campaign.farmerName,
    farmerId: campaign.farmerId,
    farmerWallet: campaign.farmerWallet,
    farmerRating: 5,
    description:
      campaign.description || `Harvest from funded campaign: ${campaign.title}`,
    paymentMethod: "wallet",
    payoutStatus: "not_paid",
    blockchainNetwork: "Base",
    status: "active",
    createdAt: new Date().toISOString(),
  };

  saveProduct(newProduct);

  updateHarvestCampaign(campaign.id, {
    status: "harvested",
    actualYieldKg,
    actualSellPricePerKg,
    actualProductionCost,
    linkedProductId: newProduct.id,
    listingCreatedAt: new Date().toISOString(),
  });

  setHarvestingCampaign(null);

  toast({
    title: "Harvest listed",
    description: "The harvested crop is now available in the marketplace.",
  });
};

  const [harvestingCampaign, setHarvestingCampaign] = useState<HarvestCampaign | null>(null);

  const openHarvestModal = (campaign: HarvestCampaign) => {
    setHarvestingCampaign(campaign);
    setSettlementForm({
      actualYieldKg: String(campaign.actualYieldKg ?? campaign.estimatedYieldKg ?? ""),
      actualSellPricePerKg: String(
        campaign.actualSellPricePerKg ?? campaign.targetSellPricePerKg ?? ""
      ),
      actualProductionCost: String(
        campaign.actualProductionCost ?? campaign.estimatedProductionCost ?? ""
      ),
    });
  };

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  const [walletConnecting, setWalletConnecting] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [harvestCampaigns, setHarvestCampaigns] = useState<HarvestCampaign[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    quantity: "",
    location: "",
    description: "",
    harvestDate: "",
    category: "polished",
  });

  const [settlingCampaign, setSettlingCampaign] = useState<HarvestCampaign | null>(null);

  const [settlementForm, setSettlementForm] = useState({
    actualYieldKg: "",
    actualSellPricePerKg: "",
    actualProductionCost: "",
  });

  const openSettlementModal = (campaign: HarvestCampaign) => {
    setSettlingCampaign(campaign);
    setSettlementForm({
      actualYieldKg: String(campaign.actualYieldKg ?? campaign.estimatedYieldKg ?? ""),
      actualSellPricePerKg: String(
        campaign.actualSellPricePerKg ?? campaign.targetSellPricePerKg ?? ""
      ),
      actualProductionCost: String(
        campaign.actualProductionCost ?? campaign.estimatedProductionCost ?? ""
      ),
    });
  };

  const handleSettleCampaign = () => {
    if (!settlingCampaign) return;
    if (!settlingCampaign.linkedProductId) {
      toast({
        title: "No linked product",
        description: "This campaign has no harvest listing yet.",
        variant: "destructive",
      });
      return;
    }

    const actualProductionCost = Number(settlementForm.actualProductionCost);

    if (actualProductionCost <= 0) {
      toast({
        title: "Invalid production cost",
        description: "Please enter a valid actual production cost.",
        variant: "destructive",
      });
      return;
    }

    const relatedOrders = getOrders().filter(
      (order) =>
        order.productId === settlingCampaign.linkedProductId &&
        ["paid", "accepted", "in_transit", "delivered", "completed"].includes(
          order.orderStatus || ""
        )
    );

    const totalRevenue = relatedOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    const totalSoldKg = relatedOrders.reduce(
      (sum, order) => sum + Number(order.quantity || 0),
      0
    );

    const netProfit = Math.max(totalRevenue - actualProductionCost, 0);
    const investorProfitPool =
      netProfit * (settlingCampaign.profitShareInvestors / 100);
    const farmerProfit =
      netProfit * (settlingCampaign.profitShareFarmer / 100);

    settlingCampaign.investors.forEach((investor) => {
      const shareRatio = investor.amount / settlingCampaign.fundingGoal;
      const profitShare = investorProfitPool * shareRatio;
      const totalPayout = investor.amount + profitShare;

      updateWalletBalance(investor.userId, totalPayout);
    });

    updateWalletBalance(settlingCampaign.farmerId, farmerProfit);

    updateHarvestCampaign(settlingCampaign.id, {
      actualYieldKg: totalSoldKg,
      actualProductionCost,
      totalRevenue,
      netProfit,
      investorProfitPool,
      farmerProfit,
      settledAt: new Date().toISOString(),
      status: "sold",
    });

    setSettlingCampaign(null);

    toast({
      title: "Campaign settled",
      description: "Settlement was based on actual marketplace sales.",
    });
  };

  const farmerName = user?.name || "Local Farmer";

  const shortAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getProducts = (): Product[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const getOrders = (): Order[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const getHarvestCampaigns = (): HarvestCampaign[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(HARVESTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const refreshDashboardData = () => {
    setProducts(getProducts());
    setOrders(getOrders());
    setHarvestCampaigns(getHarvestCampaigns());
  };

  const saveProduct = (product: Product) => {
    const currentProducts = getProducts();
    const updatedProducts = [product, ...currentProducts];

    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: PRODUCTS_STORAGE_KEY,
        newValue: JSON.stringify(updatedProducts),
      })
    );
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    const currentProducts = getProducts();
    const updatedProducts = currentProducts.map((product) => {
      if (product.id !== productId) return product;

      const merged = { ...product, ...updates };

      const available =
        typeof merged.availableQuantity === "number"
          ? merged.availableQuantity
          : merged.quantity;

      if (available <= 0) {
        merged.status = "sold_out";
      } else if (merged.status === "sold_out") {
        merged.status = "active";
      }

      return merged;
    });

    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: PRODUCTS_STORAGE_KEY,
        newValue: JSON.stringify(updatedProducts),
      })
    );
  };

  const deleteProduct = (productId: string) => {
    const currentProducts = getProducts();
    const updatedProducts = currentProducts.filter((product) => product.id !== productId);

    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: PRODUCTS_STORAGE_KEY,
        newValue: JSON.stringify(updatedProducts),
      })
    );
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    const currentOrders = getOrders();
    const updatedOrders = currentOrders.map((order) =>
      order.id === orderId ? { ...order, ...updates } : order
    );

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    setOrders(updatedOrders);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: ORDERS_STORAGE_KEY,
        newValue: JSON.stringify(updatedOrders),
      })
    );
  };

  const saveHarvestCampaign = (campaign: HarvestCampaign) => {
    const currentCampaigns = getHarvestCampaigns();
    const updatedCampaigns = [campaign, ...currentCampaigns];

    localStorage.setItem(HARVESTS_STORAGE_KEY, JSON.stringify(updatedCampaigns));
    setHarvestCampaigns(updatedCampaigns);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: HARVESTS_STORAGE_KEY,
        newValue: JSON.stringify(updatedCampaigns),
      })
    );
  };

  const updateHarvestCampaign = (
    campaignId: string,
    updates: Partial<HarvestCampaign>
  ) => {
    const currentCampaigns = getHarvestCampaigns();
    const updatedCampaigns = currentCampaigns.map((campaign) =>
      campaign.id === campaignId ? { ...campaign, ...updates } : campaign
    );

    localStorage.setItem(HARVESTS_STORAGE_KEY, JSON.stringify(updatedCampaigns));
    setHarvestCampaigns(updatedCampaigns);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: HARVESTS_STORAGE_KEY,
        newValue: JSON.stringify(updatedCampaigns),
      })
    );
  };

  const deleteHarvestCampaign = (campaignId: string) => {
    const currentCampaigns = getHarvestCampaigns();
    const campaign = currentCampaigns.find((item) => item.id === campaignId);

    if (!campaign) return;

    if (campaign.investors.length > 0 || campaign.fundedAmount > 0) {
      toast({
        title: "Cannot delete campaign",
        description:
          "This campaign already has investor funds. Cancel it instead so investors can be refunded.",
        variant: "destructive",
      });
      return;
    }

    const updatedCampaigns = currentCampaigns.filter(
      (item) => item.id !== campaignId
    );

    localStorage.setItem(HARVESTS_STORAGE_KEY, JSON.stringify(updatedCampaigns));
    setHarvestCampaigns(updatedCampaigns);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: HARVESTS_STORAGE_KEY,
        newValue: JSON.stringify(updatedCampaigns),
      })
    );

    toast({
      title: "Campaign deleted",
      description: "The funding campaign has been removed.",
    });
  };

  const cancelHarvestCampaign = (campaignId: string) => {
      const currentCampaigns = getHarvestCampaigns();
      const campaign = currentCampaigns.find((item) => item.id === campaignId);

      if (!campaign) return;

      if (campaign.status === "sold") {
        toast({
          title: "Cannot cancel campaign",
          description: "A sold campaign can no longer be cancelled.",
          variant: "destructive",
        });
        return;
      }

      campaign.investors.forEach((investor) => {
        updateWalletBalance(investor.userId, investor.amount);
      });

      const updatedCampaigns = currentCampaigns.map((item) =>
        item.id === campaignId
          ? {
              ...item,
              status: "cancelled" as HarvestStatus,
              fundedAmount: 0,
              investors: [],
            }
          : item
      );

      localStorage.setItem(HARVESTS_STORAGE_KEY, JSON.stringify(updatedCampaigns));
      setHarvestCampaigns(updatedCampaigns);

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: HARVESTS_STORAGE_KEY,
          newValue: JSON.stringify(updatedCampaigns),
        })
      );

      toast({
        title: "Campaign cancelled",
        description: "All investors were refunded and the campaign is now cancelled.",
      });
    };

  useEffect(() => {
    const savedWallet = localStorage.getItem(FARMER_WALLET_KEY);

    if (!savedWallet || !ethers.isAddress(savedWallet)) {
      localStorage.removeItem(FARMER_WALLET_KEY);
      localStorage.removeItem("sibol_harvests");
    }

    if (savedWallet && ethers.isAddress(savedWallet)) {
      setWalletAddress(savedWallet);
    } else {
      localStorage.removeItem(FARMER_WALLET_KEY);
      setWalletAddress("");
    }

    refreshDashboardData();

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === PRODUCTS_STORAGE_KEY ||
        e.key === ORDERS_STORAGE_KEY ||
        e.key === FARMER_WALLET_KEY ||
        e.key === HARVESTS_STORAGE_KEY
      ) {
        if (e.key === FARMER_WALLET_KEY) {
          const newWallet = localStorage.getItem(FARMER_WALLET_KEY);

          if (newWallet && ethers.isAddress(newWallet)) {
            setWalletAddress(newWallet);
          } else {
            setWalletAddress("");
          }
        }

        refreshDashboardData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const connectWallet = async () => {
    try {
      setWalletConnecting(true);

      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          localStorage.setItem(FARMER_WALLET_KEY, address);

          toast({
            title: "Wallet connected",
            description: `Connected: ${shortAddress(address)}`,
          });
          return;
        }
      }

      if (!window.ethereum) {
        toast({
          title: "Wallet required",
          description: "Please install MetaMask.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Demo wallet connected",
        description: "MetaMask was not detected, so a demo wallet was used.",
      });
    } catch {
      toast({
        title: "Wallet connection failed",
        description: "Could not connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWalletConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    localStorage.removeItem(FARMER_WALLET_KEY);

    toast({
      title: "Wallet disconnected",
      description: "Your payout wallet has been removed from this prototype.",
    });
  };

  const copyWalletAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Unable to copy wallet address.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 5 images.",
        variant: "destructive",
      });
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
        setImages((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetProductForm = () => {
    setFormData({
      name: "",
      price: "",
      quantity: "",
      location: "Nueva Ecija",
      description: "",
      harvestDate: new Date().toISOString().split("T")[0],
      category: "polished",
    });
    setImages([]);
    setImagePreviews([]);
    setUploading(false);
    setSuccess(false);
  };

  const resetFundingForm = () => {
    setFundingForm({
      title: "",
      cropType: "Rice",
      location: "Nueva Ecija",
      description: "",
      fundingGoal: "",
      estimatedYieldKg: "",
      targetSellPricePerKg: "",
      estimatedProductionCost: "",
      expectedHarvestDate: new Date().toISOString().split("T")[0],
      minimumInvestment: "500",
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      toast({
        title: "Connect wallet first",
        description: "Please connect your wallet before creating a listing.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.price || !formData.quantity || !formData.location) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const parsedPrice = parseFloat(formData.price);
    const parsedQuantity = parseInt(formData.quantity);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price per kilogram.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      price: parsedPrice,
      originalPrice: parsedPrice + 5,
      quantity: parsedQuantity,
      availableQuantity: parsedQuantity,
      sold: 0,
      reservedQuantity: 0,
      location: formData.location.trim(),
      harvestDate: formData.harvestDate,
      rating: 0,
      reviews: 0,
      imageUrl: imagePreviews[0] || "https://picsum.photos/seed/rice-new/400/300",
      images: imagePreviews,
      isPooled: parsedQuantity >= 100,
      category: formData.category,
      farmer: farmerName,
      farmerName,
      farmerId: user?.id || user?.email || farmerName,
      farmerWallet: walletAddress,
      farmerRating: 5.0,
      description: formData.description.trim(),
      paymentMethod: "wallet",
      payoutStatus: "not_paid",
      blockchainNetwork: "Base",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    saveProduct(newProduct);

    setSuccess(true);
    setUploading(false);

    toast({
      title: "Listing created",
      description: `${newProduct.name} is now listed in the marketplace.`,
    });

    setTimeout(() => {
      resetProductForm();
      setActiveSection("harvests");
    }, 1200);
  };

  const handleFundingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      toast({
        title: "Connect wallet first",
        description: "Please connect your wallet before creating a funding campaign.",
        variant: "destructive",
      });
      return;
    }

    if (
      !fundingForm.title ||
      !fundingForm.location ||
      !fundingForm.fundingGoal ||
      !fundingForm.estimatedYieldKg ||
      !fundingForm.targetSellPricePerKg ||
      !fundingForm.estimatedProductionCost
    ) {
      toast({
        title: "Missing fields",
        description: "Please complete all required funding campaign fields.",
        variant: "destructive",
      });
      return;
    }

    const fundingGoal = Number(fundingForm.fundingGoal);
    const estimatedYieldKg = Number(fundingForm.estimatedYieldKg);
    const targetSellPricePerKg = Number(fundingForm.targetSellPricePerKg);
    const estimatedProductionCost = Number(fundingForm.estimatedProductionCost);
    const minimumInvestment = Number(fundingForm.minimumInvestment || 500);

    if (
      fundingGoal <= 0 ||
      estimatedYieldKg <= 0 ||
      targetSellPricePerKg <= 0 ||
      estimatedProductionCost <= 0 ||
      minimumInvestment <= 0
    ) {
      toast({
        title: "Invalid values",
        description: "All funding values must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    const newCampaign: HarvestCampaign = {
      id: crypto.randomUUID(),
      farmerId: user?.id || user?.email || farmerName,
      farmerName,
      farmerWallet: walletAddress,
      title: fundingForm.title.trim(),
      cropType: fundingForm.cropType,
      location: fundingForm.location.trim(),
      description: fundingForm.description.trim(),
      fundingGoal,
      fundedAmount: 0,
      estimatedYieldKg,
      targetSellPricePerKg,
      estimatedProductionCost,
      expectedHarvestDate: fundingForm.expectedHarvestDate,
      profitShareFarmer: 60,
      profitShareInvestors: 40,
      minimumInvestment,
      status: "funding",
      investors: [],
      coverImage:
        imagePreviews[0] || "https://picsum.photos/seed/rice-funding/600/400",
      createdAt: new Date().toISOString(),
      verified: true,
    };

    saveHarvestCampaign(newCampaign);

    resetFundingForm();

    toast({
      title: "Funding campaign created",
      description: `${newCampaign.title} is now open for investor funding.`,
    });

    setActiveSection("funding");
  };

  const farmerProducts = useMemo(() => {
    return products
      .filter((product) => {
        const sameWallet =
          walletAddress && product.farmerWallet && product.farmerWallet === walletAddress;
        const sameName = product.farmer === farmerName || product.farmerName === farmerName;
        return sameWallet || sameName;
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [products, walletAddress, farmerName]);

  const farmerOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const sameWallet =
          walletAddress && order.farmerWallet && order.farmerWallet === walletAddress;
        const sameName = order.farmerName === farmerName || order.farmer === farmerName;
        return sameWallet || sameName;
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [orders, walletAddress, farmerName]);

  const farmerHarvestCampaigns = useMemo(() => {
    return harvestCampaigns
      .filter((campaign) => {
        const sameWallet =
          walletAddress &&
          campaign.farmerWallet &&
          campaign.farmerWallet === walletAddress;

        const sameName = campaign.farmerName === farmerName;

        return sameWallet || sameName;
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [harvestCampaigns, walletAddress, farmerName]);

  const activeListingsCount = farmerProducts.filter(
    (product) => product.status === "active"
  ).length;

  const activeFundingCampaignsCount = farmerHarvestCampaigns.filter(
    (campaign) => campaign.status === "funding" || campaign.status === "growing"
  ).length;

  const pendingOrdersCount = farmerOrders.filter((order) =>
    ["pending", "paid", "accepted", "in_transit"].includes(order.orderStatus || "")
  ).length;

  const earningsMTD = farmerOrders
    .filter((order) => {
      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      const now = new Date();
      if (!createdAt) return false;

      const sameMonth =
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear();

      const eligiblePayment =
        order.payoutStatus === "released" ||
        order.paymentStatus === "paid" ||
        order.escrowStatus === "released";

      return sameMonth && eligiblePayment;
    })
    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

  const totalRevenue = farmerOrders
    .filter((order) =>
      ["paid", "accepted", "in_transit", "delivered", "completed"].includes(
        order.orderStatus || ""
      )
    )
    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

  const totalKgSold = farmerOrders.reduce(
    (sum, order) => sum + (Number(order.quantity) || 0),
    0
  );

  const totalOrdersCount = farmerOrders.length;

  const deliveredOrdersCount = farmerOrders.filter((order) =>
    ["delivered", "completed"].includes(order.orderStatus || "")
  ).length;

  const acceptedOrdersCount = farmerOrders.filter(
    (order) => order.orderStatus === "accepted"
  ).length;

  const inTransitOrdersCount = farmerOrders.filter(
    (order) => order.orderStatus === "in_transit"
  ).length;

  const paidOrdersCount = farmerOrders.filter(
    (order) => order.orderStatus === "paid"
  ).length;

  const releasedPayoutAmount = farmerOrders
    .filter(
      (order) =>
        order.payoutStatus === "released" || order.escrowStatus === "released"
    )
    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

  const heldEscrowAmount = farmerOrders
    .filter(
      (order) => order.payoutStatus === "held" || order.escrowStatus === "held"
    )
    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

  const unpaidAmount = farmerOrders
    .filter(
      (order) =>
        order.payoutStatus === "not_paid" ||
        order.paymentStatus === "unpaid" ||
        order.escrowStatus === "unpaid"
    )
    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

  const activeProductsCount = farmerProducts.filter(
    (product) => product.status === "active"
  ).length;

  const pausedProductsCount = farmerProducts.filter(
    (product) => product.status === "paused"
  ).length;

  const soldOutProductsCount = farmerProducts.filter(
    (product) => product.status === "sold_out"
  ).length;

  const lowStockProducts = farmerProducts.filter((product) => {
    const available = product.availableQuantity ?? product.quantity ?? 0;
    return available > 0 && available <= 50;
  });

  const bestSellingHarvests = farmerProducts
    .map((product) => {
      const relatedOrders = farmerOrders.filter((order) => order.productId === product.id);

      const soldKg = relatedOrders.reduce(
        (sum, order) => sum + (Number(order.quantity) || 0),
        0
      );

      const revenue = relatedOrders.reduce(
        (sum, order) => sum + (Number(order.totalAmount) || 0),
        0
      );

      return {
        ...product,
        soldKg,
        revenue,
        orderCount: relatedOrders.length,
      };
    })
    .sort((a, b) => b.soldKg - a.soldKg)
    .slice(0, 5);

  const totalFundingGoal = farmerHarvestCampaigns.reduce(
    (sum, campaign) => sum + campaign.fundingGoal,
    0
  );

  const totalFundedAmount = farmerHarvestCampaigns.reduce(
    (sum, campaign) => sum + campaign.fundedAmount,
    0
  );

  const getOrderStatusClass = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-blue-100 text-blue-700";
      case "accepted":
        return "bg-amber-100 text-amber-700";
      case "in_transit":
        return "bg-purple-100 text-purple-700";
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPayoutStatusClass = (status?: string) => {
    switch (status) {
      case "released":
        return "bg-green-100 text-green-700";
      case "held":
      case "escrow_held":
        return "bg-orange-100 text-orange-700";
      case "not_paid":
      case "unpaid":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getHarvestStatusClass = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "paused":
        return "bg-amber-100 text-amber-700";
      case "sold_out":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getCampaignStatusClass = (status?: HarvestStatus) => {
    switch (status) {
      case "funding":
        return "bg-blue-100 text-blue-700";
      case "growing":
        return "bg-green-100 text-green-700";
      case "harvested":
        return "bg-amber-100 text-amber-700";
      case "sold":
        return "bg-slate-200 text-slate-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const acceptOrder = (orderId: string) => {
    updateOrder(orderId, {
      orderStatus: "accepted",
      payoutStatus: "held",
      escrowStatus: "held",
    });

    toast({
      title: "Order accepted",
      description: "The order is now being prepared.",
    });
  };

  const markInTransit = (orderId: string) => {
    updateOrder(orderId, {
      orderStatus: "in_transit",
      payoutStatus: "held",
      escrowStatus: "held",
    });

    toast({
      title: "Order marked in transit",
      description: "The buyer can now track shipment progress.",
    });
  };

  const markDelivered = (orderId: string) => {
    updateOrder(orderId, {
      orderStatus: "delivered",
      paymentStatus: "paid",
      payoutStatus: "released",
      escrowStatus: "released",
    });

    toast({
      title: "Order marked delivered",
      description: "Escrow was released to the farmer wallet in the prototype flow.",
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      quantity: String(product.availableQuantity ?? product.quantity ?? ""),
      location: product.location || "",
      description: product.description || "",
      harvestDate: product.harvestDate || "",
      category: product.category || "polished",
    });
  };

  const saveEditedHarvest = () => {
    if (!editingProduct) return;

    const parsedPrice = parseFloat(editForm.price);
    const parsedQuantity = parseInt(editForm.quantity);

    if (!editForm.name || !editForm.location || isNaN(parsedPrice) || isNaN(parsedQuantity)) {
      toast({
        title: "Invalid fields",
        description: "Please complete all required edit fields.",
        variant: "destructive",
      });
      return;
    }

    let nextStatus = editingProduct.status || "active";
    if (parsedQuantity <= 0) nextStatus = "sold_out";
    else if (nextStatus === "sold_out") nextStatus = "active";

    updateProduct(editingProduct.id, {
      name: editForm.name.trim(),
      price: parsedPrice,
      quantity: parsedQuantity,
      availableQuantity: parsedQuantity,
      location: editForm.location.trim(),
      description: editForm.description.trim(),
      harvestDate: editForm.harvestDate,
      category: editForm.category,
      status: nextStatus,
    });

    setEditingProduct(null);

    toast({
      title: "Harvest updated",
      description: "Your listing has been updated.",
    });
  };

  const toggleHarvestStatus = (product: Product) => {
    const available = product.availableQuantity ?? product.quantity ?? 0;

    if (available <= 0) {
      updateProduct(product.id, { status: "sold_out" });
      toast({
        title: "Harvest sold out",
        description: "This listing has no available stock left.",
      });
      return;
    }

    const nextStatus = product.status === "paused" ? "active" : "paused";

    updateProduct(product.id, { status: nextStatus });

    toast({
      title: nextStatus === "paused" ? "Harvest paused" : "Harvest resumed",
      description:
        nextStatus === "paused"
          ? "This listing is now hidden from active selling."
          : "This listing is active again.",
    });
  };

  const handleDeleteHarvest = (productId: string) => {
    deleteProduct(productId);
    toast({
      title: "Harvest deleted",
      description: "The listing has been removed from your harvests.",
    });
  };

  const sectionTitle =
    activeSection === "create"
      ? "Create Listing"
      : activeSection === "harvests"
      ? "Harvest Listings"
      : activeSection === "funding"
      ? "Funding Campaigns"
      : activeSection === "orders"
      ? "Buyer Orders"
      : "Market Insights";

  const sectionDescription =
    activeSection === "create"
      ? "Choose whether to publish a product or launch a funding campaign."
      : activeSection === "harvests"
      ? "Manage your live listings and stock."
      : activeSection === "funding"
      ? "Raise harvest capital through profit-sharing campaigns."
      : activeSection === "orders"
      ? "Track orders and update delivery status."
      : "Monitor revenue, payouts, inventory, and funding performance.";

  const navItems: {
    key: ActiveSection;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    { key: "create", label: "Create Listing", icon: Plus },
    { key: "harvests", label: "Harvest Listings", icon: Package, count: farmerProducts.length },
    {
      key: "funding",
      label: "Funding Campaigns",
      icon: CircleDollarSign,
      count: farmerHarvestCampaigns.length,
    },
    { key: "orders", label: "Buyer Orders", icon: History, count: farmerOrders.length },
    { key: "analytics", label: "Market Insights", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#F7F1E3] flex flex-col text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        <div className="mb-6 rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md overflow-hidden">
          <div className="h-8 bg-[repeating-linear-gradient(90deg,#2E6C3C_0px,#2E6C3C_28px,#F7EED8_28px,#F7EED8_56px)] border-b-[3px] border-[#8A5A2B]" />
          <div className="p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <WoodSign className="mb-3">Farmer Portal</WoodSign>
                <h1 className="text-3xl font-bold">Welcome back, {farmerName}</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Manage your harvest listings, funding campaigns, buyer orders, and stall
                  performance.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
                <div className="rounded-2xl bg-[#F7F8F3] px-4 py-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Listings</p>
                  <p className="mt-1 text-xl font-bold">{activeListingsCount}</p>
                </div>
                <div className="rounded-2xl bg-[#F7F8F3] px-4 py-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Campaigns</p>
                  <p className="mt-1 text-xl font-bold">{activeFundingCampaignsCount}</p>
                </div>
                <div className="rounded-2xl bg-[#F7F8F3] px-4 py-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Orders</p>
                  <p className="mt-1 text-xl font-bold">{pendingOrdersCount}</p>
                </div>
                <div className="rounded-2xl bg-[#F7F8F3] px-4 py-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Revenue</p>
                  <p className="mt-1 text-xl font-bold">₱{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-5">
            <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md overflow-hidden">
              <div className="h-20 bg-[repeating-linear-gradient(90deg,#2E6C3C_0px,#2E6C3C_28px,#F7EED8_28px,#F7EED8_56px)]" />
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Leaf className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{farmerName}</h2>
                    <p className="text-sm text-muted-foreground">Direct Farm Seller</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{formData.location || fundingForm.location || "Nueva Ecija"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  <div className="rounded-2xl bg-[#FFF8E8] p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Listings</p>
                    <p className="mt-1 font-bold">{farmerProducts.length}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FFF8E8] p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Campaigns</p>
                    <p className="mt-1 font-bold">{farmerHarvestCampaigns.length}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FFF8E8] p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Orders</p>
                    <p className="mt-1 font-bold">{farmerOrders.length}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FFF8E8] p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Rating</p>
                    <p className="mt-1 font-bold">5.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
              <CardContent className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={cn(
                        "w-full h-12 rounded-2xl px-4 border transition-all text-left flex items-center justify-between",
                        activeSection === item.key
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-[#E8D7B5] hover:bg-[#FFF8E8] text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-3 font-medium text-sm">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>

                      {typeof item.count === "number" && (
                        <span
                          className={cn(
                            "min-w-7 h-7 rounded-full text-xs px-2 flex items-center justify-center",
                            activeSection === item.key
                              ? "bg-white/20 text-white"
                              : "bg-[#FFF8E8] text-foreground"
                          )}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}

                <button className="w-full h-12 rounded-2xl px-4 border border-[#E8D7B5] bg-white hover:bg-[#FFF8E8] transition-all text-left flex items-center gap-3 font-medium text-sm">
                  <Settings className="h-4 w-4" />
                  Stall Settings
                </button>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Payout Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {walletAddress ? (
                  <>
                    <div className="rounded-2xl border border-[#E8D7B5] bg-[#FFF8E8] px-3 py-3">
                      <p className="text-xs text-muted-foreground mb-1">Connected Address</p>
                      <p className="text-sm break-all">{walletAddress}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={copyWalletAddress}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={disconnectWallet}
                      >
                        Disconnect
                      </Button>

                      
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Connect a wallet so your prototype payouts can be received here.
                    </p>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={connectWallet}
                      disabled={walletConnecting}
                    >
                      {walletConnecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div>
              <WoodSign className="mb-3">{sectionTitle}</WoodSign>
              <p className="text-sm text-muted-foreground">{sectionDescription}</p>
            </div>

            {activeSection === "create" && (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={createMode === "product" ? "default" : "outline"}
                    onClick={() => setCreateMode("product")}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Publish Product
                  </Button>
                  <Button
                    type="button"
                    variant={createMode === "funding" ? "default" : "outline"}
                    onClick={() => setCreateMode("funding")}
                  >
                    <CircleDollarSign className="h-4 w-4 mr-2" />
                    Create Funding Campaign
                  </Button>
                </div>

                {createMode === "product" && success && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Your harvest has been published to the marketplace.
                    </span>
                  </div>
                )}

                {createMode === "product" && (
                  <form onSubmit={handleSubmit}>
                    <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md overflow-hidden">
                      <CardContent className="p-0">
                        <div className="grid lg:grid-cols-2">
                          <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#E8D7B5]">
                            <div className="mb-4">
                              <h3 className="font-bold">Product Photos</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Clear photos help buyers trust your listing.
                              </p>
                            </div>

                            <div className="rounded-[24px] border-2 border-dashed border-[#C89D57] bg-[#FFF8E8] p-5 text-center">
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                multiple
                                className="hidden"
                              />

                              {imagePreviews.length === 0 ? (
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  className="cursor-pointer"
                                >
                                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                                    <Upload className="h-7 w-7 text-primary" />
                                  </div>
                                  <p className="font-medium">Upload photos of your rice</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    JPG, PNG or GIF, up to 5 images
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Select Images
                                  </Button>
                                </div>
                              ) : (
                                <div>
                                  <div className="grid grid-cols-3 gap-3 mb-4">
                                    {imagePreviews.map((preview, index) => (
                                      <div key={index} className="relative group">
                                        <div className="aspect-square rounded-2xl overflow-hidden border border-[#E8D7B5] bg-white">
                                          <Image
                                            src={preview}
                                            alt={`Product preview ${index + 1}`}
                                            width={150}
                                            height={150}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => removeImage(index)}
                                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))}

                                    {imagePreviews.length < 5 && (
                                      <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-2xl border-2 border-dashed border-[#C89D57] bg-white flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                      >
                                        <Plus className="h-8 w-8 text-primary" />
                                      </div>
                                    )}
                                  </div>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Add More Photos
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-6 space-y-4">
                            <div className="rounded-2xl bg-[#FFF8E8] border border-[#E8D7B5] px-4 py-3 text-sm text-muted-foreground">
                              {walletAddress
                                ? `Payout wallet connected: ${shortAddress(walletAddress)}`
                                : "Connect a wallet before publishing your harvest."}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="name">Product Name *</Label>
                              <Input
                                id="name"
                                placeholder="e.g. Premium Dinorado Rice"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="price">Price (₱/kg) *</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={formData.price}
                                  onChange={(e) =>
                                    setFormData({ ...formData, price: e.target.value })
                                  }
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity (kg) *</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  placeholder="0"
                                  value={formData.quantity}
                                  onChange={(e) =>
                                    setFormData({ ...formData, quantity: e.target.value })
                                  }
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                  id="location"
                                  placeholder="Province, Municipality"
                                  value={formData.location}
                                  onChange={(e) =>
                                    setFormData({ ...formData, location: e.target.value })
                                  }
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="harvestDate">Harvest Date</Label>
                                <Input
                                  id="harvestDate"
                                  type="date"
                                  value={formData.harvestDate}
                                  onChange={(e) =>
                                    setFormData({ ...formData, harvestDate: e.target.value })
                                  }
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="category">Category *</Label>
                              <select
                                id="category"
                                value={formData.category}
                                onChange={(e) =>
                                  setFormData({ ...formData, category: e.target.value })
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="polished">Polished Rice</option>
                                <option value="unpolished">Unpolished Rice</option>
                                <option value="seeds">Seeds & Seedlings</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                placeholder="Describe grain quality, milling details, packaging, and harvest notes."
                                className="min-h-[110px]"
                                value={formData.description}
                                onChange={(e) =>
                                  setFormData({ ...formData, description: e.target.value })
                                }
                              />
                            </div>

                            <Button
                              type="submit"
                              className="w-full h-12 text-base"
                              disabled={uploading || !walletAddress}
                            >
                              {uploading ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                  Publishing Harvest...
                                </div>
                              ) : !walletAddress ? (
                                "Connect Wallet to Publish"
                              ) : (
                                "Publish to Marketplace"
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </form>
                )}

                {createMode === "funding" && (
                  <form onSubmit={handleFundingSubmit}>
                    <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md overflow-hidden">
                      <CardContent className="p-6 space-y-4">
                        <div className="rounded-2xl bg-[#FFF8E8] border border-[#E8D7B5] px-4 py-3 text-sm text-muted-foreground">
                          Profit-sharing model: Farmers keep 60% of net profit, investors
                          share 40%. No fixed guaranteed ROI.
                        </div>

                        <div className="space-y-2">
                          <Label>Campaign Title *</Label>
                          <Input
                            placeholder="e.g. Dinorado Rice Harvest Batch 01"
                            value={fundingForm.title}
                            onChange={(e) =>
                              setFundingForm({ ...fundingForm, title: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Crop Type *</Label>
                            <Input
                              value={fundingForm.cropType}
                              onChange={(e) =>
                                setFundingForm({ ...fundingForm, cropType: e.target.value })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Location *</Label>
                            <Input
                              value={fundingForm.location}
                              onChange={(e) =>
                                setFundingForm({ ...fundingForm, location: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Funding Goal (₱) *</Label>
                            <Input
                              type="number"
                              value={fundingForm.fundingGoal}
                              onChange={(e) =>
                                setFundingForm({
                                  ...fundingForm,
                                  fundingGoal: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Minimum Investment (₱) *</Label>
                            <Input
                              type="number"
                              value={fundingForm.minimumInvestment}
                              onChange={(e) =>
                                setFundingForm({
                                  ...fundingForm,
                                  minimumInvestment: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Estimated Yield (kg) *</Label>
                            <Input
                              type="number"
                              value={fundingForm.estimatedYieldKg}
                              onChange={(e) =>
                                setFundingForm({
                                  ...fundingForm,
                                  estimatedYieldKg: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Target Sell Price (₱/kg) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fundingForm.targetSellPricePerKg}
                              onChange={(e) =>
                                setFundingForm({
                                  ...fundingForm,
                                  targetSellPricePerKg: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Estimated Production Cost (₱) *</Label>
                            <Input
                              type="number"
                              value={fundingForm.estimatedProductionCost}
                              onChange={(e) =>
                                setFundingForm({
                                  ...fundingForm,
                                  estimatedProductionCost: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Expected Harvest Date *</Label>
                            <Input
                              type="date"
                              value={fundingForm.expectedHarvestDate}
                              onChange={(e) =>
                                setFundingForm({
                                  ...fundingForm,
                                  expectedHarvestDate: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            className="min-h-[120px]"
                            placeholder="Describe what the funding covers: seeds, fertilizer, labor, drying, logistics, and harvest notes."
                            value={fundingForm.description}
                            onChange={(e) =>
                              setFundingForm({
                                ...fundingForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="rounded-2xl border border-dashed border-[#C89D57] bg-[#FFF8E8] p-4">
                          <p className="text-sm font-medium mb-2">Optional campaign image</p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            multiple
                            className="hidden"
                          />

                          {imagePreviews.length > 0 ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                {imagePreviews.map((preview, index) => (
                                  <div key={index} className="relative group">
                                    <div className="aspect-square rounded-2xl overflow-hidden border border-[#E8D7B5] bg-white">
                                      <Image
                                        src={preview}
                                        alt={`Campaign preview ${index + 1}`}
                                        width={150}
                                        height={150}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {imagePreviews.length < 5 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Add Campaign Image
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </Button>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-base"
                          disabled={!walletAddress}
                        >
                          {!walletAddress
                            ? "Connect Wallet to Create Campaign"
                            : "Launch Funding Campaign"}
                        </Button>
                      </CardContent>
                    </Card>
                  </form>
                )}
              </>
            )}

            {activeSection === "harvests" && (
              <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                <CardContent className="p-6">
                  {farmerProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#C89D57] bg-[#FFF8E8] p-10 text-center">
                      <Package className="h-10 w-10 mx-auto text-primary mb-3" />
                      <p className="font-semibold">No harvest listings yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create your first listing to start selling in the marketplace.
                      </p>
                      <Button className="mt-4" onClick={() => setActiveSection("create")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Publish Harvest
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {farmerProducts.map((product) => {
                        const availableQty = product.availableQuantity ?? product.quantity ?? 0;
                        const soldQty = product.sold ?? 0;
                        const stockPercent = Math.max(
                          0,
                          Math.min(
                            100,
                            (availableQty / Math.max(product.quantity || 1, 1)) * 100
                          )
                        );

                        return (
                          <div
                            key={product.id}
                            className="rounded-[26px] border-[2px] border-[#E8D7B5] bg-white p-4 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="h-28 w-full sm:w-28 rounded-2xl overflow-hidden border border-[#E8D7B5] bg-muted shrink-0">
                                <Image
                                  src={product.imageUrl || "https://picsum.photos/seed/rice/200/200"}
                                  alt={product.name}
                                  width={112}
                                  height={112}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div>
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {product.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Boxes className="h-3.5 w-3.5" />
                                        {product.harvestDate || "No date"}
                                      </span>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <span
                                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${getHarvestStatusClass(
                                          product.status
                                        )}`}
                                      >
                                        {product.status || "active"}
                                      </span>

                                      {availableQty <= 50 && availableQty > 0 && (
                                        <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold text-red-700">
                                          Low Stock
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-left sm:text-right shrink-0">
                                    <p className="text-2xl font-bold">
                                      ₱{Number(product.price).toLocaleString()}
                                      <span className="text-sm font-medium text-muted-foreground">
                                        /kg
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                                  <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                    <p className="text-[11px] text-muted-foreground">Available</p>
                                    <p className="font-semibold mt-1">{availableQty} kg</p>
                                  </div>
                                  <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                    <p className="text-[11px] text-muted-foreground">Sold</p>
                                    <p className="font-semibold mt-1">{soldQty} kg</p>
                                  </div>
                                  <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                    <p className="text-[11px] text-muted-foreground">Value</p>
                                    <p className="font-semibold mt-1">
                                      ₱{(Number(product.price) * availableQty).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                    <span>Stock level</span>
                                    <span>
                                      {availableQty} / {product.quantity} kg
                                    </span>
                                  </div>
                                  <div className="h-2.5 rounded-full bg-[#F0E6D2] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${stockPercent}%` }}
                                    />
                                  </div>
                                </div>

                                {product.description && (
                                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                                    {product.description}
                                  </p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditModal(product)}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleHarvestStatus(product)}
                                    disabled={availableQty <= 0}
                                  >
                                    {product.status === "paused" ? (
                                      <>
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        Resume
                                      </>
                                    ) : (
                                      <>
                                        <PauseCircle className="h-4 w-4 mr-2" />
                                        Pause
                                      </>
                                    )}
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteHarvest(product.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "funding" && (
              <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                <CardContent className="p-6">
                  {farmerHarvestCampaigns.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#C89D57] bg-[#FFF8E8] p-10 text-center">
                      <CircleDollarSign className="h-10 w-10 mx-auto text-primary mb-3" />
                      <p className="font-semibold">No funding campaigns yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Launch your first profit-sharing harvest campaign.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => {
                          setActiveSection("create");
                          setCreateMode("funding");
                        }}
                      >
                        Create Funding Campaign
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {farmerHarvestCampaigns.map((campaign) => {
                        const fundingPercent = Math.min(
                          (campaign.fundedAmount / Math.max(campaign.fundingGoal, 1)) * 100,
                          100
                        );

                        const estimatedRevenue =
                          campaign.estimatedYieldKg * campaign.targetSellPricePerKg;

                        const estimatedNetProfit = Math.max(
                          estimatedRevenue - campaign.estimatedProductionCost,
                          0
                        );

                        return (
                          <div
                            key={campaign.id}
                            className="rounded-[26px] border-[2px] border-[#E8D7B5] bg-white p-4 shadow-sm"
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-lg font-semibold">{campaign.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {campaign.location} • {campaign.cropType}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${getCampaignStatusClass(
                                    campaign.status
                                  )}`}
                                >
                                  {campaign.status}
                                </span>
                              </div>

                              <p className="text-sm text-muted-foreground">
                                {campaign.description || "No description provided."}
                              </p>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">Funding Goal</p>
                                  <p className="font-semibold mt-1">
                                    ₱{campaign.fundingGoal.toLocaleString()}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">Funded</p>
                                  <p className="font-semibold mt-1">
                                    ₱{campaign.fundedAmount.toLocaleString()}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">Min Investment</p>
                                  <p className="font-semibold mt-1">
                                    ₱{campaign.minimumInvestment.toLocaleString()}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">Investors</p>
                                  <p className="font-semibold mt-1">{campaign.investors.length}</p>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                  <span>Funding progress</span>
                                  <span>{fundingPercent.toFixed(0)}%</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-[#F0E6D2] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${fundingPercent}%` }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                <div className="rounded-2xl bg-[#F7F8F3] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">Expected Yield</p>
                                  <p className="font-semibold mt-1">
                                    {campaign.estimatedYieldKg.toLocaleString()} kg
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#F7F8F3] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">Target Revenue</p>
                                  <p className="font-semibold mt-1">
                                    ₱{estimatedRevenue.toLocaleString()}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#F7F8F3] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">Est. Net Profit</p>
                                  <p className="font-semibold mt-1">
                                    ₱{estimatedNetProfit.toLocaleString()}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#F7F8F3] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">Profit Split</p>
                                  <p className="font-semibold mt-1">
                                    {campaign.profitShareFarmer}% / {campaign.profitShareInvestors}%
                                  </p>
                                </div>
                              </div>

                              {campaign.status === "sold" && (
                                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 space-y-3">
                                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                                    <CheckCircle className="h-4 w-4" />
                                    Settlement Summary
                                  </div>

                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                    <div className="rounded-2xl bg-white px-3 py-3">
                                      <p className="text-[11px] text-muted-foreground">Actual Yield</p>
                                      <p className="font-semibold mt-1">
                                        {(campaign.actualYieldKg ?? 0).toLocaleString()} kg
                                      </p>
                                    </div>

                                    <div className="rounded-2xl bg-white px-3 py-3">
                                      <p className="text-[11px] text-muted-foreground">Revenue</p>
                                      <p className="font-semibold mt-1">
                                        ₱{Number(campaign.totalRevenue ?? 0).toLocaleString()}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl bg-white px-3 py-3">
                                      <p className="text-[11px] text-muted-foreground">Net Profit</p>
                                      <p className="font-semibold mt-1">
                                        ₱{Number(campaign.netProfit ?? 0).toLocaleString()}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl bg-white px-3 py-3">
                                      <p className="text-[11px] text-muted-foreground">Settled At</p>
                                      <p className="font-semibold mt-1">
                                        {campaign.settledAt
                                          ? new Date(campaign.settledAt).toLocaleDateString()
                                          : "—"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-2xl bg-[#F7F8F3] px-3 py-3">
                                      <p className="text-[11px] text-muted-foreground">Investor Pool (40%)</p>
                                      <p className="font-semibold mt-1">
                                        ₱{Number(campaign.investorProfitPool ?? 0).toLocaleString()}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                      <p className="text-[11px] text-muted-foreground">Farmer Share (60%)</p>
                                      <p className="font-semibold mt-1">
                                        ₱{Number(campaign.farmerProfit ?? 0).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Expected Harvest
                                  </div>
                                  <p className="font-semibold mt-1">
                                    {campaign.expectedHarvestDate}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">
                                    Remaining Need
                                  </p>
                                  <p className="font-semibold mt-1">
                                    ₱
                                    {Math.max(
                                      campaign.fundingGoal - campaign.fundedAmount,
                                      0
                                    ).toLocaleString()}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">
                                    Farmer Share
                                  </p>
                                  <p className="font-semibold mt-1">
                                    {campaign.profitShareFarmer}%
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#FFF8E8] px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">
                                    Investor Share
                                  </p>
                                  <p className="font-semibold mt-1">
                                    {campaign.profitShareInvestors}%
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {campaign.status === "funding" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      updateHarvestCampaign(campaign.id, { status: "growing" });
                                      toast({
                                        title: "Campaign updated",
                                        description: "Campaign marked as growing.",
                                      });
                                    }}
                                  >
                                    <Sprout className="h-4 w-4 mr-2" />
                                    Mark Growing
                                  </Button>
                                )}

                                {campaign.status === "growing" && !campaign.linkedProductId && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openHarvestModal(campaign)}
                                    >
                                      <Archive className="h-4 w-4 mr-2" />
                                      Harvest & List
                                    </Button>
                                  )}

                                {campaign.status === "harvested" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openSettlementModal(campaign)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Settle Campaign
                                  </Button>
                                )}

                                <div className="flex flex-wrap gap-2">
                                

                                {campaign.status === "growing" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      updateHarvestCampaign(campaign.id, { status: "harvested" });
                                      toast({
                                        title: "Campaign updated",
                                        description: "Campaign marked as harvested.",
                                      });
                                    }}
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Mark Harvested
                                  </Button>
                                )}

                                {campaign.status === "harvested" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openSettlementModal(campaign)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Settle Campaign
                                  </Button>
                                )}

                                {campaign.status !== "sold" && campaign.status !== "cancelled" && (
                                  campaign.investors.length > 0 || campaign.fundedAmount > 0 ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => cancelHarvestCampaign(campaign.id)}
                                      className="text-orange-600 hover:text-orange-700"
                                    >
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      Cancel & Refund
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deleteHarvestCampaign(campaign.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </Button>
                                  )
                                )}
                              </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "orders" && (
              <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Incoming Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {farmerOrders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#C89D57] bg-[#FFF8E8] p-8 text-center">
                      <p className="text-sm font-semibold">No incoming orders yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Orders paid by buyers will appear here and can be managed by the farmer.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {farmerOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-[26px] border-[2px] border-[#E8D7B5] bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-20 w-20 rounded-2xl overflow-hidden border border-[#E8D7B5] bg-muted shrink-0">
                              <Image
                                src={order.imageUrl || "https://picsum.photos/seed/rice-order/200/200"}
                                alt={order.productName || "Ordered product"}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold">
                                    {order.productName || "Rice Order"}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Order ID: {order.id}
                                  </p>
                                </div>

                                <div className="text-left sm:text-right">
                                  <p className="text-lg font-bold">
                                    ₱{Number(order.totalAmount || 0).toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {order.quantity} kg
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getOrderStatusClass(
                                    order.orderStatus
                                  )}`}
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {order.orderStatus || "pending"}
                                </span>

                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getPayoutStatusClass(
                                    order.payoutStatus || order.escrowStatus
                                  )}`}
                                >
                                  <PhilippinePeso className="h-3 w-3 mr-1" />
                                  {order.payoutStatus || order.escrowStatus || "not_paid"}
                                </span>
                              </div>

                              <p className="mt-3 text-xs text-muted-foreground">
                                Buyer: {order.buyerName || "Marketplace Buyer"}
                                {" • "}
                                {order.buyerWallet
                                  ? shortAddress(order.buyerWallet)
                                  : "Wallet payment"}
                                {order.createdAt && (
                                  <>
                                    {" • "}
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </>
                                )}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {(order.orderStatus === "paid" ||
                                  order.orderStatus === "pending" ||
                                  !order.orderStatus) && (
                                  <Button type="button" size="sm" onClick={() => acceptOrder(order.id)}>
                                    <BadgeCheck className="h-4 w-4 mr-2" />
                                    Accept Order
                                  </Button>
                                )}

                                {order.orderStatus === "accepted" && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markInTransit(order.id)}
                                  >
                                    <Truck className="h-4 w-4 mr-2" />
                                    Mark In Transit
                                  </Button>
                                )}

                                {order.orderStatus === "in_transit" && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markDelivered(order.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Delivered
                                  </Button>
                                )}

                                {(order.orderStatus === "delivered" ||
                                  order.orderStatus === "completed") && (
                                  <div className="inline-flex items-center text-sm text-green-600 font-medium">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Completed and payout released
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "analytics" && (
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Total Revenue</span>
                        <CircleDollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">All recorded farmer orders</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Total Orders</span>
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">{totalOrdersCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {deliveredOrdersCount} delivered successfully
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Total KG Sold</span>
                        <Archive className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">{totalKgSold.toLocaleString()} kg</p>
                      <p className="text-xs text-muted-foreground mt-1">Combined sold volume</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Funding Raised</span>
                        <ArrowUpRight className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">
                        ₱{totalFundedAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Out of ₱{totalFundingGoal.toLocaleString()} total campaign goals
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-5">
                  <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Order Status Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Paid</span>
                        <span className="font-semibold">{paidOrdersCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Accepted</span>
                        <span className="font-semibold">{acceptedOrdersCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">In Transit</span>
                        <span className="font-semibold">{inTransitOrdersCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Delivered</span>
                        <span className="font-semibold">{deliveredOrdersCount}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <PhilippinePeso className="h-5 w-5 text-primary" />
                        Wallet Payout Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Escrow Held</span>
                        <span className="font-semibold">
                          ₱{heldEscrowAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Released</span>
                        <span className="font-semibold text-green-600">
                          ₱{releasedPayoutAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Unpaid / Pending</span>
                        <span className="font-semibold">₱{unpaidAmount.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Best-Selling Harvests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bestSellingHarvests.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#C89D57] bg-[#FFF8E8] p-6 text-center">
                        <p className="text-sm font-medium">No sales data yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Once buyers place orders, your top-performing harvests will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bestSellingHarvests.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8D7B5] p-4"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-14 w-14 rounded-xl overflow-hidden border border-[#E8D7B5] bg-muted shrink-0">
                                <Image
                                  src={
                                    product.imageUrl ||
                                    "https://picsum.photos/seed/rice-best/200/200"
                                  }
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.orderCount} orders
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="font-semibold">
                                {product.soldKg.toLocaleString()} kg sold
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ₱{product.revenue.toLocaleString()} revenue
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      Inventory Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-[#FFF8E8] p-4">
                        <p className="text-xs text-muted-foreground">Active Listings</p>
                        <p className="mt-1 text-xl font-bold">{activeProductsCount}</p>
                      </div>
                      <div className="rounded-2xl bg-[#FFF8E8] p-4">
                        <p className="text-xs text-muted-foreground">Paused Listings</p>
                        <p className="mt-1 text-xl font-bold">{pausedProductsCount}</p>
                      </div>
                      <div className="rounded-2xl bg-[#FFF8E8] p-4">
                        <p className="text-xs text-muted-foreground">Sold Out</p>
                        <p className="mt-1 text-xl font-bold">{soldOutProductsCount}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#F7F8F3] p-4">
                        <p className="text-xs text-muted-foreground">Funding Campaigns</p>
                        <p className="mt-1 text-xl font-bold">{farmerHarvestCampaigns.length}</p>
                      </div>
                      <div className="rounded-2xl bg-[#F7F8F3] p-4">
                        <p className="text-xs text-muted-foreground">Capital Raised</p>
                        <p className="mt-1 text-xl font-bold">
                          ₱{totalFundedAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-3">Low Stock Harvests</p>
                      {lowStockProducts.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No low-stock listings right now.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {lowStockProducts.slice(0, 4).map((product) => (
                            <div
                              key={product.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="truncate pr-3">{product.name}</span>
                              <span className="font-medium">
                                {(product.availableQuantity ?? product.quantity ?? 0).toLocaleString()}{" "}
                                kg
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-5">
            <PriceSuggester productName={formData.name} location={formData.location} />

            <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Today in Your Stall
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Active Listings</span>
                  <span className="font-bold">{activeListingsCount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Funding Campaigns</span>
                  <span className="font-bold">{activeFundingCampaignsCount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pending Orders</span>
                  <span className="font-bold">{pendingOrdersCount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Earnings (MTD)</span>
                  <span className="font-bold text-primary">₱{earningsMTD.toLocaleString()}</span>
                </div>

                <div className="pt-2 border-t space-y-2 text-xs text-muted-foreground">
                  <p>• Keep photos bright and clear</p>
                  <p>• Update stock once orders are fulfilled</p>
                  <p>• Funding campaigns should show realistic costs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white border-[3px] border-[#C89D57] shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="font-semibold text-lg">Edit Harvest</h3>
                <p className="text-sm text-muted-foreground">Update your listing details.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₱/kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Available Quantity (kg)</Label>
                  <Input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Harvest Date</Label>
                <Input
                  type="date"
                  value={editForm.harvestDate}
                  onChange={(e) => setEditForm({ ...editForm, harvestDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="polished">Polished Rice</option>
                  <option value="unpolished">Unpolished Rice</option>
                  <option value="seeds">Seeds & Seedlings</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  className="min-h-[100px]"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button onClick={saveEditedHarvest}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {harvestingCampaign && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-[28px] bg-white border-[3px] border-[#C89D57] shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h3 className="font-semibold text-lg">Harvest & List Campaign</h3>
              <p className="text-sm text-muted-foreground">
                Convert this funded campaign into a real marketplace product.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setHarvestingCampaign(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-2xl bg-[#FFF8E8] border border-[#E8D7B5] px-4 py-3">
              <p className="font-medium">{harvestingCampaign.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {harvestingCampaign.location} • {harvestingCampaign.cropType}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Actual Harvested Yield (kg)</Label>
                <Input
                  type="number"
                  value={settlementForm.actualYieldKg}
                  onChange={(e) =>
                    setSettlementForm({
                      ...settlementForm,
                      actualYieldKg: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Listing Price (₱/kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settlementForm.actualSellPricePerKg}
                  onChange={(e) =>
                    setSettlementForm({
                      ...settlementForm,
                      actualSellPricePerKg: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Actual Production Cost (₱)</Label>
              <Input
                type="number"
                value={settlementForm.actualProductionCost}
                onChange={(e) =>
                  setSettlementForm({
                    ...settlementForm,
                    actualProductionCost: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setHarvestingCampaign(null)}>
              Cancel
            </Button>
            <Button onClick={createProductFromCampaign}>Create Listing</Button>
          </div>
        </div>
      </div>
    )}

      {settlingCampaign && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-[28px] bg-white border-[3px] border-[#C89D57] shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h3 className="font-semibold text-lg">Settle Campaign</h3>
              <p className="text-sm text-muted-foreground">
                Record actual sales and calculate final profit sharing.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSettlingCampaign(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-2xl bg-[#FFF8E8] border border-[#E8D7B5] px-4 py-3">
              <p className="font-medium">{settlingCampaign.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {settlingCampaign.location} • {settlingCampaign.cropType}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Actual Yield (kg)</Label>
                <Input
                  type="number"
                  value={settlementForm.actualYieldKg}
                  onChange={(e) =>
                    setSettlementForm({
                      ...settlementForm,
                      actualYieldKg: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Actual Sell Price (₱/kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settlementForm.actualSellPricePerKg}
                  onChange={(e) =>
                    setSettlementForm({
                      ...settlementForm,
                      actualSellPricePerKg: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Actual Production Cost (₱)</Label>
              <Input
                type="number"
                value={settlementForm.actualProductionCost}
                onChange={(e) =>
                  setSettlementForm({
                    ...settlementForm,
                    actualProductionCost: e.target.value,
                  })
                }
              />
            </div>

            {Number(settlementForm.actualYieldKg) > 0 &&
              Number(settlementForm.actualSellPricePerKg) > 0 &&
              Number(settlementForm.actualProductionCost) > 0 && (
                <div className="rounded-2xl border border-[#E8D7B5] bg-[#F7F8F3] p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-semibold">
                      ₱
                      {(
                        Number(settlementForm.actualYieldKg) *
                        Number(settlementForm.actualSellPricePerKg)
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Net Profit</span>
                    <span className="font-semibold">
                      ₱
                      {Math.max(
                        Number(settlementForm.actualYieldKg) *
                          Number(settlementForm.actualSellPricePerKg) -
                          Number(settlementForm.actualProductionCost),
                        0
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Investor Pool (40%)</span>
                    <span className="font-semibold">
                      ₱
                      {(
                        Math.max(
                          Number(settlementForm.actualYieldKg) *
                            Number(settlementForm.actualSellPricePerKg) -
                            Number(settlementForm.actualProductionCost),
                          0
                        ) * 0.4
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Farmer Share (60%)</span>
                    <span className="font-semibold text-primary">
                      ₱
                      {(
                        Math.max(
                          Number(settlementForm.actualYieldKg) *
                            Number(settlementForm.actualSellPricePerKg) -
                            Number(settlementForm.actualProductionCost),
                          0
                        ) * 0.6
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSettlingCampaign(null)}>
              Cancel
            </Button>
            <Button onClick={handleSettleCampaign}>Save Settlement</Button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}