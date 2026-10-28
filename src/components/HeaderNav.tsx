import React from 'react';
import {
  Sparkles,
  Wheat,
  Thermometer,
  Droplets,
  Volume2,
  VolumeX,
  Bot,
  Store,
  Layers,
  Flame,
  Scale,
  ReceiptText,
  Boxes
} from 'lucide-react';
import { playClickSound, setMuted, getMuted } from '../utils/audio';

export type ActiveTab =
  | 'showcase'
  | 'forecast'
  | 'ovens'
  | 'recipe'
  | 'pos'
  | 'inventory';

interface HeaderNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenCopilot: () => void;
  isCopilotOpen: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCopilot,
  isCopilotOpen,
}) => {
  const [muted, setMutedState] = React.useState(getMuted());

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playClickSound();
  };

  const navItems = [
    { id: 'showcase' as ActiveTab, label: '3D Kitchen & Showcase', icon: Wheat },
    { id: 'forecast' as ActiveTab, label: 'AI Demand Forecast', icon: Sparkles },
    { id: 'ovens' as ActiveTab, label: 'Smart Ovens & Proofer', icon: Flame },
    { id: 'recipe' as ActiveTab, label: 'Baker’s Hydration Calculator', icon: Scale },
    { id: 'pos' as ActiveTab, label: 'POS & Custom Orders', icon: ReceiptText },
    { id: 'inventory' as ActiveTab, label: 'Stock & Zero Waste', icon: Boxes },
  ];

  return (
    <header className="w-full bg-white/95 border-b border-stone-200/90 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: Brand + Real-time Microclimate & Quick Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-sm shadow-amber-200">
            <Wheat className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-stone-900 text-lg tracking-tight">
                Lumière Bakehouse
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold tracking-wide uppercase">
                AI Smart OS
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal">
              Artisan Boulangerie & Pâtisserie Production Engine
            </p>
          </div>
        </div>

        {/* Ambient Kitchen IoT Climate & Master AI Copilot Trigger */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 text-xs">
          {/* Bakery Kitchen Microclimate */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-600">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-medium text-stone-800">24.2°C</span>
              <span className="text-[10px] text-stone-400">Ambient</span>
            </div>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span className="font-medium text-stone-800">58% RH</span>
              <span className="text-[10px] text-stone-400">Humidity</span>
            </div>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Shift: 05:00 AM – 14:00 PM</span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors border border-stone-200/80"
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
          </button>

          {/* Master AI Copilot Drawer Trigger */}
          <button
            onClick={() => {
              playClickSound();
              onOpenCopilot();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
              isCopilotOpen
                ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chef Laurent AI</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  onTabChange(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
