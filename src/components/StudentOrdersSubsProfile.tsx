import React, { useState } from 'react';
import {
  Calendar,
  Check,
  Info,
  LogOut,
  MapPin,
  RotateCcw,
  Star,
  User,
  X,
} from 'lucide-react';
import { api } from '../api';
import type {
  Meal,
  Order,
  PaymentMethod,
  Review,
  Student,
  Subscription,
  SubscriptionPlanConfig,
} from '../types';

interface SubscriptionsScreenProps {
  student: Student | null;
  subscriptions: Subscription[];
  planConfig: SubscriptionPlanConfig;
  meals: Meal[];
  onRequireLogin: () => void;
  onSubscriptionChanged: () => Promise<void> | void;
  onOrderSingleMeal: () => void;
  onOrderTrialMeal: (trialMeal: Meal) => void;
}

export const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({
  student,
  subscriptions,
  planConfig,
  meals,
  onRequireLogin,
  onSubscriptionChanged,
  onOrderSingleMeal,
  onOrderTrialMeal,
}) => {
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI (Demo Prototype)');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const studentSubs = student
    ? subscriptions.filter((s) => s.studentId === student.id)
    : [];
  const activeSub = studentSubs.find((s) => s.status === 'active');
  const trialMeal = meals.find((m) => m.isTrialOffer && m.isAvailable) || meals.find((m) => m.price <= 50);

  const handleSubscribe = async () => {
    if (!student) {
      onRequireLogin();
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      await api.createSubscription({
        studentId: student.id,
        studentName: student.name,
        hostelName: student.hostelName,
        paymentMethod,
      });
      await onSubscriptionChanged();
      setFeedback(
        `Demo Weekly Subscription recorded for ${student.name}. No real money was charged.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSub = async (subId: string) => {
    setSubmitting(true);
    try {
      await api.updateSubscription(subId, { status: 'cancelled' });
      await onSubscriptionChanged();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs font-semibold text-[#176B45]">
          Ajmer Campus Pilot · Affordable Daily Meal Options
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#252525]">
          Meal Plans & Weekly Subscription
        </h1>
        <p className="text-sm text-[#252525]/75 leading-relaxed">
          Choose between our ₹{planConfig.trialMealPrice} first-trial tiffin, standard ₹{planConfig.standardMealPrice} single meals, or the ₹{planConfig.weeklyPrice} weekly advance subscription hypothesis.
        </p>
      </div>

      {feedback && (
        <div className="rounded-xl border border-[#176B45]/25 bg-[#176B45]/10 px-4 py-3 text-sm text-[#176B45]">
          {feedback}
        </div>
      )}

      {/* Active Subscription Status Card */}
      {student && activeSub && (
        <div className="rounded-2xl bg-white border border-[#176B45]/25 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#176B45]">
                Subscription Status: Active · {activeSub.id}
              </p>
              <h2 className="font-display text-xl font-bold text-[#252525] mt-0.5">
                {activeSub.planName}
              </h2>
              <p className="text-sm text-[#252525]/75 mt-1">{activeSub.scheduleSummary}</p>
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleCancelSub(activeSub.id)}
              className="rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
            >
              Cancel Subscription
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#252525]/10">
            <div>
              <p className="text-xs text-[#252525]/60">Start Date</p>
              <p className="font-display text-base font-semibold text-[#252525] tabular-nums">
                {new Date(activeSub.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#252525]/60">Expiry Date</p>
              <p className="font-display text-base font-semibold text-[#252525] tabular-nums">
                {new Date(activeSub.expiryDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#252525]/60">Remaining Meals</p>
              <p className="font-display text-xl font-bold text-[#176B45] tabular-nums">
                {activeSub.remainingMeals} of {activeSub.totalMeals} meals
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Three Plan Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Trial Meal */}
        <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#FFAA45]">First-Time Student Offer</p>
            <h2 className="font-display text-xl font-bold text-[#252525]">Trial Meal</h2>
            <p className="font-display text-3xl font-extrabold text-[#252525] tabular-nums">
              ₹{planConfig.trialMealPrice}
              <span className="text-sm font-normal text-[#252525]/60"> / first tiffin</span>
            </p>
            <p className="text-sm text-[#252525]/75 leading-relaxed">
              Promotional first-trial meal for Ajmer hostel students to test homemade taste, packaging hygiene, and gate drop-off punctuality.
            </p>
            <ul className="space-y-2 pt-2 text-sm text-[#252525]/80">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#176B45]" />
                <span>Dal, Rice & 2 Whole-Wheat Rotis</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#176B45]" />
                <span>₹0 Hostel Gate Delivery</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            disabled={!trialMeal}
            onClick={() => trialMeal && onOrderTrialMeal(trialMeal)}
            className="w-full rounded-xl border border-[#176B45] px-4 py-3 text-sm font-semibold text-[#176B45] hover:bg-[#176B45]/5 transition-colors cursor-pointer"
          >
            Order ₹{planConfig.trialMealPrice} Trial Meal
          </button>
        </div>

        {/* Weekly Student Meal Plan (MVP Hypothesis) */}
        <div className="rounded-2xl bg-white border-2 border-[#176B45] p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#176B45]">
              MVP Validation Hypothesis · Advance Plan
            </p>
            <h2 className="font-display text-xl font-bold text-[#252525]">
              {planConfig.weeklyPlanName}
            </h2>
            <p className="font-display text-3xl font-extrabold text-[#176B45] tabular-nums">
              ₹{planConfig.weeklyPrice}
              <span className="text-sm font-normal text-[#252525]/60"> / week</span>
            </p>
            <p className="text-xs text-[#252525]/70 leading-relaxed bg-[#FFFDF8] border border-[#252525]/10 rounded-xl p-3">
              {planConfig.hypothesisNote}
            </p>
            <div className="space-y-1.5 pt-1 text-sm text-[#252525]/85">
              <p className="font-semibold">
                Configured Demo Schedule ({planConfig.weeklyMealsCount} meals):
              </p>
              <p className="text-xs text-[#252525]/75">{planConfig.weeklyScheduleLabel}</p>
            </div>
            <div className="pt-1">
              <label className="block text-xs font-medium text-[#252525]/70 mb-1">
                Demo Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2 text-xs font-medium focus:outline-none"
              >
                <option value="UPI (Demo Prototype)">UPI (Demo Prototype)</option>
                <option value="Cash on Delivery / Pay at Collection">
                  Pay at First Gate Collection
                </option>
                <option value="Demo Prototype Payment">Demo Prototype Payment</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={submitting || Boolean(activeSub)}
              onClick={handleSubscribe}
              className="w-full rounded-xl bg-[#176B45] px-4 py-3 text-sm font-semibold text-white hover:bg-[#125436] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {activeSub
                ? 'Active Plan Running'
                : submitting
                ? 'Recording Subscription...'
                : `Subscribe Now · ₹${planConfig.weeklyPrice}/week`}
            </button>
            <button
              type="button"
              onClick={() => setShowPlanDetails(true)}
              className="w-full rounded-xl border border-[#252525]/15 px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
            >
              View Plan Details
            </button>
          </div>
        </div>

        {/* Individual Meal */}
        <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#252525]/65">Pay Per Order</p>
            <h2 className="font-display text-xl font-bold text-[#252525]">Individual Meal</h2>
            <p className="font-display text-3xl font-extrabold text-[#252525] tabular-nums">
              ₹{planConfig.standardMealPrice}
              <span className="text-sm font-normal text-[#252525]/60"> / meal</span>
            </p>
            <p className="text-sm text-[#252525]/75 leading-relaxed">
              Order single lunch or dinner meals whenever hostel mess food is unappealing—no commitment required.
            </p>
            <ul className="space-y-2 pt-2 text-sm text-[#252525]/80">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#176B45]" />
                <span>Illustrative standard price ₹{planConfig.standardMealPrice}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#176B45]" />
                <span>Zero delivery fee & no hidden charges</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={onOrderSingleMeal}
            className="w-full rounded-xl border border-[#252525]/15 px-4 py-3 text-sm font-semibold text-[#252525] hover:bg-[#252525]/5 transition-colors cursor-pointer"
          >
            Browse ₹{planConfig.standardMealPrice} Menu
          </button>
        </div>
      </div>

      {/* Subscription History for Student */}
      {student && studentSubs.length > 0 && (
        <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-[#252525]">
            Your Subscription History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#252525]/10 text-xs text-[#252525]/60">
                  <th className="py-2 pr-4">Subscription ID</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Schedule</th>
                  <th className="py-2 pr-4">Meals Left</th>
                  <th className="py-2 pr-4">Valid Dates</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252525]/10">
                {studentSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td className="py-3 pr-4 font-mono text-xs">{sub.id}</td>
                    <td className="py-3 pr-4 font-medium">{sub.planName}</td>
                    <td className="py-3 pr-4 text-xs text-[#252525]/70">{sub.scheduleSummary}</td>
                    <td className="py-3 pr-4 tabular-nums">
                      {sub.remainingMeals}/{sub.totalMeals}
                    </td>
                    <td className="py-3 pr-4 text-xs tabular-nums">
                      {new Date(sub.startDate).toLocaleDateString('en-IN')} –{' '}
                      {new Date(sub.expiryDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 capitalize font-semibold text-xs text-[#176B45]">
                      {sub.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      {showPlanDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#252525]">
                {planConfig.weeklyPlanName} — Details
              </h3>
              <button
                type="button"
                onClick={() => setShowPlanDetails(false)}
                className="p-1.5 rounded-lg text-[#252525]/60 hover:bg-[#252525]/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-[#252525]/80">
              <p>
                <strong>Price:</strong> ₹{planConfig.weeklyPrice} per week (advance validation model, ₹0 delivery fee).
              </p>
              <p>
                <strong>Admin-Configured Meal Allocation:</strong> {planConfig.weeklyMealsCount} meals per week.
              </p>
              <p>
                <strong>Schedule:</strong> {planConfig.weeklyScheduleLabel}.
              </p>
              <div className="rounded-xl bg-[#FFFDF8] border border-[#252525]/10 p-3.5 text-xs text-[#252525]/75 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#176B45] shrink-0 mt-0.5" />
                <span>
                  As an early-stage MVP hypothesis, meal quantities and delivery schedules can be adjusted by the HostelBites Admin team based on student pilot feedback in Ajmer.
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPlanDetails(false)}
                className="rounded-xl bg-[#176B45] px-5 py-2 text-sm font-semibold text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ReviewModalProps {
  order: Order | null;
  student: Student;
  onClose: () => void;
  onSubmitted: () => Promise<void> | void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  order,
  student,
  onClose,
  onSubmitted,
}) => {
  const [taste, setTaste] = useState(5);
  const [quality, setQuality] = useState(5);
  const [portion, setPortion] = useState(5);
  const [packaging, setPackaging] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!order) return null;
  const primaryItem = order.items[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a short comment about your meal experience.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.submitReview({
        orderId: order.id,
        mealId: primaryItem.mealId,
        mealName: primaryItem.mealName,
        chefId: primaryItem.chefId,
        studentId: student.id,
        studentName: student.name,
        hostelName: student.hostelName,
        tasteRating: taste,
        qualityRating: quality,
        portionRating: portion,
        packagingRating: packaging,
        punctualityRating: punctuality,
        comment,
      });
      await onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingRow = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (n: number) => void;
  }) => (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[#252525]/85">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 cursor-pointer"
            aria-label={`Rate ${label} ${star} out of 5`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'fill-[#FFAA45] text-[#FFAA45]' : 'text-[#252525]/20'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-[#252525]">Rate & Review Meal</h3>
            <p className="text-xs text-[#252525]/65">
              {primaryItem.mealName} · Order {order.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#252525]/60 hover:bg-[#252525]/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5 rounded-xl bg-[#FFFDF8] border border-[#252525]/10 p-4">
            <RatingRow label="Food Taste" value={taste} onChange={setTaste} />
            <RatingRow label="Food Quality & Hygiene" value={quality} onChange={setQuality} />
            <RatingRow label="Portion Size" value={portion} onChange={setPortion} />
            <RatingRow label="Packaging" value={packaging} onChange={setPackaging} />
            <RatingRow label="Delivery Punctuality" value={punctuality} onChange={setPunctuality} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#252525]/75 mb-1">
              Your Feedback
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the food compared to hostel mess meals?"
              className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#252525]/15 px-4 py-2.5 text-sm font-medium text-[#252525] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#176B45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#125436] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface MyOrdersScreenProps {
  student: Student | null;
  orders: Order[];
  reviews: Review[];
  onTrackOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onOrderUpdated: () => Promise<void> | void;
  onRequireLogin: () => void;
  onOpenMenu: () => void;
}

export const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({
  student,
  orders,
  reviews,
  onTrackOrder,
  onReorder,
  onOrderUpdated,
  onRequireLogin,
  onOpenMenu,
}) => {
  const [tab, setTab] = useState<'current' | 'completed' | 'cancelled' | 'all'>('all');
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  if (!student) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#252525]">Sign In to View Orders</h1>
        <p className="text-sm text-[#252525]/70">
          Log in with your student account or demo account to track current meals and reorder past favorites.
        </p>
        <button
          type="button"
          onClick={onRequireLogin}
          className="rounded-xl bg-[#176B45] px-6 py-3 text-sm font-semibold text-white cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.studentId === student.id);
  const filtered = myOrders.filter((o) => {
    if (tab === 'current') return o.status !== 'Delivered / Collected' && o.status !== 'Cancelled';
    if (tab === 'completed') return o.status === 'Delivered / Collected';
    if (tab === 'cancelled') return o.status === 'Cancelled';
    return true;
  });

  const handleCancelOrder = async (orderId: string) => {
    await api.updateOrderStatus(orderId, 'Cancelled');
    await onOrderUpdated();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#252525]">My Orders</h1>
          <p className="text-sm text-[#252525]/70 mt-1">
            Track live hostel gate dispatch status, reorder favorites, or leave a meal review.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#252525]/10 rounded-xl">
          {(
            [
              ['all', 'All History'],
              ['current', 'Current'],
              ['completed', 'Completed'],
              ['cancelled', 'Cancelled'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                tab === key ? 'bg-[#176B45] text-white' : 'text-[#252525]/70 hover:text-[#252525]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#252525]/10 p-12 text-center space-y-3">
          <p className="text-sm text-[#252525]/70">No orders in this category yet.</p>
          <button
            type="button"
            onClick={onOpenMenu}
            className="rounded-xl bg-[#176B45] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
          >
            Explore Homemade Meals
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const alreadyReviewed = reviews.some((r) => r.orderId === order.id);
            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-[#252525]/10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#252525]/65">
                    <span className="font-mono font-semibold text-[#252525]">{order.id}</span>
                    <span>·</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>·</span>
                    <span
                      className={`font-semibold ${
                        order.status === 'Cancelled'
                          ? 'text-red-700'
                          : order.status === 'Delivered / Collected'
                          ? 'text-[#176B45]'
                          : 'text-amber-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="font-display text-base font-bold text-[#252525]">
                    {order.items.map((i) => `${i.mealName} × ${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs text-[#252525]/70">
                    {order.dropOffGate} · {order.timeSlot} · {order.paymentMethod}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-lg font-bold text-[#252525] tabular-nums mr-2">
                    ₹{order.totalAmount}
                  </span>
                  <button
                    type="button"
                    onClick={() => onTrackOrder(order)}
                    className="rounded-xl border border-[#252525]/15 px-3.5 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
                  >
                    Order Details & Track
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorder(order)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#176B45]/10 px-3.5 py-2 text-xs font-semibold text-[#176B45] hover:bg-[#176B45]/15 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reorder
                  </button>
                  {order.status === 'Order Placed' && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  {order.status === 'Delivered / Collected' && !alreadyReviewed && (
                    <button
                      type="button"
                      onClick={() => setReviewOrder(order)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#FFAA45] px-3.5 py-2 text-xs font-bold text-[#252525] hover:bg-[#f59d34] cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Rate & Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          student={student}
          onClose={() => setReviewOrder(null)}
          onSubmitted={onOrderUpdated}
        />
      )}
    </div>
  );
};

interface StudentProfileScreenProps {
  student: Student | null;
  subscriptions: Subscription[];
  orders: Order[];
  onUpdated: () => Promise<void> | void;
  onLogout: () => void;
  onRequireLogin: () => void;
  onViewOrders: () => void;
  onViewSubscriptions: () => void;
}

export const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({
  student,
  subscriptions,
  orders,
  onUpdated,
  onLogout,
  onRequireLogin,
  onViewOrders,
  onViewSubscriptions,
}) => {
  const [name, setName] = useState(student?.name || '');
  const [mobile, setMobile] = useState(student?.mobile || '');
  const [college, setCollege] = useState(student?.college || '');
  const [hostelName, setHostelName] = useState(student?.hostelName || '');
  const [dropOffGate, setDropOffGate] = useState(student?.dropOffGate || '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  if (!student) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <User className="w-10 h-10 text-[#176B45]/50 mx-auto" />
        <h1 className="font-display text-2xl font-bold text-[#252525]">Student Profile</h1>
        <p className="text-sm text-[#252525]/70">
          Sign in or register to save your Ajmer college, hostel name, and gate drop-off location.
        </p>
        <button
          type="button"
          onClick={onRequireLogin}
          className="rounded-xl bg-[#176B45] px-6 py-3 text-sm font-semibold text-white cursor-pointer"
        >
          Login / Register
        </button>
      </div>
    );
  }

  const activeSub = subscriptions.find((s) => s.studentId === student.id && s.status === 'active');
  const orderCount = orders.filter((o) => o.studentId === student.id).length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      await api.updateStudent(student.id, { name, mobile, college, hostelName, dropOffGate });
      await onUpdated();
      setSavedMsg('Profile & saved hostel drop-off location updated.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#252525]">
            Student Profile
          </h1>
          <p className="text-sm text-[#252525]/70 mt-1">
            Manage your college hostel details, saved gate drop-off point, and subscriptions.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-[#252525]">
            Personal & Hostel Drop-off Details
          </h2>
          {savedMsg && (
            <div className="rounded-xl border border-[#176B45]/25 bg-[#176B45]/10 px-4 py-2.5 text-xs font-medium text-[#176B45]">
              {savedMsg}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#252525]/75 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
          <div>
            <label className="block text-xs font-medium text-[#252525]/75 mb-1">Email Address</label>
            <input
              type="email"
              value={student.email}
              disabled
              className="w-full rounded-xl border border-[#252525]/10 bg-[#252525]/5 px-3.5 py-2.5 text-sm text-[#252525]/65"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252525]/75 mb-1">College / University</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#252525]/75 mb-1">Hostel / PG Name</label>
              <input
                type="text"
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                Saved Drop-off Location
              </label>
              <input
                type="text"
                value={dropOffGate}
                onChange={(e) => setDropOffGate(e.target.value)}
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#176B45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#125436] disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>

        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#176B45]">
              <Calendar className="w-4 h-4" />
              <span>Active Subscription</span>
            </div>
            {activeSub ? (
              <div className="space-y-1.5">
                <p className="font-display text-base font-bold text-[#252525]">
                  {activeSub.planName}
                </p>
                <p className="text-xs text-[#252525]/70">{activeSub.scheduleSummary}</p>
                <p className="text-sm font-semibold text-[#176B45] tabular-nums pt-1">
                  {activeSub.remainingMeals} meals remaining
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#252525]/70">No active weekly subscription.</p>
            )}
            <button
              type="button"
              onClick={onViewSubscriptions}
              className="text-xs font-semibold text-[#176B45] hover:underline cursor-pointer"
            >
              View Subscription Plans →
            </button>
          </div>

          <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#252525]">
              <MapPin className="w-4 h-4 text-[#176B45]" />
              <span>Order History Summary</span>
            </div>
            <p className="font-display text-2xl font-bold text-[#252525] tabular-nums">
              {orderCount} Orders Placed
            </p>
            <button
              type="button"
              onClick={onViewOrders}
              className="text-xs font-semibold text-[#176B45] hover:underline cursor-pointer"
            >
              Open Full Order History →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
