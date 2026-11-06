import React from 'react';
import {
  Building2,
  Car,
  Gamepad2,
  Smartphone,
  Sofa,
  Sparkles,
} from 'lucide-react';
import { CategoryId } from '../types/marketplace';

interface CategoryBarProps {
  activeCategory: CategoryId | 'all';
  onSelectCategory: (cat: CategoryId | 'all') => void;
  categoryCounts: Record<string, number>;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'popular';
  onChangeSort: (sort: 'newest' | 'price_low' | 'price_high' | 'popular') => void;
  isNegotiableOnly: boolean;
  onToggleNegotiable: () => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
  sortBy,
  onChangeSort,
  isNegotiableOnly,
  onToggleNegotiable,
}) => {
  const categories = [
    { id: 'all', label: 'All Items', icon: Sparkles },
    { id: 'places', label: 'Real Estate & Places', icon: Building2 },
    { id: 'cars', label: 'Cars & Vehicles', icon: Car },
    { id: 'gaming', label: 'PlayStation & Games', icon: Gamepad2 },
    { id: 'electronics', label: 'Tech & Mobiles', icon: Smartphone },
    { id: 'furniture', label: 'Home & Furniture', icon: Sofa },
  ] as const;

  return (
    <div className="bg-[#161618] border-b border-white/10 sticky top-[73px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as CategoryId | 'all')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap text-xs font-oswald uppercase tracking-wider font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#e0f252] text-[#111113] border-[#e0f252] shadow-sm'
                    : 'bg-[#1e1e20] hover:bg-white/10 text-zinc-300 border-white/10'
                }`}
                aria-pressed={isSelected}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#111113]' : 'text-[#e0f252]'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono-tech px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-[#111113] text-[#e0f252]' : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-filter & Sorting Bar */}
        <div className="py-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tech">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-500 text-[11px] uppercase">Filter:</span>

            {/* Negotiable Price Filter Toggle */}
            <button
              onClick={onToggleNegotiable}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors border ${
                isNegotiableOnly
                  ? 'bg-[#e0f252]/15 border-[#e0f252] text-[#e0f252] font-bold'
                  : 'bg-[#1e1e20] border-white/10 text-zinc-300 hover:border-white/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isNegotiableOnly ? 'bg-[#e0f252]' : 'bg-zinc-500'}`} />
              <span>Accepts Cash / Venmo Discount</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[11px] hidden sm:inline uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onChangeSort(e.target.value as any)}
              className="bg-[#1e1e20] border border-white/15 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-[#e0f252]"
              aria-label="Sort listings"
            >
              <option value="newest">Latest Ads First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular & Saved</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

