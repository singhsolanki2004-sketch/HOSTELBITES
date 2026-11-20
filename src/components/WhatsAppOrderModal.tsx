import React, { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, X } from 'lucide-react';
import type { Chef, Meal, Student } from '../types';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: Meal[];
  chefs: Chef[];
  student?: Student | null;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  meals,
  chefs,
  student,
}) => {
  const availableMeals = useMemo(
    () => meals.filter((m) => m.isAvailable && m.availableQty > 0),
    [meals],
  );
  const [selectedMealId, setSelectedMealId] = useState<string>(availableMeals[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [hostelGate, setHostelGate] = useState<string>(
    student?.dropOffGate || 'Main Campus North Gate · Guard Cabin',
  );
  const [slot, setSlot] = useState<string>('Dinner · 7:30 PM – 8:15 PM');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const chosenMeal = availableMeals.find((m) => m.id === selectedMealId) || availableMeals[0];
  const chosenChef = chefs.find((c) => c.id === chosenMeal?.chefId);

  const dailyMenuLines = availableMeals
    .slice(0, 6)
    .map((m, idx) => `${idx + 1}. ${m.name} — ₹${m.price} (${m.availableQty} left)`)
    .join('\n');

  const formattedMessage = chosenMeal
    ? `Namaste HostelBites Ajmer!\n\nI would like to place a Daily Menu order:\n• Meal: ${chosenMeal.name} x${quantity} (₹${chosenMeal.price * quantity})\n• Home Kitchen: ${chosenChef?.kitchenName || 'Partner Kitchen'}\n• Hostel Gate: ${hostelGate}\n• Time Slot: ${slot}\n• Delivery Fee: ₹0\n• Student: ${student?.name || 'Hostel Student'} (${student?.hostelName || 'Ajmer Campus'})\n\nToday's Menu Reference:\n${dailyMenuLines}`
    : 'Namaste HostelBites Ajmer! Please share today’s daily homemade menu.';

  const whatsappUrl = `https://wa.me/919829000108?text=${encodeURIComponent(formattedMessage)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white border border-[#252525]/10 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]/10 bg-[#FFFDF8]">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-[#176B45]" />
            <h2 id="whatsapp-modal-title" className="font-display text-lg font-semibold text-[#252525]">
              WhatsApp Daily Menu & Order Support
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#252525]/60 hover:text-[#252525] hover:bg-[#252525]/5 transition-colors"
            aria-label="Close WhatsApp order modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <p className="text-sm text-[#252525]/75 leading-relaxed">
            Prefer ordering on WhatsApp before the daily hostel cutoff? Pick a meal from today’s live kitchen menu below to generate your ready-to-send Ajmer WhatsApp order message.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#252525]/70 mb-1">
                Select Today’s Meal
              </label>
              <select
                value={chosenMeal?.id || ''}
                onChange={(e) => setSelectedMealId(e.target.value)}
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2.5 text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              >
                {availableMeals.map((meal) => (
                  <option key={meal.id} value={meal.id}>
                    {meal.name} (₹{meal.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#252525]/70 mb-1">
                Quantity & Delivery Slot
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={chosenMeal?.availableQty || 5}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                />
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="flex-1 rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2.5 text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                >
                  <option>Lunch · 12:30 PM – 1:15 PM</option>
                  <option>Dinner · 7:30 PM – 8:15 PM</option>
                  <option>Late Dinner · 8:30 PM – 9:15 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#252525]/70 mb-1">
              Hostel Gate / Drop-off Point (Ajmer)
            </label>
            <input
              type="text"
              value={hostelGate}
              onChange={(e) => setHostelGate(e.target.value)}
              className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3 py-2.5 text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              placeholder="e.g. Gargi Hostel Main Gate"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[#252525]/70">
                Formatted WhatsApp Order Preview
              </span>
              <span className="text-xs text-[#176B45] font-medium">Zero Delivery Fee (₹0)</span>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border border-[#252525]/10 bg-[#FFFDF8] p-3.5 text-xs text-[#252525]/85 font-sans leading-relaxed max-h-48 overflow-y-auto">
              {formattedMessage}
            </pre>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl border border-[#252525]/15 px-4 py-2.5 text-sm font-medium text-[#252525] hover:bg-[#252525]/5 transition-colors whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4 text-[#176B45]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Message' : 'Copy Order Text'}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#176B45] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#125436] transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              Open in WhatsApp
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
