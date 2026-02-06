'use client';

import { useTranslations } from 'next-intl';

export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';

interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function ProductSort({ value, onChange }: ProductSortProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Ordenar por:
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-900 bg-white"
      >
        <option value="newest">Más recientes</option>
        <option value="name-asc">Nombre (A-Z)</option>
        <option value="name-desc">Nombre (Z-A)</option>
        <option value="price-asc">Precio (menor a mayor)</option>
        <option value="price-desc">Precio (mayor a menor)</option>
      </select>
    </div>
  );
}
