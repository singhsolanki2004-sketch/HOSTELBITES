import type {
  AuthSession,
  Chef,
  ChefVerificationStatus,
  DatabaseState,
  Meal,
  Order,
  OrderStatus,
  PaymentMethod,
  Review,
  Student,
  Subscription,
  SubscriptionPlanConfig,
  SubscriptionStatus,
  UserRole,
} from './types';

const SESSION_KEY = 'hostelbites_session_v1';
const CART_KEY = 'hostelbites_cart_v1';

export interface CartItem {
  mealId: string;
  quantity: number;
}

export function loadSavedSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function loadSavedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }
  return data as T;
}

export const api = {
  bootstrap: () => request<DatabaseState>('/api/bootstrap'),

  login: (role: UserRole, identifier: string, password: string) =>
    request<{ session: AuthSession }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, identifier, password }),
    }),

  registerStudent: (payload: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    college: string;
    hostelName: string;
    dropOffGate: string;
    age?: number;
  }) =>
    request<{ student: Student; session: AuthSession }>('/api/auth/register-student', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  registerChef: (payload: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    kitchenName: string;
    locality: string;
    specialty: string;
    bio: string;
    fssaiNumber: string;
    fssaiCertificateNote?: string;
    avatarUrl?: string;
  }) =>
    request<{ chef: Chef; session: AuthSession }>('/api/auth/register-chef', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateStudent: (id: string, updates: Partial<Student>) =>
    request<{ student: Student }>(`/api/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  updateChef: (id: string, updates: Partial<Chef>) =>
    request<{ chef: Chef }>(`/api/chefs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  verifyChef: (
    id: string,
    verificationStatus: ChefVerificationStatus,
    rejectionReason?: string,
    hygieneNotes?: string,
  ) =>
    request<{ chef: Chef }>(`/api/chefs/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ verificationStatus, rejectionReason, hygieneNotes }),
    }),

  createMeal: (payload: Partial<Meal>) =>
    request<{ meal: Meal }>('/api/meals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMeal: (id: string, updates: Partial<Meal>) =>
    request<{ meal: Meal }>(`/api/meals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteMeal: (id: string) =>
    request<{ deleted: boolean }>(`/api/meals/${id}`, {
      method: 'DELETE',
    }),

  placeOrder: (payload: Partial<Order>) =>
    request<{ order: Order; deduplicated?: boolean }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<{ order: Order }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  createSubscription: (payload: {
    studentId: string;
    studentName: string;
    hostelName: string;
    paymentMethod: PaymentMethod;
  }) =>
    request<{ subscription: Subscription }>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateSubscription: (id: string, updates: { status?: SubscriptionStatus; remainingMeals?: number }) =>
    request<{ subscription: Subscription }>(`/api/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  updatePlanConfig: (updates: Partial<SubscriptionPlanConfig>) =>
    request<{ planConfig: SubscriptionPlanConfig }>('/api/plan-config', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  submitReview: (payload: Partial<Review>) =>
    request<{ review: Review; meals: Meal[]; chefs: Chef[] }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  moderateReview: (id: string, isVisible: boolean) =>
    request<{ review: Review }>(`/api/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isVisible }),
    }),

  resetDemo: () => request<DatabaseState>('/api/reset-demo', { method: 'POST' }),
};
