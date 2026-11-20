import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type {
  Chef,
  ChefVerificationStatus,
  DatabaseState,
  Meal,
  Order,
  OrderStatus,
  Review,
  Student,
  Subscription,
  SubscriptionStatus,
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'hostelbites-db.json');

const IMAGE_PATHS = {
  heroThali: '/src/assets/images/hero_indian_thali_1795109857194.jpg',
  dalSabziRice: '/src/assets/images/meal_dal_sabzi_rice_1795109856817.jpg',
  paneerRotiSalad: '/src/assets/images/meal_paneer_roti_salad_1795109857621.jpg',
  rajmaChawal: '/src/assets/images/meal_rajma_chawal_1795109856726.jpg',
  choleRice: '/src/assets/images/meal_chole_rice_1795109856912.jpg',
  alooParatha: '/src/assets/images/meal_aloo_paratha_curd_1795109857813.jpg',
  dalTadkaJeera: '/src/assets/images/meal_dal_tadka_jeera_1795109856729.jpg',
  chefSunita: '/src/assets/images/chef_sunita_portrait_1795109856731.jpg',
  chefRajesh: '/src/assets/images/chef_rajesh_portrait_1795109857226.jpg',
};

function createSeedDatabase(): DatabaseState {
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
  const daysAhead = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

  const students: Student[] = [
    {
      id: 'stu-1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@student.ajmer.edu',
      mobile: '9829041122',
      password: 'demo123',
      college: 'Government Engineering College, Ajmer',
      hostelName: 'Vikramaditya Boys Hostel (Block B)',
      dropOffGate: 'Main Campus North Gate · Guard Cabin',
      age: 19,
      createdAt: daysAgo(18),
    },
    {
      id: 'stu-2',
      name: 'Ananya Rathore',
      email: 'ananya.r@mdsajmer.ac.in',
      mobile: '9829154321',
      password: 'demo123',
      college: 'MDS University, Ajmer',
      hostelName: 'Gargi Girls Hostel',
      dropOffGate: 'Gargi Hostel Entry Gate · Reception Desk',
      age: 20,
      createdAt: daysAgo(14),
    },
    {
      id: 'stu-3',
      name: 'Rohan Joshi',
      email: 'rohan.joshi@bhagwant.edu',
      mobile: '9784512390',
      password: 'demo123',
      college: 'Bhagwant University, Ajmer',
      hostelName: 'Vaishali Nagar Student PG',
      dropOffGate: 'Vaishali Nagar Lane 3 · Main Gate',
      age: 21,
      createdAt: daysAgo(9),
    },
    {
      id: 'stu-4',
      name: 'Priya Meena',
      email: 'priya.meena@curaj.ac.in',
      mobile: '9649087123',
      password: 'demo123',
      college: 'Central University Corridor, Ajmer',
      hostelName: 'Shastri Nagar Residency PG',
      dropOffGate: 'Shastri Nagar Main Porch Gate',
      age: 18,
      createdAt: daysAgo(5),
    },
  ];

  const chefs: Chef[] = [
    {
      id: 'chef-1',
      name: 'Sunita Sharma',
      email: 'sunita.kitchen@hostelbites.in',
      mobile: '9414056789',
      password: 'demo123',
      kitchenName: 'Maa Annapurna Home Kitchen',
      locality: 'Vaishali Nagar',
      city: 'Ajmer, Rajasthan',
      bio: 'Cooking wholesome, low-oil Rajasthani and North Indian family meals for over 18 years. Every batch uses fresh chakki atta, RO water, and hand-ground spices.',
      specialty: 'Everyday Ghar Ka Khana, Dal-Sabzi & Balanced Thalis',
      fssaiNumber: '22226014000842',
      fssaiCertificateNote: 'FSSAI Basic Registration · Valid through Dec 2027',
      hygieneNotes: 'RO filtered cooking water, stainless-steel food-grade prep surfaces, hairnet & apron protocol, daily kitchen audit passed.',
      avatarUrl: IMAGE_PATHS.chefSunita,
      verificationStatus: 'verified',
      rating: 4.8,
      reviewCount: 3,
      createdAt: daysAgo(30),
    },
    {
      id: 'chef-2',
      name: 'Rajesh Rathore',
      email: 'rajesh.rasoi@hostelbites.in',
      mobile: '9414188234',
      password: 'demo123',
      kitchenName: 'Shastri Nagar Ghar Rasoi',
      locality: 'Shastri Nagar',
      city: 'Ajmer, Rajasthan',
      bio: 'Former hospitality cook now preparing comforting home-style Rajma Chawal, Chole, and crisp stuffed parathas for hostel students near Ajmer colleges.',
      specialty: 'Rajma Chawal, Chole Rice & Tawa Parathas',
      fssaiNumber: '22226014001109',
      fssaiCertificateNote: 'FSSAI Registration · Valid through Aug 2027',
      hygieneNotes: 'Separate vegetarian prep station, sealed leak-proof food containers, temperature-checked dispatch boxes.',
      avatarUrl: IMAGE_PATHS.chefRajesh,
      verificationStatus: 'verified',
      rating: 4.7,
      reviewCount: 2,
      createdAt: daysAgo(25),
    },
    {
      id: 'chef-3',
      name: 'Meena Verma',
      email: 'meena.tiffin@hostelbites.in',
      mobile: '9828911204',
      password: 'demo123',
      kitchenName: 'Panchsheel Homestyle Tiffin',
      locality: 'Panchsheel Nagar',
      city: 'Ajmer, Rajasthan',
      bio: 'Home cook offering homestyle protein-rich curries and evening meals for university students around Panchsheel and Makarwali Road.',
      specialty: 'Homestyle Egg Curry & Evening Rice Bowls',
      fssaiNumber: '22226014001955',
      fssaiCertificateNote: 'Submitted FSSAI Form A · Awaiting Admin Kitchen Inspection',
      hygieneNotes: 'Inspection scheduled by Ajmer Operations Lead.',
      avatarUrl: IMAGE_PATHS.chefSunita,
      verificationStatus: 'pending',
      rating: 4.4,
      reviewCount: 0,
      createdAt: daysAgo(2),
    },
  ];

  const meals: Meal[] = [
    {
      id: 'meal-1',
      chefId: 'chef-1',
      name: 'Dal, Rice and Seasonal Sabzi',
      description: 'Comforting yellow toor dal tempered with desi ghee & jeera, steamed basmati rice, seasonal aloo-gobhi sabzi, and 3 soft tawa rotis.',
      ingredients: ['Toor Dal', 'Aged Basmati Rice', 'Cauliflower & Potato', 'Whole Wheat Chakki Atta', 'Pure Cow Ghee', 'Fresh Coriander'],
      prepDetails: 'Prepared fresh 45 mins prior to hostel gate dispatch in small batches with minimal oil.',
      price: 80,
      isTodaysSpecial: true,
      dietary: 'Veg',
      availableQty: 24,
      isAvailable: true,
      timeSlots: ['Lunch · 12:30 PM – 1:15 PM', 'Dinner · 7:30 PM – 8:15 PM', 'Late Dinner · 8:30 PM – 9:15 PM'],
      imageUrl: IMAGE_PATHS.dalSabziRice,
      rating: 4.9,
      reviewCount: 2,
      createdAt: daysAgo(20),
    },
    {
      id: 'meal-2',
      chefId: 'chef-1',
      name: 'Roti, Paneer Sabzi and Salad',
      description: 'Homestyle creamy matar paneer cooked without heavy restaurant cream, paired with 4 soft whole-wheat phulkas and crisp cucumber-tomato salad.',
      ingredients: ['Fresh Homemade Paneer', 'Green Peas', 'Whole Wheat Phulkas', 'Tomato Onion Gravy', 'Cucumber & Lemon Salad'],
      prepDetails: 'Low-spice home recipe with freshly made paneer cubes and zero artificial food coloring.',
      price: 80,
      dietary: 'Veg',
      availableQty: 18,
      isAvailable: true,
      timeSlots: ['Dinner · 7:30 PM – 8:15 PM', 'Late Dinner · 8:30 PM – 9:15 PM'],
      imageUrl: IMAGE_PATHS.paneerRotiSalad,
      rating: 4.8,
      reviewCount: 1,
      createdAt: daysAgo(18),
    },
    {
      id: 'meal-3',
      chefId: 'chef-2',
      name: 'Rajma Chawal',
      description: 'Slow-simmered Jammu red kidney beans in rich tomato-ginger gravy over fluffy basmati rice with mint chutney and onion rings.',
      ingredients: ['Red Kidney Beans', 'Basmati Rice', 'Ginger & Garlic', 'Fresh Mint Chutney', 'Red Onion Rings'],
      prepDetails: 'Soaked overnight and pressure-cooked slow for authentic home taste and easy digestion.',
      price: 80,
      dietary: 'Veg',
      availableQty: 20,
      isAvailable: true,
      timeSlots: ['Lunch · 12:30 PM – 1:15 PM', 'Dinner · 7:30 PM – 8:15 PM'],
      imageUrl: IMAGE_PATHS.rajmaChawal,
      rating: 4.8,
      reviewCount: 1,
      createdAt: daysAgo(16),
    },
    {
      id: 'meal-4',
      chefId: 'chef-2',
      name: 'Chole Rice',
      description: 'Tangy North Indian kabuli chana masala with aromatic jeera rice, lemon wedge, and homestyle spiced onion salad.',
      ingredients: ['Kabuli Chana', 'Cumin Jeera Rice', 'Anardana & Whole Spices', 'Pickled Onions', 'Fresh Lemon'],
      prepDetails: 'Cooked in cold-pressed mustard oil with balanced homely masalas.',
      price: 80,
      dietary: 'Veg',
      availableQty: 15,
      isAvailable: true,
      timeSlots: ['Lunch · 12:30 PM – 1:15 PM', 'Dinner · 7:30 PM – 8:15 PM'],
      imageUrl: IMAGE_PATHS.choleRice,
      rating: 4.6,
      reviewCount: 1,
      createdAt: daysAgo(15),
    },
    {
      id: 'meal-5',
      chefId: 'chef-2',
      name: 'Aloo Paratha with Curd',
      description: 'Two generously stuffed golden tawa aloo parathas topped with a light pat of white butter, served with fresh dahi and mango pickle.',
      ingredients: ['Whole Wheat Dough', 'Spiced Mashed Potatoes', 'Fresh Homemade Curd', 'Aam Ka Achar', 'Green Chilli & Coriander'],
      prepDetails: 'Rolled and griddled right before your slot so parathas stay warm till the hostel gate.',
      price: 80,
      dietary: 'Veg',
      availableQty: 16,
      isAvailable: true,
      timeSlots: ['Lunch · 12:30 PM – 1:15 PM', 'Dinner · 7:30 PM – 8:15 PM', 'Late Dinner · 8:30 PM – 9:15 PM'],
      imageUrl: IMAGE_PATHS.alooParatha,
      rating: 4.9,
      reviewCount: 0,
      createdAt: daysAgo(12),
    },
    {
      id: 'meal-6',
      chefId: 'chef-1',
      name: 'Veg Thali',
      description: 'Complete balanced student thali: yellow dal tadka, paneer sabzi, seasonal dry veg, 3 rotis, jeera rice, boondi raita, salad, and 1 gulab jamun.',
      ingredients: ['Yellow Dal', 'Paneer Sabzi', '3 Tawa Rotis', 'Jeera Rice', 'Boondi Raita', 'Kachumber Salad'],
      prepDetails: 'Packed in a compartmentalized spill-proof meal box for clean hostel room dining.',
      price: 80,
      dietary: 'Veg',
      availableQty: 14,
      isAvailable: true,
      timeSlots: ['Lunch · 12:30 PM – 1:15 PM', 'Dinner · 7:30 PM – 8:15 PM'],
      imageUrl: IMAGE_PATHS.heroThali,
      rating: 4.9,
      reviewCount: 0,
      createdAt: daysAgo(10),
    },
    {
      id: 'meal-7',
      chefId: 'chef-1',
      name: 'Dal Tadka with Jeera Rice',
      description: 'Aromatic roasted garlic & cumin tempered yellow dal served with steaming jeera rice and crisp roasted urad papad.',
      ingredients: ['Moong & Toor Dal', 'Roasted Garlic Tadka', 'Jeera Basmati Rice', 'Roasted Papad'],
      prepDetails: 'Light, easy on the stomach, and ideal after late evening college classes.',
      price: 80,
      dietary: 'Veg',
      availableQty: 22,
      isAvailable: true,
      timeSlots: ['Dinner · 7:30 PM – 8:15 PM', 'Late Dinner · 8:30 PM – 9:15 PM'],
      imageUrl: IMAGE_PATHS.dalTadkaJeera,
      rating: 4.7,
      reviewCount: 0,
      createdAt: daysAgo(9),
    },
    {
      id: 'meal-8',
      chefId: 'chef-1',
      name: 'First-Time Trial Meal (Dal, Rice & 2 Rotis)',
      description: 'Promotional ₹49 first-trial tiffin for Ajmer hostel students to experience Maa Annapurna Home Kitchen quality.',
      ingredients: ['Yellow Dal Fry', 'Steamed Rice', '2 Whole Wheat Rotis', 'Seasonal Pickle'],
      prepDetails: 'Introductory trial portion packed in hygienic food-grade containers.',
      price: 49,
      isTrialOffer: true,
      dietary: 'Veg',
      availableQty: 12,
      isAvailable: true,
      timeSlots: ['Dinner · 7:30 PM – 8:15 PM'],
      imageUrl: IMAGE_PATHS.dalSabziRice,
      rating: 4.8,
      reviewCount: 0,
      createdAt: daysAgo(7),
    },
    {
      id: 'meal-9',
      chefId: 'chef-3',
      name: 'Homestyle Egg Curry & Jeera Rice',
      description: 'Two boiled farm eggs simmered in home-ground onion-tomato masala served with steamed jeera rice.',
      ingredients: ['Farm Eggs', 'Jeera Basmati Rice', 'Onion Tomato Masala', 'Fresh Coriander'],
      prepDetails: 'Prepared in separate non-veg cookware; chef kitchen inspection pending admin review.',
      price: 80,
      dietary: 'Non-Veg',
      availableQty: 10,
      isAvailable: true,
      timeSlots: ['Dinner · 7:30 PM – 8:15 PM'],
      imageUrl: IMAGE_PATHS.dalTadkaJeera,
      rating: 4.5,
      reviewCount: 0,
      createdAt: daysAgo(2),
    },
  ];

  const orders: Order[] = [
    {
      id: 'HB-2026-1041',
      studentId: 'stu-1',
      studentName: 'Aarav Sharma',
      mobile: '9829041122',
      college: 'Government Engineering College, Ajmer',
      hostelName: 'Vikramaditya Boys Hostel (Block B)',
      dropOffGate: 'Main Campus North Gate · Guard Cabin',
      timeSlot: 'Dinner · 7:30 PM – 8:15 PM',
      instructions: 'Please keep dal less spicy.',
      paymentMethod: 'UPI (Demo Prototype)',
      items: [
        {
          mealId: 'meal-1',
          mealName: 'Dal, Rice and Seasonal Sabzi',
          chefId: 'chef-1',
          chefName: 'Sunita Sharma',
          price: 80,
          quantity: 1,
          imageUrl: IMAGE_PATHS.dalSabziRice,
        },
      ],
      subtotal: 80,
      deliveryFee: 0,
      totalAmount: 80,
      status: 'Delivered / Collected',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: 'HB-2026-1042',
      studentId: 'stu-1',
      studentName: 'Aarav Sharma',
      mobile: '9829041122',
      college: 'Government Engineering College, Ajmer',
      hostelName: 'Vikramaditya Boys Hostel (Block B)',
      dropOffGate: 'Main Campus North Gate · Guard Cabin',
      timeSlot: 'Dinner · 7:30 PM – 8:15 PM',
      instructions: 'Call on arrival at north gate.',
      paymentMethod: 'Cash on Delivery / Pay at Collection',
      items: [
        {
          mealId: 'meal-3',
          mealName: 'Rajma Chawal',
          chefId: 'chef-2',
          chefName: 'Rajesh Rathore',
          price: 80,
          quantity: 1,
          imageUrl: IMAGE_PATHS.rajmaChawal,
        },
      ],
      subtotal: 80,
      deliveryFee: 0,
      totalAmount: 80,
      status: 'Food Being Prepared',
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
    },
    {
      id: 'HB-2026-1043',
      studentId: 'stu-2',
      studentName: 'Ananya Rathore',
      mobile: '9829154321',
      college: 'MDS University, Ajmer',
      hostelName: 'Gargi Girls Hostel',
      dropOffGate: 'Gargi Hostel Entry Gate · Reception Desk',
      timeSlot: 'Dinner · 7:30 PM – 8:15 PM',
      instructions: 'Extra onion salad if possible.',
      paymentMethod: 'UPI (Demo Prototype)',
      items: [
        {
          mealId: 'meal-2',
          mealName: 'Roti, Paneer Sabzi and Salad',
          chefId: 'chef-1',
          chefName: 'Sunita Sharma',
          price: 80,
          quantity: 1,
          imageUrl: IMAGE_PATHS.paneerRotiSalad,
        },
      ],
      subtotal: 80,
      deliveryFee: 0,
      totalAmount: 80,
      status: 'Delivered / Collected',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: 'HB-2026-1044',
      studentId: 'stu-3',
      studentName: 'Rohan Joshi',
      mobile: '9784512390',
      college: 'Bhagwant University, Ajmer',
      hostelName: 'Vaishali Nagar Student PG',
      dropOffGate: 'Vaishali Nagar Lane 3 · Main Gate',
      timeSlot: 'Lunch · 12:30 PM – 1:15 PM',
      instructions: 'Leave at PG main gate table.',
      paymentMethod: 'UPI (Demo Prototype)',
      items: [
        {
          mealId: 'meal-4',
          mealName: 'Chole Rice',
          chefId: 'chef-2',
          chefName: 'Rajesh Rathore',
          price: 80,
          quantity: 2,
          imageUrl: IMAGE_PATHS.choleRice,
        },
      ],
      subtotal: 160,
      deliveryFee: 0,
      totalAmount: 160,
      status: 'Order Placed',
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
    },
    {
      id: 'HB-2026-1045',
      studentId: 'stu-4',
      studentName: 'Priya Meena',
      mobile: '9649087123',
      college: 'Central University Corridor, Ajmer',
      hostelName: 'Shastri Nagar Residency PG',
      dropOffGate: 'Shastri Nagar Main Porch Gate',
      timeSlot: 'Dinner · 7:30 PM – 8:15 PM',
      instructions: 'First trial meal!',
      paymentMethod: 'Demo Prototype Payment',
      items: [
        {
          mealId: 'meal-8',
          mealName: 'First-Time Trial Meal (Dal, Rice & 2 Rotis)',
          chefId: 'chef-1',
          chefName: 'Sunita Sharma',
          price: 49,
          quantity: 1,
          imageUrl: IMAGE_PATHS.dalSabziRice,
        },
      ],
      subtotal: 49,
      deliveryFee: 0,
      totalAmount: 49,
      status: 'Delivered / Collected',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ];

  const subscriptions: Subscription[] = [
    {
      id: 'SUB-2026-301',
      studentId: 'stu-1',
      studentName: 'Aarav Sharma',
      hostelName: 'Vikramaditya Boys Hostel (Block B)',
      planName: 'Weekly Student Meal Plan (MVP Pilot)',
      price: 500,
      totalMeals: 7,
      remainingMeals: 4,
      scheduleSummary: '7 Dinner Meals / Week · Mon–Sun · 7:30 PM Gate Drop-off',
      status: 'active',
      startDate: daysAgo(3),
      expiryDate: daysAhead(4),
      paymentMethod: 'UPI (Demo Prototype)',
      createdAt: daysAgo(3),
    },
    {
      id: 'SUB-2026-302',
      studentId: 'stu-2',
      studentName: 'Ananya Rathore',
      hostelName: 'Gargi Girls Hostel',
      planName: 'Weekly Student Meal Plan (MVP Pilot)',
      price: 500,
      totalMeals: 7,
      remainingMeals: 2,
      scheduleSummary: '7 Dinner Meals / Week · Mon–Sun · 7:30 PM Gate Drop-off',
      status: 'active',
      startDate: daysAgo(5),
      expiryDate: daysAhead(2),
      paymentMethod: 'UPI (Demo Prototype)',
      createdAt: daysAgo(5),
    },
    {
      id: 'SUB-2026-303',
      studentId: 'stu-3',
      studentName: 'Rohan Joshi',
      hostelName: 'Vaishali Nagar Student PG',
      planName: 'Weekly Student Meal Plan (MVP Pilot)',
      price: 500,
      totalMeals: 7,
      remainingMeals: 0,
      scheduleSummary: '7 Dinner Meals / Week · Mon–Sun · 7:30 PM Gate Drop-off',
      status: 'expired',
      startDate: daysAgo(12),
      expiryDate: daysAgo(5),
      paymentMethod: 'Cash on Delivery / Pay at Collection',
      createdAt: daysAgo(12),
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev-1',
      orderId: 'HB-2026-1041',
      mealId: 'meal-1',
      mealName: 'Dal, Rice and Seasonal Sabzi',
      chefId: 'chef-1',
      studentId: 'stu-1',
      studentName: 'Aarav Sharma',
      hostelName: 'Vikramaditya Boys Hostel',
      tasteRating: 5,
      qualityRating: 5,
      portionRating: 5,
      packagingRating: 5,
      punctualityRating: 5,
      overallRating: 5.0,
      comment: 'After 4 months of oily hostel mess dal, this felt exactly like home. Reached the North Gate right at 7:35 PM without any extra fee.',
      isVisible: true,
      createdAt: daysAgo(3),
    },
    {
      id: 'rev-2',
      orderId: 'HB-2026-1043',
      mealId: 'meal-2',
      mealName: 'Roti, Paneer Sabzi and Salad',
      chefId: 'chef-1',
      studentId: 'stu-2',
      studentName: 'Ananya Rathore',
      hostelName: 'Gargi Girls Hostel',
      tasteRating: 5,
      qualityRating: 5,
      portionRating: 4,
      packagingRating: 5,
      punctualityRating: 5,
      overallRating: 4.8,
      comment: 'Soft phulkas and fresh paneer with zero restaurant grease. At ₹80 with zero delivery charges, my monthly food budget stays under control.',
      isVisible: true,
      createdAt: daysAgo(2),
    },
    {
      id: 'rev-3',
      orderId: 'HB-2026-1045',
      mealId: 'meal-1',
      mealName: 'Dal, Rice and Seasonal Sabzi',
      chefId: 'chef-1',
      studentId: 'stu-4',
      studentName: 'Priya Meena',
      hostelName: 'Shastri Nagar Residency PG',
      tasteRating: 5,
      qualityRating: 5,
      portionRating: 5,
      packagingRating: 4,
      punctualityRating: 5,
      overallRating: 4.8,
      comment: 'Clean foil-sealed boxes, zero spills, and genuinely comforting home flavours.',
      isVisible: true,
      createdAt: daysAgo(1),
    },
    {
      id: 'rev-4',
      orderId: 'HB-2026-1044',
      mealId: 'meal-3',
      mealName: 'Rajma Chawal',
      chefId: 'chef-2',
      studentId: 'stu-3',
      studentName: 'Rohan Joshi',
      hostelName: 'Vaishali Nagar Student PG',
      tasteRating: 5,
      qualityRating: 5,
      portionRating: 5,
      packagingRating: 4,
      punctualityRating: 5,
      overallRating: 4.8,
      comment: 'Generous portion for ₹80! Mint chutney made it taste like Sunday lunch at home.',
      isVisible: true,
      createdAt: daysAgo(4),
    },
    {
      id: 'rev-5',
      orderId: 'HB-2026-1044',
      mealId: 'meal-4',
      mealName: 'Chole Rice',
      chefId: 'chef-2',
      studentId: 'stu-2',
      studentName: 'Ananya Rathore',
      hostelName: 'Gargi Girls Hostel',
      tasteRating: 5,
      qualityRating: 5,
      portionRating: 4,
      packagingRating: 5,
      punctualityRating: 4,
      overallRating: 4.6,
      comment: 'Very flavourful chole and aromatic jeera rice. Much healthier than campus canteen noodles.',
      isVisible: true,
      createdAt: daysAgo(5),
    },
  ];

  return {
    students,
    chefs,
    meals,
    orders,
    subscriptions,
    reviews,
    planConfig: {
      weeklyPlanName: 'Weekly Student Meal Plan',
      weeklyPrice: 500,
      weeklyMealsCount: 7,
      weeklyScheduleLabel: '7 Dinner Meals / Week · Mon–Sun · 7:30 PM Hostel Gate Drop-off',
      hypothesisNote:
        'MVP Validation Hypothesis: Testing student willingness to pay ₹500/week upfront for scheduled homemade meals vs. ₹80 daily ordering. Meal count & schedule are admin-configurable.',
      standardMealPrice: 80,
      trialMealPrice: 49,
    },
  };
}

function readDb(): DatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as DatabaseState;
  } catch {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

function writeDb(db: DatabaseState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function recalculateRatings(db: DatabaseState): void {
  const visibleReviews = db.reviews.filter((r) => r.isVisible);
  for (const meal of db.meals) {
    const mealRevs = visibleReviews.filter((r) => r.mealId === meal.id);
    if (mealRevs.length > 0) {
      const avg = mealRevs.reduce((s, r) => s + r.overallRating, 0) / mealRevs.length;
      meal.rating = Number(avg.toFixed(1));
      meal.reviewCount = mealRevs.length;
    }
  }
  for (const chef of db.chefs) {
    const chefRevs = visibleReviews.filter((r) => r.chefId === chef.id);
    if (chefRevs.length > 0) {
      const avg = chefRevs.reduce((s, r) => s + r.overallRating, 0) / chefRevs.length;
      chef.rating = Number(avg.toFixed(1));
      chef.reviewCount = chefRevs.length;
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/bootstrap', (_req, res) => {
    const db = readDb();
    res.json(db);
  });

  app.post('/api/auth/login', (req, res) => {
    const { role, identifier, password } = req.body as {
      role: 'student' | 'chef' | 'admin';
      identifier: string;
      password: string;
    };
    const db = readDb();
    const cleanId = (identifier || '').trim().toLowerCase();

    if (role === 'admin') {
      if (
        (cleanId === 'admin@hostelbites.in' || cleanId === 'yuvraj.0251mba519@dgu.ac.in' || cleanId === 'admin') &&
        (password === 'admin123' || password === 'demo123')
      ) {
        return res.json({
          session: {
            role: 'admin',
            userId: 'admin-1',
            name: 'Yuvraj Singh (Venture Admin)',
            email: 'admin@hostelbites.in',
          },
        });
      }
      return res.status(401).json({ error: 'Invalid admin credentials. Use admin@hostelbites.in / admin123 for demo.' });
    }

    if (role === 'student') {
      const student = db.students.find(
        (s) => (s.email.toLowerCase() === cleanId || s.mobile === cleanId) && s.password === password,
      );
      if (!student) {
        return res.status(401).json({ error: 'Invalid student email/mobile or password.' });
      }
      return res.json({
        session: { role: 'student', userId: student.id, name: student.name, email: student.email },
      });
    }

    if (role === 'chef') {
      const chef = db.chefs.find(
        (c) => (c.email.toLowerCase() === cleanId || c.mobile === cleanId) && c.password === password,
      );
      if (!chef) {
        return res.status(401).json({ error: 'Invalid home chef email/mobile or password.' });
      }
      return res.json({
        session: { role: 'chef', userId: chef.id, name: chef.name, email: chef.email },
      });
    }

    return res.status(400).json({ error: 'Unsupported role.' });
  });

  app.post('/api/auth/register-student', (req, res) => {
    const payload = req.body as Partial<Student>;
    if (!payload.name || !payload.email || !payload.mobile || !payload.password || !payload.college || !payload.hostelName || !payload.dropOffGate) {
      return res.status(400).json({ error: 'Please fill in all required student registration fields.' });
    }
    const db = readDb();
    const exists = db.students.some(
      (s) => s.email.toLowerCase() === payload.email!.trim().toLowerCase() || s.mobile === payload.mobile!.trim(),
    );
    if (exists) {
      return res.status(409).json({ error: 'A student account with this email or mobile number already exists.' });
    }
    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim(),
      mobile: payload.mobile.trim(),
      password: payload.password,
      college: payload.college.trim(),
      hostelName: payload.hostelName.trim(),
      dropOffGate: payload.dropOffGate.trim(),
      age: Number(payload.age) || 19,
      createdAt: new Date().toISOString(),
    };
    db.students.unshift(newStudent);
    writeDb(db);
    return res.status(201).json({
      student: newStudent,
      session: { role: 'student', userId: newStudent.id, name: newStudent.name, email: newStudent.email },
    });
  });

  app.post('/api/auth/register-chef', (req, res) => {
    const payload = req.body as Partial<Chef>;
    if (!payload.name || !payload.email || !payload.mobile || !payload.password || !payload.kitchenName || !payload.fssaiNumber) {
      return res.status(400).json({ error: 'Please fill in all required home chef and FSSAI fields.' });
    }
    const db = readDb();
    const exists = db.chefs.some(
      (c) => c.email.toLowerCase() === payload.email!.trim().toLowerCase() || c.mobile === payload.mobile!.trim(),
    );
    if (exists) {
      return res.status(409).json({ error: 'A home chef account with this email or mobile number already exists.' });
    }
    const newChef: Chef = {
      id: `chef-${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim(),
      mobile: payload.mobile.trim(),
      password: payload.password,
      kitchenName: payload.kitchenName.trim(),
      locality: (payload.locality || 'Vaishali Nagar').trim(),
      city: 'Ajmer, Rajasthan',
      bio: (payload.bio || 'Local home kitchen preparing hygienic everyday student meals in Ajmer.').trim(),
      specialty: (payload.specialty || 'Homestyle North Indian Meals').trim(),
      fssaiNumber: payload.fssaiNumber.trim(),
      fssaiCertificateNote: (payload.fssaiCertificateNote || 'Submitted for Admin Verification').trim(),
      hygieneNotes: 'Pending administrator kitchen hygiene inspection.',
      avatarUrl: payload.avatarUrl || IMAGE_PATHS.chefSunita,
      verificationStatus: 'pending',
      rating: 4.5,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    db.chefs.unshift(newChef);
    writeDb(db);
    return res.status(201).json({
      chef: newChef,
      session: { role: 'chef', userId: newChef.id, name: newChef.name, email: newChef.email },
    });
  });

  app.patch('/api/students/:id', (req, res) => {
    const db = readDb();
    const idx = db.students.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found.' });
    const updates = req.body as Partial<Student>;
    db.students[idx] = {
      ...db.students[idx],
      name: updates.name?.trim() || db.students[idx].name,
      mobile: updates.mobile?.trim() || db.students[idx].mobile,
      college: updates.college?.trim() || db.students[idx].college,
      hostelName: updates.hostelName?.trim() || db.students[idx].hostelName,
      dropOffGate: updates.dropOffGate?.trim() || db.students[idx].dropOffGate,
    };
    writeDb(db);
    return res.json({ student: db.students[idx] });
  });

  app.patch('/api/chefs/:id', (req, res) => {
    const db = readDb();
    const idx = db.chefs.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Chef not found.' });
    const updates = req.body as Partial<Chef>;
    db.chefs[idx] = {
      ...db.chefs[idx],
      name: updates.name?.trim() || db.chefs[idx].name,
      mobile: updates.mobile?.trim() || db.chefs[idx].mobile,
      kitchenName: updates.kitchenName?.trim() || db.chefs[idx].kitchenName,
      locality: updates.locality?.trim() || db.chefs[idx].locality,
      bio: updates.bio?.trim() || db.chefs[idx].bio,
      specialty: updates.specialty?.trim() || db.chefs[idx].specialty,
      fssaiNumber: updates.fssaiNumber?.trim() || db.chefs[idx].fssaiNumber,
      avatarUrl: updates.avatarUrl || db.chefs[idx].avatarUrl,
    };
    writeDb(db);
    return res.json({ chef: db.chefs[idx] });
  });

  app.patch('/api/chefs/:id/verification', (req, res) => {
    const { verificationStatus, rejectionReason, hygieneNotes } = req.body as {
      verificationStatus: ChefVerificationStatus;
      rejectionReason?: string;
      hygieneNotes?: string;
    };
    const db = readDb();
    const idx = db.chefs.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Chef not found.' });
    db.chefs[idx].verificationStatus = verificationStatus;
    db.chefs[idx].rejectionReason = verificationStatus === 'rejected' ? rejectionReason || 'FSSAI or kitchen hygiene details require resubmission.' : undefined;
    if (verificationStatus === 'verified') {
      db.chefs[idx].hygieneNotes =
        hygieneNotes || 'Verified FSSAI certificate, clean food-grade home kitchen, RO water, and sealed hostel gate dispatch.';
    }
    writeDb(db);
    return res.json({ chef: db.chefs[idx] });
  });

  app.post('/api/meals', (req, res) => {
    const payload = req.body as Partial<Meal>;
    if (!payload.chefId || !payload.name || !payload.description || payload.price === undefined) {
      return res.status(400).json({ error: 'Meal name, chef, description, and price are required.' });
    }
    const db = readDb();
    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      chefId: payload.chefId,
      name: payload.name.trim(),
      description: payload.description.trim(),
      ingredients:
        payload.ingredients && payload.ingredients.length > 0
          ? payload.ingredients
          : ['Fresh Homestyle Ingredients', 'Whole Spices', 'RO Water'],
      prepDetails: (payload.prepDetails || 'Freshly prepared to order in home kitchen before campus gate slot.').trim(),
      price: Math.max(1, Number(payload.price) || 80),
      dietary: payload.dietary === 'Non-Veg' ? 'Non-Veg' : 'Veg',
      availableQty: Math.max(0, Number(payload.availableQty) || 15),
      isAvailable: payload.isAvailable ?? true,
      isTodaysSpecial: Boolean(payload.isTodaysSpecial),
      timeSlots:
        payload.timeSlots && payload.timeSlots.length > 0
          ? payload.timeSlots
          : ['Dinner · 7:30 PM – 8:15 PM'],
      imageUrl: payload.imageUrl || IMAGE_PATHS.dalSabziRice,
      rating: 4.7,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    db.meals.unshift(newMeal);
    writeDb(db);
    return res.status(201).json({ meal: newMeal });
  });

  app.patch('/api/meals/:id', (req, res) => {
    const db = readDb();
    const idx = db.meals.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Meal not found.' });
    const updates = req.body as Partial<Meal>;
    db.meals[idx] = {
      ...db.meals[idx],
      ...updates,
      price: updates.price !== undefined ? Math.max(1, Number(updates.price)) : db.meals[idx].price,
      availableQty:
        updates.availableQty !== undefined ? Math.max(0, Number(updates.availableQty)) : db.meals[idx].availableQty,
    };
    writeDb(db);
    return res.json({ meal: db.meals[idx] });
  });

  app.delete('/api/meals/:id', (req, res) => {
    const db = readDb();
    const prevLen = db.meals.length;
    db.meals = db.meals.filter((m) => m.id !== req.params.id);
    if (db.meals.length === prevLen) return res.status(404).json({ error: 'Meal not found.' });
    writeDb(db);
    return res.json({ deleted: true });
  });

  app.post('/api/orders', (req, res) => {
    const payload = req.body as Partial<Order>;
    if (!payload.studentName || !payload.mobile || !payload.hostelName || !payload.dropOffGate || !payload.items?.length) {
      return res.status(400).json({ error: 'Complete hostel delivery details and at least one meal item are required.' });
    }
    const db = readDb();

    if (payload.clientRequestId) {
      const existing = db.orders.find((o) => o.clientRequestId === payload.clientRequestId);
      if (existing) {
        return res.status(200).json({ order: existing, deduplicated: true });
      }
    }

    for (const item of payload.items) {
      const meal = db.meals.find((m) => m.id === item.mealId);
      if (!meal || !meal.isAvailable || meal.availableQty < item.quantity) {
        return res.status(400).json({
          error: `${item.mealName} does not have enough portions available right now.`,
        });
      }
    }

    const subtotal = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderNum = 1046 + db.orders.length;
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: `HB-2026-${orderNum}`,
      clientRequestId: payload.clientRequestId,
      studentId: payload.studentId || 'guest-student',
      studentName: payload.studentName.trim(),
      mobile: payload.mobile.trim(),
      college: (payload.college || 'Ajmer Campus').trim(),
      hostelName: payload.hostelName.trim(),
      dropOffGate: payload.dropOffGate.trim(),
      timeSlot: payload.timeSlot || 'Dinner · 7:30 PM – 8:15 PM',
      instructions: (payload.instructions || '').trim(),
      paymentMethod: payload.paymentMethod || 'UPI (Demo Prototype)',
      items: payload.items,
      subtotal,
      deliveryFee: 0,
      totalAmount: subtotal,
      status: 'Order Placed',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    for (const item of payload.items) {
      const meal = db.meals.find((m) => m.id === item.mealId);
      if (meal) {
        meal.availableQty = Math.max(0, meal.availableQty - item.quantity);
        if (meal.availableQty === 0) {
          meal.isAvailable = false;
        }
      }
    }

    db.orders.unshift(newOrder);
    writeDb(db);
    return res.status(201).json({ order: newOrder });
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body as { status: OrderStatus };
    const db = readDb();
    const idx = db.orders.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found.' });
    db.orders[idx].status = status;
    db.orders[idx].updatedAt = new Date().toISOString();
    writeDb(db);
    return res.json({ order: db.orders[idx] });
  });

  app.post('/api/subscriptions', (req, res) => {
    const payload = req.body as Partial<Subscription>;
    const db = readDb();
    if (!payload.studentId || !payload.studentName) {
      return res.status(400).json({ error: 'Student account details are required to subscribe.' });
    }
    const start = new Date();
    const expiry = new Date(start.getTime() + 7 * 86400000);
    const newSub: Subscription = {
      id: `SUB-2026-${304 + db.subscriptions.length}`,
      studentId: payload.studentId,
      studentName: payload.studentName,
      hostelName: payload.hostelName || 'Ajmer Campus Hostel',
      planName: db.planConfig.weeklyPlanName,
      price: db.planConfig.weeklyPrice,
      totalMeals: db.planConfig.weeklyMealsCount,
      remainingMeals: db.planConfig.weeklyMealsCount,
      scheduleSummary: db.planConfig.weeklyScheduleLabel,
      status: 'active',
      startDate: start.toISOString(),
      expiryDate: expiry.toISOString(),
      paymentMethod: payload.paymentMethod || 'UPI (Demo Prototype)',
      createdAt: start.toISOString(),
    };
    db.subscriptions.unshift(newSub);
    writeDb(db);
    return res.status(201).json({ subscription: newSub });
  });

  app.patch('/api/subscriptions/:id', (req, res) => {
    const { status, remainingMeals } = req.body as { status?: SubscriptionStatus; remainingMeals?: number };
    const db = readDb();
    const idx = db.subscriptions.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Subscription not found.' });
    if (status) db.subscriptions[idx].status = status;
    if (remainingMeals !== undefined) db.subscriptions[idx].remainingMeals = Math.max(0, remainingMeals);
    writeDb(db);
    return res.json({ subscription: db.subscriptions[idx] });
  });

  app.patch('/api/plan-config', (req, res) => {
    const updates = req.body as Partial<DatabaseState['planConfig']>;
    const db = readDb();
    db.planConfig = {
      ...db.planConfig,
      ...updates,
      weeklyMealsCount:
        updates.weeklyMealsCount !== undefined
          ? Math.max(1, Number(updates.weeklyMealsCount))
          : db.planConfig.weeklyMealsCount,
      weeklyPrice:
        updates.weeklyPrice !== undefined ? Math.max(1, Number(updates.weeklyPrice)) : db.planConfig.weeklyPrice,
    };
    writeDb(db);
    return res.json({ planConfig: db.planConfig });
  });

  app.post('/api/reviews', (req, res) => {
    const payload = req.body as Partial<Review>;
    if (!payload.mealId || !payload.chefId || !payload.studentId || !payload.comment) {
      return res.status(400).json({ error: 'Please provide ratings and a short review comment.' });
    }
    const db = readDb();
    const ratings = [
      Number(payload.tasteRating) || 5,
      Number(payload.qualityRating) || 5,
      Number(payload.portionRating) || 5,
      Number(payload.packagingRating) || 5,
      Number(payload.punctualityRating) || 5,
    ];
    const overall = Number((ratings.reduce((a, b) => a + b, 0) / 5).toFixed(1));
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      orderId: payload.orderId || 'DIRECT',
      mealId: payload.mealId,
      mealName: payload.mealName || 'Homemade Meal',
      chefId: payload.chefId,
      studentId: payload.studentId,
      studentName: payload.studentName || 'Student',
      hostelName: payload.hostelName || 'Ajmer Hostel',
      tasteRating: ratings[0],
      qualityRating: ratings[1],
      portionRating: ratings[2],
      packagingRating: ratings[3],
      punctualityRating: ratings[4],
      overallRating: overall,
      comment: payload.comment.trim(),
      isVisible: true,
      createdAt: new Date().toISOString(),
    };
    db.reviews.unshift(newReview);
    recalculateRatings(db);
    writeDb(db);
    return res.status(201).json({ review: newReview, meals: db.meals, chefs: db.chefs });
  });

  app.patch('/api/reviews/:id', (req, res) => {
    const { isVisible } = req.body as { isVisible: boolean };
    const db = readDb();
    const idx = db.reviews.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Review not found.' });
    db.reviews[idx].isVisible = Boolean(isVisible);
    recalculateRatings(db);
    writeDb(db);
    return res.json({ review: db.reviews[idx] });
  });

  app.post('/api/reset-demo', (_req, res) => {
    const seed = createSeedDatabase();
    writeDb(seed);
    return res.json(seed);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HostelBites server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
