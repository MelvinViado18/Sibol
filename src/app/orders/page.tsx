"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Eye,
  ChevronRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";

const ORDERS_STORAGE_KEY = "sibol_orders";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: Package },
  in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadOrders = () => {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
      setLoading(false);
    };
    
    loadOrders();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredOrders = orders.filter((order: any) => 
    filter === "all" || order.status === filter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground mb-6">Track and manage your orders</p>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {["all", "pending", "in_transit", "delivered"].map(status => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status === "all" ? "All Orders" : 
                 status === "in_transit" ? "In Transit" : status}
              </Button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order: any) => {
                const StatusIcon = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.icon || Package;
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.color || "bg-gray-100"}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.label || order.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity}kg x ₱{item.price}/kg
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">₱{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t mt-4 pt-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-xl font-bold text-primary">₱{order.total}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>

                      {/* Tracking Info */}
                      <div className="bg-gray-50 rounded-lg p-3 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-primary" />
                          <span className="font-medium">Tracking:</span>
                          {order.status === "delivered" ? (
                            <span>Delivered on {new Date(order.updatedAt || order.date).toLocaleDateString()}</span>
                          ) : order.status === "in_transit" ? (
                            <span>Estimated delivery: 2-3 days</span>
                          ) : (
                            <span>Order confirmed, waiting for pickup</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-xl font-bold">No orders found</h3>
              <p className="text-muted-foreground mt-1">
                You haven't placed any orders yet
              </p>
              <Button asChild className="mt-4">
                <Link href="/market">Start Shopping</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}