"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  Sprout,
  CheckCircle,
  Clock,
  MapPin,
  CalendarDays,
  PhilippinePeso,
} from "lucide-react";
import {
  getCurrentUser,
  getHarvestCampaigns,
  getInvestmentRecords,
  getInvestorPayout,
  type HarvestCampaign,
  type InvestmentRecord,
} from "@/lib/investment-utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusClass(status?: string) {
  switch (status) {
    case "funding":
      return "bg-blue-100 text-blue-700";
    case "growing":
      return "bg-green-100 text-green-700";
    case "harvested":
      return "bg-amber-100 text-amber-700";
    case "sold":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function InvestmentsPage() {
  const [campaigns, setCampaigns] = useState<HarvestCampaign[]>([]);
  const [records, setRecords] = useState<InvestmentRecord[]>([]);

  useEffect(() => {
    const loadData = () => {
      setCampaigns(getHarvestCampaigns());
      setRecords(getInvestmentRecords());
    };

    loadData();

    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const currentUser = getCurrentUser();

  const myInvestments = useMemo(() => {
    if (!currentUser) return [];

    const myRecords = records.filter((record) => record.userId === currentUser.id);

    const grouped = myRecords.reduce<Record<string, InvestmentRecord[]>>((acc, record) => {
      if (!acc[record.harvestId]) acc[record.harvestId] = [];
      acc[record.harvestId].push(record);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([harvestId, investmentRecords]) => {
        const campaign = campaigns.find((item) => item.id === harvestId);
        if (!campaign) return null;

        const totalInvested = investmentRecords.reduce(
          (sum, record) => sum + record.amount,
          0
        );

        const payout = getInvestorPayout(campaign, currentUser.id);

        return {
          campaign,
          records: investmentRecords,
          totalInvested,
          investmentCount: investmentRecords.length,
          payout,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a?.campaign.createdAt
          ? new Date(a.campaign.createdAt).getTime()
          : 0;
        const bTime = b?.campaign.createdAt
          ? new Date(b.campaign.createdAt).getTime()
          : 0;
        return bTime - aTime;
      });
  }, [campaigns, records, currentUser]);

  const totalInvestedAmount = myInvestments.reduce(
    (sum, item) => sum + (item?.totalInvested || 0),
    0
  );

  const totalProfitEarned = myInvestments.reduce(
    (sum, item) => sum + (item?.payout.profitEarned || 0),
    0
  );

  const totalPayoutValue = myInvestments.reduce(
    (sum, item) => sum + (item?.payout.totalPayout || 0),
    0
  );

  function handleConvertToRice(campaign: HarvestCampaign, payout: any) {
    const riceKg = payout.totalPayout / (campaign.targetSellPricePerKg || 40);

    alert(
        `You can convert your payout into approximately ${riceKg.toFixed(
        2
        )} kg of rice.\n\n(This is a prototype simulation)`
    );
    }

  return (
    <div className="min-h-screen bg-[#F6EEDC] text-[#3B2817]">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md overflow-hidden">
          <div className="h-8 bg-[repeating-linear-gradient(90deg,#2E6C3C_0px,#2E6C3C_28px,#F7EED8_28px,#F7EED8_56px)] border-b-[3px] border-[#8A5A2B]" />
          <div className="p-6">
            <h1 className="text-3xl font-bold">My Investments</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Track your harvest funding, campaign progress, and final payouts from
              Sibol’s profit-sharing model.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Total Invested</span>
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalInvestedAmount)}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Profit Earned</span>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalProfitEarned)}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Total Payout Value</span>
                <PhilippinePeso className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalPayoutValue)}</p>
            </CardContent>
          </Card>
        </div>

        {myInvestments.length === 0 ? (
          <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
            <CardContent className="p-10 text-center">
              <Sprout className="mx-auto h-10 w-10 text-primary mb-3" />
              <h2 className="text-xl font-semibold">No investments yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Once you fund a harvest campaign, it will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myInvestments.map((item) => {
              if (!item) return null;

              const { campaign, totalInvested, investmentCount, payout } = item;
              const sharePercent = payout.shareRatio * 100;

              return (
                <Card
                  key={campaign.id}
                  className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-[220px_1fr]">
                      <div className="h-56 lg:h-full bg-[#EAD9B8]">
                        <img
                          src={campaign.coverImage}
                          alt={campaign.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                                  campaign.status
                                )}`}
                              >
                                {campaign.status}
                              </span>

                              <span className="rounded-full bg-[#E9F6E5] px-3 py-1 text-xs font-bold text-[#2E6C3C]">
                                {campaign.cropType}
                              </span>
                            </div>

                            <h2 className="text-xl font-bold">{campaign.title}</h2>

                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {campaign.location}
                              </span>

                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                {campaign.expectedHarvestDate}
                              </span>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-sm text-muted-foreground">Your invested amount</p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(totalInvested)}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                          <div className="rounded-2xl bg-[#FFF8E8] p-3">
                            <p className="text-[11px] text-muted-foreground">Investments Made</p>
                            <p className="mt-1 font-semibold">{investmentCount}</p>
                          </div>

                          <div className="rounded-2xl bg-[#FFF8E8] p-3">
                            <p className="text-[11px] text-muted-foreground">Your Share</p>
                            <p className="mt-1 font-semibold">{sharePercent.toFixed(2)}%</p>
                          </div>

                          <div className="rounded-2xl bg-[#FFF8E8] p-3">
                            <p className="text-[11px] text-muted-foreground">Profit Earned</p>
                            <p
                            className={`mt-1 font-semibold ${
                                payout.profitEarned > 0 ? "text-green-600" : "text-slate-700"
                            }`}
                            >
                            {formatCurrency(payout.profitEarned)}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#FFF8E8] p-3">
                            <p className="text-[11px] text-muted-foreground">Total Payout</p>
                            <p className="mt-1 font-semibold">
                              {formatCurrency(payout.totalPayout)}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-[#FFF8E8] p-3">
                            <p className="text-[11px] text-muted-foreground">ROI</p>
                            <p className="mt-1 font-semibold">
                                {totalInvested > 0
                                ? ((payout.profitEarned / totalInvested) * 100).toFixed(2)
                                : 0}
                                %
                            </p>
                            </div>

                        <div className="rounded-2xl border border-[#E8D7B5] bg-[#F7F8F3] p-4 text-sm">
                          {campaign.status === "sold" ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 font-semibold text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                Settlement Complete
                              </div>
                              <div className="grid sm:grid-cols-3 gap-3">
                                <div>
                                  <p className="text-muted-foreground">Campaign Revenue</p>
                                  <p className="font-semibold">
                                    {formatCurrency(campaign.totalRevenue ?? 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Investor Pool</p>
                                  <p className="font-semibold">
                                    {formatCurrency(campaign.investorProfitPool ?? 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Your Final Payout</p>
                                  <p className="font-semibold">
                                    {formatCurrency(payout.totalPayout)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-700">
                              <Clock className="h-4 w-4" />
                              Campaign not settled yet. Final payout will appear after the
                              farmer records the actual sale and production cost.
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline">View Campaign</Button>

                            {campaign.status === "sold" && payout.totalPayout > 0 && (
                                <Button
                                className="bg-[#2E6C3C] hover:bg-[#245730] text-white"
                                onClick={() => handleConvertToRice(campaign, payout)}
                                >
                                🌾 Convert to Rice
                                </Button>
                            )}
                            </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}