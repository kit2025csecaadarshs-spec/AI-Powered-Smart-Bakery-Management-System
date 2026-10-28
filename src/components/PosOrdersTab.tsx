import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ReceiptText,
  Plus,
  CheckCircle2,
  Clock,
  Cake,
  User,
  ShoppingBag,
  Sparkles,
  Search,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { OrderItem } from '../types/bakery';
import { playClickSound, playCashDing, playChimeSound } from '../utils/audio';

export const PosOrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: 'ORD-8101',
      customerName: 'Claire Beauchamp',
      type: 'Custom Cake',
      itemsSummary: '2-Tier Pistachio Raspberry Cake with Pressed Edible Botanicals (8" + 6")',
      totalPrice: 165.00,
      pickupTime: 'Today 11:30 AM',
      status: 'In Oven',
      notes: 'Inscription: "Joyeux Anniversaire Sophie"',
    },
    {
      id: 'ORD-8102',
      customerName: 'Café de Flore (Wholesale)',
      type: 'Café Wholesale',
      itemsSummary: '24x Butter Croissants, 16x Pain au Chocolat, 6x Country Boule',
      totalPrice: 198.50,
      pickupTime: 'Today 07:15 AM',
      status: 'Ready for Pickup',
      notes: 'Packaged in branded kraft baker crates',
    },
    {
      id: 'ORD-8103',
      customerName: 'Julian Mercer',
      type: 'Walk-in Retail',
      itemsSummary: '2x Sourdough Boule (T65), 1x Box of 6 Parisian Macarons',
      totalPrice: 33.00,
      pickupTime: 'Immediate',
      status: 'Proofing',
      notes: 'Sliced sourdough request',
    },
    {
      id: 'ORD-8104',
      customerName: 'Helena Thorne',
      type: 'Custom Cake',
      itemsSummary: 'Valrhona Triple Chocolate Mousse Tart with Gold Leaf (10")',
      totalPrice: 85.00,
      pickupTime: 'Today 03:00 PM',
      status: 'In Prep',
      notes: 'Gluten-conscious guest alert',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Ready'>('All');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Quick custom order builder state
  const [newCustomer, setNewCustomer] = useState('');
  const [newType, setNewType] = useState<'Walk-in Retail' | 'Custom Cake' | 'Café Wholesale'>('Walk-in Retail');
  const [newItemsSummary, setNewItemsSummary] = useState('');
  const [newPrice, setNewPrice] = useState(25.00);
  const [newPickupTime, setNewPickupTime] = useState('Today 12:00 PM');
  const [newNotes, setNewNotes] = useState('');

  const handleAdvanceStatus = (orderId: string) => {
    playClickSound();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.status === 'In Prep') return { ...o, status: 'Proofing' };
        if (o.status === 'Proofing') return { ...o, status: 'In Oven' };
        if (o.status === 'In Oven') return { ...o, status: 'Cooling' };
        if (o.status === 'Cooling') return { ...o, status: 'Ready for Pickup' };
        if (o.status === 'Ready for Pickup') {
          playCashDing();
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#f59e0b', '#d97706', '#10b981', '#fbbf24'],
            });
          } catch (_) {}
          return { ...o, status: 'Completed' };
        }
        return o;
      })
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer || !newItemsSummary) return;

    playCashDing();
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#fbbf24'],
      });
    } catch (_) {}

    const newOrder: OrderItem = {
      id: `ORD-${Math.floor(8105 + Math.random() * 500)}`,
      customerName: newCustomer,
      type: newType,
      itemsSummary: newItemsSummary,
      totalPrice: Number(newPrice),
      pickupTime: newPickupTime,
      status: 'In Prep',
      notes: newNotes,
    };

    setOrders([newOrder, ...orders]);
    setShowNewOrderModal(false);
    setNewCustomer('');
    setNewItemsSummary('');
    setNewNotes('');
  };

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'Active') return o.status !== 'Completed';
    if (activeFilter === 'Ready') return o.status === 'Ready for Pickup';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">
              Bakery POS & Custom Pastry Order Pipeline
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Track customer orders through dough preparation, proofing chamber, stone deck baking, and pickup counter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClickSound();
              setShowNewOrderModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-2 text-xs">
        <div className="flex items-center gap-2">
          {(['All', 'Active', 'Ready'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                playClickSound();
                setActiveFilter(filter);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {filter} Orders
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-500">
          Showing <strong>{filteredOrders.length}</strong> orders
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => {
          const isCompleted = order.status === 'Completed';
          const isReady = order.status === 'Ready for Pickup';

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border p-4.5 shadow-xs space-y-3 transition-all ${
                isReady
                  ? 'border-emerald-300 ring-2 ring-emerald-50'
                  : isCompleted
                  ? 'border-stone-200 opacity-75'
                  : 'border-stone-200/90'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {order.id}
                    </span>
                    <span className="text-xs font-semibold text-stone-800">{order.customerName}</span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-0.5 block">{order.type}</span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-stone-900 text-sm">${order.totalPrice.toFixed(2)}</span>
                  <span
                    className={`block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${
                      order.status === 'Ready for Pickup'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'In Oven'
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === 'Completed'
                        ? 'bg-stone-100 text-stone-600'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-stone-700 space-y-1">
                <p className="font-medium text-stone-900 leading-snug">{order.itemsSummary}</p>
                {order.notes && <p className="text-stone-500 text-[11px] italic">Note: {order.notes}</p>}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Pickup: {order.pickupTime}</span>
                </div>

                {!isCompleted && (
                  <button
                    onClick={() => handleAdvanceStatus(order.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isReady
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-700'
                    }`}
                  >
                    <span>{isReady ? 'Mark Picked Up' : 'Advance Stage'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-base">New Custom Order / POS Sale</h3>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Customer / Organization Name</label>
                <input
                  type="text"
                  required
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  placeholder="e.g. Gabrielle Dubois"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Order Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Walk-in Retail">Walk-in Retail</option>
                    <option value="Custom Cake">Custom Cake / Pâtisserie</option>
                    <option value="Café Wholesale">Café Wholesale Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Total Bill ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Items / Cake Formulation Details</label>
                <textarea
                  rows={2}
                  required
                  value={newItemsSummary}
                  onChange={(e) => setNewItemsSummary(e.target.value)}
                  placeholder="e.g. 1x Vanilla Bean Celebration Cake with Swiss Buttercream, 4x Sourdough Boules"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Target Pickup Time</label>
                <input
                  type="text"
                  value={newPickupTime}
                  onChange={(e) => setNewPickupTime(e.target.value)}
                  placeholder="e.g. Today 02:30 PM"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Special Dietary / Decor Inscription Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Happy 30th Birthday, sliced, nut allergy alert"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all shadow-xs"
                >
                  Create & Push to Kitchen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
