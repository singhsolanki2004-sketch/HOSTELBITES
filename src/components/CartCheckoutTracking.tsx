import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { api, type CartItem } from '../api';
import type { Chef, Meal, Order, OrderStatus, PaymentMethod, Student } from '../types';
import { FoodImage } from './BrandLogo';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  meals: Meal[];
  chefs: Chef[];
  onUpdateQty: (mealId: string, delta: number) => void;
  onRemoveItem: (mealId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  meals,
  chefs,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const detailedItems = cart
    .map((ci) => {
      const meal = meals.find((m) => m.id === ci.mealId);
      if (!meal) return null;
      const chef = chefs.find((c) => c.id === meal.chefId);
      return { ...ci, meal, chef };
    })
    .filter(Boolean) as Array<{ mealId: string; quantity: number; meal: Meal; chef?: Chef }>;

  const subtotal = detailedItems.reduce((sum, item) => sum + item.meal.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45" role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-[#252525]/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]/10 bg-[#FFFDF8]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#176B45]" />
            <h2 className="font-display text-lg font-bold text-[#252525]">Your Tiffin Cart</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#252525]/60 hover:text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {detailedItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-10 h-10 text-[#176B45]/40 mx-auto" />
              <p className="font-display text-base font-semibold text-[#252525]">
                Your cart is empty
              </p>
              <p className="text-sm text-[#252525]/65">
                Add homemade meals starting at ₹80 with zero delivery charges.
              </p>
            </div>
          ) : (
            detailedItems.map(({ meal, chef, quantity }) => (
              <div
                key={meal.id}
                className="flex items-start gap-3.5 rounded-xl border border-[#252525]/10 p-3.5 bg-[#FFFDF8]"
              >
                <FoodImage
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-display text-sm font-semibold text-[#252525] truncate">
                    {meal.name}
                  </p>
                  <p className="text-xs text-[#252525]/65 truncate">
                    {chef?.kitchenName || 'Home Kitchen'}
                  </p>
                  <div className="flex items-center justify-between pt-1.5">
                    <span className="font-display text-sm font-bold text-[#252525] tabular-nums">
                      ₹{meal.price * quantity}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center rounded-lg border border-[#252525]/15 bg-white">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(meal.id, -1)}
                          className="p-1.5 text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold tabular-nums">{quantity}</span>
                        <button
                          type="button"
                          disabled={quantity >= meal.availableQty}
                          onClick={() => onUpdateQty(meal.id, 1)}
                          className="p-1.5 text-[#252525] hover:bg-[#252525]/5 disabled:opacity-35 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(meal.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        aria-label={`Remove ${meal.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {detailedItems.length > 0 && (
          <div className="p-6 border-t border-[#252525]/10 bg-[#FFFDF8] space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#252525]/75">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#176B45] font-medium">
                <span>Hostel Gate Delivery Fee</span>
                <span className="tabular-nums">₹0</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#252525] pt-2 border-t border-[#252525]/10">
                <span>Final Amount</span>
                <span className="tabular-nums">₹{subtotal}</span>
              </div>
            </div>
            <p className="text-xs text-[#252525]/60">
              No hidden platform fees or surge charges.
            </p>
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full rounded-xl bg-[#176B45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#125436] transition-colors cursor-pointer"
            >
              Proceed to Checkout · ₹{subtotal}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface CheckoutScreenProps {
  cart: CartItem[];
  meals: Meal[];
  chefs: Chef[];
  student: Student | null;
  onBackToMenu: () => void;
  onOrderConfirmed: (order: Order) => Promise<void> | void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  cart,
  meals,
  chefs,
  student,
  onBackToMenu,
  onOrderConfirmed,
}) => {
  const [studentName, setStudentName] = useState(student?.name || '');
  const [mobile, setMobile] = useState(student?.mobile || '');
  const [college, setCollege] = useState(student?.college || 'Government Engineering College, Ajmer');
  const [hostelName, setHostelName] = useState(student?.hostelName || '');
  const [dropOffGate, setDropOffGate] = useState(student?.dropOffGate || '');
  const [timeSlot, setTimeSlot] = useState('Dinner · 7:30 PM – 8:15 PM');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI (Demo Prototype)');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [requestId] = useState(() => `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const detailedItems = cart
    .map((ci) => {
      const meal = meals.find((m) => m.id === ci.mealId);
      if (!meal) return null;
      const chef = chefs.find((c) => c.id === meal.chefId);
      return {
        mealId: meal.id,
        mealName: meal.name,
        chefId: meal.chefId,
        chefName: chef?.name || 'Home Chef',
        price: meal.price,
        quantity: ci.quantity,
        imageUrl: meal.imageUrl,
      };
    })
    .filter(Boolean) as Order['items'];

  const subtotal = detailedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (detailedItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="font-display text-xl font-bold text-[#252525]">Your cart is empty</p>
        <button
          type="button"
          onClick={onBackToMenu}
          className="rounded-xl bg-[#176B45] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
        >
          Explore Homemade Meals
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    if (!studentName.trim() || !mobile.trim() || !hostelName.trim() || !dropOffGate.trim()) {
      setError('Please enter your name, mobile number, hostel name, and hostel gate drop-off point.');
      return;
    }
    if (mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const { order } = await api.placeOrder({
        clientRequestId: requestId,
        studentId: student?.id || 'guest-student',
        studentName,
        mobile,
        college,
        hostelName,
        dropOffGate,
        timeSlot,
        instructions,
        paymentMethod,
        items: detailedItems,
      });
      await onOrderConfirmed(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <button
        type="button"
        onClick={onBackToMenu}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#176B45] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 rounded-2xl bg-white border border-[#252525]/10 p-6 sm:p-8 space-y-5"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-[#252525]">
              Hostel Gate Checkout
            </h1>
            <p className="text-sm text-[#252525]/70 mt-1">
              Pre-arranged collection at your Ajmer hostel gate. Delivery fee is ₹0.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#252525]/75 mb-1">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252525]/75 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#252525]/75 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252525]/75 mb-1">Hostel / PG Name</label>
              <input
                type="text"
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                placeholder="e.g. Vikramaditya Boys Hostel"
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                Hostel Gate / Drop-off Point
              </label>
              <input
                type="text"
                value={dropOffGate}
                onChange={(e) => setDropOffGate(e.target.value)}
                placeholder="e.g. North Gate Guard Cabin"
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                Preferred Collection / Delivery Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              >
                <option>Lunch · 12:30 PM – 1:15 PM</option>
                <option>Dinner · 7:30 PM – 8:15 PM</option>
                <option>Late Dinner · 8:30 PM – 9:15 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#252525]/75 mb-1">
              Order Instructions (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Less spicy, call when reaching main gate"
              className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <label className="block text-xs font-medium text-[#252525]/75">Payment Option</label>
            <div className="grid grid-cols-1 gap-2.5">
              {(
                [
                  'UPI (Demo Prototype)',
                  'Cash on Delivery / Pay at Collection',
                  'Demo Prototype Payment',
                ] as PaymentMethod[]
              ).map((method) => (
                <label
                  key={method}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm cursor-pointer transition-colors ${
                    paymentMethod === method
                      ? 'border-[#176B45] bg-[#176B45]/5 font-semibold text-[#176B45]'
                      : 'border-[#252525]/15 bg-[#FFFDF8] text-[#252525]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-[#176B45]"
                    />
                    {method}
                  </span>
                  <CreditCard className="w-4 h-4 opacity-60" />
                </label>
              ))}
            </div>
            <p className="text-xs text-[#252525]/65">
              Prototype Notice: No live payment gateway is connected. Selecting UPI or Demo Payment records a simulated order confirmation for prototype testing.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#176B45] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#125436] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {submitting ? 'Placing Order...' : `Confirm Order · ₹${subtotal}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#252525]">Order Summary</h2>
          <div className="space-y-3">
            {detailedItems.map((item) => (
              <div key={item.mealId} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-[#252525] truncate">
                    {item.mealName} × {item.quantity}
                  </p>
                  <p className="text-xs text-[#252525]/60">{item.chefName}</p>
                </div>
                <span className="font-semibold tabular-nums">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#252525]/10 space-y-1.5 text-sm">
            <div className="flex justify-between text-[#252525]/75">
              <span>Meals Subtotal</span>
              <span className="tabular-nums">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-[#176B45] font-medium">
              <span>Hostel Gate Delivery Fee</span>
              <span className="tabular-nums">₹0</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#252525] pt-2 border-t border-[#252525]/10">
              <span>Total Payable</span>
              <span className="tabular-nums">₹{subtotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OrderTrackingScreenProps {
  order: Order;
  justConfirmed?: boolean;
  onBackToOrders: () => void;
  onStatusUpdated: (order: Order) => void;
}

const STAGES: OrderStatus[] = [
  'Order Placed',
  'Order Accepted by Chef',
  'Food Being Prepared',
  'Ready for Dispatch',
  'Delivered / Collected',
];

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  order,
  justConfirmed,
  onBackToOrders,
  onStatusUpdated,
}) => {
  const [updating, setUpdating] = useState(false);
  const currentIndex = STAGES.indexOf(order.status);

  const handleSimulateNext = async () => {
    if (currentIndex === -1 || currentIndex >= STAGES.length - 1) return;
    const nextStage = STAGES[currentIndex + 1];
    setUpdating(true);
    try {
      const { order: updated } = await api.updateOrderStatus(order.id, nextStage);
      onStatusUpdated(updated);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button
        type="button"
        onClick={onBackToOrders}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#176B45] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Orders
      </button>

      {justConfirmed && (
        <div className="rounded-2xl border border-[#176B45]/25 bg-[#176B45]/5 p-6 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-[#176B45] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-[#176B45]">
              Demo Order Confirmed · {order.id}
            </h2>
            <p className="text-sm text-[#252525]/80">
              Your order has been routed to the home chef dashboard. Payment mode ({order.paymentMethod}) is recorded in prototype mode—no real financial charge occurred.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#252525]/10">
          <div>
            <p className="font-mono text-xs text-[#252525]/60">ORDER ID: {order.id}</p>
            <h1 className="font-display text-2xl font-bold text-[#252525] mt-1">
              {order.status}
            </h1>
            <p className="text-sm text-[#252525]/70 mt-1">
              Expected Hostel Gate Window: <strong className="text-[#252525]">{order.timeSlot}</strong>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#252525]/60">Total Paid / Due</p>
            <p className="font-display text-2xl font-bold text-[#176B45] tabular-nums">
              ₹{order.totalAmount}
            </p>
            <p className="text-xs text-[#252525]/60">Delivery Fee ₹0</p>
          </div>
        </div>

        {/* 5-Stage Campus Gate Drop-off Timeline (No GPS) */}
        {order.status === 'Cancelled' ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            This order was cancelled.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-[#252525]">
                Pre-Arranged Hostel Gate Dispatch Status
              </h2>
              {currentIndex >= 0 && currentIndex < STAGES.length - 1 && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleSimulateNext}
                  className="rounded-xl border border-[#176B45]/25 bg-[#176B45]/5 px-3 py-1.5 text-xs font-semibold text-[#176B45] hover:bg-[#176B45]/10 cursor-pointer"
                >
                  {updating ? 'Updating...' : 'Simulate Next Stage (Demo)'}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {STAGES.map((stage, idx) => {
                const done = idx <= currentIndex;
                const active = idx === currentIndex;
                return (
                  <div key={stage} className="flex items-center gap-3.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold tabular-nums shrink-0 ${
                        done
                          ? 'bg-[#176B45] text-white'
                          : 'bg-[#FFFDF8] border border-[#252525]/20 text-[#252525]/45'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 flex items-center justify-between py-1">
                      <span
                        className={`text-sm ${
                          active
                            ? 'font-bold text-[#176B45]'
                            : done
                            ? 'font-semibold text-[#252525]'
                            : 'text-[#252525]/50'
                        }`}
                      >
                        {stage}
                      </span>
                      {active && <span className="text-xs font-medium text-[#176B45]">Current</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#252525]/10 text-sm">
          <div className="rounded-xl bg-[#FFFDF8] border border-[#252525]/10 p-4 space-y-1">
            <p className="text-xs font-semibold text-[#252525]/60 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#176B45]" />
              Hostel Gate Collection Point
            </p>
            <p className="font-semibold text-[#252525]">{order.hostelName}</p>
            <p className="text-xs text-[#252525]/75">{order.dropOffGate}</p>
            {order.instructions && (
              <p className="text-xs text-[#252525]/65 pt-1">Note: {order.instructions}</p>
            )}
          </div>

          <div className="rounded-xl bg-[#FFFDF8] border border-[#252525]/10 p-4 space-y-2">
            <p className="text-xs font-semibold text-[#252525]/60">Meal & Chef Details</p>
            {order.items.map((item) => (
              <div key={item.mealId} className="flex justify-between text-xs">
                <span className="text-[#252525] font-medium">
                  {item.mealName} × {item.quantity} ({item.chefName})
                </span>
                <span className="tabular-nums font-semibold">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <p className="text-xs text-[#252525]/60 pt-1">Payment: {order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
