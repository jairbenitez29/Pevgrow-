'use client';

interface CategoryDebugProps {
  category: any;
  subcategories: any[];
}

export default function CategoryDebug({ category, subcategories }: CategoryDebugProps) {
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Solo mostrar si hay un posible problema (no hay subcategorías)
  if (subcategories.length > 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-yellow-900 mb-2">🔍 DEBUG - Información de Categoría</h3>

      <div className="text-xs space-y-2 text-gray-700">
        <div>
          <strong>Categoría Actual:</strong>
          <pre className="bg-white p-2 rounded mt-1 overflow-auto">
            {JSON.stringify({
              id: category.id,
              name: category.name,
              parent_id: category.parent_id,
              level_depth: category.level_depth,
              products_count: category.products_count,
            }, null, 2)}
          </pre>
        </div>

        <div>
          <strong>Subcategorías Encontradas ({subcategories.length}):</strong>
          {subcategories.length === 0 ? (
            <p className="text-red-600 mt-1">❌ No se encontraron subcategorías</p>
          ) : (
            <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-60">
              {JSON.stringify(
                subcategories.map(s => ({
                  id: s.id,
                  name: s.name,
                  parent_id: s.parent_id,
                  level_depth: s.level_depth,
                  active: s.active,
                })),
                null,
                2
              )}
            </pre>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-600">
          <p>💡 Si no ves subcategorías esperadas, verifica:</p>
          <ul className="list-disc ml-4 mt-1">
            <li>Que las subcategorías tengan parent_id = {category.id}</li>
            <li>Que level_depth sea {category.level_depth ? category.level_depth + 1 : 'N/A'}</li>
            <li>Que estén activas (active = 1)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
