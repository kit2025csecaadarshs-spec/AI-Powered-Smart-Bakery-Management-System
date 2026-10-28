import React, { useState } from 'react';
import {
  Boxes,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Recycle,
  Plus,
  ArrowRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { InventoryItem } from '../types/bakery';
import { playClickSound, playChimeSound } from '../utils/audio';

export const InventoryWasteTab: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'inv-1',
      name: 'French T65 Flour (Moulins Viron Label Rouge)',
      category: 'Flour',
      stockKg: 145.0,
      minimumThresholdKg: 50.0,
      unitCost: 1.85,
      supplier: 'Minoteries Viron, Chartres',
      status: 'Optimal',
    },
    {
      id: 'inv-2',
      name: 'Normandy Beurre de Tourage 84% (Dry Sheet Butter)',
      category: 'Dairy',
      stockKg: 28.5,
      minimumThresholdKg: 30.0,
      unitCost: 9.40,
      supplier: 'Isigny Sainte-Mère, Normandy',
      status: 'Low',
    },
    {
      id: 'inv-3',
      name: 'Active Wild Sourdough Levain (100% Hydration)',
      category: 'Yeast & Starters',
      stockKg: 18.0,
      minimumThresholdKg: 8.0,
      unitCost: 0.60,
      supplier: 'In-house Mother Culture (Est. 2018)',
      status: 'Optimal',
    },
    {
      id: 'inv-4',
      name: 'Valrhona Manjari 64% Pure Dark Chocolate Batons',
      category: 'Sugar & Chocolate',
      stockKg: 16.0,
      minimumThresholdKg: 10.0,
      unitCost: 22.50,
      supplier: 'Valrhona, Tain-l’Hermitage',
      status: 'Optimal',
    },
    {
      id: 'inv-5',
      name: 'Extra-Fine Sicilian Almond Flour (Blanched)',
      category: 'Flour',
      stockKg: 9.2,
      minimumThresholdKg: 12.0,
      unitCost: 14.20,
      supplier: 'Pariani, Italy',
      status: 'Low',
    },
    {
      id: 'inv-6',
      name: 'Grey Guérande Hand-Harvested Sea Salt',
      category: 'Flour',
      stockKg: 32.0,
      minimumThresholdKg: 10.0,
      unitCost: 3.10,
      supplier: 'Salines de Guérande, Brittany',
      status: 'Optimal',
    },
  ]);

  const [surplusItems] = useState([
    { name: 'Day-old Classic Croissants', count: 14, unit: 'pcs' },
    { name: 'Stale Country Sourdough Boules', count: 4, unit: 'loaves' },
    { name: 'Surplus Brioche Nanterre', count: 3, unit: 'loaves' },
  ]);

  const [repurposeData, setRepurposeData] = useState<{
    recoveryPotentialRevenue: number;
    wasteReductionKg: number;
    ideas: {
      title: string;
      uses: string;
      prepTime: string;
      extraIngredientsNeeded: string;
      resalePrice: number;
      estimatedProfit: number;
    }[];
  }>({
    recoveryPotentialRevenue: 195,
    wasteReductionKg: 7.2,
    ideas: [
      {
        title: 'Signature Double-Baked Almond Frangipane Croissants',
        uses: 'Day-old Butter Croissants (14 units)',
        prepTime: '20 mins',
        extraIngredientsNeeded: 'Almond frangipane cream, orange blossom simple syrup, toasted sliced almonds',
        resalePrice: 5.75,
        estimatedProfit: 68,
      },
      {
        title: 'Artisan Rosemary Sea Salt Sourdough Crisps',
        uses: 'Stale Country Boules & Baguettes (4 units)',
        prepTime: '25 mins',
        extraIngredientsNeeded: 'Cold-pressed extra virgin olive oil, fresh rosemary, Maldon sea salt flakes',
        resalePrice: 4.50,
        estimatedProfit: 42,
      },
      {
        title: 'Caramelized Brioche Pain Perdu Dessert Jars',
        uses: 'Surplus Brioche Loaves (3 units)',
        prepTime: '35 mins',
        extraIngredientsNeeded: 'Bourbon vanilla custard bath, salted butter caramel drizzle',
        resalePrice: 6.25,
        estimatedProfit: 55,
      },
    ],
  });

  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleRestock = (id: string) => {
    playClickSound();
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              stockKg: item.stockKg + 25,
              status: 'Optimal',
            }
          : item
      )
    );
  };

  const handleRecalculateZeroWaste = async () => {
    playClickSound();
    setIsLoadingAi(true);

    try {
      const res = await fetch('/api/gemini/waste-repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surplusItems }),
      });
      const data = await res.json();
      if (data && data.data) {
        setRepurposeData(data.data);
        playChimeSound();
      }
    } catch (e) {
      console.error('Waste repurpose failed:', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">
              Ingredient Inventory & AI Zero-Waste Repurposing Engine
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor European artisan pantry stocks and transform day-old surplus pastries into high-margin signature items.
          </p>
        </div>

        <button
          onClick={handleRecalculateZeroWaste}
          disabled={isLoadingAi}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
          <span>{isLoadingAi ? 'Analyzing Waste...' : 'AI Zero-Waste Repurpose'}</span>
        </button>
      </div>

      {/* AI Zero-Waste Recovery Banner */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Active Surplus Repurposing Blueprint
              </h3>
              <p className="text-xs text-emerald-800">
                Surplus logged: 14 croissants, 4 sourdough loaves, 3 brioche loaves
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-stone-500 text-[11px] block">Recoverable Revenue</span>
              <span className="text-base font-bold text-emerald-700">
                +${repurposeData.recoveryPotentialRevenue}
              </span>
            </div>
            <div className="text-right border-l border-emerald-200 pl-4">
              <span className="text-stone-500 text-[11px] block">Food Waste Avoided</span>
              <span className="text-base font-bold text-stone-900">
                {repurposeData.wasteReductionKg} kg
              </span>
            </div>
          </div>
        </div>

        {/* Repurposing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {repurposeData.ideas.map((idea, idx) => (
            <div key={idx} className="bg-white rounded-xl p-3.5 border border-emerald-200/70 shadow-2xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-stone-900 text-xs leading-snug">{idea.title}</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  +${idea.estimatedProfit} profit
                </span>
              </div>

              <div className="text-stone-600 text-[11px] space-y-1">
                <p><strong>Utilizes:</strong> {idea.uses}</p>
                <p><strong>Prep Time:</strong> {idea.prepTime}</p>
                <p className="text-stone-500 text-[10px] italic">Add: {idea.extraIngredientsNeeded}</p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-stone-500">Retail: <strong>${idea.resalePrice.toFixed(2)}</strong></span>
                <button
                  onClick={() => {
                    playChimeSound();
                    alert(`Recipe "${idea.title}" queued for morning prep!`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>Queue Batch</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Artisan Pantry & Raw Materials</h3>
            <p className="text-xs text-stone-500">Real-time stock counts and automatic low-threshold alerts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/75 border-b border-stone-100 text-stone-500 font-medium">
              <tr>
                <th className="py-3 px-4">Raw Material / Flour</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Unit Cost ($/kg)</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {inventory.map((item) => {
                const isLow = item.status === 'Low' || item.status === 'Critical';

                return (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900">{item.name}</td>
                    <td className="py-3 px-4 text-stone-500">{item.category}</td>
                    <td className="py-3 px-4 font-bold text-stone-900 font-mono">
                      {item.stockKg.toFixed(1)} kg
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono">
                      {item.minimumThresholdKg.toFixed(1)} kg min
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-700">${item.unitCost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-stone-500 text-[11px]">{item.supplier}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isLow
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 font-medium transition-colors"
                      >
                        +25 kg
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
