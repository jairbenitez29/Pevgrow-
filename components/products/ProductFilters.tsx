'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  brands?: number[];
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  brands?: Array<{ id: number; name: string }>;
}

export default function ProductFilters({ onFilterChange, brands = [] }: ProductFiltersProps) {
  const t = useTranslations();
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

  const handleApplyFilters = () => {
    const filters: FilterOptions = {
      inStockOnly,
    };

    if (minPrice) {
      filters.minPrice = parseFloat(minPrice);
    }

    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice);
    }

    if (selectedBrands.length > 0) {
      filters.brands = selectedBrands;
    }

    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSelectedBrands([]);
    onFilterChange({});
  };

  const toggleBrand = (brandId: number) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Filtros</h3>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">{t('product.price')}</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-900"
            min="0"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-900"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Stock Status */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 text-purple-900 border-gray-300 rounded focus:ring-purple-900"
          />
          <span className="text-sm text-gray-700">Solo productos en stock</span>
        </label>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Marcas</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => toggleBrand(brand.id)}
                  className="w-4 h-4 text-purple-900 border-gray-300 rounded focus:ring-purple-900"
                />
                <span className="text-sm text-gray-700">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t">
        <Button onClick={handleApplyFilters} variant="primary" size="md" fullWidth>
          Aplicar filtros
        </Button>
        <Button onClick={handleResetFilters} variant="outline" size="md" fullWidth>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
