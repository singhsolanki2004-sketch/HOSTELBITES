import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChefHat,
  Clock,
  MapPin,
  MessageCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import type { Chef, Meal, Order, Review, Student, Subscription, SubscriptionPlanConfig } from '../types';
import { FoodImage } from './BrandLogo';

interface ChefProfileModalProps {
  chef: Chef | null;
  reviews: Review[];
  meals: Meal[];
  onClose: () => void;
  onSelectMeal: (meal: Meal) => void;
}

export const ChefProfileModal: React.FC<ChefProfileModalProps> = ({
  chef,
  reviews,
  meals,
  onClose,
  onSelectMeal,
}) => {
  if (!chef) return null;
  const isVerified = chef.verificationStatus === 'verified';
  const chefReviews = reviews.filter((r) => r.chefId === chef.id && r.isVisible);
  const chefMeals = meals.filter((m) => m.chefId === chef.id && m.isAvailable);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chef-profile-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#252525]/10 shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]/10 bg-[#FFFDF8]">
          <h2 id="chef-profile-title" className="font-display text-lg font-semibold text-[#252525]">
            Home Chef Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#252525]/60 hover:text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
            aria-label="Close chef profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <FoodImage
              src={chef.avatarUrl}
              alt={chef.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-[#252525]/10"
              fallbackLabel={chef.name}
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl font-bold text-[#252525]">{chef.name}</h3>
                <span className="text-xs text-[#252525]/60">·</span>
                <span className="text-sm font-medium text-[#176B45]">{chef.kitchenName}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#252525]/70">
                <span>
                  {chef.locality}, {chef.city}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 tabular-nums font-medium text-[#252525]">
                  <Star className="w-3.5 h-3.5 fill-[#FFAA45] text-[#FFAA45]" />
                  {chef.rating.toFixed(1)} ({chef.reviewCount} reviews)
                </span>
                <span aria-hidden="true">·</span>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[#176B45]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Verified Chef
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Pending Verification
                  </span>
                )}
              </div>
              <p className="text-sm text-[#252525]/80 pt-1 leading-relaxed">{chef.bio}</p>
            </div>
          </div>

          {isVerified ? (
            <div className="rounded-xl border border-[#176B45]/20 bg-[#176B45]/5 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#176B45]">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Kitchen & FSSAI Hygiene Details</span>
              </div>
              <p className="text-xs text-[#252525]/80 font-mono">
                FSSAI Reg: {chef.fssaiNumber} · {chef.fssaiCertificateNote}
              </p>
              <p className="text-xs text-[#252525]/75">{chef.hygieneNotes}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <AlertCircle className="w-4 h-4" />
                <span>Hygiene & Certification Pending Admin Verification</span>
              </div>
              <p className="text-xs text-amber-800">
                This home chef has submitted onboarding details and is awaiting administrator kitchen verification. Hygiene certification details are hidden until approved.
              </p>
            </div>
          )}

          {chefMeals.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-display text-sm font-semibold text-[#252525]">
                Available Dishes from {chef.kitchenName}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chefMeals.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectMeal(m);
                    }}
                    className="flex items-center gap-3 rounded-xl border border-[#252525]/10 p-2.5 text-left hover:bg-[#FFFDF8] transition-colors cursor-pointer"
                  >
                    <FoodImage
                      src={m.imageUrl}
                      alt={m.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#252525] truncate">{m.name}</p>
                      <p className="text-xs text-[#176B45] font-medium tabular-nums">
                        ₹{m.price} · {m.availableQty} left
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {chefReviews.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-display text-sm font-semibold text-[#252525]">Student Reviews</h4>
              <div className="space-y-2.5">
                {chefReviews.map((rev) => (
                  <div key={rev.id} className="rounded-xl border border-[#252525]/10 p-3.5 bg-[#FFFDF8]">
                    <div className="flex items-center justify-between text-xs text-[#252525]/65">
                      <span className="font-semibold text-[#252525]">
                        {rev.studentName} · {rev.hostelName}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums font-semibold text-[#252525]">
                        <Star className="w-3.5 h-3.5 fill-[#FFAA45] text-[#FFAA45]" />
                        {rev.overallRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-[#252525]/80 mt-1.5">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface StudentDashboardProps {
  student: Student;
  meals: Meal[];
  chefs: Chef[];
  orders: Order[];
  subscription: Subscription | undefined;
  planConfig: SubscriptionPlanConfig;
  onAddToCart: (meal: Meal) => void;
  onViewMealDetails: (meal: Meal) => void;
  onViewChef: (chef: Chef) => void;
  onExploreMenu: () => void;
  onViewSubscriptions: () => void;
  onTrackOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onOpenWhatsApp: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  meals,
  chefs,
  orders,
  subscription,
  planConfig,
  onAddToCart,
  onViewMealDetails,
  onViewChef,
  onExploreMenu,
  onViewSubscriptions,
  onTrackOrder,
  onReorder,
  onOpenWhatsApp,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<'all' | 'under60' | '80'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const todaysSpecial = meals.find((m) => m.isTodaysSpecial && m.isAvailable) || meals[0];
  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      if (onlyAvailable && (!meal.isAvailable || meal.availableQty <= 0)) return false;
      if (maxPrice === 'under60' && meal.price >= 60) return false;
      if (maxPrice === '80' && meal.price > 80) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const chef = chefs.find((c) => c.id === meal.chefId);
        return (
          meal.name.toLowerCase().includes(q) ||
          meal.description.toLowerCase().includes(q) ||
          (chef?.name.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [meals, chefs, searchQuery, maxPrice, onlyAvailable]);

  const studentOrders = orders.filter((o) => o.studentId === student.id).slice(0, 3);
  const featuredChefs = chefs.filter((c) => c.verificationStatus === 'verified');

  return (
    <div className="space-y-10 pb-12">
      {/* Greeting & Prominent Message */}
      <section className="rounded-2xl bg-white border border-[#252525]/10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#176B45]">
            {student.hostelName} · {student.dropOffGate}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#252525]">
            Hello, {student.name}!
          </h1>
          <p className="text-sm sm:text-base text-[#252525]/75">
            Your ghar jaisa khana is just a few clicks away.
          </p>
          <p className="inline-block pt-1 text-sm font-semibold text-[#176B45]">
            Fresh Homemade Meals Starting at ₹{planConfig.standardMealPrice} | Zero Delivery Fee
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="inline-flex items-center gap-2 rounded-xl border border-[#176B45]/25 bg-[#176B45]/5 px-4 py-2.5 text-sm font-semibold text-[#176B45] hover:bg-[#176B45]/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Daily Menu
          </button>
          <button
            type="button"
            onClick={onExploreMenu}
            className="rounded-xl bg-[#176B45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#125436] transition-colors cursor-pointer whitespace-nowrap"
          >
            Explore Full Menu
          </button>
        </div>
      </section>

      {/* Today's Special + Active Subscription Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {todaysSpecial && (
          <div className="lg:col-span-7 rounded-2xl bg-white border border-[#252525]/10 overflow-hidden grid grid-cols-1 sm:grid-cols-12">
            <div className="sm:col-span-5 min-h-[200px]">
              <FoodImage
                src={todaysSpecial.imageUrl}
                alt={todaysSpecial.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#FFAA45] uppercase tracking-wider">
                  Today’s Special
                </p>
                <h2 className="font-display text-xl font-bold text-[#252525]">
                  {todaysSpecial.name}
                </h2>
                <p className="text-sm text-[#252525]/70 line-clamp-2">{todaysSpecial.description}</p>
                <p className="text-xs text-[#252525]/65 pt-1">
                  {chefs.find((c) => c.id === todaysSpecial.chefId)?.kitchenName} · {todaysSpecial.availableQty} portions left
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#252525]/10">
                <span className="font-display text-xl font-bold text-[#252525] tabular-nums">
                  ₹{todaysSpecial.price}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onViewMealDetails(todaysSpecial)}
                    className="rounded-xl border border-[#252525]/15 px-3.5 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToCart(todaysSpecial)}
                    className="rounded-xl bg-[#176B45] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125436] cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#252525]/10 p-6 flex flex-col justify-between space-y-4">
          {subscription && subscription.status === 'active' ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#176B45]">Active Subscription</span>
                  <span className="font-mono text-xs text-[#252525]/60">{subscription.id}</span>
                </div>
                <h2 className="font-display text-xl font-bold text-[#252525]">
                  {subscription.planName}
                </h2>
                <p className="text-xs text-[#252525]/70">{subscription.scheduleSummary}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#252525]/10">
                <div>
                  <p className="text-xs text-[#252525]/60">Remaining Meals</p>
                  <p className="font-display text-2xl font-bold text-[#176B45] tabular-nums">
                    {subscription.remainingMeals} / {subscription.totalMeals}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#252525]/60">Valid Until</p>
                  <p className="font-display text-base font-semibold text-[#252525] tabular-nums mt-1">
                    {new Date(subscription.expiryDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onViewSubscriptions}
                className="w-full rounded-xl border border-[#176B45]/25 px-4 py-2.5 text-sm font-semibold text-[#176B45] hover:bg-[#176B45]/5 transition-colors cursor-pointer"
              >
                Manage Subscription
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#176B45]">Weekly Pilot Offer</span>
                <h2 className="font-display text-xl font-bold text-[#252525]">
                  {planConfig.weeklyPlanName} — ₹{planConfig.weeklyPrice}/week
                </h2>
                <p className="text-sm text-[#252525]/75">{planConfig.weeklyScheduleLabel}</p>
              </div>
              <button
                type="button"
                onClick={onViewSubscriptions}
                className="w-full rounded-xl bg-[#FFAA45] px-4 py-2.5 text-sm font-bold text-[#252525] hover:bg-[#f59d34] transition-colors cursor-pointer"
              >
                Explore Weekly Plan
              </button>
            </>
          )}
        </div>
      </section>

      {/* Search & Today's Available Meals */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#252525]">
              Today’s Available Meals
            </h2>
            <p className="text-xs text-[#252525]/65 mt-0.5">
              Sample menus are illustrative; live availability reflects participating Ajmer chefs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-[#252525]/45 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dal, paneer, rajma..."
                className="w-full rounded-xl border border-[#252525]/15 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              />
            </div>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value as 'all' | 'under60' | '80')}
              className="rounded-xl border border-[#252525]/15 bg-white px-3 py-2 text-sm text-[#252525] focus:outline-none"
            >
              <option value="all">All Prices</option>
              <option value="under60">Trial (₹49)</option>
              <option value="80">Up to ₹80</option>
            </select>
            <button
              type="button"
              onClick={() => setOnlyAvailable((v) => !v)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                onlyAvailable
                  ? 'border-[#176B45] bg-[#176B45]/10 text-[#176B45]'
                  : 'border-[#252525]/15 bg-white text-[#252525]/70'
              }`}
            >
              {onlyAvailable ? 'Available Now' : 'Showing All'}
            </button>
          </div>
        </div>

        {filteredMeals.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#252525]/10 p-10 text-center space-y-3">
            <p className="text-sm text-[#252525]/75">No meals match your current search or filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setMaxPrice('all');
                setOnlyAvailable(false);
              }}
              className="rounded-xl border border-[#252525]/15 px-4 py-2 text-xs font-semibold text-[#176B45] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeals.slice(0, 6).map((meal) => {
              const chef = chefs.find((c) => c.id === meal.chefId);
              const isVerified = chef?.verificationStatus === 'verified';
              return (
                <article
                  key={meal.id}
                  className="rounded-2xl bg-white border border-[#252525]/10 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[#FFFDF8]">
                      <FoodImage src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#252525]/65">
                        <span>{meal.dietary}</span>
                        <span className="tabular-nums font-medium text-[#176B45]">
                          {meal.isAvailable && meal.availableQty > 0
                            ? `${meal.availableQty} portions left`
                            : 'Sold Out'}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-semibold text-[#252525]">
                        {meal.name}
                      </h3>
                      <p className="text-xs text-[#252525]/70 line-clamp-2">{meal.description}</p>
                      <p className="text-xs text-[#252525]/65 pt-0.5">
                        {chef?.name} · {isVerified ? 'Verified' : 'Pending Verification'} · ★ {meal.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-3 border-t border-[#252525]/10 flex items-center justify-between gap-2">
                    <span className="font-display text-lg font-bold text-[#252525] tabular-nums">
                      ₹{meal.price}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewMealDetails(meal)}
                        className="rounded-xl border border-[#252525]/15 px-3 py-1.5 text-xs font-medium text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        disabled={!meal.isAvailable || meal.availableQty <= 0}
                        onClick={() => onAddToCart(meal)}
                        className="rounded-xl bg-[#176B45] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#125436] disabled:opacity-45 cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Home Chefs & Recent Orders */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#252525]">
            Verified Ajmer Home Chefs
          </h2>
          <div className="space-y-3">
            {featuredChefs.map((chef) => (
              <div
                key={chef.id}
                className="rounded-2xl bg-white border border-[#252525]/10 p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <FoodImage
                    src={chef.avatarUrl}
                    alt={chef.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-[#252525] truncate">
                      {chef.name} · {chef.kitchenName}
                    </p>
                    <p className="text-xs text-[#252525]/65 truncate">{chef.specialty}</p>
                    <p className="text-xs text-[#176B45] font-medium mt-0.5 tabular-nums">
                      Verified FSSAI Kitchen · ★ {chef.rating.toFixed(1)} · {chef.locality}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onViewChef(chef)}
                  className="rounded-xl border border-[#252525]/15 px-3 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 shrink-0 cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#252525]">Recent Orders</h2>
          {studentOrders.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 text-sm text-[#252525]/70">
              You haven’t placed any orders yet. Explore today’s ₹80 home meals to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {studentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white border border-[#252525]/10 p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#252525]/60">
                      <span className="font-mono font-semibold text-[#252525]">{order.id}</span>
                      <span>·</span>
                      <span className="text-[#176B45] font-medium">{order.status}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#252525] truncate">
                      {order.items.map((i) => `${i.mealName} x${i.quantity}`).join(', ')}
                    </p>
                    <p className="text-xs text-[#252525]/65 tabular-nums">
                      ₹{order.totalAmount} · {order.timeSlot}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onTrackOrder(order)}
                      className="rounded-xl border border-[#252525]/15 px-3 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
                    >
                      Track
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorder(order)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#176B45]/10 px-3 py-2 text-xs font-semibold text-[#176B45] hover:bg-[#176B45]/15 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Order Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

interface ExploreMenuProps {
  meals: Meal[];
  chefs: Chef[];
  onAddToCart: (meal: Meal) => void;
  onViewMealDetails: (meal: Meal) => void;
  onViewChef: (chef: Chef) => void;
}

export const ExploreMenuScreen: React.FC<ExploreMenuProps> = ({
  meals,
  chefs,
  onAddToCart,
  onViewMealDetails,
  onViewChef,
}) => {
  const [search, setSearch] = useState('');
  const [dietary, setDietary] = useState<'all' | 'Veg' | 'Non-Veg'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'trial' | 'standard'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const filteredMeals = useMemo(() => {
    const list = meals.filter((meal) => {
      if (dietary !== 'all' && meal.dietary !== dietary) return false;
      if (priceFilter === 'trial' && meal.price > 55) return false;
      if (priceFilter === 'standard' && meal.price !== 80) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const chef = chefs.find((c) => c.id === meal.chefId);
        return (
          meal.name.toLowerCase().includes(q) ||
          meal.description.toLowerCase().includes(q) ||
          meal.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
          (chef?.name.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });

    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [meals, chefs, search, dietary, priceFilter, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#252525]">
            Explore Homemade Meals
          </h1>
          <p className="text-sm text-[#252525]/70 mt-1">
            Standard illustrative meal price ₹80 · Zero delivery fee at Ajmer hostel gates.
          </p>
        </div>
        <p className="text-xs text-[#252525]/65 bg-white border border-[#252525]/10 rounded-xl px-3.5 py-2">
          Note: Sample menus are illustrative; actual availability depends on participating Ajmer home chefs.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl bg-white border border-[#252525]/10 p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#252525]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Rajma Chawal, Veg Thali, Paratha, Chef..."
            className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-[#FFFDF8] border border-[#252525]/10 rounded-xl">
            {(['all', 'Veg', 'Non-Veg'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDietary(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  dietary === d ? 'bg-[#176B45] text-white' : 'text-[#252525]/70 hover:text-[#252525]'
                }`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as 'all' | 'trial' | 'standard')}
            className="rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2 text-xs font-semibold text-[#252525] focus:outline-none"
          >
            <option value="all">All Price Tiers</option>
            <option value="trial">Trial Offer (₹49)</option>
            <option value="standard">Standard Meal (₹80)</option>
          </select>

          <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#252525]/60" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-xs font-semibold text-[#252525] focus:outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {filteredMeals.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#252525]/10 p-12 text-center space-y-3">
          <p className="text-sm font-medium text-[#252525]/75">
            No homemade meals found matching your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setDietary('all');
              setPriceFilter('all');
            }}
            className="rounded-xl bg-[#176B45] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            Show All Meals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => {
            const chef = chefs.find((c) => c.id === meal.chefId);
            const isVerified = chef?.verificationStatus === 'verified';
            const available = meal.isAvailable && meal.availableQty > 0;
            return (
              <article
                key={meal.id}
                className="rounded-2xl bg-white border border-[#252525]/10 overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <div
                    className="aspect-[4/3] w-full overflow-hidden bg-[#FFFDF8] cursor-pointer"
                    onClick={() => onViewMealDetails(meal)}
                  >
                    <FoodImage
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[#252525]/65">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-[2px] ${
                            meal.dietary === 'Veg' ? 'bg-[#176B45]' : 'bg-red-600'
                          }`}
                        />
                        {meal.dietary}
                        {meal.isTrialOffer ? ' · Trial Offer' : ''}
                      </span>
                      <span
                        className={`tabular-nums font-semibold ${
                          available ? 'text-[#176B45]' : 'text-red-700'
                        }`}
                      >
                        {available ? `${meal.availableQty} available` : 'Unavailable'}
                      </span>
                    </div>

                    <h2
                      onClick={() => onViewMealDetails(meal)}
                      className="font-display text-lg font-semibold text-[#252525] cursor-pointer hover:text-[#176B45] transition-colors"
                    >
                      {meal.name}
                    </h2>

                    <p className="text-sm text-[#252525]/70 line-clamp-2">{meal.description}</p>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#252525]/70 pt-1">
                      <button
                        type="button"
                        onClick={() => chef && onViewChef(chef)}
                        className="font-medium text-[#252525] hover:text-[#176B45] hover:underline cursor-pointer"
                      >
                        {chef?.name || 'Home Chef'}
                      </button>
                      <span>·</span>
                      <span>{isVerified ? 'Verified Kitchen' : 'Pending Verification'}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-0.5 tabular-nums font-medium text-[#252525]">
                        <Star className="w-3.5 h-3.5 fill-[#FFAA45] text-[#FFAA45]" />
                        {meal.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[#252525]/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-display text-xl font-bold text-[#252525] tabular-nums">
                      ₹{meal.price}
                    </span>
                    <span className="block text-xs text-[#176B45]">₹0 delivery fee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewMealDetails(meal)}
                      className="rounded-xl border border-[#252525]/15 px-3.5 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 cursor-pointer whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => onAddToCart(meal)}
                      className="rounded-xl bg-[#176B45] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125436] disabled:opacity-45 cursor-pointer whitespace-nowrap"
                    >
                      {available ? 'Add to Cart' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface MealDetailsProps {
  meal: Meal;
  chef: Chef | undefined;
  reviews: Review[];
  onBack: () => void;
  onAddToCart: (meal: Meal, qty: number) => void;
  onViewChef: (chef: Chef) => void;
}

export const MealDetailsScreen: React.FC<MealDetailsProps> = ({
  meal,
  chef,
  reviews,
  onBack,
  onAddToCart,
  onViewChef,
}) => {
  const [qty, setQty] = useState(1);
  const isVerified = chef?.verificationStatus === 'verified';
  const available = meal.isAvailable && meal.availableQty > 0;
  const mealReviews = reviews.filter((r) => r.mealId === meal.id && r.isVisible);

  return (
    <div className="space-y-8 pb-12">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#176B45] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </button>

      {/* Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#252525]/10 bg-white">
          <FoodImage
            src={meal.imageUrl}
            alt={meal.name}
            className="w-full aspect-[4/3] object-cover"
          />
        </div>

        <div className="lg:col-span-6 rounded-2xl bg-white border border-[#252525]/10 p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#252525]/65">
              <span className="font-semibold text-[#176B45]">{meal.dietary}</span>
              <span>·</span>
              <span className="tabular-nums font-medium">
                ★ {meal.rating.toFixed(1)} ({meal.reviewCount} reviews)
              </span>
              <span>·</span>
              <span className="tabular-nums font-semibold text-[#176B45]">
                {available ? `${meal.availableQty} portions available` : 'Currently Unavailable'}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#252525]">
              {meal.name}
            </h1>
            <p className="text-sm sm:text-base text-[#252525]/75 leading-relaxed">
              {meal.description}
            </p>
          </div>

          <div className="flex items-baseline gap-3 pt-2 border-t border-[#252525]/10">
            <span className="font-display text-3xl font-bold text-[#252525] tabular-nums">
              ₹{meal.price}
            </span>
            <span className="text-sm font-medium text-[#176B45]">+ ₹0 Hostel Gate Delivery</span>
          </div>

          {/* Ingredients & Prep Details */}
          <div className="space-y-3 pt-2">
            <div>
              <h2 className="text-xs font-semibold text-[#252525]/70 uppercase tracking-wide">
                Ingredients
              </h2>
              <p className="text-sm text-[#252525]/85 mt-1">{meal.ingredients.join(' · ')}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#252525]/70 uppercase tracking-wide">
                Food Preparation Details
              </h2>
              <p className="text-sm text-[#252525]/85 mt-1">{meal.prepDetails}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#252525]/70 uppercase tracking-wide">
                Available Hostel Gate Collection Slots
              </h2>
              <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-[#252525]/80">
                {meal.timeSlots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#252525]/10 bg-[#FFFDF8] px-2.5 py-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#176B45]" />
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Chef & Hygiene Verification Gate */}
          {chef && (
            <div className="rounded-xl border border-[#252525]/10 bg-[#FFFDF8] p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FoodImage
                    src={chef.avatarUrl}
                    alt={chef.name}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#252525]">
                      {chef.name} · {chef.kitchenName}
                    </p>
                    <p className="text-xs text-[#252525]/65">
                      {chef.locality}, {chef.city}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onViewChef(chef)}
                  className="text-xs font-semibold text-[#176B45] hover:underline cursor-pointer whitespace-nowrap"
                >
                  Chef Profile
                </button>
              </div>

              {isVerified ? (
                <div className="pt-2 border-t border-[#252525]/10 text-xs text-[#176B45] space-y-1">
                  <p className="font-semibold inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Admin Verified Hygiene & FSSAI Reg: {chef.fssaiNumber}
                  </p>
                  <p className="text-[#252525]/75">{chef.hygieneNotes}</p>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#252525]/10 text-xs text-amber-800">
                  <p className="font-semibold inline-flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Chef Verification Pending
                  </p>
                  <p className="mt-0.5 text-amber-800/90">
                    Hygiene inspection and FSSAI certification details are displayed only after administrator approval.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center rounded-xl border border-[#252525]/15 bg-[#FFFDF8]">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2.5 text-sm font-bold text-[#252525] cursor-pointer"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-3 text-sm font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(meal.availableQty || 1, q + 1))}
                className="px-3.5 py-2.5 text-sm font-bold text-[#252525] cursor-pointer"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={!available}
              onClick={() => onAddToCart(meal, qty)}
              className="flex-1 rounded-xl bg-[#176B45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#125436] disabled:opacity-45 transition-colors cursor-pointer whitespace-nowrap"
            >
              {available ? `Add to Cart · ₹${meal.price * qty}` : 'Currently Sold Out'}
            </button>
          </div>
        </div>
      </div>

      {/* Meal Reviews */}
      <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#252525]">
          Student Reviews for {meal.name}
        </h2>
        {mealReviews.length === 0 ? (
          <p className="text-sm text-[#252525]/65">
            No reviews yet for this dish. Order and share your feedback after delivery!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealReviews.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-[#252525]/10 bg-[#FFFDF8] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#252525]">
                    {rev.studentName} · {rev.hostelName}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-[#FFAA45] text-[#FFAA45]" />
                    {rev.overallRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-[#252525]/80">{rev.comment}</p>
                <p className="text-xs text-[#252525]/60 tabular-nums">
                  Taste {rev.tasteRating}/5 · Quality {rev.qualityRating}/5 · Portion {rev.portionRating}/5 · Packaging {rev.packagingRating}/5 · Punctuality {rev.punctualityRating}/5
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
