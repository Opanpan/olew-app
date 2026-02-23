'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, FileText, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';

interface OrderFormProps {
  productName: string;
  productId: string;
  selectedColor: string;
}

export default function OrderForm({
  productName,
  productId,
  selectedColor,
}: OrderFormProps) {
  const { dict } = useLang();
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 100);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 100));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  };

  const handleAddToInquiry = () => {
    // In real implementation, this would add to cart/inquiry
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleQuoteRequest = () => {
    // In real implementation, this would open quote request form
    const subject = `Quote Request: ${productName}`;
    const body = `I would like to request a quote for:\n\nProduct: ${productName}\nProduct ID: ${productId}\nColor: ${selectedColor}\nQuantity: ${quantity}\n\nPlease provide pricing and availability.`;
    window.location.href = `mailto:info@olewgroup.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="text-xs md:text-base font-semibold text-gray-900 dark:text-white">
          {dict.catalog.product_detail.quantity} ({dict.catalog.product_detail.pieces})
        </label>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className={cn(
              'p-2 md:p-4 rounded-lg md:rounded-xl transition-all min-h-[40px] md:min-h-[48px] flex items-center justify-center',
              quantity <= 1
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
            )}
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            step={100}
            className={cn(
              'flex-1 px-2 md:px-4 py-2 md:py-4 rounded-lg md:rounded-xl text-center',
              'bg-white dark:bg-gray-900',
              'border-2 border-gray-200 dark:border-gray-700',
              'text-sm md:text-xl font-bold text-gray-900 dark:text-white',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'transition-all min-h-[40px] md:min-h-[48px]'
            )}
          />

          <button
            onClick={incrementQuantity}
            className="p-2 md:p-4 rounded-lg md:rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all min-h-[40px] md:min-h-[48px] flex items-center justify-center"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {dict.catalog.product_detail.step}: 100 {dict.catalog.product_detail.pieces}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 md:space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToInquiry}
          className="btn-primary w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-5 text-xs md:text-base font-semibold min-h-[44px] md:min-h-[52px]"
        >
          <ShoppingCart className="w-4 h-4 md:w-6 md:h-6" />
          {dict.catalog.product_detail.add_to_inquiry}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleQuoteRequest}
          className="btn-outline w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-5 text-xs md:text-base font-semibold min-h-[44px] md:min-h-[52px]"
        >
          <Mail className="w-4 h-4 md:w-6 md:h-6" />
          {dict.catalog.product_detail.request_quote}
        </motion.button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
        >
          <p className="text-sm md:text-base text-green-700 dark:text-green-400 font-medium text-center">
            {dict.catalog.product_detail.added_success}
          </p>
        </motion.div>
      )}

      {/* Additional Info */}
      <div className="p-3 md:p-5 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2 md:space-y-3">
        <div className="flex items-start gap-2 md:gap-3">
          <FileText className="w-3 h-3 md:w-5 md:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1 md:mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
              {dict.catalog.product_detail.bulk_discount_title}
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">
              {dict.catalog.product_detail.bulk_discount_desc}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 md:gap-3">
          <FileText className="w-3 h-3 md:w-5 md:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1 md:mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
              {dict.catalog.product_detail.custom_printing_title}
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">
              {dict.catalog.product_detail.custom_printing_desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
