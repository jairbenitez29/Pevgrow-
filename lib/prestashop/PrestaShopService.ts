/**
 * Servicio de conexion con PrestaShop API
 * Maneja todas las peticiones a la API REST de PrestaShop
 */

import PrestaShopProxy from './PrestaShopProxy';
import memoryCache from '../../utils/cache/MemoryCache';

/**
 * Campos solicitados a la API de PrestaShop
 * Se usa 'full' para obtener associations (categorias, imagenes)
 * La optimizacion se logra mediante cache agresivo
 */
const PRODUCT_FIELDS = 'full';

const CATEGORY_FIELDS = 'id,name,id_parent,active,level_depth,nleft,nright,nb_products_recursive,link_rewrite,description';

const MANUFACTURER_FIELDS = 'id,name,active';

/**
 * Tiempos de cache en milisegundos
 */
const CACHE_DURATION = {
  PRODUCTS: 30 * 60 * 1000,      // 30 minutos para productos
  CATEGORIES: 60 * 60 * 1000,    // 1 hora para categorias
  PRODUCT_DETAIL: 15 * 60 * 1000, // 15 minutos para detalle de producto
  MANUFACTURERS: 60 * 60 * 1000,  // 1 hora para marcas
  SEARCH: 10 * 60 * 1000,         // 10 minutos para busquedas
};

class PrestaShopService {
  private proxy: typeof PrestaShopProxy;

  constructor() {
    this.proxy = PrestaShopProxy;
  }

  /**
   * Obtener listado de productos
   */
  async getProducts(params: any = {}) {
    const cacheKey = memoryCache.generateKey('products', params);
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: PRODUCT_FIELDS,
      };

      if (params.filter) psParams.filter = params.filter;
      if (params.sort) psParams.sort = params.sort;

      // PrestaShop usa formato especial para paginacion: limit=offset,count
      // Por ejemplo: limit=24,24 significa "empezar en 24, obtener 24 productos"
      if (params.limit && params.offset) {
        psParams.limit = `${params.offset},${params.limit}`;
      } else if (params.limit) {
        psParams.limit = params.limit;
      }

      const result = await this.proxy.get('/products', psParams);
      memoryCache.set(cacheKey, result, CACHE_DURATION.PRODUCTS);

      return result;
    } catch (error: any) {
      console.error('Error fetching products from PrestaShop:', error);
      return { products: [] };
    }
  }

  /**
   * Obtener IDs de productos asociados a una categoria
   * Usa las associations de la categoria de PrestaShop
   */
  async getProductIdsByCategory(categoryId: number): Promise<number[]> {
    const cacheKey = `product_ids_category_${categoryId}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached as number[];
    }

    try {
      const categoryData = await this.getCategoryById(categoryId);

      if (!categoryData) {
        return [];
      }

      const category = categoryData.category || categoryData.categories?.category || categoryData;
      let productIds: number[] = [];

      if (category.associations?.products) {
        const products = category.associations.products;
        if (Array.isArray(products)) {
          productIds = products.map((p: any) => parseInt(p.id || p));
        } else if (products.product) {
          const productList = Array.isArray(products.product) ? products.product : [products.product];
          productIds = productList.map((p: any) => parseInt(p.id || p));
        }
      }

      memoryCache.set(cacheKey, productIds, CACHE_DURATION.CATEGORIES);
      return productIds;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Products] Error obteniendo IDs de categoria ${categoryId}:`, error.message);
      }
      return [];
    }
  }

  /**
   * Obtener productos por sus IDs
   * Carga en lotes para mejor rendimiento
   */
  async getProductsByIds(productIds: number[], limit: number = 50, offset: number = 0): Promise<any[]> {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    // Aplicar paginacion a los IDs
    const paginatedIds = productIds.slice(offset, offset + limit);

    if (paginatedIds.length === 0) {
      return [];
    }

    const cacheKey = `products_by_ids_${paginatedIds.join('_')}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached as any[];
    }

    try {
      // Cargar productos en paralelo (lotes de 10 para no sobrecargar)
      const batchSize = 10;
      const products: any[] = [];

      for (let i = 0; i < paginatedIds.length; i += batchSize) {
        const batch = paginatedIds.slice(i, i + batchSize);
        const promises = batch.map(id => this.getProductById(id).catch(() => null));
        const results = await Promise.all(promises);

        for (const result of results) {
          if (result?.product) {
            products.push(result.product);
          } else if (result?.products?.product) {
            products.push(result.products.product);
          }
        }
      }

      memoryCache.set(cacheKey, products, CACHE_DURATION.PRODUCTS);
      return products;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Products] Error cargando productos por IDs:`, error.message);
      }
      return [];
    }
  }

  /**
   * Obtener productos de una categoria
   * Estrategia:
   * 1. Primero intenta obtener IDs desde associations de la categoria
   * 2. Si no hay, busca productos que tengan la categoria en su lista
   */
  async getProductsByCategory(categoryId: number, limit: number = 50, offset: number = 0) {
    const cacheKey = `products_category_${categoryId}_${limit}_${offset}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Primero intentar obtener IDs desde associations de la categoria
      let productIds = await this.getProductIdsByCategory(categoryId);

      // Si no hay productos en associations, buscar en productos cargados
      if (productIds.length === 0) {
        productIds = await this.findProductIdsByCategorySearch(categoryId);
      }

      if (productIds.length === 0) {
        return { products: [], total: 0 };
      }

      // Cargar los productos
      const products = await this.getProductsByIds(productIds, limit, offset);

      const result = {
        products: products,
        total: productIds.length,
      };

      memoryCache.set(cacheKey, result, CACHE_DURATION.PRODUCTS);
      return result;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Products] Error en getProductsByCategory ${categoryId}:`, error.message);
      }
      return { products: [], total: 0 };
    }
  }

  /**
   * Buscar productos que tengan una categoria en su lista de categorias
   * OPTIMIZADO: Usa cache global de productos para busqueda rapida
   */
  async findProductIdsByCategorySearch(categoryId: number): Promise<number[]> {
    const cacheKey = `product_ids_search_category_${categoryId}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached as number[];
    }

    try {
      // Usar cache global de productos si existe
      const globalCacheKey = 'all_products_for_search';
      let allProducts = memoryCache.get(globalCacheKey) as any[] | undefined;

      // Si no hay cache global, cargar productos una vez
      if (!allProducts) {
        const psProducts = await this.getProducts({ limit: 500 });

        allProducts = [];
        if (psProducts?.products?.product) {
          allProducts = Array.isArray(psProducts.products.product)
            ? psProducts.products.product
            : [psProducts.products.product];
        } else if (psProducts?.products && Array.isArray(psProducts.products)) {
          allProducts = psProducts.products;
        }

        // Cachear por 30 minutos
        memoryCache.set(globalCacheKey, allProducts, CACHE_DURATION.PRODUCTS);
      }

      // Buscar productos que tengan esta categoria (busqueda en memoria, muy rapida)
      const productIds: number[] = [];

      for (const product of allProducts) {
        let hasCategory = false;

        // Verificar en associations.categories
        if (product.associations?.categories) {
          const categories = product.associations.categories;
          const categoryList = Array.isArray(categories)
            ? categories
            : (categories.category ? (Array.isArray(categories.category) ? categories.category : [categories.category]) : []);

          hasCategory = categoryList.some((cat: any) => {
            const catId = parseInt(cat.id || cat);
            return catId === categoryId;
          });
        }

        // Verificar en id_category_default
        if (!hasCategory && product.id_category_default) {
          hasCategory = parseInt(product.id_category_default) === categoryId;
        }

        if (hasCategory) {
          productIds.push(parseInt(product.id));
        }
      }

      // Cachear resultado por 30 minutos
      memoryCache.set(cacheKey, productIds, CACHE_DURATION.PRODUCTS);
      return productIds;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Products] Error buscando productos por categoria ${categoryId}:`, error.message);
      }
      return [];
    }
  }

  /**
   * Obtener productos de una marca (manufacturer)
   * Usa el filtro de PrestaShop por id_manufacturer
   */
  async getProductsByManufacturer(manufacturerId: number, limit: number = 50, offset: number = 0) {
    const cacheKey = `products_manufacturer_${manufacturerId}_${limit}_${offset}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Usar filtro de PrestaShop por id_manufacturer
      // PrestaShop usa formato especial para paginacion: limit=offset,count
      const psParams: any = {
        display: 'full',
        'filter[id_manufacturer]': `[${manufacturerId}]`,
        limit: offset > 0 ? `${offset},${limit}` : limit,
      };

      const response = await this.proxy.get('/products', psParams);

      // Extraer productos
      let products: any[] = [];
      if (response?.products?.product) {
        products = Array.isArray(response.products.product)
          ? response.products.product
          : [response.products.product];
      } else if (response?.products && Array.isArray(response.products)) {
        products = response.products;
      }

      // Obtener total (haciendo una consulta sin limite para contar)
      let total = products.length;
      if (offset === 0 && products.length === limit) {
        // Si recibimos el limite exacto, puede haber mas
        // Hacer consulta de conteo
        try {
          const countParams: any = {
            display: '[id]',
            'filter[id_manufacturer]': `[${manufacturerId}]`,
          };
          const countResponse = await this.proxy.get('/products', countParams);

          if (countResponse?.products?.product) {
            const countProducts = Array.isArray(countResponse.products.product)
              ? countResponse.products.product
              : [countResponse.products.product];
            total = countProducts.length;
          } else if (countResponse?.products && Array.isArray(countResponse.products)) {
            total = countResponse.products.length;
          }
        } catch {
          // Si falla el conteo, usar el numero actual
        }
      }

      const result = {
        products: products,
        total: total,
      };

      memoryCache.set(cacheKey, result, CACHE_DURATION.PRODUCTS);
      return result;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Products] Error en getProductsByManufacturer ${manufacturerId}:`, error.message);
      }
      return { products: [], total: 0 };
    }
  }

  /**
   * Obtener un producto por su ID
   */
  async getProductById(productId: number | string) {
    const cacheKey = memoryCache.generateKey('product', { id: productId });
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.proxy.get(`/products/${productId}`);
      memoryCache.set(cacheKey, result, CACHE_DURATION.PRODUCT_DETAIL);

      return result;
    } catch (error: any) {
      if (error.response?.status !== 404 && process.env.NODE_ENV === 'development') {
        console.error(`Error fetching product ${productId} from PrestaShop:`, error);
      }
      throw error;
    }
  }

  /**
   * Obtener listado de categorias
   * Usa limite reducido para evitar timeout de PrestaShop
   */
  async getCategories(params: any = {}) {
    const CATEGORIES_LIMIT = 200;
    const cacheKey = 'categories_main';
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: CATEGORY_FIELDS,
        limit: CATEGORIES_LIMIT,
      };

      if (params.filter) psParams.filter = params.filter;

      const result = await this.proxy.get('/categories', psParams);
      memoryCache.set(cacheKey, result, CACHE_DURATION.CATEGORIES);

      return result;
    } catch (error: any) {
      console.error('Error fetching categories from PrestaShop:', error.message);
      return { categories: [] };
    }
  }

  /**
   * Buscar categoria por slug (link_rewrite) directamente en PrestaShop
   */
  async getCategoryBySlug(slug: string) {
    const cacheKey = `category_slug_${slug}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Buscar usando filtro de PrestaShop por link_rewrite
      const psParams: any = {
        display: 'full',
        'filter[link_rewrite]': `[${slug}]`,
        limit: 1,
      };

      const result = await this.proxy.get('/categories', psParams);

      // Extraer la categoria del resultado
      let category = null;
      if (result?.categories?.category) {
        category = Array.isArray(result.categories.category)
          ? result.categories.category[0]
          : result.categories.category;
      } else if (result?.categories && Array.isArray(result.categories)) {
        category = result.categories[0];
      }

      if (category) {
        memoryCache.set(cacheKey, { category }, CACHE_DURATION.CATEGORIES);
        return { category };
      }

      return null;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Category] Busqueda por slug "${slug}" fallo:`, error.message);
      }
      return null;
    }
  }

  /**
   * Obtener categorias especificas por sus IDs
   */
  async getCategoriesByIds(ids: number[]) {
    const cacheKey = `categories_ids_${ids.sort().join('_')}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Obtener cada categoria por ID en paralelo
      const promises = ids.map(id => this.getCategoryById(id).catch(() => null));
      const results = await Promise.all(promises);

      // Filtrar nulls y extraer las categorias
      const categories = results
        .filter(r => r !== null)
        .map(r => r?.category || r);

      const result = { categories: { category: categories } };
      memoryCache.set(cacheKey, result, CACHE_DURATION.CATEGORIES);

      return result;
    } catch (error: any) {
      console.error('Error fetching categories by IDs:', error.message);
      return { categories: [] };
    }
  }

  /**
   * Obtener categorias por ID del padre
   * Usa filtro de PrestaShop para evitar cargar todas las categorias
   */
  async getCategoriesByParentId(parentId: number) {
    const cacheKey = `categories_parent_${parentId}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: CATEGORY_FIELDS,
        'filter[id_parent]': `[${parentId}]`,
        limit: 50,
      };

      const result = await this.proxy.get('/categories', psParams);
      memoryCache.set(cacheKey, result, CACHE_DURATION.CATEGORIES);

      return result;
    } catch (error: any) {
      console.error(`Error fetching categories by parent ${parentId}:`, error.message);
      return { categories: [] };
    }
  }

  /**
   * Obtener una categoria por su ID
   */
  async getCategoryById(categoryId: number | string) {
    const cacheKey = memoryCache.generateKey('category', { id: categoryId });
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.proxy.get(`/categories/${categoryId}`);
      memoryCache.set(cacheKey, result, CACHE_DURATION.CATEGORIES);

      return result;
    } catch (error: any) {
      console.error(`Error fetching category ${categoryId} from PrestaShop:`, error);
      throw error;
    }
  }

  /**
   * Buscar productos - Optimizado para reducir requests
   */
  async searchProducts(searchTerm: string, params: any = {}) {
    const cacheKey = memoryCache.generateKey('search', { term: searchTerm, ...params });
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const limit = params.limit || 300;
      const searchTermLower = searchTerm.toLowerCase().trim();

      // Intentar primero con el endpoint de búsqueda de PrestaShop
      try {
        const psParams: any = {
          query: searchTerm,
        };

        if (params.limit) psParams.limit = params.limit;

        const searchResults = await this.proxy.get('/search/products', psParams);

        if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
          memoryCache.set(cacheKey, searchResults, CACHE_DURATION.SEARCH);
          return searchResults;
        }
      } catch (searchError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Search] Busqueda de PrestaShop fallo, usando busqueda manual:', searchError.message);
        }
      }

      // Busqueda manual optimizada: solo 3 batches (300 productos)
      const allProducts = [];
      let offset = 0;
      const batchSize = 100;
      let hasMore = true;
      const maxBatches = 3;

      while (hasMore && offset < maxBatches * batchSize) {
        try {
          // PrestaShop usa formato especial para paginacion: limit=offset,count
          const psParams: any = {
            display: PRODUCT_FIELDS,
            limit: offset > 0 ? `${offset},${batchSize}` : batchSize,
          };

          const batch = await this.proxy.get('/products', psParams);

          if (!batch || (Array.isArray(batch) && batch.length === 0)) {
            hasMore = false;
            break;
          }

          const productsArray = Array.isArray(batch) ? batch : (batch.products || []);
          allProducts.push(...productsArray);

          if (productsArray.length < batchSize) {
            hasMore = false;
          } else {
            offset += batchSize;
          }
        } catch (error: any) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`[Search] Error obteniendo lote de productos para busqueda (offset ${offset}):`, error.message);
          }
          hasMore = false;
          break;
        }
      }

      // Filtrar productos localmente
      const filteredProducts = allProducts.filter(product => {
        if (!product) return false;

        // Buscar en nombre
        const name = product.name;
        let nameMatch = false;
        if (name) {
          if (typeof name === 'string') {
            nameMatch = name.toLowerCase().includes(searchTermLower);
          } else if (Array.isArray(name)) {
            nameMatch = name.some(n =>
              (typeof n === 'string' && n.toLowerCase().includes(searchTermLower)) ||
              (n && typeof n.value === 'string' && n.value.toLowerCase().includes(searchTermLower))
            );
          } else if (name.value) {
            nameMatch = String(name.value).toLowerCase().includes(searchTermLower);
          }
        }

        // Buscar en referencia
        const referenceMatch = product.reference &&
          String(product.reference).toLowerCase().includes(searchTermLower);

        // Buscar en EAN13
        const eanMatch = product.ean13 &&
          String(product.ean13).toLowerCase().includes(searchTermLower);

        // Buscar en UPC
        const upcMatch = product.upc &&
          String(product.upc).toLowerCase().includes(searchTermLower);

        // Buscar en descripción corta
        let descriptionMatch = false;
        const shortDesc = product.description_short;
        if (shortDesc) {
          if (typeof shortDesc === 'string') {
            descriptionMatch = shortDesc.toLowerCase().includes(searchTermLower);
          } else if (Array.isArray(shortDesc)) {
            descriptionMatch = shortDesc.some(d =>
              (typeof d === 'string' && d.toLowerCase().includes(searchTermLower)) ||
              (d && typeof d.value === 'string' && d.value.toLowerCase().includes(searchTermLower))
            );
          } else if (shortDesc.value) {
            descriptionMatch = String(shortDesc.value).toLowerCase().includes(searchTermLower);
          }
        }

        return nameMatch || referenceMatch || eanMatch || upcMatch || descriptionMatch;
      });

      // Limitar resultados si se especificó un límite
      let result = filteredProducts;
      if (params.limit && filteredProducts.length > params.limit) {
        result = filteredProducts.slice(0, params.limit);
      }

      memoryCache.set(cacheKey, result, CACHE_DURATION.SEARCH);
      return result;
    } catch (error: any) {
      console.error('Error searching products in PrestaShop:', error);
      throw error;
    }
  }

  /**
   * Obtener pedidos (orders)
   */
  async getOrders(params: any = {}) {
    const cacheKey = memoryCache.generateKey('orders', params);
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: params.display || 'id,reference,id_customer,current_state,total_paid,date_add',
      };

      if (params.filter) psParams.filter = params.filter;

      const result = await this.proxy.get('/orders', psParams);
      memoryCache.set(cacheKey, result, 2 * 60 * 1000);

      return result;
    } catch (error: any) {
      console.error('Error fetching orders from PrestaShop:', error);
      throw error;
    }
  }

  async createOrder(orderData: any) {
    try {
      return await this.proxy.post('/orders', orderData);
    } catch (error: any) {
      console.error('Error creating order in PrestaShop:', error);
      throw error;
    }
  }

  async createCart(cartData: any) {
    try {
      return await this.proxy.post('/carts', cartData);
    } catch (error: any) {
      console.error('Error creating cart in PrestaShop:', error);
      throw error;
    }
  }

  async updateCart(cartId: number | string, cartData: any) {
    try {
      return await this.proxy.put(`/carts/${cartId}`, cartData);
    } catch (error: any) {
      console.error('Error updating cart in PrestaShop:', error);
      throw error;
    }
  }

  async getCart(cartId: number | string) {
    const cacheKey = memoryCache.generateKey('cart', { id: cartId });
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.proxy.get(`/carts/${cartId}`);
      memoryCache.set(cacheKey, result, 1 * 60 * 1000);

      return result;
    } catch (error: any) {
      console.error('Error fetching cart from PrestaShop:', error);
      throw error;
    }
  }

  /**
   * Obtener clientes (customers)
   */
  async getCustomers(params: any = {}) {
    const cacheKey = memoryCache.generateKey('customers', params);
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: params.display || 'id,email,firstname,lastname,active',
      };

      if (params.filter) psParams.filter = params.filter;

      const result = await this.proxy.get('/customers', psParams);
      memoryCache.set(cacheKey, result, 5 * 60 * 1000);

      return result;
    } catch (error: any) {
      console.error('Error fetching customers from PrestaShop:', error);
      throw error;
    }
  }

  async createCustomer(customerData: any) {
    try {
      return await this.proxy.post('/customers', customerData);
    } catch (error: any) {
      console.error('Error creating customer in PrestaShop:', error);
      throw error;
    }
  }

  /**
   * Obtener una combinación específica por ID
   */
  async getCombinationById(combinationId: number | string) {
    const cacheKey = memoryCache.generateKey('combination', { id: combinationId });
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.proxy.get(`/combinations/${combinationId}`);
      memoryCache.set(cacheKey, result, 10 * 60 * 1000);

      return result;
    } catch (error: any) {
      console.error(`Error fetching combination ${combinationId} from PrestaShop:`, error);
      throw error;
    }
  }

  /**
   * Obtener stock disponible por ID
   */
  async getStockAvailableById(stockId: number | string) {
    const cacheKey = memoryCache.generateKey('stock', { id: stockId });
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.proxy.get(`/stock_availables/${stockId}`);
      memoryCache.set(cacheKey, result, 2 * 60 * 1000);

      return result;
    } catch (error: any) {
      console.error(`Error fetching stock ${stockId} from PrestaShop:`, error);
      throw error;
    }
  }

  /**
   * Obtener imagen de producto a través de la API de PrestaShop
   */
  async getProductImage(productId: number | string, imageId: number | string, size: string = 'large_default') {
    const cacheKey = memoryCache.generateKey('image', { productId, imageId, size });
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const imageUrl = `/images/products/${productId}/${imageId}`;
      const result = await this.proxy.get(imageUrl, {});
      memoryCache.set(cacheKey, result, 30 * 60 * 1000);

      return result;
    } catch (error: any) {
      console.error(`Error fetching image ${imageId} for product ${productId} from PrestaShop:`, error);
      throw error;
    }
  }

  /**
   * Obtener listado de marcas (manufacturers)
   */
  async getManufacturers(params: any = {}) {
    const cacheKey = memoryCache.generateKey('manufacturers', params);
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: params.display === 'full' ? MANUFACTURER_FIELDS : (params.display || MANUFACTURER_FIELDS),
      };

      if (params.filter) psParams.filter = params.filter;
      if (params.sort) psParams.sort = params.sort;
      // PrestaShop usa formato especial para paginacion: limit=offset,count
      if (params.limit && params.offset) {
        psParams.limit = `${params.offset},${params.limit}`;
      } else if (params.limit) {
        psParams.limit = params.limit;
      }

      const result = await this.proxy.get('/manufacturers', psParams);
      memoryCache.set(cacheKey, result, CACHE_DURATION.MANUFACTURERS);

      return result;
    } catch (error: any) {
      console.error('Error fetching manufacturers from PrestaShop:', error);
      throw error;
    }
  }

  /**
   * Obtener una marca por su ID
   */
  async getManufacturerById(manufacturerId: number | string) {
    const cacheKey = memoryCache.generateKey('manufacturer', { id: manufacturerId });
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.proxy.get(`/manufacturers/${manufacturerId}`);
      memoryCache.set(cacheKey, result, CACHE_DURATION.MANUFACTURERS);

      return result;
    } catch (error: any) {
      console.error(`Error fetching manufacturer ${manufacturerId} from PrestaShop:`, error);
      throw error;
    }
  }

  /**
   * Obtener configuraciones de la tienda
   */
  async getConfigurations(params: any = {}) {
    const cacheKey = memoryCache.generateKey('configurations', params);
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: 'full',
      };

      if (params.filter) psParams.filter = params.filter;

      const result = await this.proxy.get('/configurations', psParams);
      memoryCache.set(cacheKey, result, 30 * 60 * 1000); // Cache 30 min

      return result;
    } catch (error: any) {
      console.error('Error fetching configurations from PrestaShop:', error);
      throw error;
    }
  }

  /**
   * Obtener páginas CMS (contenido)
   */
  async getCMSPages(params: any = {}) {
    const cacheKey = memoryCache.generateKey('cms', params);
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: 'full',
      };

      if (params.filter) psParams.filter = params.filter;
      if (params.limit) psParams.limit = params.limit;

      const result = await this.proxy.get('/content_management_system', psParams);
      memoryCache.set(cacheKey, result, 15 * 60 * 1000);

      return result;
    } catch (error: any) {
      console.error('Error fetching CMS pages from PrestaShop:', error);
      throw error;
    }
  }

  /**
   * Obtener información de la tienda
   */
  async getShopInfo() {
    const cacheKey = 'shop_info';
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.proxy.get('/shops');
      memoryCache.set(cacheKey, result, 60 * 60 * 1000); // Cache 1 hora

      return result;
    } catch (error: any) {
      console.error('Error fetching shop info from PrestaShop:', error);
      throw error;
    }
  }

  /**
   * Obtener banners/sliders configurados en PrestaShop
   * Nota: Requiere módulo ps_imageslider o similar instalado
   *
   * El módulo ps_imageslider usa las siguientes tablas:
   * - homeslider (id_homeslider)
   * - homeslider_slides (id_homeslider_slides, id_shop, position, active, etc.)
   * - homeslider_slides_lang (id_homeslider_slides, id_lang, title, description, legend, url, image)
   *
   * Como PrestaShop no expone estos datos por defecto en la API REST,
   * esta función devuelve datos estáticos que deben ser configurados manualmente.
   *
   * Para obtener datos reales, necesitarías:
   * 1. Extender el webservice de PrestaShop con un hook addWebserviceResources
   * 2. O consultar directamente la base de datos desde el servidor
   * 3. O crear un endpoint personalizado en PrestaShop
   */
  async getImageSliders(params: any = {}) {
    const cacheKey = memoryCache.generateKey('image_sliders', params);
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Intentar obtener desde un endpoint personalizado si existe
      // Este endpoint debe ser creado en PrestaShop o mediante un módulo
      const psParams: any = {
        display: 'full',
      };

      if (params.filter) psParams.filter = params.filter;
      if (params.limit) psParams.limit = params.limit;

      try {
        // Intentar endpoint personalizado
        const result = await this.proxy.get('/homeslider_slides', psParams);
        memoryCache.set(cacheKey, result, 15 * 60 * 1000);
        return result;
      } catch (endpointError: any) {
        // Si no existe el endpoint, devolver datos estaticos configurables
        if (process.env.NODE_ENV === 'development') {
          console.log('[Slider] Endpoint /homeslider_slides no disponible, usando datos estaticos');
        }

        // Datos estaticos de ejemplo - deberian venir de configuracion o CMS
        // NOTA: Las imagenes usan placeholders temporales de https://placehold.co
        // Para usar imagenes reales, reemplazar las URLs con rutas locales o URLs de PrestaShop
        const staticSliders = {
          slides: [
            {
              id: 1,
              title: 'Semillas Gratis con cada compra',
              description: 'Consigue semillas gratis en todos tus pedidos',
              image: 'https://placehold.co/1920x600/6B46C1/FFFFFF/png?text=Semillas+Gratis',
              url: '/productos',
              position: 1,
              active: true,
            },
            {
              id: 2,
              title: 'Nuevas Variedades 2026',
              description: 'Descubre las últimas genéticas del mercado',
              image: 'https://placehold.co/1920x600/EC4899/FFFFFF/png?text=Nuevas+Variedades',
              url: '/productos',
              position: 2,
              active: true,
            },
            {
              id: 3,
              title: 'Envío Discreto y Seguro',
              description: 'Garantizamos la máxima discreción en todos tus envíos',
              image: 'https://placehold.co/1920x600/7C3AED/FFFFFF/png?text=Envío+Discreto',
              url: '/productos',
              position: 3,
              active: true,
            },
          ],
        };

        memoryCache.set(cacheKey, staticSliders, 15 * 60 * 1000);
        return staticSliders;
      }
    } catch (error: any) {
      console.error('Error fetching image sliders from PrestaShop:', error);
      // Retornar array vacío si hay error
      return { slides: [] };
    }
  }

  /**
   * Obtener productos destacados
   * Devuelve los primeros productos activos de PrestaShop
   */
  async getFeaturedProducts(params: any = {}) {
    const cacheKey = memoryCache.generateKey('featured_products', params);
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: PRODUCT_FIELDS,
        limit: params.limit || 8,
      };

      const result = await this.proxy.get('/products', psParams);
      memoryCache.set(cacheKey, result, CACHE_DURATION.PRODUCTS);

      return result;
    } catch (error: any) {
      console.error('Error fetching featured products from PrestaShop:', error);
      // Devolver estructura vacia en caso de error para no romper la pagina
      return { products: [] };
    }
  }

  /**
   * Obtener productos en oferta
   */
  async getProductsOnSale(params: any = {}) {
    const cacheKey = memoryCache.generateKey('products_on_sale', params);
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        display: PRODUCT_FIELDS,
        limit: params.limit || 20,
      };

      const result = await this.proxy.get('/products', psParams);
      memoryCache.set(cacheKey, result, CACHE_DURATION.PRODUCTS);

      return result;
    } catch (error: any) {
      console.error('Error fetching products on sale from PrestaShop:', error);
      return { products: [] };
    }
  }

  /**
   * Obtener specific_prices (precios específicos/descuentos) para un producto
   */
  async getSpecificPrices(productId: number | string, params: any = {}) {
    const cacheKey = memoryCache.generateKey('specific_prices', { productId, ...params });
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const psParams: any = {
        filter: `[id_product]=${productId}`,
        display: 'id,id_product,price,reduction,reduction_type,from,to',
      };

      if (params.limit) psParams.limit = params.limit;

      const result = await this.proxy.get('/specific_prices', psParams);
      memoryCache.set(cacheKey, result, 5 * 60 * 1000);

      return result;
    } catch (error: any) {
      console.error(`Error fetching specific_prices for product ${productId} from PrestaShop:`, error);
      throw error;
    }
  }

  /**
   * Limpiar todo el caché
   */
  clearCache() {
    memoryCache.clear();
  }

  /**
   * Limpiar caché de un tipo específico
   */
  clearCacheByPrefix(prefix: string) {
    const stats = memoryCache.getStats();
    (stats.keys as string[]).forEach((key: string) => {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    });
  }
}

export default new PrestaShopService();
