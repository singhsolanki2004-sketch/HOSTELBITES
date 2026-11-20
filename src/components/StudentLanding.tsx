import React from 'react';
import { ArrowRight, ChefHat, Clock, MapPin, MessageCircle, ShieldCheck, Star, Utensils } from 'lucide-react';
import type { Chef, Meal, SubscriptionPlanConfig } from '../types';
import { FoodImage } from './BrandLogo';

interface StudentLandingProps {
  meals: Meal[];
  chefs: Chef[];
  planConfig: SubscriptionPlanConfig;
  onExploreMenu: () => void;
  onOrderMeal: () => void;
  onViewMealDetails: (meal: Meal) => void;
  onAddToCart: (meal: Meal) => void;
  onViewSubscriptions: () => void;
  onOpenWhatsApp: () => void;
  onOpenAuth: (mode?: 'login' | 'register', role?: 'student' | 'chef' | 'admin') => void;
}

export const StudentLanding: React.FC<StudentLandingProps> = ({
  meals,
  chefs,
  planConfig,
  onExploreMenu,
  onOrderMeal,
  onViewMealDetails,
  onAddToCart,
  onViewSubscriptions,
  onOpenWhatsApp,
  onOpenAuth,
}) => {
  const featuredMeals = meals.filter((m) => m.isAvailable).slice(0, 3);

  const testimonials = [
    {
      name: 'Aarav Sharma',
      role: '2nd Year B.Tech · Vikramaditya Boys Hostel, Ajmer',
      quote:
        'Before HostelBites, I was skipping repetitive mess dal three nights a week and spending ₹200+ on Zomato. Now Maa Annapurna Kitchen drops hot dal, sabzi, and rotis at our North Gate for ₹80 with zero delivery fee.',
    },
    {
      name: 'Ananya Rathore',
      role: '1st Year B.Sc · Gargi Girls Hostel, MDS University',
      quote:
        'I do not have a scooty on campus, so going into Vaishali Nagar for dinner was impossible. Having FSSAI-verified home kitchens deliver to the hostel reception at 7:30 PM has completely fixed my evening meals.',
    },
    {
      name: 'Rohan Joshi',
      role: 'MBA Student · Vaishali Nagar Student PG, Ajmer',
      quote:
        'Started with the ₹49 trial meal and switched to the ₹500 weekly plan. Clean oil, real homemade spices, and punctual gate drop-offs.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Section 1: Hero Split + Key Value Proposition */}
      <section className="pt-6 lg:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-sm font-medium text-[#176B45] tracking-wide">
              Ajmer Campus Kitchen · Ghar Jaisa Khana, Hostel Ke Paas!
            </p>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#252525] leading-[1.12] [text-wrap:balance]">
              Missing Ghar Ka Khana?
            </h1>

            <p className="text-base sm:text-lg text-[#252525]/80 leading-relaxed max-w-xl">
              Enjoy fresh, hygienic and affordable homemade meals delivered straight to your hostel. Cooked by certified local home chefs in Ajmer with zero delivery fee.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onOrderMeal}
                className="inline-flex items-center gap-2 rounded-xl bg-[#176B45] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#125436] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Order Your Meal
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onExploreMenu}
                className="inline-flex items-center gap-2 rounded-xl border border-[#252525]/15 bg-white px-6 py-3.5 text-sm font-semibold text-[#252525] hover:bg-[#176B45]/5 hover:border-[#176B45]/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Menu
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-[#252525]/10 text-sm text-[#252525]/75">
              <span>Standard Meal ₹{planConfig.standardMealPrice}</span>
              <span aria-hidden="true">·</span>
              <span>Trial Meal ₹{planConfig.trialMealPrice}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#176B45]">Zero Delivery Fee (₹0)</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[300px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-[#252525]/10 shadow-sm bg-white">
              <FoodImage
                src="/src/assets/images/hero_indian_thali_1795109857194.jpg"
                alt="Fresh Indian homemade veg thali with dal tadka, jeera rice, soft rotis, paneer sabzi, salad, and raita"
                className="w-full h-full object-cover"
                fallbackLabel="Indian Homemade Veg Thali"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 sm:p-6 text-white">
                <p className="text-xs font-medium text-[#FFAA45]">
                  Today’s Campus Highlight · Ajmer
                </p>
                <p className="font-display text-lg font-semibold mt-0.5">
                  Fresh Homemade Meals Starting at ₹{planConfig.standardMealPrice} | Zero Delivery Fee
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Benefit Strip Below Hero */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white p-5 border border-[#252525]/10">
            <Utensils className="w-5 h-5 text-[#176B45] mb-2.5" />
            <h2 className="font-display text-base font-semibold text-[#252525]">100% Homemade</h2>
            <p className="text-sm text-[#252525]/70 mt-1">
              Cooked in small batches by local Ajmer home kitchens—never commercial mess bulk.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-[#252525]/10">
            <ShieldCheck className="w-5 h-5 text-[#176B45] mb-2.5" />
            <h2 className="font-display text-base font-semibold text-[#252525]">Verified Hygiene</h2>
            <p className="text-sm text-[#252525]/70 mt-1">
              Admin-inspected FSSAI-certified home chefs using RO water and food-grade packs.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-[#252525]/10">
            <ChefHat className="w-5 h-5 text-[#176B45] mb-2.5" />
            <h2 className="font-display text-base font-semibold text-[#252525]">Student-Friendly ₹80</h2>
            <p className="text-sm text-[#252525]/70 mt-1">
              Half the price of restaurant delivery apps with a ₹49 first-time trial meal option.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-[#252525]/10">
            <MapPin className="w-5 h-5 text-[#176B45] mb-2.5" />
            <h2 className="font-display text-base font-semibold text-[#252525]">₹0 Hostel Gate Drop</h2>
            <p className="text-sm text-[#252525]/70 mt-1">
              Pre-arranged scheduled drop-offs at your hostel gate with zero hidden delivery charges.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: How HostelBites Works + Featured Meals */}
      <section className="space-y-12">
        <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 sm:p-8">
          <div className="max-w-2xl mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#252525]">
              How HostelBites Works
            </h2>
            <p className="text-sm sm:text-base text-[#252525]/70 mt-1.5">
              Built for first- and second-year hostel students without personal transport in Ajmer.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="font-mono text-xs font-semibold text-[#176B45]">01. Pick Today’s Menu</p>
              <h3 className="font-display text-lg font-semibold text-[#252525]">
                Browse Certified Kitchens
              </h3>
              <p className="text-sm text-[#252525]/75 leading-relaxed">
                Explore fresh daily lunch and dinner options from verified Ajmer home chefs starting at ₹{planConfig.standardMealPrice}.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs font-semibold text-[#176B45]">02. Lock Your Slot</p>
              <h3 className="font-display text-lg font-semibold text-[#252525]">
                Order Online or via WhatsApp
              </h3>
              <p className="text-sm text-[#252525]/75 leading-relaxed">
                Choose your hostel gate, select Lunch (12:30 PM) or Dinner (7:30 PM), and pay ₹0 delivery fee.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs font-semibold text-[#176B45]">03. Collect at Hostel Gate</p>
              <h3 className="font-display text-lg font-semibold text-[#252525]">
                Pre-Arranged Campus Drop-off
              </h3>
              <p className="text-sm text-[#252525]/75 leading-relaxed">
                Skip repetitive mess food. Pick up your sealed warm tiffin right at your designated hostel gate desk.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Meals Grid */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#252525]">
                Today’s Featured Home Meals
              </h2>
              <p className="text-sm text-[#252525]/70 mt-1">
                Illustrative Ajmer pilot menu · Prepared fresh by local home chefs.
              </p>
            </div>
            <button
              type="button"
              onClick={onExploreMenu}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#176B45] hover:underline cursor-pointer whitespace-nowrap"
            >
              View Full Menu
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMeals.map((meal) => {
              const chef = chefs.find((c) => c.id === meal.chefId);
              const isVerified = chef?.verificationStatus === 'verified';
              return (
                <article
                  key={meal.id}
                  className="group rounded-2xl bg-white border border-[#252525]/10 overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#FFFDF8]">
                    <FoodImage
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      fallbackLabel={meal.name}
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#252525]/65">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2.5 h-2.5 border ${
                              meal.dietary === 'Veg'
                                ? 'border-[#176B45] bg-[#176B45]'
                                : 'border-red-600 bg-red-600'
                            } rounded-[2px]`}
                            aria-hidden="true"
                          />
                          {meal.dietary}
                        </span>
                        <span className="tabular-nums font-medium text-[#176B45]">
                          {meal.availableQty} left today
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-semibold text-[#252525] leading-snug">
                        {meal.name}
                      </h3>

                      <p className="text-sm text-[#252525]/70 line-clamp-2">{meal.description}</p>

                      <div className="flex items-center gap-2 text-xs text-[#252525]/65 pt-1">
                        <span>{chef?.name || 'Home Chef'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{isVerified ? 'Verified Kitchen' : 'Pending Verification'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-0.5 tabular-nums font-medium text-[#252525]">
                          <Star className="w-3.5 h-3.5 fill-[#FFAA45] text-[#FFAA45]" />
                          {meal.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#252525]/10 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-display text-xl font-bold text-[#252525] tabular-nums">
                          ₹{meal.price}
                        </span>
                        <span className="block text-xs text-[#176B45]">₹0 delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onViewMealDetails(meal)}
                          className="rounded-xl border border-[#252525]/15 px-3 py-2 text-xs font-medium text-[#252525] hover:bg-[#252525]/5 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddToCart(meal)}
                          className="rounded-xl bg-[#176B45] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125436] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Student Testimonials + Weekly Hypothesis & WhatsApp CTA */}
      <section className="space-y-10">
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#252525]">
              Trusted by Ajmer Hostel Students
            </h2>
            <p className="text-sm text-[#252525]/70 mt-1">
              Real feedback from our early campus cohort across MDS University, GEC Ajmer, and Vaishali Nagar PGs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-2xl bg-white border border-[#252525]/10 p-6 flex flex-col justify-between space-y-4"
              >
                <p className="text-sm text-[#252525]/85 leading-relaxed">“{t.quote}”</p>
                <footer className="pt-3 border-t border-[#252525]/10">
                  <p className="font-display text-sm font-semibold text-[#252525]">{t.name}</p>
                  <p className="text-xs text-[#252525]/65 mt-0.5">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>

        {/* Final Call-to-Action */}
        <div className="rounded-2xl bg-[#176B45] text-white p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2.5">
            <p className="text-xs font-semibold tracking-wide text-[#FFAA45]">
              Healthy & Pocket-Friendly Campus Kitchen
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold [text-wrap:balance]">
              Try Your First Home-Cooked Meal for ₹{planConfig.trialMealPrice} or Join the ₹{planConfig.weeklyPrice} Weekly Plan
            </h2>
            <p className="text-sm sm:text-base text-white/85 max-w-2xl">
              Zero delivery fees. Pre-arranged hostel gate drop-offs in Ajmer. Instant ordering on web or via our WhatsApp Daily Menu support.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-wrap lg:flex-col gap-3 lg:items-stretch">
            <button
              type="button"
              onClick={onViewSubscriptions}
              className="rounded-xl bg-[#FFAA45] px-5 py-3 text-sm font-bold text-[#252525] hover:bg-[#f59d34] transition-colors whitespace-nowrap cursor-pointer text-center"
            >
              View ₹{planConfig.weeklyPrice} Weekly Plan
            </button>
            <button
              type="button"
              onClick={onOpenWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors whitespace-nowrap cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Order via WhatsApp Menu
            </button>
          </div>
        </div>

        {/* Subtle Portal Access for Presenters & Chefs */}
        <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-[#252525]">
              Cook for Hostels or Manage Campus Operations?
            </h3>
            <p className="text-sm text-[#252525]/70">
              Switch between Student, Home Chef, and Admin roles to explore the full HostelBites marketplace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenAuth('login', 'chef')}
              className="rounded-xl border border-[#252525]/15 px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 transition-colors whitespace-nowrap cursor-pointer"
            >
              Home Chef Portal
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login', 'admin')}
              className="rounded-xl border border-[#252525]/15 px-4 py-2 text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 transition-colors whitespace-nowrap cursor-pointer"
            >
              Admin Dashboard
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('register', 'student')}
              className="rounded-xl bg-[#176B45]/10 px-4 py-2 text-xs font-semibold text-[#176B45] hover:bg-[#176B45]/15 transition-colors whitespace-nowrap cursor-pointer"
            >
              Student Sign Up
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
