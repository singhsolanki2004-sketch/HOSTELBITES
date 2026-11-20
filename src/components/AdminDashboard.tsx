import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  LogOut,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
  Utensils,
  XCircle,
} from 'lucide-react';
import { api } from '../api';
import type {
  Chef,
  DatabaseState,
  OrderStatus,
  SubscriptionStatus,
} from '../types';
import { BrandLogo, FoodImage } from './BrandLogo';

interface AdminDashboardProps {
  db: DatabaseState;
  onDataChanged: () => Promise<void> | void;
  onLogout: () => void;
  onSwitchToStudentView: () => void;
}

type AdminTab =
  | 'analytics'
  | 'chefs'
  | 'orders'
  | 'menu'
  | 'students'
  | 'subscriptions'
  | 'reviews';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  db,
  onDataChanged,
  onLogout,
  onSwitchToStudentView,
}) => {
  const [tab, setTab] = useState<AdminTab>('analytics');
  const [studentSearch, setStudentSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});

  // Plan Configurator state
  const [weeklyMealsCount, setWeeklyMealsCount] = useState(String(db.planConfig.weeklyMealsCount));
  const [weeklyScheduleLabel, setWeeklyScheduleLabel] = useState(db.planConfig.weeklyScheduleLabel);
  const [planSavedMsg, setPlanSavedMsg] = useState('');

  const verifiedChefsCount = db.chefs.filter((c) => c.verificationStatus === 'verified').length;
  const pendingChefsCount = db.chefs.filter((c) => c.verificationStatus === 'pending').length;
  const activeSubsCount = db.subscriptions.filter((s) => s.status === 'active').length;
  const orderRevenue = db.orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const subscriptionRevenue = db.subscriptions
    .filter((s) => s.status !== 'cancelled')
    .reduce((sum, s) => sum + s.price, 0);
  const totalRevenue = orderRevenue + subscriptionRevenue;

  const popularMeals = useMemo(() => {
    const counts = new Map<string, { name: string; count: number; revenue: number }>();
    for (const order of db.orders) {
      if (order.status === 'Cancelled') continue;
      for (const item of order.items) {
        const cur = counts.get(item.mealName) || { name: item.mealName, count: 0, revenue: 0 };
        cur.count += item.quantity;
        cur.revenue += item.price * item.quantity;
        counts.set(item.mealName, cur);
      }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count);
  }, [db.orders]);

  const dailyChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseCounts = [4, 6, 5, 8, 7, 9, db.orders.length];
    return days.map((day, idx) => ({
      day,
      orders: baseCounts[idx],
      revenue: baseCounts[idx] * 80,
    }));
  }, [db.orders.length]);

  const handleVerifyChef = async (chef: Chef, status: 'verified' | 'rejected') => {
    setBusyId(chef.id);
    try {
      await api.verifyChef(
        chef.id,
        status,
        status === 'rejected'
          ? rejectNote[chef.id] || 'FSSAI documentation needs clearer verification.'
          : undefined,
      );
      await onDataChanged();
    } finally {
      setBusyId(null);
    }
  };

  const handleSavePlanConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId('plan-config');
    setPlanSavedMsg('');
    try {
      await api.updatePlanConfig({
        weeklyMealsCount: Math.max(1, Number(weeklyMealsCount) || 7),
        weeklyScheduleLabel: weeklyScheduleLabel.trim(),
      });
      await onDataChanged();
      setPlanSavedMsg('Weekly ₹500 subscription schedule updated for all students.');
    } finally {
      setBusyId(null);
    }
  };

  const handleResetDemo = async () => {
    setBusyId('reset-demo');
    try {
      await api.resetDemo();
      await onDataChanged();
    } finally {
      setBusyId(null);
    }
  };

  const filteredStudents = db.students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.college.toLowerCase().includes(q) ||
      s.hostelName.toLowerCase().includes(q) ||
      s.mobile.includes(q)
    );
  });

  const filteredOrders = db.orders.filter(
    (o) => orderFilter === 'all' || o.status === orderFilter,
  );

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'chefs', label: `Chefs (${pendingChefsCount})`, icon: <ChefHat className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'menu', label: 'Menu', icon: <Utensils className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-[#252525]/10 p-5 justify-between">
        <div className="space-y-6">
          <div>
            <BrandLogo size="sm" />
            <p className="text-xs font-medium text-[#252525]/60 pt-1">
              Ajmer Venture Admin Console
            </p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  tab === item.id
                    ? 'bg-[#176B45] text-white'
                    : 'text-[#252525]/75 hover:bg-[#252525]/5 hover:text-[#252525]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#252525]/10">
          <button
            type="button"
            onClick={onSwitchToStudentView}
            className="w-full rounded-xl border border-[#252525]/15 px-3.5 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
          >
            Student Storefront
          </button>
          <button
            type="button"
            disabled={busyId === 'reset-demo'}
            onClick={handleResetDemo}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#252525]/15 px-3.5 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 pb-20 md:pb-10">
        <header className="bg-white border-b border-[#252525]/10 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#252525]/60">HostelBites Operations · Ajmer Pilot</p>
            <h1 className="font-display text-lg sm:text-xl font-bold text-[#252525]">
              Administrative Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="md:hidden p-2 rounded-lg border border-[#252525]/15 text-[#252525]/70"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
          {/* 7 Key Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-3.5">
              <p className="text-[11px] text-[#252525]/60">Total Students</p>
              <p className="font-display text-xl font-bold tabular-nums mt-1">
                {db.students.length}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-3.5">
              <p className="text-[11px] text-[#252525]/60">Total Chefs</p>
              <p className="font-display text-xl font-bold tabular-nums mt-1">{db.chefs.length}</p>
            </div>
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-3.5">
              <p className="text-[11px] text-[#252525]/60">Verified Chefs</p>
              <p className="font-display text-xl font-bold text-[#176B45] tabular-nums mt-1">
                {verifiedChefsCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-3.5">
              <p className="text-[11px] text-[#252525]/60">Pending Apps</p>
              <p className="font-display text-xl font-bold text-amber-700 tabular-nums mt-1">
                {pendingChefsCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-3.5">
              <p className="text-[11px] text-[#252525]/60">Total Orders</p>
              <p className="font-display text-xl font-bold tabular-nums mt-1">{db.orders.length}</p>
            </div>
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-3.5">
              <p className="text-[11px] text-[#252525]/60">Active Subs</p>
              <p className="font-display text-xl font-bold text-[#176B45] tabular-nums mt-1">
                {activeSubsCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-3.5 col-span-2 sm:col-span-1">
              <p className="text-[11px] text-[#252525]/60">Total Revenue</p>
              <p className="font-display text-xl font-bold text-[#176B45] tabular-nums mt-1">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {tab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Orders & Revenue Chart */}
              <div className="lg:col-span-7 rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-bold text-[#252525]">
                      Weekly Orders & Revenue Trend (Ajmer Pilot)
                    </h2>
                    <p className="text-xs text-[#252525]/65">
                      Daily meal volume at ₹80 standard unit price (₹0 delivery fee)
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#176B45] font-semibold">
                    Orders ₹{orderRevenue} · Subs ₹{subscriptionRevenue}
                  </span>
                </div>

                <div className="h-52 flex items-end justify-between gap-3 pt-4 border-b border-[#252525]/10 pb-2">
                  {dailyChartData.map((d) => {
                    const heightPct = Math.max(14, Math.min(100, (d.orders / 10) * 100));
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <span className="font-mono text-[11px] text-[#252525]/70 tabular-nums">
                          {d.orders}
                        </span>
                        <div
                          className="w-full max-w-[36px] rounded-t-lg bg-[#176B45] transition-all"
                          style={{ height: `${heightPct}%` }}
                          title={`${d.day}: ${d.orders} orders (₹${d.revenue})`}
                        />
                        <span className="text-xs font-medium text-[#252525]/70">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular Meals Breakdown */}
              <div className="lg:col-span-5 rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
                <h2 className="font-display text-base font-bold text-[#252525]">
                  Most Popular Hostel Meals
                </h2>
                <div className="space-y-3">
                  {popularMeals.slice(0, 5).map((item) => {
                    const maxCount = popularMeals[0]?.count || 1;
                    const widthPct = Math.round((item.count / maxCount) * 100);
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-[#252525] truncate pr-2">
                            {item.name}
                          </span>
                          <span className="font-mono tabular-nums text-[#176B45] shrink-0">
                            {item.count} sold · ₹{item.revenue}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#FFFDF8] border border-[#252525]/10 overflow-hidden">
                          <div
                            className="h-full bg-[#36A66A] rounded-full"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'chefs' && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-[#252525]">
                Home Chef Verification & Applications
              </h2>
              <div className="space-y-4">
                {db.chefs.map((chef) => (
                  <div
                    key={chef.id}
                    className="rounded-2xl bg-white border border-[#252525]/10 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4">
                      <FoodImage
                        src={chef.avatarUrl}
                        alt={chef.name}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-bold text-[#252525]">
                            {chef.name} · {chef.kitchenName}
                          </h3>
                          {chef.verificationStatus === 'verified' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#176B45]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verified
                            </span>
                          ) : chef.verificationStatus === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                              <XCircle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#252525]/70">
                          {chef.locality}, {chef.city} · Mobile: {chef.mobile} · {chef.email}
                        </p>
                        <p className="text-xs font-mono text-[#252525]/85">
                          FSSAI Reg: {chef.fssaiNumber} ({chef.fssaiCertificateNote})
                        </p>
                        <p className="text-xs text-[#252525]/70">{chef.bio}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                      {chef.verificationStatus !== 'verified' && (
                        <input
                          type="text"
                          value={rejectNote[chef.id] || ''}
                          onChange={(e) =>
                            setRejectNote((prev) => ({ ...prev, [chef.id]: e.target.value }))
                          }
                          placeholder="Optional rejection note..."
                          className="rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2 text-xs"
                        />
                      )}
                      {chef.verificationStatus !== 'verified' && (
                        <button
                          type="button"
                          disabled={busyId === chef.id}
                          onClick={() => handleVerifyChef(chef, 'verified')}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#176B45] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125436] cursor-pointer whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Chef
                        </button>
                      )}
                      {chef.verificationStatus !== 'rejected' && (
                        <button
                          type="button"
                          disabled={busyId === chef.id}
                          onClick={() => handleVerifyChef(chef, 'rejected')}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer whitespace-nowrap"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-[#252525]">
                  Order Management ({filteredOrders.length})
                </h2>
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as 'all' | OrderStatus)}
                  className="rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2 text-xs font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Order Accepted by Chef">Order Accepted by Chef</option>
                  <option value="Food Being Prepared">Food Being Prepared</option>
                  <option value="Ready for Dispatch">Ready for Dispatch</option>
                  <option value="Delivered / Collected">Delivered / Collected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#252525]/10 text-[#252525]/60">
                      <th className="py-2.5 pr-4">Order ID</th>
                      <th className="py-2.5 pr-4">Student & Hostel Gate</th>
                      <th className="py-2.5 pr-4">Meals</th>
                      <th className="py-2.5 pr-4">Amount</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252525]/10">
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="py-3 pr-4 font-mono font-semibold">{order.id}</td>
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-[#252525]">{order.studentName}</p>
                          <p className="text-[#252525]/65">
                            {order.hostelName} · {order.dropOffGate}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          {order.items.map((i) => `${i.mealName} ×${i.quantity}`).join(', ')}
                        </td>
                        <td className="py-3 pr-4 font-semibold tabular-nums">
                          ₹{order.totalAmount}
                        </td>
                        <td className="py-3">
                          <select
                            value={order.status}
                            onChange={async (e) => {
                              await api.updateOrderStatus(order.id, e.target.value as OrderStatus);
                              await onDataChanged();
                            }}
                            className="rounded-lg border border-[#252525]/15 bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-medium"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Order Accepted by Chef">Order Accepted by Chef</option>
                            <option value="Food Being Prepared">Food Being Prepared</option>
                            <option value="Ready for Dispatch">Ready for Dispatch</option>
                            <option value="Delivered / Collected">Delivered / Collected</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'menu' && (
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#252525]">
                Campus Meal Catalog ({db.meals.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#252525]/10 text-[#252525]/60">
                      <th className="py-2.5 pr-4">Meal</th>
                      <th className="py-2.5 pr-4">Home Chef</th>
                      <th className="py-2.5 pr-4">Price (₹)</th>
                      <th className="py-2.5 pr-4">Qty</th>
                      <th className="py-2.5 pr-4">Today’s Special</th>
                      <th className="py-2.5">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252525]/10">
                    {db.meals.map((meal) => {
                      const chef = db.chefs.find((c) => c.id === meal.chefId);
                      return (
                        <tr key={meal.id}>
                          <td className="py-3 pr-4 font-semibold text-[#252525]">{meal.name}</td>
                          <td className="py-3 pr-4">
                            {chef?.name} ({chef?.verificationStatus})
                          </td>
                          <td className="py-3 pr-4">
                            <input
                              type="number"
                              defaultValue={meal.price}
                              onBlur={async (e) => {
                                const val = Math.max(1, Number(e.target.value) || meal.price);
                                if (val !== meal.price) {
                                  await api.updateMeal(meal.id, { price: val });
                                  await onDataChanged();
                                }
                              }}
                              className="w-16 rounded-lg border border-[#252525]/15 bg-[#FFFDF8] px-2 py-1 tabular-nums"
                            />
                          </td>
                          <td className="py-3 pr-4 tabular-nums">{meal.availableQty}</td>
                          <td className="py-3 pr-4">
                            <button
                              type="button"
                              onClick={async () => {
                                await api.updateMeal(meal.id, {
                                  isTodaysSpecial: !meal.isTodaysSpecial,
                                });
                                await onDataChanged();
                              }}
                              className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                                meal.isTodaysSpecial
                                  ? 'bg-[#FFAA45] text-[#252525]'
                                  : 'border border-[#252525]/15 text-[#252525]/70'
                              }`}
                            >
                              {meal.isTodaysSpecial ? 'Featured' : 'Standard'}
                            </button>
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={async () => {
                                await api.updateMeal(meal.id, { isAvailable: !meal.isAvailable });
                                await onDataChanged();
                              }}
                              className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                                meal.isAvailable
                                  ? 'bg-[#176B45]/10 text-[#176B45]'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {meal.isAvailable ? 'Available' : 'Paused'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'students' && (
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-[#252525]">
                  Registered Hostel Students ({filteredStudents.length})
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#252525]/45 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search student or hostel..."
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] pl-9 pr-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#252525]/10 text-[#252525]/60">
                      <th className="py-2.5 pr-4">Student</th>
                      <th className="py-2.5 pr-4">College</th>
                      <th className="py-2.5 pr-4">Hostel & Gate Drop-off</th>
                      <th className="py-2.5 pr-4">Contact</th>
                      <th className="py-2.5">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252525]/10">
                    {filteredStudents.map((stu) => {
                      const count = db.orders.filter((o) => o.studentId === stu.id).length;
                      return (
                        <tr key={stu.id}>
                          <td className="py-3 pr-4 font-semibold text-[#252525]">{stu.name}</td>
                          <td className="py-3 pr-4">{stu.college}</td>
                          <td className="py-3 pr-4">
                            {stu.hostelName} · {stu.dropOffGate}
                          </td>
                          <td className="py-3 pr-4 font-mono">{stu.mobile}</td>
                          <td className="py-3 tabular-nums font-semibold">{count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'subscriptions' && (
            <div className="space-y-6">
              {/* Admin Weekly Plan Hypothesis Configurator */}
              <form
                onSubmit={handleSavePlanConfig}
                className="rounded-2xl bg-white border border-[#176B45]/25 p-6 space-y-4"
              >
                <div>
                  <h2 className="font-display text-base font-bold text-[#252525]">
                    Configure ₹500 Weekly Plan Schedule & Meal Allocation
                  </h2>
                  <p className="text-xs text-[#252525]/70 mt-0.5">
                    The ₹500 weekly plan is an MVP validation hypothesis. Adjust meal quantity and schedule below; changes update the Student Subscription page immediately.
                  </p>
                </div>
                {planSavedMsg && (
                  <div className="rounded-xl border border-[#176B45]/25 bg-[#176B45]/10 px-4 py-2.5 text-xs font-medium text-[#176B45]">
                    {planSavedMsg}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                      Meals per Week
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={21}
                      value={weeklyMealsCount}
                      onChange={(e) => setWeeklyMealsCount(e.target.value)}
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                      Schedule Description
                    </label>
                    <input
                      type="text"
                      value={weeklyScheduleLabel}
                      onChange={(e) => setWeeklyScheduleLabel(e.target.value)}
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      disabled={busyId === 'plan-config'}
                      className="w-full rounded-xl bg-[#176B45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#125436] cursor-pointer"
                    >
                      Save Plan Config
                    </button>
                  </div>
                </div>
              </form>

              <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-[#252525]">
                  Student Subscriptions ({db.subscriptions.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#252525]/10 text-[#252525]/60">
                        <th className="py-2.5 pr-4">Sub ID</th>
                        <th className="py-2.5 pr-4">Student & Hostel</th>
                        <th className="py-2.5 pr-4">Price</th>
                        <th className="py-2.5 pr-4">Remaining Meals</th>
                        <th className="py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252525]/10">
                      {db.subscriptions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="py-3 pr-4 font-mono font-semibold">{sub.id}</td>
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-[#252525]">{sub.studentName}</p>
                            <p className="text-[#252525]/65">{sub.hostelName}</p>
                          </td>
                          <td className="py-3 pr-4 tabular-nums font-semibold">₹{sub.price}</td>
                          <td className="py-3 pr-4 tabular-nums">
                            {sub.remainingMeals} / {sub.totalMeals}
                          </td>
                          <td className="py-3">
                            <select
                              value={sub.status}
                              onChange={async (e) => {
                                await api.updateSubscription(sub.id, {
                                  status: e.target.value as SubscriptionStatus,
                                });
                                await onDataChanged();
                              }}
                              className="rounded-lg border border-[#252525]/15 bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-medium capitalize"
                            >
                              <option value="active">active</option>
                              <option value="expired">expired</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#252525]">
                Customer Ratings & Reviews ({db.reviews.length})
              </h2>
              <div className="space-y-3">
                {db.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-[#252525]/10 bg-[#FFFDF8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-[#252525]">
                          {rev.studentName} ({rev.hostelName})
                        </span>
                        <span>·</span>
                        <span className="text-[#176B45] font-medium">{rev.mealName}</span>
                        <span>·</span>
                        <span className="font-semibold tabular-nums">
                          ★ {rev.overallRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-[#252525]/85">{rev.comment}</p>
                      <p className="text-xs text-[#252525]/60 tabular-nums">
                        Taste {rev.tasteRating}/5 · Quality {rev.qualityRating}/5 · Portion {rev.portionRating}/5 · Packaging {rev.packagingRating}/5 · Punctuality {rev.punctualityRating}/5
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.moderateReview(rev.id, !rev.isVisible);
                        await onDataChanged();
                      }}
                      className={`rounded-xl px-3.5 py-2 text-xs font-semibold shrink-0 cursor-pointer ${
                        rev.isVisible
                          ? 'border border-[#252525]/15 text-[#252525] hover:bg-[#252525]/5'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {rev.isVisible ? 'Visible · Hide' : 'Hidden · Restore'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#252525]/10 grid grid-cols-5">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex flex-col items-center justify-center py-2 text-[10px] font-medium ${
              tab === item.id ? 'text-[#176B45]' : 'text-[#252525]/60'
            }`}
          >
            {item.icon}
            <span className="mt-0.5 truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
