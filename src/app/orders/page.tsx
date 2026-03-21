"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  ChevronRight,
  Loader2,
  Lock,
  Store,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ORDERS_STORAGE_KEY = "sibol_orders";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    icon: any;
    trackingText: (order: any) => string;
  }
> = {
  paid_escrow: {
    label: "Paid in Escrow",
    color: "bg-blue-100 text-blue-800",
    icon: Lock,
    trackingText: () => "Payment secured. Waiting for cooperative confirmation.",
  },
  awaiting_farmer_confirmation: {
    label: "Awaiting Confirmation",
    color: "bg-amber-100 text-amber-800",
    icon: Clock3,
    trackingText: () => "The cooperative is reviewing your order.",
  },
  preparing: {
    label: "Preparing",
    color: "bg-yellow-100 text-yellow-800",
    icon: Package,
    trackingText: () => "Your rice order is being prepared for shipment.",
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
    trackingText: () => "Your order is on the way. Estimated delivery: 2–3 days.",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
    trackingText: (order) =>
      `Delivered on ${new Date(order.updatedAt || order.date).toLocaleDateString()}.`,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
    trackingText: () => "Delivery confirmed and escrow has been released.",
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
    trackingText: () => "There is an issue with this order. Payment remains on hold.",
  },

  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock3,
    trackingText: () => "Your order is pending.",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
    trackingText: () => "Order confirmed and waiting for pickup.",
  },
  in_transit: {
    label: "In Transit",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
    trackingText: () => "Your order is on the way. Estimated delivery: 2–3 days.",
  },
};

const FILTERS = [
  "all",
  "paid_escrow",
  "preparing",
  "shipped",
  "delivered",
  "completed",
];

// WoodSign component for rustic header
function WoodSign({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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

// FarmerBasket Component - Detailed version with crops
function FarmerBasket() {
  return (
    <div className="relative w-44 h-44 flex items-end justify-center">
      {/* 🧺 Basket */}
      <div className="w-40 h-24 bg-gradient-to-br from-[#C68642] via-[#A47148] to-[#8B5A2B] rounded-b-[2rem] rounded-t-xl shadow-xl border border-[#6B4226] relative overflow-hidden">
        {/* weave texture */}
        <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#000_0px,#000_2px,transparent_2px,transparent_6px)]" />
      </div>

      {/* 🧺 Handle */}
      <div className="absolute -top-2 w-32 h-32 border-[6px] border-[#8B5A2B] rounded-full opacity-80" />

      {/* 🌾 CROPS */}
      <div className="absolute bottom-16 flex items-end gap-1">
        {/* 🌿 Leaf cluster */}
        <div className="relative w-10 h-14">
          <div className="absolute bottom-0 left-1 w-6 h-10 bg-gradient-to-t from-green-700 to-green-400 rounded-full rotate-12" />
          <div className="absolute bottom-0 right-1 w-6 h-10 bg-gradient-to-t from-green-600 to-green-300 rounded-full -rotate-12" />
        </div>

        {/* 🍎 Fruit */}
        <div className="relative w-10 h-10">
          <div className="w-10 h-10 bg-gradient-to-br from-red-300 to-red-500 rounded-full shadow-md" />
          <div className="absolute top-1 left-3 w-2 h-2 bg-white/40 rounded-full blur-[1px]" />
          <div className="absolute -top-1 left-4 w-1 h-3 bg-green-700 rounded-full" />
        </div>

        {/* 🌽 Corn */}
        <div className="relative w-8 h-14 flex items-center justify-center">
          <div className="w-5 h-12 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full shadow-sm" />
          <div className="absolute w-6 h-12 border-l-4 border-green-600 rounded-full -rotate-12" />
          <div className="absolute w-6 h-12 border-r-4 border-green-600 rounded-full rotate-12" />
        </div>

        {/* 🥬 Veg blob */}
        <div className="relative w-10 h-10">
          <div className="w-10 h-10 bg-gradient-to-br from-green-200 to-green-500 rounded-[40%] shadow-md" />
          <div className="absolute inset-1 border border-white/20 rounded-[40%]" />
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isWalletConnected, setIsWalletConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const loadOrders = () => {
      try {
        const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders);
          setOrders(Array.isArray(parsed) ? parsed : []);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    const checkWallet = async () => {
      if (!window.ethereum) {
        setIsWalletConnected(false);
        return;
      }

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        setIsWalletConnected(Array.isArray(accounts) && accounts.length > 0);
      } catch (error) {
        console.error("Failed to check wallet:", error);
        setIsWalletConnected(false);
      }
    };

    checkWallet();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) => filter === "all" || order.status === filter
    );
  }, [orders, filter]);

  // Stats for the header
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => 
    !["delivered", "completed", "disputed"].includes(o.status)
  ).length;
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Wait for wallet check to complete
  if (isWalletConnected === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F1E3]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-[#F7F1E3] text-[#3C2A18]">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <div className="rounded-[28px] border-[3px] border-[#C89D57] bg-white p-8 text-center shadow-md">
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="mt-2 text-muted-foreground">
              Connect your wallet first to view your orders.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F1E3]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F7F1E3] flex flex-col overflow-hidden">
      {/* Background Graphics - 5 Farmer Baskets Scattered with one in the middle */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Basket 1 - Top Left */}
        <div className="absolute -left-10 top-10 opacity-20 scale-75 rotate-[-15deg]">
          <FarmerBasket />
        </div>
        
        {/* Basket 2 - Top Right */}
        <div className="absolute -right-10 top-20 opacity-20 scale-75 rotate-[12deg]">
          <FarmerBasket />
        </div>
        
        {/* Basket 3 - Middle Center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 scale-90 rotate-[5deg]">
          <FarmerBasket />
        </div>
        
        {/* Basket 4 - Bottom Right */}
        <div className="absolute -right-16 bottom-20 opacity-20 scale-75 rotate-[10deg]">
          <FarmerBasket />
        </div>
        
        {/* Basket 5 - Bottom Left */}
        <div className="absolute -left-16 bottom-10 opacity-15 scale-65 rotate-[-5deg]">
          <FarmerBasket />
        </div>
      </div>

      <Navbar />

      <main className="relative container mx-auto px-4 py-6 lg:py-8 z-10">
        {/* Header Card */}
        <div className="mb-6 rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md overflow-hidden">
          <div className="h-8 bg-[repeating-linear-gradient(90deg,#2E6C3C_0px,#2E6C3C_28px,#F7EED8_28px,#F7EED8_56px)] border-b-[3px] border-[#8A5A2B]" />
          <div className="p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <WoodSign className="mb-3">My Orders</WoodSign>
                <h1 className="text-3xl font-bold">Order Tracker</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Track your escrow payments, delivery progress, and order history.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
                <div className="rounded-2xl bg-[#F7F8F3] px-4 py-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Total Orders</p>
                  <p className="mt-1 text-xl font-bold">{totalOrders}</p>
                </div>
                <div className="rounded-2xl bg-[#F7F8F3] px-4 py-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Active</p>
                  <p className="mt-1 text-xl font-bold">{activeOrders}</p>
                </div>
                <div className="rounded-2xl bg-[#F7F8F3] px-4 py-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Completed</p>
                  <p className="mt-1 text-xl font-bold">{orders.filter(o => o.status === "delivered" || o.status === "completed").length}</p>
                </div>
                <div className="rounded-2xl bg-[#F7F8F3] px-4 py-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Total Spent</p>
                  <p className="mt-1 text-xl font-bold">₱{totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className={`capitalize whitespace-nowrap rounded-full ${
                filter === status
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-[#D7C29B] bg-white text-[#5E472F] hover:bg-[#F5EEDC]"
              }`}
            >
              {status === "all"
                ? "All Orders"
                : status === "paid_escrow"
                ? "Paid in Escrow"
                : status}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = config.icon;
              const items = order.items || (order.item ? [order.item] : []);

              return (
                <Card
                  key={order.id}
                  className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md hover:shadow-lg transition-all"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="text-sm text-[#7A6547]">Order #{order.id}</p>
                        <p className="text-xs text-[#8B6A45]">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>

                      <Badge className={`${config.color} border-0 px-3 py-1`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {items.map((item: any, index: number) => {
                        const itemImage =
                          item?.imageUrl?.trim() ? item.imageUrl : "/sibolLogo.png";

                        const itemQuantity = item.quantity ?? order.quantity ?? 0;

                        return (
                          <div
                            key={`${item.id || "item"}-${index}`}
                            className="flex gap-3 p-3 bg-[#FFF8E8] rounded-2xl"
                          >
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[#D7C29B] bg-[#FFFDF7]">
                              <Image
                                src={itemImage}
                                alt={item.name || "Product image"}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1">
                              <p className="font-bold text-[#2F1F10]">{item.name}</p>
                              <p className="text-sm text-[#7A6547]">
                                {itemQuantity}kg × ₱{item.price}/kg
                              </p>
                              {item.farmer && (
                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
                                  <Store className="h-3 w-3" />
                                  {item.farmer}
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="font-black text-[#7A4A14]">
                                ₱{(item.price * itemQuantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E4D3B1] pt-4">
                      <div>
                        <p className="text-sm text-[#7A6547]">Total</p>
                        <p className="text-xl font-black text-primary">
                          ₱{Number(order.total || 0).toLocaleString()}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-[#D7C29B] bg-white text-[#5E472F] hover:bg-[#F5EEDC]"
                      >
                        <Link href={`/orders/${order.id}`}>
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    <div className="mt-4 rounded-lg border border-[#E4D3B1] bg-[#FFFDF7] p-3">
                      <div className="flex items-center gap-2 text-sm text-[#5E472F]">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="font-bold">Tracking:</span>
                        <span>{config.trackingText(order)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
            <CardContent className="p-12 text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-[#8B6A45]" />
              <h3 className="text-xl font-black text-[#2F1F10]">No orders found</h3>
              <p className="mt-1 text-[#7A6547]">
                You haven't placed any orders yet.
              </p>
              <Button
                asChild
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/market">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}