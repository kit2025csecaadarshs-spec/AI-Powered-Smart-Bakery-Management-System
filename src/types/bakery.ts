export interface BakeryItem3D {
  id: string;
  name: string;
  category: 'artisan-bread' | 'viennoiserie' | 'patisserie' | 'equipment';
  meshType: 'sourdough' | 'croissant' | 'macaron' | 'baguette' | 'oven';
  batchCode: string;
  status: 'Fermenting' | 'Proofing' | 'Baking' | 'Cooling' | 'On Display' | 'Sold Out';
  internalTempC: number;
  hydrationPercent: number;
  flourType: string;
  browningLevel: number; // 0 to 1
  price: number;
  stockCount: number;
  bakedAt: string;
  freshnessScore: number; // 0 - 100
  flavorNotes: string[];
}

export interface DeckOvenTelemetry {
  id: string;
  name: string;
  type: 'stone-deck' | 'convection' | 'fermentation-proofer';
  status: 'Baking' | 'Preheating' | 'Ready' | 'Idle' | 'Steam Injection';
  currentTempC: number;
  targetTempC: number;
  bottomDeckTempC?: number;
  humidityPercent: number;
  activeBatch?: {
    item: string;
    batchId: string;
    remainingMinutes: number;
    totalMinutes: number;
    steamApplied: boolean;
  };
  powerKw: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Flour' | 'Dairy' | 'Yeast & Starters' | 'Sugar & Chocolate' | 'Packaging';
  stockKg: number;
  minimumThresholdKg: number;
  unitCost: number;
  supplier: string;
  status: 'Optimal' | 'Low' | 'Critical';
}

export interface OrderItem {
  id: string;
  customerName: string;
  type: 'Walk-in Retail' | 'Custom Cake' | 'Café Wholesale';
  itemsSummary: string;
  totalPrice: number;
  pickupTime: string;
  status: 'In Prep' | 'Proofing' | 'In Oven' | 'Cooling' | 'Ready for Pickup' | 'Completed';
  notes?: string;
}

export interface ForecastResult {
  summary: string;
  expectedFootTrafficIndex: number;
  projectedRevenue: number;
  wasteReductionScore: string;
  items: {
    name: string;
    recommendedBatch: number;
    baseBaseline: number;
    changePercent: string;
    recommendedHydration: string;
    proofingNotes: string;
    urgency: string;
    targetSelloutTime: string;
  }[];
  bakerActionItems: string[];
}

export interface RecipeOptimizationResult {
  recipeTitle: string;
  unitWeightGrams: number;
  totalBatchFlourKg: number;
  ingredients: {
    name: string;
    bakersPercent: string;
    weightGrams: number;
  }[];
  fermentationTimeline: {
    autolyse: string;
    bulkFerment: string;
    preShapeRest: string;
    finalProof: string;
    bakeProfile: string;
  };
  costPerUnit: number;
  suggestedRetailPrice: number;
  profitMargin: string;
  aiProTips: string[];
}
