export type UserRole = 'student' | 'chef' | 'admin';

export type ChefVerificationStatus = 'pending' | 'verified' | 'rejected';

export type OrderStatus =
  | 'Order Placed'
  | 'Order Accepted by Chef'
  | 'Food Being Prepared'
  | 'Ready for Dispatch'
  | 'Delivered / Collected'
  | 'Cancelled';

export type DietaryType = 'Veg' | 'Non-Veg';

export type PaymentMethod =
  | 'UPI (Demo Prototype)'
  | 'Cash on Delivery / Pay at Collection'
  | 'Demo Prototype Payment';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface Student {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  college: string;
  hostelName: string;
  dropOffGate: string;
  age: number;
  createdAt: string;
}

export interface Chef {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  kitchenName: string;
  locality: string;
  city: string;
  bio: string;
  specialty: string;
  fssaiNumber: string;
  fssaiCertificateNote: string;
  hygieneNotes: string;
  avatarUrl: string;
  verificationStatus: ChefVerificationStatus;
  rejectionReason?: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Meal {
  id: string;
  chefId: string;
  name: string;
  description: string;
  ingredients: string[];
  prepDetails: string;
  price: number;
  isTrialOffer?: boolean;
  isTodaysSpecial?: boolean;
  dietary: DietaryType;
  availableQty: number;
  isAvailable: boolean;
  timeSlots: string[];
  imageUrl: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface OrderItem {
  mealId: string;
  mealName: string;
  chefId: string;
  chefName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  clientRequestId?: string;
  studentId: string;
  studentName: string;
  mobile: string;
  college: string;
  hostelName: string;
  dropOffGate: string;
  timeSlot: string;
  instructions: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  studentName: string;
  hostelName: string;
  planName: string;
  price: number;
  totalMeals: number;
  remainingMeals: number;
  scheduleSummary: string;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  mealId: string;
  mealName: string;
  chefId: string;
  studentId: string;
  studentName: string;
  hostelName: string;
  tasteRating: number;
  qualityRating: number;
  portionRating: number;
  packagingRating: number;
  punctualityRating: number;
  overallRating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export interface SubscriptionPlanConfig {
  weeklyPlanName: string;
  weeklyPrice: number;
  weeklyMealsCount: number;
  weeklyScheduleLabel: string;
  hypothesisNote: string;
  standardMealPrice: number;
  trialMealPrice: number;
}

export interface DatabaseState {
  students: Student[];
  chefs: Chef[];
  meals: Meal[];
  orders: Order[];
  subscriptions: Subscription[];
  reviews: Review[];
  planConfig: SubscriptionPlanConfig;
}

export interface AuthSession {
  role: UserRole;
  userId: string;
  name: string;
  email: string;
}
