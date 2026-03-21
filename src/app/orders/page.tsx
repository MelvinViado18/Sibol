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

  if (isWalletConnected === null) return null;

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-[#F6EEDC] text-[#3C2A18]">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <div className="rounded-xl border bg-card p-8 text-center">
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
      <div className="flex min-h-screen items-center justify-center bg-[#F6EEDC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2E6C3C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6EEDC] text-[#3C2A18]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-2 text-3xl font-black text-[#2F1F10]">My Orders</h1>
          <p className="mb-6 text-[#7A6547]">
            Track your escrow payments and delivery progress
          </p>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {FILTERS.map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className={`capitalize whitespace-nowrap ${
                  filter === status
                    ? "bg-[#2E6C3C] text-white hover:bg-[#285D35]"
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

          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const StatusIcon = config.icon;
                const items = order.items || (order.item ? [order.item] : []);

                return (
                  <Card
                    key={order.id}
                    className="rounded-[26px] border-[2px] border-[#D7C29B] bg-[#FFF9EC] shadow-sm"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                        <div>
                          <p className="text-sm text-[#7A6547]">Order #{order.id}</p>
                          <p className="text-xs text-[#8B6A45]">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>

                        <Badge className={`${config.color} border-0`}>
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
                              className="flex gap-3"
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
                                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#2E6C3C]">
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
                          <p className="text-xl font-black text-[#2E6C3C]">
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
                          <Truck className="h-4 w-4 text-[#2E6C3C]" />
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
            <div className="py-12 text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-[#8B6A45]" />
              <h3 className="text-xl font-black text-[#2F1F10]">No orders found</h3>
              <p className="mt-1 text-[#7A6547]">
                You haven’t placed any orders yet.
              </p>
              <Button
                asChild
                className="mt-4 bg-[#2E6C3C] text-white hover:bg-[#285D35]"
              >
                <Link href="/market">Start Shopping</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}