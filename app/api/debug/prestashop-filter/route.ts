import { NextResponse } from "next/server";
import PrestaShopProxy from '@/lib/prestashop/PrestaShopProxy';

/**
 * Debug endpoint para probar diferentes formatos de filtro de PrestaShop
 * GET /api/debug/prestashop-filter?category=10
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category') || '10';

    const results: any = {
        categoryId,
        tests: []
    };

    // Test 0: Ver datos de la categoria directamente
    try {
        const categoryData = await PrestaShopProxy.get(`/categories/${categoryId}`, {
            display: 'full',
        });

        const cat = categoryData?.category || categoryData;
        const associations = cat?.associations || {};

        results.tests.push({
            name: 'Datos de categoria',
            success: true,
            data: {
                id: cat?.id,
                name: cat?.name,
                id_parent: cat?.id_parent,
                level_depth: cat?.level_depth,
                active: cat?.active,
                nb_products_recursive: cat?.nb_products_recursive,
                has_products_association: !!associations?.products,
                products_count: associations?.products?.product?.length || 0,
                has_categories_association: !!associations?.categories,
                subcategories_sample: associations?.categories?.category?.slice(0, 5) || [],
            },
        });
    } catch (e: any) {
        results.tests.push({
            name: 'Datos de categoria',
            success: false,
            error: e.message,
        });
    }

    // Test 1: Filtro con corchetes en valor
    try {
        const test1 = await PrestaShopProxy.get('/products', {
            display: 'id,name,id_category_default',
            limit: 5,
            'filter[id_category_default]': `[${categoryId}]`,
        });
        results.tests.push({
            name: 'filter[id_category_default]=[X]',
            success: true,
            count: test1?.products?.length || (Array.isArray(test1) ? test1.length : 0),
            sample: test1?.products?.[0] || test1?.[0] || null,
        });
    } catch (e: any) {
        results.tests.push({
            name: 'filter[id_category_default]=[X]',
            success: false,
            error: e.message,
        });
    }

    // Test 2: Filtro sin corchetes en valor
    try {
        const test2 = await PrestaShopProxy.get('/products', {
            display: 'id,name,id_category_default',
            limit: 5,
            'filter[id_category_default]': categoryId,
        });
        results.tests.push({
            name: 'filter[id_category_default]=X',
            success: true,
            count: test2?.products?.length || (Array.isArray(test2) ? test2.length : 0),
            sample: test2?.products?.[0] || test2?.[0] || null,
        });
    } catch (e: any) {
        results.tests.push({
            name: 'filter[id_category_default]=X',
            success: false,
            error: e.message,
        });
    }

    // Test 3: Obtener categoria con sus productos asociados
    try {
        const test3 = await PrestaShopProxy.get(`/categories/${categoryId}`, {
            display: 'full',
        });
        const productIds = test3?.category?.associations?.products || [];
        results.tests.push({
            name: 'GET /categories/{id} con associations',
            success: true,
            productCount: Array.isArray(productIds) ? productIds.length : (productIds?.product?.length || 0),
            sample: productIds?.product?.[0] || productIds?.[0] || null,
        });
    } catch (e: any) {
        results.tests.push({
            name: 'GET /categories/{id} con associations',
            success: false,
            error: e.message,
        });
    }

    // Test 4: Filtro LIKE
    try {
        const test4 = await PrestaShopProxy.get('/products', {
            display: 'id,name,id_category_default',
            limit: 5,
            'filter[id_category_default]': `%[${categoryId}]%`,
        });
        results.tests.push({
            name: 'filter[id_category_default]=%[X]%',
            success: true,
            count: test4?.products?.length || (Array.isArray(test4) ? test4.length : 0),
            sample: test4?.products?.[0] || test4?.[0] || null,
        });
    } catch (e: any) {
        results.tests.push({
            name: 'filter[id_category_default]=%[X]%',
            success: false,
            error: e.message,
        });
    }

    // Test 5: Obtener subcategorias de la categoria
    try {
        const allCategories = await PrestaShopProxy.get('/categories', {
            display: 'id,name,id_parent',
            limit: 500,
        });

        const categories = allCategories?.categories?.category || allCategories?.categories || [];
        const subcats = categories.filter((c: any) => {
            const parentId = typeof c.id_parent === 'string' ? parseInt(c.id_parent) : c.id_parent;
            return parentId === parseInt(categoryId);
        });

        results.tests.push({
            name: 'Subcategorias de categoria',
            success: true,
            count: subcats.length,
            subcategoryIds: subcats.slice(0, 10).map((c: any) => ({ id: c.id, name: c.name })),
        });
    } catch (e: any) {
        results.tests.push({
            name: 'Subcategorias de categoria',
            success: false,
            error: e.message,
        });
    }

    // Test 6: Filtrar productos por subcategoria especifica (si hay subcategorias)
    try {
        // Primero obtener una subcategoria
        const allCategories = await PrestaShopProxy.get('/categories', {
            display: 'id,id_parent',
            limit: 200,
        });

        const categories = allCategories?.categories?.category || allCategories?.categories || [];
        const firstSubcat = categories.find((c: any) => {
            const parentId = typeof c.id_parent === 'string' ? parseInt(c.id_parent) : c.id_parent;
            return parentId === parseInt(categoryId);
        });

        if (firstSubcat) {
            const subcatProducts = await PrestaShopProxy.get('/products', {
                display: 'id,name,id_category_default',
                limit: 5,
                'filter[id_category_default]': `[${firstSubcat.id}]`,
            });

            results.tests.push({
                name: `Productos en subcategoria ${firstSubcat.id}`,
                success: true,
                count: subcatProducts?.products?.length || (Array.isArray(subcatProducts) ? subcatProducts.length : 0),
                sample: subcatProducts?.products?.[0] || subcatProducts?.[0] || null,
            });
        } else {
            results.tests.push({
                name: 'Productos en subcategoria',
                success: true,
                count: 0,
                note: 'No hay subcategorias',
            });
        }
    } catch (e: any) {
        results.tests.push({
            name: 'Productos en subcategoria',
            success: false,
            error: e.message,
        });
    }

    // Test 7: Ver estructura de un producto con sus categorias
    try {
        const products = await PrestaShopProxy.get('/products', {
            display: 'full',
            limit: 3,
        });

        const productList = products?.products?.product || products?.products || [];
        const samples = productList.slice(0, 3).map((p: any) => ({
            id: p.id,
            name: typeof p.name === 'string' ? p.name : p.name?.[0]?.value || p.name?.language?.[0]?.value,
            id_category_default: p.id_category_default,
            categories_association: p.associations?.categories,
        }));

        results.tests.push({
            name: 'Estructura de productos con categorias',
            success: true,
            samples,
        });
    } catch (e: any) {
        results.tests.push({
            name: 'Estructura de productos con categorias',
            success: false,
            error: e.message,
        });
    }

    // Test 8: Verificar si categoria 10 existe en algun producto
    try {
        const products = await PrestaShopProxy.get('/products', {
            display: 'full',
            limit: 100,
        });

        const productList = products?.products?.product || products?.products || [];

        const productsInCategory = productList.filter((p: any) => {
            // Verificar id_category_default
            if (p.id_category_default == categoryId) return true;

            // Verificar en associations.categories
            const cats = p.associations?.categories?.category || p.associations?.categories || [];
            if (Array.isArray(cats)) {
                return cats.some((c: any) => c.id == categoryId);
            }
            return false;
        });

        results.tests.push({
            name: `Productos que pertenecen a categoria ${categoryId} (de 100 productos)`,
            success: true,
            count: productsInCategory.length,
            sample: productsInCategory[0] ? {
                id: productsInCategory[0].id,
                id_category_default: productsInCategory[0].id_category_default,
                categories: productsInCategory[0].associations?.categories,
            } : null,
        });
    } catch (e: any) {
        results.tests.push({
            name: 'Buscar productos en categoria',
            success: false,
            error: e.message,
        });
    }

    return NextResponse.json(results);
}
