import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  CloudSun,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Flame,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { ForecastResult } from '../types/bakery';
import { playChimeSound, playClickSound } from '../utils/audio';

interface DemandForecastTabProps {
  onApplyScheduleToOvens?: (items: { name: string; count: number }[]) => void;
}

export const DemandForecastTab: React.FC<DemandForecastTabProps> = ({
  onApplyScheduleToOvens,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState('Saturday');
  const [weather, setWeather] = useState('Brisk Autumn & Sunny, 15°C');
  const [footTraffic, setFootTraffic] = useState('Peak Weekend Rush');
  const [specialEvent, setSpecialEvent] = useState('Artisan Farmers Market & Marathon');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);

  const [forecast, setForecast] = useState<ForecastResult>({
    summary:
      'Saturday morning rush with brisk 15°C conditions generates 41% higher demand for warm laminated viennoiserie and crusty rustic sourdough. Proofer schedule shifted 25 mins earlier.',
    expectedFootTrafficIndex: 94,
    projectedRevenue: 2840,
    wasteReductionScore: '96%',
    items: [
      {
        name: 'Country Sourdough Boule (T65)',
        recommendedBatch: 52,
        baseBaseline: 36,
        changePercent: '+44%',
        recommendedHydration: '78%',
        proofingNotes: 'Cold retard 14h at 4°C, bake at 245°C with 4s steam',
        urgency: 'Critical',
        targetSelloutTime: '11:15 AM',
      },
      {
        name: 'Classic Butter Croissant (Isigny AOP)',
        recommendedBatch: 95,
        baseBaseline: 65,
        changePercent: '+46%',
        recommendedHydration: '52%',
        proofingNotes: 'Proof strictly at 25.5°C to preserve laminated butter layers',
        urgency: 'Critical',
        targetSelloutTime: '10:30 AM',
      },
      {
        name: 'Pain au Chocolat (Valrhona 64%)',
        recommendedBatch: 70,
        baseBaseline: 48,
        changePercent: '+45%',
        recommendedHydration: '52%',
        proofingNotes: 'Bake deck 195°C for 18 mins until deep golden honey hue',
        urgency: 'High',
        targetSelloutTime: '11:00 AM',
      },
      {
        name: 'Cardamom Pistachio Morning Buns',
        recommendedBatch: 44,
        baseBaseline: 30,
        changePercent: '+46%',
        recommendedHydration: '58%',
        proofingNotes: 'Roll in cardamom cane sugar immediately upon deck exit',
        urgency: 'Medium',
        targetSelloutTime: '12:15 PM',
      },
      {
        name: 'Parisian Macaron Assortment (6pk)',
        recommendedBatch: 34,
        baseBaseline: 24,
        changePercent: '+41%',
        recommendedHydration: 'N/A',
        proofingNotes: 'Allow 25-minute skin drying before oven insertion',
        urgency: 'Medium',
        targetSelloutTime: '02:30 PM',
      },
    ],
    bakerActionItems: [
      'Pre-heat Deck 1 to 250°C by 04:30 AM for the first sourdough steam blast',
      'Stagger croissant bake into 2 batches (06:00 AM and 08:30 AM) for continuous fresh aroma',
      'Prepare secondary sourdough levain feeding in case afternoon foot traffic exceeds baseline',
    ],
  });

  const handleRunForecast = async () => {
    playClickSound();
    setIsLoading(true);
    setAppliedNotice(false);

    try {
      const res = await fetch('/api/gemini/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek,
          weather,
          footTraffic,
          specialEvent,
        }),
      });
      const data = await res.json();
      if (data && data.data) {
        setForecast(data.data);
        playChimeSound();
      }
    } catch (e) {
      console.error('Forecast failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToOvens = () => {
    playChimeSound();
    setAppliedNotice(true);
    if (onApplyScheduleToOvens) {
      onApplyScheduleToOvens(
        forecast.items.map((it) => ({
          name: it.name,
          count: it.recommendedBatch,
        }))
      );
    }
    setTimeout(() => setAppliedNotice(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Description & Parameter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-stone-900">
                AI Demand Forecasting & Predictive Morning Bake Schedule
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Powered by Gemini 3.8 Flash: correlates ambient weather, day-of-week foot traffic, and festival crowds to generate precise batch yields and zero-waste production plans.
            </p>
          </div>

          <button
            onClick={handleRunForecast}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Calibrating with AI...' : 'Recalibrate AI Forecast'}</span>
          </button>
        </div>

        {/* Input variables grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-600 font-medium mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Day of Week</span>
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="Monday">Monday (Commuter Steady)</option>
              <option value="Tuesday">Tuesday (Mid-Week Calm)</option>
              <option value="Wednesday">Wednesday (Office Bulk Orders)</option>
              <option value="Thursday">Thursday (Pre-Weekend Prep)</option>
              <option value="Friday">Friday (Afternoon Surge)</option>
              <option value="Saturday">Saturday (Morning Peak Rush)</option>
              <option value="Sunday">Sunday (Family Brunch Peak)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1 flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-stone-400" />
              <span>Weather & Ambient</span>
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="Sunny & Crisp 16°C">Sunny & Crisp 16°C (+35% foot traffic)</option>
              <option value="Rainy & Cold 11°C">Rainy & Cold 11°C (+45% hot bread & cinnamon)</option>
              <option value="Hot & Humid 29°C">Hot & Humid 29°C (-15% heavy bread, +cold items)</option>
              <option value="Overcast & Breezy 19°C">Overcast & Breezy 19°C (Standard)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>Foot Traffic Tier</span>
            </label>
            <select
              value={footTraffic}
              onChange={(e) => setFootTraffic(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="Moderate (Weekday Average)">Moderate (Weekday Average)</option>
              <option value="High (Morning Commute)">High (Morning Commute)</option>
              <option value="Peak Weekend Rush">Peak Weekend Rush (Maximum capacity)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-400" />
              <span>Special Local Event</span>
            </label>
            <input
              type="text"
              value={specialEvent}
              onChange={(e) => setSpecialEvent(e.target.value)}
              placeholder="e.g. Farmers Market, Marathon"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-500">Projected Daily Revenue</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-stone-900">${forecast.projectedRevenue}</span>
              <span className="text-xs font-semibold text-emerald-600">+28% vs baseline</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-500">Zero-Waste Target Efficiency</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-stone-900">{forecast.wasteReductionScore}</span>
              <span className="text-xs text-stone-500">&lt; 3.5% day-end scrap</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-stone-500">Foot Traffic Index</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-stone-900">{forecast.expectedFootTrafficIndex} / 100</span>
              <span className="text-xs text-amber-700 font-semibold">Elevated Peak</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Executive Summary Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-stone-900">Chef AI Morning Synthesis</h4>
          <p className="text-stone-700 leading-relaxed">{forecast.summary}</p>
        </div>
      </div>

      {/* Production Matrix Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Recommended Production Matrix</h3>
            <p className="text-xs text-stone-500">Batches calibrated for morning rush sellout curve</p>
          </div>

          <div className="flex items-center gap-2">
            {appliedNotice && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Schedule pushed to Smart Ovens!
              </span>
            )}
            <button
              onClick={handleApplyToOvens}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Apply Schedule to Ovens</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/75 border-b border-stone-100 text-stone-500 font-medium">
              <tr>
                <th className="py-3 px-4">Pastry / Bread Product</th>
                <th className="py-3 px-4">Recommended Yield</th>
                <th className="py-3 px-4">Baseline Shift</th>
                <th className="py-3 px-4">Target Sellout</th>
                <th className="py-3 px-4">Hydration / Formula Notes</th>
                <th className="py-3 px-4">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {forecast.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-stone-900">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 text-sm">{item.recommendedBatch}</span>
                    <span className="text-[11px] text-stone-500 ml-1">units</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-100">
                      {item.changePercent}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{item.targetSelloutTime}</span>
                  </td>
                  <td className="py-3 px-4 text-stone-600 max-w-xs">{item.proofingNotes}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        item.urgency === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.urgency === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Baker Action Items Checklist */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-3">
        <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Operational Bake Sequence for Head Baker</span>
        </h4>
        <div className="space-y-2">
          {forecast.bakerActionItems.map((action, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                {i + 1}
              </span>
              <p className="pt-0.5 leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
