"use client";

import { useState } from "react";
import { suggestMarketPriceForFarmer, type SuggestMarketPriceForFarmerOutput } from "@/ai/flows/market-price-suggester";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, TrendingUp, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PriceSuggester({ productName, location }: { productName: string, location: string }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestMarketPriceForFarmerOutput | null>(null);
  const [quantity, setQuantity] = useState(1000);
  const { toast } = useToast();

  const handleSuggest = async () => {
    if (!productName || !location) {
      toast({
        title: "Missing Information",
        description: "Please provide a product name and location first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await suggestMarketPriceForFarmer({
        productName,
        quantityKg: quantity,
        location,
        harvestDate: new Date().toISOString(),
        currentMarketDemand: "moderate"
      });
      setSuggestion(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Suggestion Failed",
        description: "We couldn't get a price suggestion right now. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-inner">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Price Suggester
        </CardTitle>
        <CardDescription>
          Get data-driven pricing recommendations based on current market trends on Base.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="quantity-suggest" className="text-xs">Quantity for analysis (kg)</Label>
          <div className="flex gap-2">
            <Input 
              id="quantity-suggest" 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
              className="bg-white h-9"
            />
            <Button 
              size="sm" 
              onClick={handleSuggest} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suggest Price"}
            </Button>
          </div>
        </div>

        {suggestion && (
          <div className="p-4 bg-white rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Optimal Price:</span>
              <span className="text-xl font-bold text-primary flex items-center">
                ₱{suggestion.suggestedPricePerKg.toFixed(2)}/kg
                <TrendingUp className="h-4 w-4 ml-1" />
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  {suggestion.reasoning}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}