"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  LayoutDashboard, 
  TrendingUp,
  ShoppingCart,
  Leaf,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      title: "Marketplace",
      description: "Browse and buy fresh rice directly from farmers",
      icon: ShoppingBag,
      href: "/market",
      color: "bg-blue-500",
      badge: "Shop Now"
    },
    {
      title: "My Orders",
      description: "Track your orders and view purchase history",
      icon: Package,
      href: "/orders",
      color: "bg-green-500",
      badge: "View Orders"
    },
    {
      title: "Farmer Portal",
      description: "List your harvest and manage your products",
      icon: Leaf,
      href: "/farmer",
      color: "bg-emerald-500",
      badge: "Manage Products"
    },
    {
      title: "Logistics Portal",
      description: "Manage deliveries and track shipments",
      icon: Truck,
      href: "/logistics",
      color: "bg-purple-500",
      badge: "Track Deliveries"
    },
    {
      title: "Analytics",
      description: "View sales data and market trends",
      icon: TrendingUp,
      href: "/analytics",
      color: "bg-orange-500",
      badge: "Coming Soon"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Access all SibolMarket features from one dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Leaf className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Deliveries</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Truck className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">₱12,450</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Grid */}
        <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} bg-opacity-10 flex items-center justify-center mb-3`}>
                    <feature.icon className={`h-6 w-6 ${feature.color.replace("bg-", "text-")}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:underline">
                    {feature.badge}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { action: "You placed an order for Dinorado Rice", time: "2 hours ago", status: "completed" },
                  { action: "You created a new listing for Jasmine Rice", time: "1 day ago", status: "pending" },
                  { action: "Your delivery from Nueva Ecija is in transit", time: "2 days ago", status: "in-progress" },
                  { action: "Order #12345 was delivered", time: "3 days ago", status: "completed" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      activity.status === "completed" ? "bg-green-100 text-green-800" :
                      activity.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {activity.status === "completed" ? "Completed" :
                       activity.status === "pending" ? "Pending" : "In Progress"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}