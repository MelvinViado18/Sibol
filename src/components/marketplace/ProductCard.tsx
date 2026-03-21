import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  Star, 
  TrendingUp, 
  Truck, 
  Shield,
  Heart,
  ShoppingCart
} from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  location: string;
  harvestDate: string;
  rating: number;
  reviews?: number;
  imageUrl: string;
  isPooled?: boolean;
  farmer?: string;
  farmerRating?: number;
  badge?: string;
  viewMode?: "grid" | "list";
  sold?: number;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  quantity,
  location,
  harvestDate,
  rating,
  reviews = 0,
  imageUrl,
  isPooled = false,
  farmer,
  farmerRating,
  badge,
  viewMode = "grid",
  sold,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-48">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
            />
            {badge && (
              <Badge className="absolute top-2 left-2 bg-primary text-white">
                {badge === "best-seller" && "🏆 Best Seller"}
                {badge === "featured" && "⭐ Featured"}
                {badge === "new" && "🆕 New"}
                {badge === "organic" && "🌱 Organic"}
                {badge === "limited" && "🔹 Limited"}
                {badge === "value" && "💰 Value"}
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                -{discount}%
              </Badge>
            )}
          </div>
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg hover:text-primary transition-colors">
                  <Link href={`/market/${id}`}>{name}</Link>
                </h3>
                {farmer && (
                  <p className="text-xs text-muted-foreground mt-1">
                    by {farmer} {farmerRating && `⭐ ${farmerRating}`}
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={isWishlisted ? "text-red-500" : ""}
              >
                <Heart className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium ml-1">{rating}</span>
                <span className="text-xs text-muted-foreground ml-1">({reviews} reviews)</span>
              </div>
              {isPooled && (
                <Badge variant="secondary" className="bg-accent/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Pooled
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {location}</span>
              <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {harvestDate}</span>
              {sold && <span className="flex items-center"><ShoppingCart className="h-3 w-3 mr-1" /> {sold} sold</span>}
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-2xl font-bold text-primary">₱{price}</span>
                <span className="text-xs text-muted-foreground ml-1">/kg</span>
                {originalPrice && (
                  <span className="text-xs text-muted-foreground line-through ml-2">₱{originalPrice}</span>
                )}
                <p className="text-xs text-muted-foreground mt-1">{quantity}kg available</p>
              </div>
              <Button asChild size="sm" className="gap-2">
                {/* CHANGED: Link to checkout instead of market detail */}
                <Link href={`/checkout?id=${id}`}>
                  <ShoppingCart className="h-4 w-4" />
                  Buy Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="overflow-hidden group hover:shadow-xl transition-all duration-300 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Wishlist Button */}
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsWishlisted(!isWishlisted)}
      >
        <Heart className="h-4 w-4" fill={isWishlisted ? "red" : "none"} />
      </Button>
      
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {badge && (
          <Badge className="absolute top-2 left-2 bg-primary text-white">
            {badge === "best-seller" && "🏆 Best Seller"}
            {badge === "featured" && "⭐ Featured"}
            {badge === "new" && "🆕 New"}
            {badge === "organic" && "🌱 Organic"}
            {badge === "limited" && "🔹 Limited"}
            {badge === "value" && "💰 Value"}
          </Badge>
        )}
        {discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
            -{discount}%
          </Badge>
        )}
        {isPooled && (
          <Badge className="absolute bottom-2 left-2 bg-accent text-accent-foreground border-none">
            <TrendingUp className="h-3 w-3 mr-1" /> Pooled Order
          </Badge>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">
            <Link href={`/market/${id}`}>{name}</Link>
          </h3>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-medium ml-1">{rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({reviews})</span>
          {farmer && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">by {farmer.split(' ')[0]}</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-2">
        <div className="flex items-center text-xs text-muted-foreground gap-2 mb-2">
          <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {location.split(',')[0]}</span>
          <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {harvestDate}</span>
        </div>
        <div className="flex justify-between items-baseline mt-1">
          <div>
            <span className="text-2xl font-bold text-primary">₱{price}</span>
            <span className="text-xs text-muted-foreground ml-1">/kg</span>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through ml-2">₱{originalPrice}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{quantity}kg left</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full gap-2 bg-primary hover:bg-primary/90">
          {/* CHANGED: Link to checkout instead of market detail */}
          <Link href={`/checkout?id=${id}`}>
            <ShoppingCart className="h-4 w-4" />
            Buy Now
          </Link>
        </Button>
      </CardFooter>
      
      {/* Free Shipping Badge on Hover */}
      {isHovered && (
        <div className="absolute bottom-20 left-0 right-0 bg-black/80 text-white text-xs py-1 text-center animate-in slide-in-from-bottom-2">
          <Truck className="h-3 w-3 inline mr-1" />
          Free shipping on ₱5,000+
        </div>
      )}
    </Card>
  );
}