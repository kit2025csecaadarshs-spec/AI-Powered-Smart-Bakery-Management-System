import React, { useState } from 'react';
import {
  HeaderNav,
  ActiveTab
} from './components/HeaderNav';
import {
  BakeryCanvas3D,
  BAKERY_ITEMS_CATALOG
} from './components/BakeryCanvas3D';
import { DemandForecastTab } from './components/DemandForecastTab';
import { OvensMonitorTab } from './components/OvensMonitorTab';
import { RecipeOptimizerTab } from './components/RecipeOptimizerTab';
import { PosOrdersTab } from './components/PosOrdersTab';
import { InventoryWasteTab } from './components/InventoryWasteTab';
import { ChefLaurentDrawer } from './components/ChefLaurentDrawer';
import { BakeryItem3D } from './types/bakery';
import {
  Sparkles,
  Wheat,
  Thermometer,
  Droplets,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  X,
  Layers,
  Info
} from 'lucide-react';
import { playClickSound, playChimeSound } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('showcase');
  const [selectedItem3D, setSelectedItem3D] = useState<BakeryItem3D | null>(BAKERY_ITEMS_CATALOG[0]);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectItemFrom3D = (item: BakeryItem3D) => {
    setSelectedItem3D(item);
    setShowItemDetailModal(true);
    showToast(`Inspecting 3D telemetry: ${item.name}`);
  };

  const handleApplyScheduleToOvens = (items: { name: string; count: number }[]) => {
    showToast(`Pushed ${items.length} AI-optimized batches to Smart Hearth Ovens!`);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header & Tab Navigation */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        isCopilotOpen={isCopilotOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: 3D Smart Kitchen & Showcase */}
        {activeTab === 'showcase' && (
          <div className="space-y-6">
            {/* Quick Hero Banner */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Wheat className="w-4 h-4 text-amber-600" />
                  <h2 className="text-base font-bold text-stone-900">
                    Interactive 3D Artisan Boulangerie & Smart Deck Showcase
                  </h2>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Real-time Three.js PBR physical simulation. Orbit 360°, inspect sourdough grigne scoring, adjust Maillard crust browning, and test steam injection.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('forecast')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View AI Demand Forecast</span>
                </button>
              </div>
            </div>

            {/* Three.js 3D Viewport with Collapsible Bottom Dock */}
            <BakeryCanvas3D
              onSelectItem={handleSelectItemFrom3D}
              selectedItem={selectedItem3D}
            />

            {/* Showcase Quick Selector Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {BAKERY_ITEMS_CATALOG.map((item) => {
                const isSelected = selectedItem3D?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedItem3D(item);
                      setShowItemDetailModal(true);
                    }}
                    className={`bg-white rounded-xl p-3 border text-left transition-all shadow-2xs hover:border-amber-400 ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/20'
                        : 'border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-stone-400 font-semibold uppercase">
                        {item.batchCode}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <h4 className="font-bold text-stone-900 text-xs mt-1 truncate">{item.name}</h4>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                      <span>{item.internalTempC}°C</span>
                      <strong className="text-stone-900">${item.price.toFixed(2)}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: AI Demand Forecast */}
        {activeTab === 'forecast' && (
          <DemandForecastTab onApplyScheduleToOvens={handleApplyScheduleToOvens} />
        )}

        {/* TAB 3: Smart Ovens & Proofer */}
        {activeTab === 'ovens' && <OvensMonitorTab />}

        {/* TAB 4: Baker's Hydration & Recipe Optimizer */}
        {activeTab === 'recipe' && <RecipeOptimizerTab />}

        {/* TAB 5: POS & Custom Orders */}
        {activeTab === 'pos' && <PosOrdersTab />}

        {/* TAB 6: Stock & Zero Waste */}
        {activeTab === 'inventory' && <InventoryWasteTab />}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-stone-200 py-4 text-xs text-stone-500 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Lumière Bakehouse Smart OS. Artisan Baking meets Predictive AI & Three.js 3D.</p>
          <div className="flex items-center gap-3 text-stone-400">
            <span>RoomEnvironment PBR</span>
            <span>•</span>
            <span>Gemini 3.8 Flash AI</span>
            <span>•</span>
            <span>HACCP Compliant</span>
          </div>
        </div>
      </footer>

      {/* Item Detail Modal when clicked in 3D scene */}
      {showItemDetailModal && selectedItem3D && (
        <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {selectedItem3D.batchCode}
                </span>
                <h3 className="font-bold text-stone-900 text-base mt-1">{selectedItem3D.name}</h3>
                <span className="text-xs text-stone-500">{selectedItem3D.category}</span>
              </div>
              <button
                onClick={() => setShowItemDetailModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 block font-medium">Internal Core Temp</span>
                <span className="text-sm font-bold text-stone-900">{selectedItem3D.internalTempC}°C</span>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 block font-medium">Dough Hydration</span>
                <span className="text-sm font-bold text-stone-900">
                  {selectedItem3D.hydrationPercent > 0 ? `${selectedItem3D.hydrationPercent}%` : 'N/A'}
                </span>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 block font-medium">Retail Shelf Price</span>
                <span className="text-sm font-bold text-stone-900">${selectedItem3D.price.toFixed(2)}</span>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 block font-medium">Freshness Index</span>
                <span className="text-sm font-bold text-emerald-600">{selectedItem3D.freshnessScore}% Peak</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium text-stone-500">Grain & Raw Material Specification</p>
              <p className="text-xs font-semibold text-stone-800 mt-0.5">{selectedItem3D.flourType}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-stone-500 mb-1">Aromas & Crumb Profile</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedItem3D.flavorNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400">Pulled from Deck: {selectedItem3D.bakedAt}</span>
              <button
                onClick={() => {
                  playChimeSound();
                  setShowItemDetailModal(false);
                  setActiveTab('recipe');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all"
              >
                Inspect Recipe Formula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chef Laurent AI Copilot Drawer */}
      <ChefLaurentDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-stone-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
