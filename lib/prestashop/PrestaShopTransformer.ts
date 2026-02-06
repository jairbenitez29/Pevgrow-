/**
 * Transformadores de datos de PrestaShop al formato que espera el frontend
 *
 * OPTIMIZADO: Transformacion 100% sincrona sin llamadas HTTP
 * Esto permite transformar miles de productos en milisegundos
 */

class PrestaShopTransformer {
  /**
   * Transformar producto de PrestaShop al formato del frontend
   * SINCRONO - No hace llamadas HTTP
   */
  transformProduct(psProduct: any) {
    // PrestaShop devuelve productos en formato { product: {...} }
    const product = psProduct.product || psProduct;
    
    // Logging reducido - solo en caso de problemas
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('🔍 Transformando producto:', product.id);
    // }
    
    // Manejar nombre (puede ser string, objeto con language, o array)
    let productName = '';
    if (typeof product.name === 'string') {
      productName = product.name;
    } else if (Array.isArray(product.name)) {
      // Si es un array, puede ser:
      // 1. Array de strings: ["nombre1", "nombre2"]
      // 2. Array de objetos: [{"id":1,"value":"nombre"}, {"id":4,"value":"nombre"}]
      // Tomar el primer elemento con valor
      for (const item of product.name) {
        if (typeof item === 'string' && item.length > 0) {
          productName = item;
          break;
        } else if (item && typeof item === 'object' && item.value && typeof item.value === 'string') {
          productName = item.value;
          break;
        }
      }
    } else if (product.name?.language) {
      // Formato: { name: { language: [{ value: "..." }] } }
      if (Array.isArray(product.name.language)) {
        productName = product.name.language[0]?.value || '';
      } else {
        productName = product.name.language?.value || '';
      }
    } else if (product.name && typeof product.name === 'object') {
      // PrestaShop puede devolver el nombre como objeto con claves numéricas (IDs de idioma)
      // Ejemplo: { "1": "Nombre del producto" } o { "1": { value: "Nombre" } }
      const nameObj = product.name;
      
      // Primero intentar propiedades comunes
      if (nameObj.value && typeof nameObj.value === 'string') {
        productName = nameObj.value;
      } else {
        // Buscar en todas las propiedades (pueden ser IDs de idioma como "1", "2", etc.)
        for (const key in nameObj) {
          const value = nameObj[key];
          if (typeof value === 'string' && value.length > 0) {
            productName = value;
            break;
          } else if (value && typeof value === 'object' && value.value && typeof value.value === 'string') {
            productName = value.value;
            break;
          }
        }
      }
    } else if (product.name) {
      productName = String(product.name);
    }
    
    // Si aún no tenemos nombre después de todos los intentos, usar valor por defecto
    if (!productName) {
      productName = `Producto ${product.id || 'sin ID'}`;
      // Solo log en desarrollo si realmente hay un problema
      if (process.env.NODE_ENV === 'development' && product.name) {
        console.log(`[Warn] Producto ${product.id}: Nombre no extraido, usando por defecto`);
      }
    }
    
    // Manejar descripciones
    let shortDescription = '';
    if (typeof product.description_short === 'string') {
      shortDescription = product.description_short;
    } else if (product.description_short?.language) {
      shortDescription = Array.isArray(product.description_short.language)
        ? product.description_short.language[0]?.value || ''
        : product.description_short.language?.value || '';
    }
    
    let description = '';
    if (typeof product.description === 'string') {
      description = product.description;
    } else if (product.description?.language) {
      description = Array.isArray(product.description.language)
        ? product.description.language[0]?.value || ''
        : product.description.language?.value || '';
    }
    
    // Precio - PrestaShop puede tener precio en diferentes campos
    // PrestaShop devuelve el precio como string, puede venir en:
    // - price (precio sin impuestos) - puede ser '0.000000' si no está configurado
    // - price_with_reduction (precio con descuento)
    // - wholesale_price (precio mayorista)
    // - unit_price (precio unitario)
    let price = 0;
    let salePrice = 0;
    
    // Intentar obtener precio de diferentes campos
    // IMPORTANTE: PrestaShop puede tener price como precio base (sin descuento) o como precio final
    // Si hay price_with_reduction, ese es el precio con descuento y price es el precio base
    let basePrice = 0;
    
    if (product.price && parseFloat(product.price) > 0) {
      basePrice = parseFloat(product.price);
    } else if (product.wholesale_price && parseFloat(product.wholesale_price) > 0) {
      basePrice = parseFloat(product.wholesale_price);
    } else if (product.unit_price && parseFloat(product.unit_price) > 0) {
      basePrice = parseFloat(product.unit_price);
    }
    
    // Verificar si hay precio con descuento
    let finalPrice = basePrice;
    if (product.price_with_reduction && parseFloat(product.price_with_reduction) > 0) {
      finalPrice = parseFloat(product.price_with_reduction);
    }
    
    // Si hay descuento, el precio base debe ser mayor que el precio final
    // Si price_with_reduction existe y es menor que price, hay descuento
    if (basePrice > 0 && finalPrice > 0 && basePrice > finalPrice) {
      // Hay descuento: price es el precio base, price_with_reduction es el precio final
      price = basePrice;
      salePrice = finalPrice;
    } else if (basePrice > 0) {
      // No hay descuento o price_with_reduction no está disponible
      price = basePrice;
      salePrice = basePrice;
    } else if (finalPrice > 0) {
      // Solo tenemos precio con descuento, usarlo como ambos
      price = finalPrice;
      salePrice = finalPrice;
    }
    
    // Inicializar descuento
    let discount = 0;
    
    // Stock - Verificar cantidad disponible
    // PrestaShop puede tener quantity directamente o en stock_availables
    let quantity = 0;
    let stockAvailable = false;
    
    // Primero intentar obtener quantity directamente
    if (product.quantity !== undefined && product.quantity !== null) {
      quantity = parseInt(product.quantity) || 0;
      stockAvailable = quantity > 0;
    }
    
    // Si no hay quantity directo, verificar stock_availables
    if (!stockAvailable && product.associations?.stock_availables && Array.isArray(product.associations.stock_availables) && product.associations.stock_availables.length > 0) {
      // Si hay stock_availables, asumir que hay stock disponible
      // (consultar cada uno sería muy lento, así que asumimos disponible)
      quantity = 999; // 999 = disponible pero cantidad desconocida
      stockAvailable = true;
    }
    
    // Si el producto está activo y no hay información de stock, asumir disponible
    if (!stockAvailable && (product.active === '1' || product.active === 1 || product.active === true)) {
      // En PrestaShop, si un producto está activo, generalmente está disponible
      quantity = 999;
      stockAvailable = true;
    }
    
    // Calcular descuento desde la diferencia de precios (sin llamadas HTTP)
    if (discount === 0 && price > 0 && salePrice > 0 && price > salePrice) {
      discount = Math.round(((price - salePrice) / price) * 100);
    }
    
    // Si no hay precio, marcar como "consultar" (no loguear para evitar spam)
    
    // Obtener imágenes del producto
    const productImages = this.getProductImages(product.associations?.images || []);
    let thumbnailUrl = null;
    
    if (productImages.length > 0) {
      thumbnailUrl = productImages[0].original_url;
    } else if (product.id_default_image) {
      thumbnailUrl = this.getImageUrl(product.id_default_image);
    }
    
    // product_thumbnail debe ser objeto con original_url para Avatar
    const productThumbnail = thumbnailUrl
      ? { original_url: thumbnailUrl }
      : null;

    // Obtener slug (link_rewrite) de PrestaShop o generarlo
    let slug = '';
    if (typeof product.link_rewrite === 'string') {
      slug = product.link_rewrite;
    } else if (product.link_rewrite?.language) {
      // link_rewrite puede venir como objeto multiidioma
      const linkRewrite = Array.isArray(product.link_rewrite.language)
        ? product.link_rewrite.language[0]?.value || ''
        : product.link_rewrite.language?.value || '';
      slug = linkRewrite;
    } else if (product.link_rewrite && typeof product.link_rewrite === 'object') {
      // PrestaShop puede devolver como objeto con IDs de idioma
      const firstKey = Object.keys(product.link_rewrite)[0];
      if (firstKey) {
        const linkValue = product.link_rewrite[firstKey];
        slug = typeof linkValue === 'string' ? linkValue : (linkValue?.value || '');
      }
    }

    // Si no hay link_rewrite, generar desde el nombre
    if (!slug) {
      slug = this.generateSlug(productName);
    }

    // Agregar ID al inicio del slug solo si no lo tiene ya
    // Formato: "7400-nombre-del-producto"
    let slugWithId = slug;
    if (product.id) {
      const idPrefix = `${product.id}-`;
      if (!slug.startsWith(idPrefix)) {
        slugWithId = `${product.id}-${slug}`;
      }
    }

    return {
      id: product.id,
      name: productName,
      slug: slugWithId,
      short_description: shortDescription,
      description: description,
      price: price,
      sale_price: salePrice,
      discount: discount, // Porcentaje de descuento
      is_sale_enable: discount > 0 || (price > 0 && salePrice > 0 && price > salePrice), // Habilitar etiqueta de venta si hay descuento
      product_thumbnail: productThumbnail, // Objeto con original_url para Avatar
      product_galleries: productImages, // Array de imágenes para galería
      images: productImages, // Alias para compatibilidad
      stock_status: stockAvailable ? 'in_stock' : 'out_of_stock',
      unit: product.unit || '1 unidad',
      quantity: quantity,
      rating_count: 0, // PrestaShop tiene reviews pero en otro endpoint
      categories: this.transformCategories(product.associations?.categories || []),
      // Campos adicionales de PrestaShop
      id_category_default: parseInt(product.id_category_default) || null, // Categoría principal del producto
      reference: product.reference || '',
      ean13: product.ean13 || '',
      upc: product.upc || '',
      active: product.active === '1' || product.active === 1 || product.active === true,
      // Manufacturer (marca)
      manufacturer_id: product.id_manufacturer ? parseInt(product.id_manufacturer) : null,
      manufacturer_name: product.manufacturer_name || null,
    };
  }

  /**
   * Transformar multiples productos
   * SINCRONO - Transforma miles de productos en milisegundos
   */
  transformProducts(psProducts: any) {
    // PrestaShop puede devolver productos en varios formatos
    let products = null;

    if (psProducts.products) {
      if (Array.isArray(psProducts.products)) {
        products = psProducts.products;
      } else if (psProducts.products.product) {
        products = Array.isArray(psProducts.products.product)
          ? psProducts.products.product
          : [psProducts.products.product];
      } else {
        products = psProducts.products;
      }
    } else if (Array.isArray(psProducts)) {
      products = psProducts;
    } else {
      return [];
    }

    if (!Array.isArray(products)) {
      return [];
    }

    // Transformacion sincrona - muy rapida
    return products.map(product => this.transformProduct(product));
  }

  /**
   * Transformar categoría de PrestaShop
   * Maneja tanto categorías completas como asociaciones simples {id: X}
   */
  transformCategory(psCategory: any) {
    const category = psCategory.category || psCategory;

    // Si solo viene el ID (desde asociaciones de producto), devolver objeto minimo
    if (category && typeof category === 'object' && Object.keys(category).length === 1 && category.id) {
      return {
        id: parseInt(category.id) || category.id,
        name: '',
        slug: '',
        description: '',
        category_image: null,
        category_icon: null,
        products_count: 0,
        parent_id: null,
        level_depth: 0,
        nleft: 0,
        nright: 0,
        active: true,
      };
    }

    // PrestaShop en JSON puede devolver name como objeto o string
    let categoryName = '';
    if (typeof category.name === 'string') {
      categoryName = category.name;
    } else if (Array.isArray(category.name)) {
      // Si es un array, puede ser array de strings o array de objetos
      for (const item of category.name) {
        if (typeof item === 'string' && item.length > 0) {
          categoryName = item;
          break;
        } else if (item && typeof item === 'object' && item.value && typeof item.value === 'string') {
          categoryName = item.value;
          break;
        }
      }
    } else if (category.name?.language) {
      // Formato XML: { name: { language: [{ value: "..." }] } }
      categoryName = Array.isArray(category.name.language)
        ? category.name.language[0]?.value || ''
        : category.name.language?.value || '';
    } else if (category.name && typeof category.name === 'object') {
      // Puede ser un objeto con claves numéricas (IDs de idioma) o con .value
      const firstKey = Object.keys(category.name)[0];
      if (firstKey) {
        const nameValue = category.name[firstKey];
        if (typeof nameValue === 'string') {
          categoryName = nameValue;
        } else if (nameValue && typeof nameValue === 'object' && nameValue.value) {
          categoryName = nameValue.value;
        } else {
          categoryName = String(category.name);
        }
      } else {
        categoryName = String(category.name);
      }
    } else if (category.name) {
      // Ultimo recurso: convertir a string
      categoryName = String(category.name);
    }

    // Descripcion similar
    let description = '';
    if (typeof category.description === 'string') {
      description = category.description;
    } else if (category.description?.language) {
      description = Array.isArray(category.description.language)
        ? category.description.language[0]?.value || ''
        : category.description.language?.value || '';
    }

    // Obtener slug (link_rewrite) de PrestaShop o generarlo
    let slug = '';
    if (typeof category.link_rewrite === 'string') {
      slug = category.link_rewrite;
    } else if (category.link_rewrite?.language) {
      // link_rewrite puede venir como objeto multiidioma
      const linkRewrite = Array.isArray(category.link_rewrite.language)
        ? category.link_rewrite.language[0]?.value || ''
        : category.link_rewrite.language?.value || '';
      slug = linkRewrite;
    }

    // Si no hay link_rewrite, generar desde el nombre
    if (!slug) {
      slug = this.generateSlug(categoryName);
      // Solo mostrar warning si el slug generado esta vacio (problema real)
      if (process.env.NODE_ENV === 'development' && !slug && categoryName) {
        console.log(`Categoria ${category.id} "${categoryName}" - No se pudo generar slug`);
      }
    }

    return {
      id: parseInt(category.id) || category.id,
      name: categoryName,
      slug: slug,
      description: description,
      category_image: this.getCategoryImageUrl(category.id, categoryName),
      category_icon: this.getCategoryImageUrl(category.id, categoryName),
      products_count: category.nb_products_recursive || 0,
      parent_id: category.id_parent ? parseInt(category.id_parent) : null,
      level_depth: parseInt(category.level_depth) || 0,
      nleft: parseInt(category.nleft) || 0,
      nright: parseInt(category.nright) || 0,
      active: category.active === '1' || category.active === 1 || category.active === true,
    };
  }

  /**
   * Transformar múltiples categorías
   * Maneja varios formatos de PrestaShop:
   * - { categories: { category: [...] } }
   * - { categories: [...] }
   * - { category: [...] } (formato de asociaciones de producto)
   * - [...] (array directo)
   */
  transformCategories(psCategories: any) {
    let categories = null;

    if (psCategories.categories) {
      // Si tiene .categories, puede ser array o objeto con .category
      if (Array.isArray(psCategories.categories)) {
        categories = psCategories.categories;
      } else if (psCategories.categories.category) {
        // Formato: { categories: { category: [...] } }
        categories = Array.isArray(psCategories.categories.category)
          ? psCategories.categories.category
          : [psCategories.categories.category];
      } else {
        categories = psCategories.categories;
      }
    } else if (psCategories.category) {
      // Formato de asociaciones de producto: { category: [{id: X}, {id: Y}] }
      categories = Array.isArray(psCategories.category)
        ? psCategories.category
        : [psCategories.category];
    } else if (Array.isArray(psCategories)) {
      categories = psCategories;
    } else {
      return [];
    }

    if (!Array.isArray(categories)) {
      return [];
    }

    return categories.map(category => this.transformCategory(category));
  }

  /**
   * Transformar manufacturer (marca) de PrestaShop al formato del frontend
   */
  transformManufacturer(psManufacturer: any) {
    // PrestaShop devuelve manufacturers en formato { manufacturer: {...} }
    const manufacturer = psManufacturer.manufacturer || psManufacturer;
    
    // Manejar nombre (similar a productos y categorías)
    let manufacturerName = '';
    if (typeof manufacturer.name === 'string') {
      manufacturerName = manufacturer.name;
    } else if (Array.isArray(manufacturer.name)) {
      for (const item of manufacturer.name) {
        if (typeof item === 'string' && item.length > 0) {
          manufacturerName = item;
          break;
        } else if (item && typeof item === 'object' && item.value && typeof item.value === 'string') {
          manufacturerName = item.value;
          break;
        }
      }
    } else if (manufacturer.name?.language) {
      if (Array.isArray(manufacturer.name.language)) {
        manufacturerName = manufacturer.name.language[0]?.value || '';
      } else {
        manufacturerName = manufacturer.name.language?.value || '';
      }
    } else if (manufacturer.name && typeof manufacturer.name === 'object') {
      const firstKey = Object.keys(manufacturer.name)[0];
      if (firstKey) {
        const nameValue = manufacturer.name[firstKey];
        manufacturerName = typeof nameValue === 'string' ? nameValue : (nameValue?.value || '');
      }
    }

    // Obtener URL de imagen del manufacturer
    // PrestaShop puede almacenar imágenes de manufacturers de diferentes formas:
    // 1. /img/m/{id}.jpg (pero este directorio puede estar usado para idiomas)
    // 2. Usar la API de imágenes: /api/images/manufacturers/{id}
    // 3. Puede que no haya imágenes si el manufacturer no tiene logo configurado
    let imageUrl = null;
    const manufacturerId = manufacturer.id || manufacturer.id_manufacturer;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Debug] Manufacturer data:`, {
        id: manufacturer.id,
        id_manufacturer: manufacturer.id_manufacturer,
        name: manufacturerName,
        raw: manufacturer
      });
    }
    
    if (manufacturerId) {
      // PrestaShop puede usar la API de imágenes para manufacturers
      // Formato: /api/images/manufacturers/{id}
      // O también puede estar en /img/m/{id}.jpg (aunque este directorio parece ser para idiomas)
      // Intentaremos primero con la API de imágenes, que es más confiable
      imageUrl = `/api/prestashop/images/manufacturers/${manufacturerId}.jpg`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Image] Manufacturer ${manufacturerId} (${manufacturerName}) image URL:`, imageUrl);
      }
    }

    return {
      id: manufacturer.id,
      name: manufacturerName,
      image: imageUrl,
      logo: {
        original_url: imageUrl,
      },
    };
  }

  /**
   * Transformar múltiples manufacturers
   */
  transformManufacturers(psManufacturers: any) {
    // PrestaShop puede devolver: { manufacturers: { manufacturer: [...] } } o { manufacturers: [...] }
    let manufacturers = null;
    
    if (psManufacturers.manufacturers) {
      if (Array.isArray(psManufacturers.manufacturers)) {
        manufacturers = psManufacturers.manufacturers;
      } else if (psManufacturers.manufacturers.manufacturer) {
        manufacturers = Array.isArray(psManufacturers.manufacturers.manufacturer) 
          ? psManufacturers.manufacturers.manufacturer 
          : [psManufacturers.manufacturers.manufacturer];
      } else {
        manufacturers = psManufacturers.manufacturers;
      }
    } else if (Array.isArray(psManufacturers)) {
      manufacturers = psManufacturers;
    } else {
      return [];
    }
    
    if (!Array.isArray(manufacturers)) {
      return [];
    }
    
    return manufacturers.map(manufacturer => this.transformManufacturer(manufacturer));
  }

  /**
   * Obtener URL de imagen de PrestaShop
   * PrestaShop almacena imágenes en: /img/p/{path}/{id_image}-{size}.jpg
   * Formato: Siempre 9 dígitos divididos en grupos de 3
   * Ejemplos:
   * - ID 123 -> /img/p/000/000/123/123-large_default.jpg
   * - ID 1234 -> /img/p/000/001/234/1234-large_default.jpg
   * - ID 12345 -> /img/p/000/012/345/12345-large_default.jpg
   * - ID 123456 -> /img/p/000/123/456/123456-large_default.jpg
   * - ID 1234567 -> /img/p/001/234/567/1234567-large_default.jpg
   * - ID 12345678 -> /img/p/012/345/678/12345678-large_default.jpg
   * - ID 123456789 -> /img/p/123/456/789/123456789-large_default.jpg
   */
  getImageUrl(imageId: any, size: any = 'large_default') {
    if (!imageId) {
      return null;
    }
    
    const imageIdNum = parseInt(imageId);
    
    if (isNaN(imageIdNum) || imageIdNum <= 0) {
      return null;
    }
    
    // PrestaShop 9 usa cada dígito del ID como un directorio separado
    // Ejemplo: ID 26395 -> /img/p/2/6/3/9/5/26395-large_default.jpg
    const imageIdStr = String(imageIdNum);
    const path = imageIdStr.split('').join('/');
    
    // Usar proxy de imágenes de Next.js que maneja autenticación
    // El proxy servirá las imágenes desde PrestaShop con las credenciales correctas
    return `/api/prestashop/images/${path}/${imageIdNum}-${size}.jpg`;
  }

  /**
   * Generar URL de imagen de categoría de PrestaShop
   * PrestaShop almacena imágenes de categorías en /img/c/ con estructura similar a productos
   * Ejemplo: ID 3011 -> /img/c/3/0/1/1/3011-category_default.jpg
   */
  getCategoryImageUrl(categoryId: any, categoryName: any = '', size = 'category_default') {
    if (!categoryId) {
      return null;
    }
    
    const categoryIdNum = parseInt(categoryId);
    
    if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
      return null;
    }
    
    // PrestaShop 9 usa cada dígito del ID como un directorio separado para categorías también
    // Ejemplo: ID 3011 -> /img/c/3/0/1/1/3011-category_default.jpg
    const categoryIdStr = String(categoryIdNum);
    const path = categoryIdStr.split('').join('/');
    
    // Usar proxy de imágenes de Next.js que maneja autenticación
    // El proxy servirá las imágenes desde PrestaShop con las credenciales correctas
    return `/api/prestashop/images/categories/${path}/${categoryIdNum}-${size}.jpg`;
  }

  /**
   * Obtener todas las imágenes de un producto
   */
  getProductImages(images: any) {
    if (!images) {
      return [];
    }
    
    // PrestaShop puede devolver imágenes en diferentes formatos:
    // 1. Array: [{id: 1}, {id: 2}]
    // 2. Objeto: {image: [{id: 1}, {id: 2}]}
    // 3. Array directo de IDs: [1, 2]
    let imageArray = [];
    
    if (Array.isArray(images)) {
      imageArray = images;
    } else if (images.image && Array.isArray(images.image)) {
      imageArray = images.image;
    } else if (typeof images === 'object') {
      // Si es objeto, intentar extraer array
      imageArray = Object.values(images).filter(item => Array.isArray(item) ? item : [item]).flat();
    }
    
    if (imageArray.length === 0) {
      return [];
    }
    
    const result = imageArray.map((img: any) => {
      // img puede ser {id: 1} o solo el número 1
      const imageId = img?.id || img;
      if (!imageId) return null;
      
      const imageUrl = this.getImageUrl(imageId, 'large_default');
      if (!imageUrl) return null;
      
      return {
        id: imageId,
        name: `Imagen ${imageId}`,
        original_url: imageUrl,
        thumbnail_url: this.getImageUrl(imageId, 'small_default'),
      };
    }).filter((img: any) => img && img.original_url); // Filtrar imágenes sin URL
    
    // Debug temporal
    if (result.length === 0 && process.env.NODE_ENV === 'development') {
      console.log('[Image] No se generaron URLs de imagenes:', {
        images: images,
        imageArray: imageArray,
        firstImage: imageArray[0]
      });
    }
    
    return result;
  }

  /**
   * Generar slug desde nombre
   */
  generateSlug(name: any) {
    if (!name) return '';
    
    // Asegurarse de que name es un string
    const nameStr = String(name);
    
    return nameStr
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Transformar datos de home page
   */
  transformHomePage(products: any, categories: any, banners: any = []) {
    return {
      content: {
        home_banner: {
          main_banner: banners[0] || null,
          sub_banner_1: banners[1] || null,
          sub_banner_2: banners[2] || null,
        },
        main_content: {
          section1_products: {
            status: true,
            title: 'Top Semillas feminizadas:',
            product_ids: products.slice(0, 10).map((p: any) => p.id),
          },
          section2_categories_list: {
            status: true,
            category_ids: categories.slice(0, 6).map((c: any) => c.id),
          },
        },
        products_ids: products.map((p: any) => p.id),
      },
    };
  }
}

export default new PrestaShopTransformer();

