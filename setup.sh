#!/bin/bash

echo "🚀 Configurando Pevgrow Next.js..."

# Crear estructura de carpetas
mkdir -p app/api/{category,product,brands,home} lib/prestashop utils/cache components/{layout,home} public/images

echo "✅ Estructura de carpetas creada"

# Verificar que los archivos de PrestaShop se copiaron
if [ -f "lib/prestashop/PrestaShopService.ts" ]; then
  echo "✅ PrestaShopService copiado"
else
  echo "❌ Falta PrestaShopService"
fi

if [ -f "lib/prestashop/PrestaShopTransformer.ts" ]; then
  echo "✅ PrestaShopTransformer copiado"
else
  echo "❌ Falta PrestaShopTransformer"
fi

if [ -f ".env.local" ]; then
  echo "✅ Variables de entorno configuradas"
else
  echo "❌ Falta .env.local"
fi

echo "✅ Setup completado!"
