import React, { useState } from 'react';
import { Plus, Minus, Check, Coffee, Utensils } from 'lucide-react';
import { MenuItem } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { sfx } from '../utils/audio';

interface MenuCardProps {
  item: MenuItem;
  quantityInCart: number;
  onAddToCart: (item: MenuItem) => void;
  onDecrement: (itemId: string) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  quantityInCart,
  onAddToCart,
  onDecrement,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    sfx.playClick();
    onAddToCart(item);
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playClick();
    onDecrement(item.id);
  };

  return (
    <div
      onClick={handleAdd}
      className={`group relative flex flex-col bg-neutral-800/90 rounded-xl overflow-hidden border transition-all duration-200 select-none ${
        !item.isAvailable
          ? 'opacity-60 border-neutral-800 cursor-not-allowed'
          : quantityInCart > 0
          ? 'border-amber-500/60 shadow-lg shadow-amber-950/20 bg-neutral-800 cursor-pointer'
          : 'border-neutral-700/60 hover:border-neutral-600 hover:shadow-md cursor-pointer'
      }`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
        {!imageError && item.image ? (
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${
              item.fallbackGradient || 'from-neutral-800 to-neutral-900'
            } flex flex-col items-center justify-center p-4 text-center`}
          >
            {item.category === 'coffee' || item.category === 'non-coffee' || item.category === 'minuman' ? (
              <Coffee className="w-10 h-10 text-amber-400/70 mb-1" />
            ) : (
              <Utensils className="w-10 h-10 text-amber-400/70 mb-1" />
            )}
            <span className="text-xs font-semibold text-neutral-300 line-clamp-1">{item.name}</span>
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          {item.badge && item.isAvailable && (
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500 text-neutral-950 rounded-md shadow-sm">
              {item.badge}
            </span>
          )}
          {!item.isAvailable && (
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-500 text-white rounded-md shadow-sm">
              Habis
            </span>
          )}
        </div>

        {/* In-cart indicator badge */}
        {quantityInCart > 0 && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-neutral-900/90 text-amber-400 border border-amber-500/40 rounded-md text-xs font-bold font-mono tabular-nums flex items-center gap-1 shadow-md">
            <Check className="w-3.5 h-3.5" />
            <span>{quantityInCart}x</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-3.5 justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-1 mb-1">
            <span className="text-[11px] font-medium text-amber-400/80 uppercase tracking-wider">
              {item.category}
            </span>
            <span className="text-sm font-bold text-amber-400 font-mono tabular-nums">
              {formatRupiah(item.price)}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-amber-300 transition-colors line-clamp-1">
            {item.name}
          </h3>

          <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Action button */}
        <div className="mt-3 pt-2.5 border-t border-neutral-700/50 flex items-center justify-between">
          {quantityInCart > 0 ? (
            <div className="flex items-center gap-2 w-full justify-between" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleMinus}
                className="w-8 h-8 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-neutral-200 flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Kurangi porsi"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-sm font-bold font-mono tabular-nums text-white px-2">
                {quantityInCart}
              </span>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!item.isAvailable}
                className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center transition-colors font-bold focus:outline-none"
                aria-label="Tambah porsi"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!item.isAvailable}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                item.isAvailable
                  ? 'bg-neutral-700/80 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{item.isAvailable ? 'Tambah' : 'Stok Habis'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
