/**
 * Proxy para PrestaShop que maneja la doble autenticación:
 * 1. .htaccess del servidor (dev / pevgrowPs9!Dev)
 * 2. PrestaShop API (API Key como HTTP Basic Auth)
 */

import axios from 'axios';

class PrestaShopProxy {
  private baseURL: string;
  private apiKey: string;
  private htaccessUser: string;
  private htaccessPassword: string;

  constructor() {
    this.baseURL = process.env.PRESTASHOP_API_URL || 'https://ps9.pevgrow.com/api';
    this.apiKey = process.env.PRESTASHOP_API_KEY || '';
    this.htaccessUser = process.env.PRESTASHOP_HTACCESS_USER || 'dev';
    this.htaccessPassword = process.env.PRESTASHOP_HTACCESS_PASSWORD || 'pevgrowPs9!Dev';
  }

  /**
   * Hacer petición a PrestaShop con doble autenticación
   * Primero intenta con la API Key directamente, si falla por .htaccess, usa las credenciales del servidor
   */
  async request(method: string, endpoint: string, params: any = {}): Promise<any> {
    try {
      // Primera opción: Usar API Key directamente (lo que PrestaShop requiere)
      const clientWithApiKey = axios.create({
        baseURL: this.baseURL,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        auth: {
          username: this.apiKey,
          password: '',
        },
        timeout: 60000, // 60 segundos maximo
      });

      const queryParams = new URLSearchParams();
      // PrestaShop requiere output_format=JSON para devolver JSON
      queryParams.append('output_format', 'JSON');
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          // PrestaShop requiere corchetes alrededor de los campos en display
          if (key === 'display' && params[key] !== 'full') {
            queryParams.append(key, `[${params[key]}]`);
          } else {
            queryParams.append(key, params[key]);
          }
        }
      });

      const url = `${endpoint}?${queryParams.toString()}`;
      
      const startTime = Date.now();
      
      try {
        const response = await clientWithApiKey.request({
          method,
          url,
        });
        return response.data;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`PrestaShop API Error (${duration}ms):`, error.message);
        if (error.code === 'ECONNABORTED') {
          console.error('Timeout: La peticion tardo mas de 120 segundos');
        }
        if (error.response) {
          console.error('Server response:', {
            status: error.response.status,
            statusText: error.response.statusText,
          });
        }
        // Si falla por .htaccess (401 con realm="Restricted Area")
        const wwwAuth = error.response?.headers['www-authenticate'] || '';
        const isHtaccessBlock = wwwAuth.includes('Restricted Area');
        const isPrestaShopAuth = wwwAuth.includes('PrestaShop Webservice');

        if (error.response?.status === 401) {
          if (isHtaccessBlock) {
            console.log('[Auth] .htaccess bloqueando acceso');
            console.log('[Auth] Solucion: El servidor necesita configurar el .htaccess para permitir la API Key de PrestaShop');
            console.log('[Auth] Alternativa: Contactar al administrador del servidor para configurar el acceso');

            // Intentar con credenciales del servidor, pero PrestaShop no acepta ws_key con otra auth
            // Esta es una limitacion del servidor, no del codigo
            throw new Error('El servidor tiene un .htaccess que bloquea el acceso. Se necesita configurar el servidor para permitir la API Key de PrestaShop directamente.');
          } else if (isPrestaShopAuth) {
            console.log('[Auth] PrestaShop rechazo la autenticacion');
            console.log('[Auth] Verifica que la API Key sea correcta y tenga los permisos necesarios');
            throw new Error('API Key de PrestaShop invalida o sin permisos. Verifica la clave en el panel de administracion.');
          }
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error en PrestaShop Proxy:', error);
      throw error;
    }
  }

  async get(endpoint: string, params: any = {}): Promise<any> {
    return this.request('GET', endpoint, params);
  }

  async post(endpoint: string, data: any = {}, params: any = {}): Promise<any> {
    const client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.apiKey,
        password: '',
      },
      timeout: 120000, // 120 segundos para respuestas grandes
    });

    const queryParams = new URLSearchParams();
    queryParams.append('output_format', 'JSON');
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        // PrestaShop requiere corchetes alrededor de los campos en display
        if (key === 'display' && params[key] !== 'full') {
          queryParams.append(key, `[${params[key]}]`);
        } else {
          queryParams.append(key, params[key]);
        }
      }
    });

    const url = `${endpoint}?${queryParams.toString()}`;

    try {
      const response = await client.post(url, data);
      return response.data;
    } catch (error: any) {
      // Si falla por .htaccess, intentar con credenciales del servidor
      if (error.response?.status === 401) {
        const clientWithHtaccess = axios.create({
          baseURL: this.baseURL,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          auth: {
            username: this.htaccessUser,
            password: this.htaccessPassword,
          },
          timeout: 60000, // 60 segundos maximo
        });

        queryParams.append('ws_key', this.apiKey);
        const urlWithKey = `${endpoint}?${queryParams.toString()}`;

        const response = await clientWithHtaccess.post(urlWithKey, data);
        return response.data;
      }
      throw error;
    }
  }

  async put(endpoint: string, data: any = {}, params: any = {}): Promise<any> {
    const client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.apiKey,
        password: '',
      },
      timeout: 120000, // 120 segundos para respuestas grandes
    });

    const queryParams = new URLSearchParams();
    queryParams.append('output_format', 'JSON');
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        // PrestaShop requiere corchetes alrededor de los campos en display
        if (key === 'display' && params[key] !== 'full') {
          queryParams.append(key, `[${params[key]}]`);
        } else {
          queryParams.append(key, params[key]);
        }
      }
    });

    const url = `${endpoint}?${queryParams.toString()}`;

    try {
      const response = await client.put(url, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        const clientWithHtaccess = axios.create({
          baseURL: this.baseURL,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          auth: {
            username: this.htaccessUser,
            password: this.htaccessPassword,
          },
          timeout: 60000, // 60 segundos maximo
        });

        queryParams.append('ws_key', this.apiKey);
        const urlWithKey = `${endpoint}?${queryParams.toString()}`;

        const response = await clientWithHtaccess.put(urlWithKey, data);
        return response.data;
      }
      throw error;
    }
  }

  async delete(endpoint: string, params: any = {}): Promise<any> {
    return this.request('DELETE', endpoint, params);
  }
}

export default new PrestaShopProxy();

