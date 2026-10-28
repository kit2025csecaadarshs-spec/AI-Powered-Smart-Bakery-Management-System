import React, { useState, useEffect } from 'react';
import {
  Flame,
  Droplets,
  Thermometer,
  Timer,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  CheckCircle2,
  Wind,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { DeckOvenTelemetry } from '../types/bakery';
import { playClickSound, playChimeSound, playSteamSound } from '../utils/audio';

export const OvensMonitorTab: React.FC = () => {
  const [ovens, setOvens] = useState<DeckOvenTelemetry[]>([
    {
      id: 'deck-1',
      name: 'Stone Deck 1 (Boulangerie Hearth)',
      type: 'stone-deck',
      status: 'Baking',
      currentTempC: 245,
      targetTempC: 245,
      bottomDeckTempC: 228,
      humidityPercent: 88,
      powerKw: 4.8,
      activeBatch: {
        item: 'Country Sourdough Boule (Batch SRD-0824)',
        batchId: 'SRD-0824',
        remainingMinutes: 12,
        totalMinutes: 38,
        steamApplied: true,
      },
    },
    {
      id: 'deck-2',
      name: 'Deck 2 (Viennoiserie & Morning Buns)',
      type: 'convection',
      status: 'Baking',
      currentTempC: 195,
      targetTempC: 195,
      humidityPercent: 42,
      powerKw: 3.5,
      activeBatch: {
        item: 'Classic Butter Croissant (Batch CRS-0419)',
        batchId: 'CRS-0419',
        remainingMinutes: 6,
        totalMinutes: 18,
        steamApplied: false,
      },
    },
    {
      id: 'proofer-1',
      name: 'Controlled Retarder Proofer (Chamber A)',
      type: 'fermentation-proofer',
      status: 'Ready',
      currentTempC: 26.5,
      targetTempC: 26.0,
      humidityPercent: 82,
      powerKw: 1.2,
      activeBatch: {
        item: 'Pain au Chocolat (Final Proof Stage)',
        batchId: 'PAC-0922',
        remainingMinutes: 28,
        totalMinutes: 75,
        steamApplied: false,
      },
    },
  ]);

  const [activeSteamAlert, setActiveSteamAlert] = useState<string | null>(null);

  // Live timer simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      setOvens((prev) =>
        prev.map((oven) => {
          if (!oven.activeBatch) return oven;
          if (oven.activeBatch.remainingMinutes <= 0) {
            return oven;
          }
          // decrement timer slightly
          const nextRemaining = Math.max(0, oven.activeBatch.remainingMinutes - 0.1);
          return {
            ...oven,
            activeBatch: {
              ...oven.activeBatch,
              remainingMinutes: parseFloat(nextRemaining.toFixed(1)),
            },
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleInjectSteam = (ovenId: string) => {
    playSteamSound();
    setActiveSteamAlert(ovenId);
    setOvens((prev) =>
      prev.map((o) =>
        o.id === ovenId
          ? {
              ...o,
              status: 'Steam Injection',
              humidityPercent: Math.min(100, o.humidityPercent + 15),
              activeBatch: o.activeBatch ? { ...o.activeBatch, steamApplied: true } : undefined,
            }
          : o
      )
    );

    setTimeout(() => {
      setActiveSteamAlert(null);
      setOvens((prev) =>
        prev.map((o) => (o.id === ovenId ? { ...o, status: 'Baking' } : o))
      );
    }, 2800);
  };

  const adjustTemp = (ovenId: string, delta: number) => {
    playClickSound();
    setOvens((prev) =>
      prev.map((o) =>
        o.id === ovenId
          ? {
              ...o,
              targetTempC: o.targetTempC + delta,
              currentTempC: o.currentTempC + Math.sign(delta),
            }
          : o
      )
    );
  };

  const handleFinishBatch = (ovenId: string) => {
    playChimeSound();
    setOvens((prev) =>
      prev.map((o) =>
        o.id === ovenId
          ? {
              ...o,
              status: 'Ready',
              activeBatch: undefined,
            }
          : o
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">
              Smart IoT Hearth Ovens & Controlled Fermentation Proofer
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time PID thermal feedback, automatic top/bottom deck delta, and pressurized steam injection controls.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Total Draw: 9.5 kW / 15 kW max</span>
          </div>
        </div>
      </div>

      {/* Ovens Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {ovens.map((oven) => {
          const isProofer = oven.type === 'fermentation-proofer';
          const isSteaming = activeSteamAlert === oven.id;

          const progressPercent = oven.activeBatch
            ? Math.round(
                ((oven.activeBatch.totalMinutes - oven.activeBatch.remainingMinutes) /
                  oven.activeBatch.totalMinutes) *
                  100
              )
            : 0;

          return (
            <div
              key={oven.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition-all ${
                isSteaming
                  ? 'border-sky-400 ring-2 ring-sky-100 shadow-md'
                  : 'border-stone-200/90'
              }`}
            >
              {/* Card Top Title & Status */}
              <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                    {oven.id.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-stone-900 text-sm leading-tight">{oven.name}</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                    oven.status === 'Baking'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : oven.status === 'Steam Injection'
                      ? 'bg-sky-50 text-sky-800 border border-sky-300 animate-pulse'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      oven.status === 'Baking'
                        ? 'bg-amber-500'
                        : oven.status === 'Steam Injection'
                        ? 'bg-sky-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  {oven.status}
                </span>
              </div>

              {/* Digital Temperature Gauge Readout */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 grid grid-cols-2 gap-3 text-stone-700">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isProofer ? 'Chamber Temp' : 'Top Hearth'}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-stone-900">{oven.currentTempC}°</span>
                    <span className="text-xs text-stone-400 font-mono">/ {oven.targetTempC}°C</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>Humidity</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-stone-900">{oven.humidityPercent}%</span>
                    <span className="text-xs text-stone-400">RH</span>
                  </div>
                </div>

                {oven.bottomDeckTempC && (
                  <div className="col-span-2 pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs text-stone-500">
                    <span>Bottom Stone Deck:</span>
                    <span className="font-semibold text-stone-800">{oven.bottomDeckTempC}°C</span>
                  </div>
                )}
              </div>

              {/* Temp Adjustment Buttons */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">Calibrate Target:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => adjustTemp(oven.id, -5)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-colors"
                  >
                    -5°C
                  </button>
                  <button
                    onClick={() => adjustTemp(oven.id, 5)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-colors"
                  >
                    +5°C
                  </button>
                </div>
              </div>

              {/* Active Bake Batch Section */}
              {oven.activeBatch ? (
                <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-200/70 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                        Active Batch: {oven.activeBatch.batchId}
                      </p>
                      <h4 className="font-semibold text-stone-900 leading-tight">
                        {oven.activeBatch.item}
                      </h4>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Timer className="w-3 h-3 text-amber-600" />
                        <span>{Math.round(oven.activeBatch.remainingMinutes)} mins left</span>
                      </span>
                      <span className="font-mono text-stone-500">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleFinishBatch(oven.id)}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-medium transition-colors"
                    >
                      Complete & Pull
                    </button>

                    {!isProofer && (
                      <button
                        onClick={() => handleInjectSteam(oven.id)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Droplets className="w-3 h-3 text-sky-600" />
                        <span>Inject Steam</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-stone-50 rounded-xl p-5 border border-stone-200/60 text-center space-y-2 text-xs">
                  <p className="text-stone-500 font-medium">Chamber idle & at target temperature</p>
                  <button
                    onClick={() => {
                      playClickSound();
                      setOvens((prev) =>
                        prev.map((o) =>
                          o.id === oven.id
                            ? {
                                ...o,
                                status: 'Baking',
                                activeBatch: {
                                  item: 'Artisan Baguette (Fresh Batch)',
                                  batchId: `BAG-${Math.floor(1000 + Math.random() * 9000)}`,
                                  remainingMinutes: 20,
                                  totalMinutes: 20,
                                  steamApplied: false,
                                },
                              }
                            : o
                        )
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Load New Batch</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
