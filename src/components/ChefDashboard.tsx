import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Edit3,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  User,
  Utensils,
} from 'lucide-react';
import { api } from '../api';
import type { Chef, DietaryType, Meal, Order, OrderStatus, Review } from '../types';
import { BrandLogo, FoodImage } from './BrandLogo';

interface ChefDashboardProps {
  chef: Chef;
  meals: Meal[];
  orders: Order[];
  reviews: Review[];
  onDataChanged: () => Promise<void> | void;
  onLogout: () => void;
  onSwitchToStudentView: () => void;
}

type ChefTab = 'overview' | 'orders' | 'menu' | 'profile';

const PRESET_FOOD_IMAGES = [
  { label: 'Dal, Rice & Sabzi', url: '/src/assets/images/meal_dal_sabzi_rice_1795109856817.jpg' },
  { label: 'Paneer, Roti & Salad', url: '/src/assets/images/meal_paneer_roti_salad_1795109857621.jpg' },
  { label: 'Rajma Chawal', url: '/src/assets/images/meal_rajma_chawal_1795109856726.jpg' },
  { label: 'Chole Rice', url: '/src/assets/images/meal_chole_rice_1795109856912.jpg' },
  { label: 'Aloo Paratha & Curd', url: '/src/assets/images/meal_aloo_paratha_curd_1795109857813.jpg' },
  { label: 'Dal Tadka & Jeera Rice', url: '/src/assets/images/meal_dal_tadka_jeera_1795109856729.jpg' },
  { label: 'Veg Thali', url: '/src/assets/images/hero_indian_thali_1795109857194.jpg' },
];

export const ChefDashboard: React.FC<ChefDashboardProps> = ({
  chef,
  meals,
  orders,
  reviews,
  onDataChanged,
  onLogout,
  onSwitchToStudentView,
}) => {
  const [tab, setTab] = useState<ChefTab>('overview');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Add / Edit Meal state
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showMealForm, setShowMealForm] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealDesc, setMealDesc] = useState('');
  const [mealIngredients, setMealIngredients] = useState('Dal, Rice, Whole Wheat Roti, Spices');
  const [mealPrice, setMealPrice] = useState('80');
  const [mealQty, setMealQty] = useState('20');
  const [mealDietary, setMealDietary] = useState<DietaryType>('Veg');
  const [mealImage, setMealImage] = useState(PRESET_FOOD_IMAGES[0].url);
  const [mealAvailable, setMealAvailable] = useState(true);
  const [mealError, setMealError] = useState('');

  // Profile edit state
  const [profName, setProfName] = useState(chef.name);
  const [profMobile, setProfMobile] = useState(chef.mobile);
  const [profKitchen, setProfKitchen] = useState(chef.kitchenName);
  const [profLocality, setProfLocality] = useState(chef.locality);
  const [profSpecialty, setProfSpecialty] = useState(chef.specialty);
  const [profBio, setProfBio] = useState(chef.bio);
  const [profFssai, setProfFssai] = useState(chef.fssaiNumber);
  const [profAvatar, setProfAvatar] = useState(chef.avatarUrl);
  const [profSaved, setProfSaved] = useState('');

  const chefMeals = useMemo(() => meals.filter((m) => m.chefId === chef.id), [meals, chef.id]);
  const chefOrders = useMemo(
    () => orders.filter((o) => o.items.some((i) => i.chefId === chef.id)),
    [orders, chef.id],
  );
  const chefReviews = useMemo(
    () => reviews.filter((r) => r.chefId === chef.id && r.isVisible),
    [reviews, chef.id],
  );

  const todayIso = new Date().toISOString().slice(0, 10);
  const todaysOrders = chefOrders.filter((o) => o.createdAt.slice(0, 10) === todayIso);
  const pendingOrders = chefOrders.filter(
    (o) =>
      o.status === 'Order Placed' ||
      o.status === 'Order Accepted by Chef' ||
      o.status === 'Food Being Prepared' ||
      o.status === 'Ready for Dispatch',
  );
  const completedOrders = chefOrders.filter((o) => o.status === 'Delivered / Collected');

  const calcChefRevenue = (list: Order[]) =>
    list
      .filter((o) => o.status !== 'Cancelled')
      .reduce(
        (sum, o) =>
          sum +
          o.items
            .filter((i) => i.chefId === chef.id)
            .reduce((s, i) => s + i.price * i.quantity, 0),
        0,
      );

  const todayEarnings = calcChefRevenue(todaysOrders);
  const monthlyEarnings = calcChefRevenue(chefOrders);

  const openNewMealForm = () => {
    setEditingMeal(null);
    setMealName('');
    setMealDesc('');
    setMealIngredients('Toor Dal, Basmati Rice, Seasonal Sabzi, 3 Rotis');
    setMealPrice('80');
    setMealQty('20');
    setMealDietary('Veg');
    setMealImage(PRESET_FOOD_IMAGES[0].url);
    setMealAvailable(true);
    setMealError('');
    setShowMealForm(true);
  };

  const openEditMealForm = (meal: Meal) => {
    setEditingMeal(meal);
    setMealName(meal.name);
    setMealDesc(meal.description);
    setMealIngredients(meal.ingredients.join(', '));
    setMealPrice(String(meal.price));
    setMealQty(String(meal.availableQty));
    setMealDietary(meal.dietary);
    setMealImage(meal.imageUrl);
    setMealAvailable(meal.isAvailable);
    setMealError('');
    setShowMealForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !mealDesc.trim()) {
      setMealError('Please enter a meal name and description.');
      return;
    }
    setBusyId('saving-meal');
    setMealError('');
    try {
      const payload = {
        chefId: chef.id,
        name: mealName.trim(),
        description: mealDesc.trim(),
        ingredients: mealIngredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        price: Math.max(1, Number(mealPrice) || 80),
        availableQty: Math.max(0, Number(mealQty) || 0),
        dietary: mealDietary,
        isAvailable: mealAvailable,
        imageUrl: mealImage,
      };
      if (editingMeal) {
        await api.updateMeal(editingMeal.id, payload);
      } else {
        await api.createMeal(payload);
      }
      await onDataChanged();
      setShowMealForm(false);
    } catch (err) {
      setMealError(err instanceof Error ? err.message : 'Unable to save meal.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setBusyId(orderId);
    try {
      await api.updateOrderStatus(orderId, status);
      await onDataChanged();
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleMealAvailability = async (meal: Meal) => {
    setBusyId(meal.id);
    try {
      await api.updateMeal(meal.id, { isAvailable: !meal.isAvailable });
      await onDataChanged();
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    setBusyId(mealId);
    try {
      await api.deleteMeal(mealId);
      await onDataChanged();
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId('saving-profile');
    setProfSaved('');
    try {
      await api.updateChef(chef.id, {
        name: profName,
        mobile: profMobile,
        kitchenName: profKitchen,
        locality: profLocality,
        specialty: profSpecialty,
        bio: profBio,
        fssaiNumber: profFssai,
        avatarUrl: profAvatar,
      });
      await onDataChanged();
      setProfSaved('Kitchen profile and FSSAI details updated.');
    } finally {
      setBusyId(null);
    }
  };

  const navItems: Array<{ id: ChefTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'menu', label: 'Menu', icon: <Utensils className="w-4 h-4" /> },
    { id: 'profile', label: 'Kitchen Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-[#252525]/10 p-5 justify-between">
        <div className="space-y-6">
          <div className="space-y-1">
            <BrandLogo size="sm" />
            <p className="text-xs font-medium text-[#252525]/60 pt-1">Home Chef Kitchen Console</p>
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
            View Student Storefront
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
          <div className="min-w-0">
            <p className="text-xs text-[#252525]/60">
              {chef.kitchenName} · {chef.locality}, Ajmer
            </p>
            <h1 className="font-display text-lg sm:text-xl font-bold text-[#252525] truncate">
              Welcome, Chef {chef.name}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {chef.verificationStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B45]">
                <ShieldCheck className="w-4 h-4" />
                Verified Kitchen
              </span>
            ) : chef.verificationStatus === 'rejected' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                <AlertCircle className="w-4 h-4" />
                Verification Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <AlertCircle className="w-4 h-4" />
                Pending Verification
              </span>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="md:hidden p-2 rounded-lg border border-[#252525]/15 text-[#252525]/70"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
          {/* Verification Warning for Unverified Chefs */}
          {chef.verificationStatus !== 'verified' && (
            <div
              className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-3 ${
                chef.verificationStatus === 'rejected'
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold">
                  {chef.verificationStatus === 'rejected'
                    ? 'Kitchen Verification Rejected by Admin'
                    : 'Pending Admin Verification'}
                </p>
                <p className="text-xs opacity-90">
                  {chef.verificationStatus === 'rejected'
                    ? chef.rejectionReason || 'Please update your FSSAI registration and kitchen hygiene info in your profile.'
                    : 'Your kitchen and FSSAI details are currently under review by the HostelBites Admin. You will not appear as certified to students until approved.'}
                </p>
              </div>
            </div>
          )}

          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-2xl bg-white border border-[#252525]/10 p-4">
                  <p className="text-xs text-[#252525]/60">Today’s Orders</p>
                  <p className="font-display text-2xl font-bold text-[#252525] tabular-nums mt-1">
                    {todaysOrders.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-[#252525]/10 p-4">
                  <p className="text-xs text-[#252525]/60">Pending / Active</p>
                  <p className="font-display text-2xl font-bold text-amber-700 tabular-nums mt-1">
                    {pendingOrders.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-[#252525]/10 p-4">
                  <p className="text-xs text-[#252525]/60">Completed Orders</p>
                  <p className="font-display text-2xl font-bold text-[#176B45] tabular-nums mt-1">
                    {completedOrders.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-[#252525]/10 p-4">
                  <p className="text-xs text-[#252525]/60">Today’s Earnings</p>
                  <p className="font-display text-2xl font-bold text-[#252525] tabular-nums mt-1">
                    ₹{todayEarnings}
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-[#252525]/10 p-4 col-span-2 lg:col-span-1">
                  <p className="text-xs text-[#252525]/60">Monthly Earnings</p>
                  <p className="font-display text-2xl font-bold text-[#176B45] tabular-nums mt-1">
                    ₹{monthlyEarnings}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#252525]">
                    Active Incoming Orders
                  </h2>
                  <button
                    type="button"
                    onClick={() => setTab('orders')}
                    className="text-xs font-semibold text-[#176B45] hover:underline cursor-pointer"
                  >
                    View All Orders →
                  </button>
                </div>
                {pendingOrders.length === 0 ? (
                  <p className="text-sm text-[#252525]/65">No pending hostel orders right now.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl border border-[#252525]/10 bg-[#FFFDF8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <p className="font-mono text-xs font-semibold text-[#176B45]">
                            {order.id} · {order.status}
                          </p>
                          <p className="text-sm font-semibold text-[#252525]">
                            {order.items
                              .filter((i) => i.chefId === chef.id)
                              .map((i) => `${i.mealName} × ${i.quantity}`)
                              .join(', ')}
                          </p>
                          <p className="text-xs text-[#252525]/70">
                            {order.studentName} · {order.hostelName} ({order.dropOffGate}) · {order.timeSlot}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.status === 'Order Placed' && (
                            <>
                              <button
                                type="button"
                                disabled={busyId === order.id}
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, 'Order Accepted by Chef')
                                }
                                className="rounded-xl bg-[#176B45] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                              >
                                Accept Order
                              </button>
                              <button
                                type="button"
                                disabled={busyId === order.id}
                                onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}
                                className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {order.status === 'Order Accepted by Chef' && (
                            <button
                              type="button"
                              disabled={busyId === order.id}
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, 'Food Being Prepared')
                              }
                              className="rounded-xl bg-[#176B45] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                            >
                              Start Preparing
                            </button>
                          )}
                          {order.status === 'Food Being Prepared' && (
                            <button
                              type="button"
                              disabled={busyId === order.id}
                              onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Dispatch')}
                              className="rounded-xl bg-[#FFAA45] px-3.5 py-2 text-xs font-bold text-[#252525] cursor-pointer"
                            >
                              Mark Ready for Dispatch
                            </button>
                          )}
                          {order.status === 'Ready for Dispatch' && (
                            <button
                              type="button"
                              disabled={busyId === order.id}
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, 'Delivered / Collected')
                              }
                              className="rounded-xl bg-[#176B45] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                            >
                              Mark Handed Over
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#252525]">
                All Kitchen Orders ({chefOrders.length})
              </h2>
              {chefOrders.length === 0 ? (
                <p className="text-sm text-[#252525]/65">No orders received yet.</p>
              ) : (
                <div className="space-y-3">
                  {chefOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-[#252525]/10 bg-[#FFFDF8] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-semibold text-[#252525]">{order.id}</span>
                          <span>·</span>
                          <span className="font-semibold text-[#176B45]">{order.status}</span>
                          <span>·</span>
                          <span className="text-[#252525]/60">{order.timeSlot}</span>
                        </div>
                        <p className="font-semibold text-sm text-[#252525]">
                          {order.items
                            .filter((i) => i.chefId === chef.id)
                            .map((i) => `${i.mealName} × ${i.quantity} (₹${i.price * i.quantity})`)
                            .join(', ')}
                        </p>
                        <p className="text-xs text-[#252525]/70">
                          Student: {order.studentName} ({order.mobile}) · {order.hostelName} · Gate: {order.dropOffGate}
                        </p>
                        {order.instructions && (
                          <p className="text-xs text-[#252525]/65">Instructions: {order.instructions}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0">
                        {order.status === 'Order Placed' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, 'Order Accepted by Chef')
                              }
                              className="rounded-xl bg-[#176B45] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}
                              className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {order.status === 'Order Accepted by Chef' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Food Being Prepared')}
                            className="rounded-xl bg-[#176B45] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                          >
                            Mark Preparing
                          </button>
                        )}
                        {order.status === 'Food Being Prepared' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Dispatch')}
                            className="rounded-xl bg-[#FFAA45] px-3.5 py-2 text-xs font-bold text-[#252525] cursor-pointer"
                          >
                            Ready for Dispatch
                          </button>
                        )}
                        {order.status === 'Ready for Dispatch' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, 'Delivered / Collected')
                            }
                            className="rounded-xl bg-[#176B45] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                          >
                            Mark Handed Over
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'menu' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#252525]">
                    Daily Kitchen Menu ({chefMeals.length})
                  </h2>
                  <p className="text-xs text-[#252525]/65">
                    Manage daily dish availability, quantities, prices, and food photos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewMealForm}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#176B45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#125436] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add New Meal
                </button>
              </div>

              {showMealForm && (
                <form
                  onSubmit={handleSaveMeal}
                  className="rounded-2xl bg-white border border-[#176B45]/25 p-6 space-y-4"
                >
                  <h3 className="font-display text-base font-bold text-[#252525]">
                    {editingMeal ? `Edit Meal: ${editingMeal.name}` : 'Add a New Homemade Meal'}
                  </h3>
                  {mealError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
                      {mealError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                        Meal Name
                      </label>
                      <input
                        type="text"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        placeholder="e.g. Kadhi Pakora & Rice"
                        className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={mealPrice}
                          onChange={(e) => setMealPrice(e.target.value)}
                          className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2.5 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                          Daily Qty
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={mealQty}
                          onChange={(e) => setMealQty(e.target.value)}
                          className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2.5 text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                          Dietary
                        </label>
                        <select
                          value={mealDietary}
                          onChange={(e) => setMealDietary(e.target.value as DietaryType)}
                          className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-2.5 py-2.5 text-sm"
                        >
                          <option value="Veg">Veg</option>
                          <option value="Non-Veg">Non-Veg</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={mealDesc}
                      onChange={(e) => setMealDesc(e.target.value)}
                      placeholder="Describe portions, sides, and home cooking style..."
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                        Ingredients (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={mealIngredients}
                        onChange={(e) => setMealIngredients(e.target.value)}
                        className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                        Food Photograph (Choose Preset or Upload)
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={mealImage}
                          onChange={(e) => setMealImage(e.target.value)}
                          className="flex-1 rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2 text-xs"
                        >
                          {PRESET_FOOD_IMAGES.map((img) => (
                            <option key={img.url} value={img.url}>
                              {img.label}
                            </option>
                          ))}
                        </select>
                        <label className="inline-flex items-center gap-1.5 rounded-xl border border-[#252525]/15 px-3 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 cursor-pointer whitespace-nowrap">
                          <Upload className="w-3.5 h-3.5" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setMealImage)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-[#252525] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mealAvailable}
                        onChange={(e) => setMealAvailable(e.target.checked)}
                        className="accent-[#176B45]"
                      />
                      Available for today’s hostel orders
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMealForm(false)}
                        className="rounded-xl border border-[#252525]/15 px-4 py-2 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={busyId === 'saving-meal'}
                        className="rounded-xl bg-[#176B45] px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                      >
                        {busyId === 'saving-meal' ? 'Saving...' : 'Save Meal'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {chefMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="rounded-2xl bg-white border border-[#252525]/10 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[#FFFDF8]">
                        <FoodImage
                          src={meal.imageUrl}
                          alt={meal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#252525]/65">{meal.dietary}</span>
                          <span
                            className={`font-semibold ${
                              meal.isAvailable ? 'text-[#176B45]' : 'text-red-700'
                            }`}
                          >
                            {meal.isAvailable ? `Active · ${meal.availableQty} left` : 'Paused'}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-[#252525]">
                          {meal.name}
                        </h3>
                        <p className="text-xs text-[#252525]/70 line-clamp-2">{meal.description}</p>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-3 border-t border-[#252525]/10 flex items-center justify-between gap-2">
                      <span className="font-display text-lg font-bold tabular-nums">
                        ₹{meal.price}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleMealAvailability(meal)}
                          className="rounded-lg border border-[#252525]/15 px-2.5 py-1.5 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
                        >
                          {meal.isAvailable ? 'Pause' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditMealForm(meal)}
                          className="p-1.5 rounded-lg border border-[#252525]/15 text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
                          aria-label={`Edit ${meal.name}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                          aria-label={`Delete ${meal.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form
                onSubmit={handleSaveProfile}
                className="lg:col-span-7 rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4"
              >
                <div className="flex items-center gap-4 pb-3 border-b border-[#252525]/10">
                  <FoodImage
                    src={profAvatar}
                    alt={chef.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-bold text-[#252525]">
                      Kitchen & FSSAI Information
                    </h2>
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B45] hover:underline cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Profile Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setProfAvatar)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {profSaved && (
                  <div className="rounded-xl border border-[#176B45]/25 bg-[#176B45]/10 px-4 py-2.5 text-xs text-[#176B45] font-medium">
                    {profSaved}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                      Chef Name
                    </label>
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={profMobile}
                      onChange={(e) => setProfMobile(e.target.value)}
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                      Kitchen Name
                    </label>
                    <input
                      type="text"
                      value={profKitchen}
                      onChange={(e) => setProfKitchen(e.target.value)}
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                      Locality (Ajmer)
                    </label>
                    <input
                      type="text"
                      value={profLocality}
                      onChange={(e) => setProfLocality(e.target.value)}
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                      FSSAI Certificate Number
                    </label>
                    <input
                      type="text"
                      value={profFssai}
                      onChange={(e) => setProfFssai(e.target.value)}
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                      Specialty
                    </label>
                    <input
                      type="text"
                      value={profSpecialty}
                      onChange={(e) => setProfSpecialty(e.target.value)}
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                    Kitchen Bio & Hygiene Practices
                  </label>
                  <textarea
                    rows={3}
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busyId === 'saving-profile'}
                  className="rounded-xl bg-[#176B45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#125436] cursor-pointer"
                >
                  {busyId === 'saving-profile' ? 'Saving...' : 'Save Kitchen Profile'}
                </button>
              </form>

              <div className="lg:col-span-5 rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-[#252525]">
                    Ratings & Reviews
                  </h3>
                  <span className="inline-flex items-center gap-1 font-display text-lg font-bold tabular-nums">
                    <Star className="w-4 h-4 fill-[#FFAA45] text-[#FFAA45]" />
                    {chef.rating.toFixed(1)}
                  </span>
                </div>
                {chefReviews.length === 0 ? (
                  <p className="text-sm text-[#252525]/65">No student reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {chefReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-xl border border-[#252525]/10 bg-[#FFFDF8] p-3.5 space-y-1"
                      >
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-[#252525]">
                            {rev.studentName} · {rev.mealName}
                          </span>
                          <span className="tabular-nums font-semibold">
                            ★ {rev.overallRating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-[#252525]/80">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#252525]/10 grid grid-cols-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex flex-col items-center justify-center py-2 text-[11px] font-medium ${
              tab === item.id ? 'text-[#176B45]' : 'text-[#252525]/60'
            }`}
          >
            {item.icon}
            <span className="mt-0.5 truncate max-w-[70px]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
