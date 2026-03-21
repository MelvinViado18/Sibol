import { updateWalletBalance } from "@/lib/wallet-utils";

export const HARVESTS_STORAGE_KEY = "sibol_harvests";
export const INVESTMENTS_STORAGE_KEY = "sibol_investments";
export const CURRENT_USER_KEY = "sibol_current_user";

export type HarvestStatus = "funding" | "growing" | "harvested" | "sold";

export type HarvestInvestor = {
  userId: string;
  userName: string;
  amount: number;
};

export type HarvestCampaign = {
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

  actualYieldKg?: number;
  actualSellPricePerKg?: number;
  actualProductionCost?: number;
  totalRevenue?: number;
  netProfit?: number;
  investorProfitPool?: number;
  farmerProfit?: number;
  settledAt?: string;
};

export type InvestmentRecord = {
  id: string;
  harvestId: string;
  userId: string;
  userName: string;
  amount: number;
  createdAt: string;
};

export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);

    if (!raw) {
      return {
        id: "demo-investor-001",
        name: "Demo Investor",
      };
    }

    const parsed = JSON.parse(raw);

    return {
      id: parsed.id || parsed.userId || parsed.email || "demo-investor-001",
      name: parsed.name || parsed.fullName || "Demo Investor",
    };
  } catch {
    return {
      id: "demo-investor-001",
      name: "Demo Investor",
    };
  }
}

export function getHarvestCampaigns(): HarvestCampaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HARVESTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHarvestCampaigns(campaigns: HarvestCampaign[]) {
  localStorage.setItem(HARVESTS_STORAGE_KEY, JSON.stringify(campaigns));
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: HARVESTS_STORAGE_KEY,
      newValue: JSON.stringify(campaigns),
    })
  );
}

export function getInvestmentRecords(): InvestmentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INVESTMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInvestmentRecords(records: InvestmentRecord[]) {
  localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: INVESTMENTS_STORAGE_KEY,
      newValue: JSON.stringify(records),
    })
  );
}

export function investInHarvest(harvestId: string, amount: number) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("No user found.");
  }

  const campaigns = getHarvestCampaigns();
  const records = getInvestmentRecords();

  updateWalletBalance(currentUser.id, -amount);

  const campaign = campaigns.find((item) => item.id === harvestId);
  if (!campaign) {
    throw new Error("Campaign not found.");
  }

  if (campaign.status !== "funding") {
    throw new Error("This campaign is no longer open for funding.");
  }

  if (amount < campaign.minimumInvestment) {
    throw new Error(
      `Minimum investment is ₱${campaign.minimumInvestment.toLocaleString()}.`
    );
  }

  const remaining = campaign.fundingGoal - campaign.fundedAmount;

  if (amount > remaining) {
    throw new Error(
      `Investment exceeds remaining funding need of ₱${remaining.toLocaleString()}.`
    );
  }

  const updatedCampaigns = campaigns.map((item) => {
    if (item.id !== harvestId) return item;

    const investors = [...item.investors];
    const existingIndex = investors.findIndex(
      (investor) => investor.userId === currentUser.id
    );

    if (existingIndex >= 0) {
      investors[existingIndex] = {
        ...investors[existingIndex],
        amount: investors[existingIndex].amount + amount,
      };
    } else {
      investors.push({
        userId: currentUser.id,
        userName: currentUser.name,
        amount,
      });
    }

    const newFundedAmount = item.fundedAmount + amount;

    return {
      ...item,
      fundedAmount: newFundedAmount,
      investors,
      status: newFundedAmount >= item.fundingGoal ? "growing" : item.status,
    };
  });

  const newRecord: InvestmentRecord = {
    id: crypto.randomUUID(),
    harvestId,
    userId: currentUser.id,
    userName: currentUser.name,
    amount,
    createdAt: new Date().toISOString(),
  };

  saveHarvestCampaigns(updatedCampaigns);
  saveInvestmentRecords([newRecord, ...records]);

  return {
    campaign: updatedCampaigns.find((item) => item.id === harvestId)!,
    record: newRecord,
  };
}

export function getInvestorCampaignShare(
  campaign: HarvestCampaign,
  userId: string
) {
  const totalUserInvestment = campaign.investors
    .filter((investor) => investor.userId === userId)
    .reduce((sum, investor) => sum + investor.amount, 0);

  if (!campaign.fundingGoal || totalUserInvestment <= 0) return 0;

  return totalUserInvestment / campaign.fundingGoal;
}

export function getInvestorPayout(
  campaign: HarvestCampaign,
  userId: string
) {
  const totalUserInvestment = campaign.investors
    .filter((investor) => investor.userId === userId)
    .reduce((sum, investor) => sum + investor.amount, 0);

  if (totalUserInvestment <= 0) {
    return {
      investedAmount: 0,
      shareRatio: 0,
      profitEarned: 0,
      totalPayout: 0,
    };
  }

  const shareRatio = campaign.fundingGoal
    ? totalUserInvestment / campaign.fundingGoal
    : 0;

  const investorProfitPool = campaign.investorProfitPool ?? 0;
  const profitEarned = investorProfitPool * shareRatio;
  const totalPayout = totalUserInvestment + profitEarned;

  return {
    investedAmount: totalUserInvestment,
    shareRatio,
    profitEarned,
    totalPayout,
  };
}