import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Star, TrendingUp } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  location: string;
  harvestDate: string;
  rating: number;
  imageUrl: string;
  isPooled?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  quantity,
  location,
  harvestDate,
  rating,
  imageUrl,
  isPooled = false,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all border-border/40">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {isPooled && (
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground border-none">
            <TrendingUp className="h-3 w-3 mr-1" /> Pooled Order
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg leading-none">{name}</h3>
          <div className="flex items-center text-xs text-muted-foreground">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
            {rating.toFixed(1)}
          </div>
        </div>
        <div className="flex items-center text-xs text-muted-foreground gap-3">
          <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {location}</span>
          <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {harvestDate}</span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold text-primary">₱{price}<small className="text-xs font-normal text-muted-foreground ml-1">/kg</small></span>
          <span className="text-sm text-muted-foreground">{quantity}kg available</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link href={`/market/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}