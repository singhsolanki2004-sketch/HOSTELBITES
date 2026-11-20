import React, { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  ClipboardList,
  Home,
  ShoppingBag,
  User,
  Utensils,
} from 'lucide-react';
import {
  api,
  loadSavedCart,
  loadSavedSession,
  saveCart,
  saveSession,
  type CartItem,
} from './api';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthScreen } from './components/AuthScreen';
import { BrandLogo } from './components/BrandLogo';
import {
  CartDrawer,
  CheckoutScreen,
  OrderTrackingScreen,
} from './components/CartCheckoutTracking';
import { ChefDashboard } from './components/ChefDashboard';
import { StudentLanding } from './components/StudentLanding';
import {
  MyOrdersScreen,
  StudentProfileScreen,
  SubscriptionsScreen,
} from './components/StudentOrdersSubsProfile';
import {
  ChefProfileModal,
  ExploreMenuScreen,
  MealDetailsScreen,
  StudentDashboard,
} from './components/StudentViews';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import type {
  AuthSession,
  Chef,
  DatabaseState,
  Meal,
  Order,
  UserRole,
} from './types';

type StudentScreen =
  | 'home'
  | 'menu'
  | 'meal-details'
  | 'checkout'
  | 'tracking'
  | 'subscriptions'
  | 'orders'
  | 'profile'
  | 'auth';

export default function App() {
  const [db, setDb] = useState<DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [session, setSession] = useState<AuthSession | null>(() => loadSavedSession());
  const [cart, setCart] = useState<CartItem[]>(() => loadSavedCart());
  const [cartOpen, setCartOpen] = useState(false);

  const [screen, setScreen] = useState<StudentScreen>('home');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('student');
  const [previewStudentStorefront, setPreviewStudentStorefront] = useState(false);

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [justConfirmedOrder, setJustConfirmedOrder] = useState(false);

  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [toast, setToast] = useState<string>('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? '' : prev));
    }, 2800);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const data = await api.bootstrap();
      setDb(data);
      setLoadError('');
      setTrackedOrder((prev) =>
        prev ? data.orders.find((o) => o.id === prev.id) || prev : null,
      );
      setSelectedMeal((prev) =>
        prev ? data.meals.find((m) => m.id === prev.id) || prev : null,
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to connect to HostelBites server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const handleAuthenticated = async (newSession: AuthSession) => {
    setSession(newSession);
    saveSession(newSession);
    setPreviewStudentStorefront(false);
    await refreshData();
    if (newSession.role === 'student') {
      setScreen('home');
      showToast(`Welcome, ${newSession.name}!`);
    }
  };

  const handleLogout = () => {
    setSession(null);
    saveSession(null);
    setPreviewStudentStorefront(false);
    setScreen('home');
    showToast('Signed out.');
  };

  const handleAddToCart = (meal: Meal, qty = 1) => {
    if (!meal.isAvailable || meal.availableQty <= 0) {
      showToast('This meal is currently sold out.');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.mealId === meal.id);
      if (existing) {
        const nextQty = Math.min(meal.availableQty, existing.quantity + qty);
        return prev.map((i) => (i.mealId === meal.id ? { ...i, quantity: nextQty } : i));
      }
      return [...prev, { mealId: meal.id, quantity: Math.min(meal.availableQty, qty) }];
    });
    showToast(`Added "${meal.name}" to your tiffin cart`);
  };

  const handleUpdateCartQty = (mealId: string, delta: number) => {
    const meal = db?.meals.find((m) => m.id === mealId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.mealId !== mealId) return item;
          const next = item.quantity + delta;
          if (next <= 0) return null;
          const cap = meal ? meal.availableQty : 10;
          return { ...item, quantity: Math.min(cap, next) };
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const handleRemoveCartItem = (mealId: string) => {
    setCart((prev) => prev.filter((i) => i.mealId !== mealId));
  };

  const handleReorder = (order: Order) => {
    if (!db) return;
    const nextCart: CartItem[] = [];
    for (const item of order.items) {
      const meal = db.meals.find((m) => m.id === item.mealId);
      if (meal && meal.isAvailable && meal.availableQty > 0) {
        nextCart.push({ mealId: meal.id, quantity: Math.min(meal.availableQty, item.quantity) });
      }
    }
    if (nextCart.length === 0) {
      showToast('Meals from this past order are currently unavailable today.');
      return;
    }
    setCart(nextCart);
    setCartOpen(true);
  };

  const openAuth = (mode: 'login' | 'register' = 'login', role: UserRole = 'student') => {
    setAuthInitialMode(mode);
    setAuthInitialRole(role);
    setPreviewStudentStorefront(true);
    setScreen('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 space-y-4">
        <BrandLogo size="lg" />
        <p className="text-sm text-[#252525]/70">Loading Ajmer home kitchens and daily menu...</p>
      </div>
    );
  }

  if (loadError || !db) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <BrandLogo size="lg" />
        <p className="text-sm text-red-700 max-w-md">{loadError || 'Unable to load application data.'}</p>
        <button
          type="button"
          onClick={refreshData}
          className="rounded-xl bg-[#176B45] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const activeChef =
    session?.role === 'chef' ? db.chefs.find((c) => c.id === session.userId) : undefined;
  const activeStudent =
    session?.role === 'student' ? db.students.find((s) => s.id === session.userId) || null : null;

  if (session?.role === 'chef' && activeChef && !previewStudentStorefront) {
    return (
      <ChefDashboard
        chef={activeChef}
        meals={db.meals}
        orders={db.orders}
        reviews={db.reviews}
        onDataChanged={refreshData}
        onLogout={handleLogout}
        onSwitchToStudentView={() => {
          setPreviewStudentStorefront(true);
          setScreen('home');
        }}
      />
    );
  }

  if (session?.role === 'admin' && !previewStudentStorefront) {
    return (
      <AdminDashboard
        db={db}
        onDataChanged={refreshData}
        onLogout={handleLogout}
        onSwitchToStudentView={() => {
          setPreviewStudentStorefront(true);
          setScreen('home');
        }}
      />
    );
  }

  const studentActiveSub = activeStudent
    ? db.subscriptions.find((s) => s.studentId === activeStudent.id && s.status === 'active')
    : undefined;

  const navigateStudent = (target: StudentScreen) => {
    setScreen(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#252525] flex flex-col">
      {/* Return Bar when Chef/Admin is previewing Storefront */}
      {(session?.role === 'chef' || session?.role === 'admin') && previewStudentStorefront && (
        <div className="bg-[#176B45] text-white px-4 py-2 text-xs flex items-center justify-between">
          <span>
            Previewing Student Storefront as {session.name}
          </span>
          <button
            type="button"
            onClick={() => setPreviewStudentStorefront(false)}
            className="font-semibold underline cursor-pointer whitespace-nowrap"
          >
            Return to {session.role === 'chef' ? 'Chef' : 'Admin'} Dashboard
          </button>
        </div>
      )}

      {/* Top Bar Contract: [Brand] — [Nav Links] — [Primary Action] */}
      <header className="sticky top-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-sm border-b border-[#252525]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => navigateStudent('home')}
            className="cursor-pointer whitespace-nowrap shrink-0"
            aria-label="HostelBites Home"
          >
            <BrandLogo size="md" />
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#252525]/75">
            {(
              [
                ['home', 'Home'],
                ['menu', 'Menu'],
                ['subscriptions', 'Subscriptions'],
                ['orders', 'My Orders'],
                ['profile', 'Profile'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => navigateStudent(key)}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  screen === key
                    ? 'border-[#176B45] text-[#176B45] font-semibold'
                    : 'border-transparent hover:text-[#176B45]'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-xl border border-[#252525]/15 bg-white px-3.5 py-2 text-xs font-semibold text-[#252525] hover:bg-[#176B45]/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="Open shopping cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#176B45]" />
              <span>Cart</span>
              <span className="font-mono tabular-nums text-[#176B45]">({cartCount})</span>
            </button>

            {!activeStudent ? (
              <button
                type="button"
                onClick={() => openAuth('login', 'student')}
                className="rounded-xl bg-[#176B45] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125436] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateStudent('profile')}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#176B45]/10 px-3.5 py-2 text-xs font-semibold text-[#176B45] hover:bg-[#176B45]/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer max-w-[150px] truncate"
              >
                {activeStudent.name.split(' ')[0]}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {screen === 'home' && !activeStudent && (
          <StudentLanding
            meals={db.meals}
            chefs={db.chefs}
            planConfig={db.planConfig}
            onOrderMeal={() => navigateStudent('menu')}
            onExploreMenu={() => navigateStudent('menu')}
            onViewMealDetails={(meal) => {
              setSelectedMeal(meal);
              navigateStudent('meal-details');
            }}
            onAddToCart={(meal) => handleAddToCart(meal, 1)}
            onViewSubscriptions={() => navigateStudent('subscriptions')}
            onOpenWhatsApp={() => setWhatsAppOpen(true)}
            onOpenAuth={openAuth}
          />
        )}

        {screen === 'home' && activeStudent && (
          <StudentDashboard
            student={activeStudent}
            meals={db.meals}
            chefs={db.chefs}
            orders={db.orders}
            subscription={studentActiveSub}
            planConfig={db.planConfig}
            onAddToCart={(meal) => handleAddToCart(meal, 1)}
            onViewMealDetails={(meal) => {
              setSelectedMeal(meal);
              navigateStudent('meal-details');
            }}
            onViewChef={(chef) => setSelectedChef(chef)}
            onExploreMenu={() => navigateStudent('menu')}
            onViewSubscriptions={() => navigateStudent('subscriptions')}
            onTrackOrder={(order) => {
              setTrackedOrder(order);
              setJustConfirmedOrder(false);
              navigateStudent('tracking');
            }}
            onReorder={handleReorder}
            onOpenWhatsApp={() => setWhatsAppOpen(true)}
          />
        )}

        {screen === 'menu' && (
          <ExploreMenuScreen
            meals={db.meals}
            chefs={db.chefs}
            onAddToCart={(meal) => handleAddToCart(meal, 1)}
            onViewMealDetails={(meal) => {
              setSelectedMeal(meal);
              navigateStudent('meal-details');
            }}
            onViewChef={(chef) => setSelectedChef(chef)}
          />
        )}

        {screen === 'meal-details' && selectedMeal && (
          <MealDetailsScreen
            meal={selectedMeal}
            chef={db.chefs.find((c) => c.id === selectedMeal.chefId)}
            reviews={db.reviews}
            onBack={() => navigateStudent('menu')}
            onAddToCart={(meal, qty) => handleAddToCart(meal, qty)}
            onViewChef={(chef) => setSelectedChef(chef)}
          />
        )}

        {screen === 'checkout' && (
          <CheckoutScreen
            cart={cart}
            meals={db.meals}
            chefs={db.chefs}
            student={activeStudent}
            onBackToMenu={() => navigateStudent('menu')}
            onOrderConfirmed={async (order) => {
              setCart([]);
              await refreshData();
              setTrackedOrder(order);
              setJustConfirmedOrder(true);
              navigateStudent('tracking');
            }}
          />
        )}

        {screen === 'tracking' && trackedOrder && (
          <OrderTrackingScreen
            order={trackedOrder}
            justConfirmed={justConfirmedOrder}
            onBackToOrders={() => navigateStudent('orders')}
            onStatusUpdated={async (updated) => {
              setTrackedOrder(updated);
              await refreshData();
            }}
          />
        )}

        {screen === 'subscriptions' && (
          <SubscriptionsScreen
            student={activeStudent}
            subscriptions={db.subscriptions}
            planConfig={db.planConfig}
            meals={db.meals}
            onRequireLogin={() => openAuth('login', 'student')}
            onSubscriptionChanged={refreshData}
            onOrderSingleMeal={() => navigateStudent('menu')}
            onOrderTrialMeal={(trialMeal) => {
              handleAddToCart(trialMeal, 1);
              setCartOpen(true);
            }}
          />
        )}

        {screen === 'orders' && (
          <MyOrdersScreen
            student={activeStudent}
            orders={db.orders}
            reviews={db.reviews}
            onTrackOrder={(order) => {
              setTrackedOrder(order);
              setJustConfirmedOrder(false);
              navigateStudent('tracking');
            }}
            onReorder={handleReorder}
            onOrderUpdated={refreshData}
            onRequireLogin={() => openAuth('login', 'student')}
            onOpenMenu={() => navigateStudent('menu')}
          />
        )}

        {screen === 'profile' && (
          <StudentProfileScreen
            student={activeStudent}
            subscriptions={db.subscriptions}
            orders={db.orders}
            onUpdated={refreshData}
            onLogout={handleLogout}
            onRequireLogin={() => openAuth('login', 'student')}
            onViewOrders={() => navigateStudent('orders')}
            onViewSubscriptions={() => navigateStudent('subscriptions')}
          />
        )}

        {screen === 'auth' && (
          <AuthScreen
            initialMode={authInitialMode}
            initialRole={authInitialRole}
            onAuthenticated={handleAuthenticated}
            onCancel={() => navigateStudent('home')}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#252525]/10 bg-white py-8 px-4 sm:px-6 lg:px-8 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#252525]/65">
          <div className="space-y-1">
            <BrandLogo size="sm" />
            <p>
              Ghar Jaisa Khana, Hostel Ke Paas! · Ajmer Campus Pilot, Rajasthan · ₹0 Hostel Gate Delivery
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-medium text-[#252525]">
            <button
              type="button"
              onClick={() => navigateStudent('menu')}
              className="hover:text-[#176B45] cursor-pointer"
            >
              Explore Menu
            </button>
            <button
              type="button"
              onClick={() => setWhatsAppOpen(true)}
              className="hover:text-[#176B45] cursor-pointer"
            >
              WhatsApp Support
            </button>
            <button
              type="button"
              onClick={() => openAuth('login', 'chef')}
              className="hover:text-[#176B45] cursor-pointer"
            >
              Home Chef Login
            </button>
            <button
              type="button"
              onClick={() => openAuth('login', 'admin')}
              className="hover:text-[#176B45] cursor-pointer"
            >
              Admin Console
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#252525]/10 grid grid-cols-5 h-14"
        aria-label="Mobile Navigation"
      >
        {(
          [
            ['home', 'Home', <Home className="w-4 h-4" key="h" />],
            ['menu', 'Menu', <Utensils className="w-4 h-4" key="m" />],
            ['subscriptions', 'Plans', <Calendar className="w-4 h-4" key="s" />],
            ['orders', 'Orders', <ClipboardList className="w-4 h-4" key="o" />],
            ['profile', activeStudent ? 'Profile' : 'Login', <User className="w-4 h-4" key="p" />],
          ] as const
        ).map(([key, label, icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === 'profile' && !activeStudent) {
                openAuth('login', 'student');
              } else {
                navigateStudent(key);
              }
            }}
            className={`flex flex-col items-center justify-center text-[11px] font-medium ${
              screen === key ? 'text-[#176B45]' : 'text-[#252525]/60'
            }`}
          >
            {icon}
            <span className="mt-0.5">{label}</span>
          </button>
        ))}
      </nav>

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        meals={db.meals}
        chefs={db.chefs}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          navigateStudent('checkout');
        }}
      />

      <ChefProfileModal
        chef={selectedChef}
        reviews={db.reviews}
        meals={db.meals}
        onClose={() => setSelectedChef(null)}
        onSelectMeal={(meal) => {
          setSelectedMeal(meal);
          navigateStudent('meal-details');
        }}
      />

      <WhatsAppOrderModal
        isOpen={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        meals={db.meals}
        chefs={db.chefs}
        student={activeStudent}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-16 md:bottom-6 right-4 z-50 rounded-xl bg-[#252525] text-white px-4 py-3 text-xs font-medium shadow-lg flex items-center gap-3"
        >
          <span>{toast}</span>
          {toast.includes('cart') && (
            <button
              type="button"
              onClick={() => {
                setToast('');
                setCartOpen(true);
              }}
              className="text-[#FFAA45] font-semibold hover:underline cursor-pointer"
            >
              View Cart
            </button>
          )}
        </div>
      )}
    </div>
  );
}
