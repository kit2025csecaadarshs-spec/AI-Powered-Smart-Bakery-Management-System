import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  Thermometer,
  Droplets,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Flame
} from 'lucide-react';
import { RecipeOptimizationResult } from '../types/bakery';
import { playClickSound, playChimeSound } from '../utils/audio';

export const RecipeOptimizerTab: React.FC = () => {
  const [recipeName, setRecipeName] = useState('Country Sourdough Boule');
  const [targetYield, setTargetYield] = useState<number>(12);
  const [flourType, setFlourType] = useState('French T65 Label Rouge & Whole Spelt');
  const [ambientTemp, setAmbientTemp] = useState<number>(24);
  const [humidity, setHumidity] = useState<number>(58);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [recipe, setRecipe] = useState<RecipeOptimizationResult>({
    recipeTitle: 'Country Sourdough Boule Master Formula',
    unitWeightGrams: 750,
    totalBatchFlourKg: 5.64,
    ingredients: [
      { name: 'French T65 Bread Flour (Label Rouge)', bakersPercent: '85.0%', weightGrams: 4794 },
      { name: 'Organic Stone-Ground Whole Spelt', bakersPercent: '15.0%', weightGrams: 846 },
      { name: 'Water (Filtered 20°C)', bakersPercent: '78.0%', weightGrams: 4399 },
      { name: 'Active Wild Levain (100% hydration)', bakersPercent: '20.0%', weightGrams: 1128 },
      { name: 'Fine Guérande Sea Salt', bakersPercent: '2.2%', weightGrams: 124 },
    ],
    fermentationTimeline: {
      autolyse: '45 mins at 24°C (flour + water only for enzymatic protease activity)',
      bulkFerment: '4 hours with 3 gentle coil folds spaced 45 mins apart',
      preShapeRest: '20 mins bench rest covered with linen couche',
      finalProof: '14 hours cold retard at 4°C in oval rattan bannetons',
      bakeProfile: '20 mins at 245°C with 4s pressurized steam blast, then 18 mins at 220°C vented',
    },
    costPerUnit: 1.48,
    suggestedRetailPrice: 7.50,
    profitMargin: '80.3%',
    aiProTips: [
      'Target Desired Dough Temperature (DDT) is 24°C: Water Temp = (24 * 3) - 24 (Room) - 22 (Flour) - 6 (Mixer friction) = 20°C.',
      'Given 58% ambient humidity, maintain 78% hydration to achieve maximum ear blister without gluten slack.',
      'Score loaf at 30° angle with fresh razor blade for optimal oven spring and prominent grigne (ear).',
    ],
  });

  const handleOptimize = async () => {
    playClickSound();
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/recipe-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName,
          targetYield,
          flourType,
          ambientTemp,
          humidity,
        }),
      });
      const data = await res.json();
      if (data && data.data) {
        setRecipe(data.data);
        playChimeSound();
      }
    } catch (e) {
      console.error('Recipe optimizer error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Water temperature calculation helper for master bakers: DDT * 3 - Room - Flour - Friction
  const calculatedWaterTemp = Math.round(24 * 3 - ambientTemp - 22 - 6);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-stone-900">
                Master Baker’s Percentage & Hydration Formula Engine
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Food science and AI-calculated dough hydration, water temperature calibration, and profit margins.
            </p>
          </div>

          <button
            onClick={handleOptimize}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Calibrating Formula...' : 'Calculate Formula & Yield'}</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-600 font-medium mb-1">Recipe Standard</label>
            <select
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="Country Sourdough Boule">Country Sourdough Boule (T65)</option>
              <option value="Classic French Croissant">Classic French Butter Croissant</option>
              <option value="Tradition Baguette au Levain">Tradition Baguette au Levain</option>
              <option value="Brioche Feuilletée">Brioche Feuilletée (82% Butter)</option>
              <option value="Olive & Rosemary Focaccia">Artisan Olive & Rosemary Focaccia</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1">Target Yield (Units)</label>
            <input
              type="number"
              min="1"
              max="200"
              value={targetYield}
              onChange={(e) => setTargetYield(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1">Flour Blend</label>
            <select
              value={flourType}
              onChange={(e) => setFlourType(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="French T65 Label Rouge & Whole Spelt">French T65 Label Rouge & Spelt (12.8% protein)</option>
              <option value="Organic T55 Pastry Flour">Organic T55 Pastry Flour (11.5% protein)</option>
              <option value="T80 Semi-Complet Heritage Grain">T80 Semi-Complet Heritage Grain</option>
              <option value="High-Extraction Rye Blend (T130)">High-Extraction Rye Blend (T130)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1">Kitchen DDT Calibrator</label>
            <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 flex items-center justify-between font-mono">
              <span>Required Water:</span>
              <strong className="text-amber-800">{calculatedWaterTemp}°C</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Financials & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-500">Unit Ingredient Cost</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-stone-900">${recipe.costPerUnit.toFixed(2)}</span>
              <span className="text-xs text-stone-500">per {recipe.unitWeightGrams}g loaf</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-500">Target Retail & Profit Margin</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-stone-900">${recipe.suggestedRetailPrice.toFixed(2)}</span>
              <span className="text-xs font-semibold text-emerald-600">({recipe.profitMargin} Margin)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-700">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-500">Total Batch Dough Mass</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-stone-900">
                {(targetYield * (recipe.unitWeightGrams / 1000)).toFixed(1)} kg
              </span>
              <span className="text-xs text-stone-500">for {targetYield} units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients & Baker's Percentage Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">{recipe.recipeTitle}</h3>
            <p className="text-xs text-stone-500">Standardized to 100% total flour weight baseline</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            Yield: {targetYield} Loaves ({recipe.unitWeightGrams}g pre-bake)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/75 border-b border-stone-100 text-stone-500 font-medium">
              <tr>
                <th className="py-3 px-4">Ingredient</th>
                <th className="py-3 px-4">Baker’s %</th>
                <th className="py-3 px-4">Total Weight (Grams)</th>
                <th className="py-3 px-4">Weight (Kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recipe.ingredients.map((ing, i) => (
                <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-stone-900">{ing.name}</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-800">{ing.bakersPercent}</td>
                  <td className="py-3 px-4 font-mono text-stone-800">{ing.weightGrams} g</td>
                  <td className="py-3 px-4 font-mono text-stone-500">{(ing.weightGrams / 1000).toFixed(3)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fermentation & Bake Timeline */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-4">
        <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Scientific Fermentation & Deck Baking Schedule</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-amber-700">Stage 1</span>
            <p className="font-bold text-stone-900">Autolyse</p>
            <p className="text-stone-600 text-[11px] leading-tight">{recipe.fermentationTimeline.autolyse}</p>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-amber-700">Stage 2</span>
            <p className="font-bold text-stone-900">Bulk Ferment</p>
            <p className="text-stone-600 text-[11px] leading-tight">{recipe.fermentationTimeline.bulkFerment}</p>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-amber-700">Stage 3</span>
            <p className="font-bold text-stone-900">Pre-Shape & Bench</p>
            <p className="text-stone-600 text-[11px] leading-tight">{recipe.fermentationTimeline.preShapeRest}</p>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-amber-700">Stage 4</span>
            <p className="font-bold text-stone-900">Cold Retard</p>
            <p className="text-stone-600 text-[11px] leading-tight">{recipe.fermentationTimeline.finalProof}</p>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-amber-800">Stage 5 (Oven)</span>
            <p className="font-bold text-stone-900">Bake Profile</p>
            <p className="text-stone-700 text-[11px] leading-tight">{recipe.fermentationTimeline.bakeProfile}</p>
          </div>
        </div>
      </div>

      {/* AI Pro Tips */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-3">
        <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Maître Boulanger AI Technical Notes</span>
        </h4>
        <div className="space-y-2">
          {recipe.aiProTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-stone-700 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
